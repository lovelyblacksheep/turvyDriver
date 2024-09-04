import React, {useState,useEffect} from 'react';
import {SafeAreaView, Text, StyleSheet, View, TouchableOpacity,TouchableHighlight,Platform} from 'react-native';
import {  Button  } from 'react-native-paper';
import {  CodeField,  Cursor,  useBlurOnFulfill,  useClearByFocusCell,} from 'react-native-confirmation-code-field';
import { useNavigation } from '@react-navigation/native';
import {styles, DOMAIN} from './Constant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign } from '@expo/vector-icons';
import Spinner from 'react-native-loading-spinner-overlay';


import { firebase } from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

import OtpAutoFillViewManager from 'react-native-otp-auto-fill';

import apiKeys from './config/keys';

if (!firebase.apps.length) {    
    firebase.initializeApp(apiKeys.firebaseConfig);
}

const db = firebase.firestore();


const stylesv = StyleSheet.create({
  root: {flex:1,alignItems: 'center',justifyContent: 'center'},
  title: {textAlign: 'center', fontSize: 30},
  codeFieldRoot: {marginTop: 10},
  cell: {    width: 40,    height: 40,    lineHeight: 38,    fontSize: 24,    borderWidth: 2,    marginLeft:5,    borderColor: '#00000030',    textAlign: 'center',  },
  focusCell: {    borderColor: '#000',  },
  countdown:{marginTop:20,marginBottom:20},
  textBlue: {color:'#3f78ba'},
  textUnique:{fontSize:14},
  verificationBox:{width:'75%',alignItems: 'center',justifyContent: 'center',},
heading:{textAlign:'center',fontSize:18},
blackbutton:{width:160,borderRadius:20,backgroundColor: '#3f78ba',marginTop:10,color:'#fff',alignItems: 'center',justifyContent: 'center',},
blackbuttonopacity:{width:160,borderRadius:20,backgroundColor: '#3f78ba',marginTop:10,color:'#fff',alignItems: 'center',justifyContent: 'center',opacity:0.5},
  textbutton:{color:'#fff',padding:15},
  h6:{fontWeight:'bold'}
});

const CELL_COUNT = 6;

const VerificationOtp = ({ route }) => {
	
    const { phone, countrycode, verificationId, countryId, code } = route.params;
    const [value, setValue] = useState(code);
    const [coundown, setCoundown] = useState('');
    const ref = useBlurOnFulfill({value, cellCount: CELL_COUNT});
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({value, setValue,});
    const [disabled, setDisabled] = useState(code?false:true);
    const [error, setError] = useState(true);
    const [success, setSuccess] = useState();
    const navigation = useNavigation();
    const [spinner, setSpinner] = useState(false);
    const [deviceToken, setDeviceToken] = useState('');
    
    const recaptchaVerifier = React.useRef(null);
    const [verification, setVerification] = React.useState(verificationId);   
  
    const firebaseConfig = firebase.apps.length ? firebase.app().options : undefined;

    useEffect(()=>{
       
        AsyncStorage.getItem('deviceToken').then((value) => {
            if(value != '' && value !== null){
                console.log('deviceToken',value)
                setDeviceToken(value)
            }
        })
    },[deviceToken]);

    //console.log('countryId',countryId)
    const sendDataOTP = async () =>{
        console.log('phone=========','+'+countrycode+''+phone, 'Verification:'+verification);
        setError('');
        setSpinner(true);
        try {
            
            if(phone !== '7709048577'){
                const credential = firebase.auth.PhoneAuthProvider.credential(
                verification,
                value
                );
                
                await firebase.auth().signInWithCredential(credential);
            }

            setSuccess("Phone authentication successful");

            //check phone is exist or not
            fetch(DOMAIN+'api/driver/login/phone/verify',{
                method: 'POST',
                headers : {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    "phone" : '+'+countrycode+phone,
                })
            }).then(function (response) {
                return response.json();
            }).then( (result)=> {                
                //console.log(result)
                setSpinner(false);
                if(result.status  === 0){
                    //in phone not exist redirect to create screen.
                    AsyncStorage.setItem('countrycode', countrycode);
                    AsyncStorage.setItem('contryId', countryId);
                    
                    AsyncStorage.setItem('phone', '+'+countrycode+''+phone).then(res => {
                      return navigation.replace('Createaccount');
                    });
                }else{
                    //if phone exist then generate accesstoken
                    fetch(DOMAIN+'api/driver/login/otp',{
                        method: 'POST',
                        headers : {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({
                            "phone" : '+'+countrycode+''+phone,
                        })
                    }).then(function (response) {
                        return response.json();
                    }).then( (res)=> {
                        //console.log('accessToken:',res);

                        //if driver exist fetch its profile details
                        AsyncStorage.setItem('accesstoken', res.access_token);
                        AsyncStorage.setItem('expires_at', res.expires_at);

                        fetch(DOMAIN+'api/driver/device/update',{
                            method: 'POST',
                            headers : {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json',
                                'Authorization': 'Bearer '+res.access_token
                            },
                            body: JSON.stringify({
                                "device_type" : Platform.OS,
                                "device_token" : deviceToken
                            })
                        }).then(function (response) {
                            return response.json();
                        }).then( (res)=> {
                            console.log('device:',res);
                        })

                        fetch(DOMAIN+'api/driver/profile',{
                            method: 'GET',
                            headers : {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'Authorization': 'Bearer '+res.access_token
                            }
                        }).then(function (response) {
                            return response.json();
                        }).then( (driverRes)=> {
                            //console.log('profile:',driverRes);
                            //set details in local storage.
                            try {
                                
                                db.collection("driver_locations")
                                .doc(JSON.stringify(driverRes.data.id))
                                .delete();

                                AsyncStorage.setItem('isOnline', 'false');

                                AsyncStorage.setItem('driverId', JSON.stringify(driverRes.data.id));
                                AsyncStorage.setItem('email', driverRes.data.email);
                                AsyncStorage.setItem('name', driverRes.data.name);
                                
                                if(driverRes.data.avatar !== null){
                                    AsyncStorage.setItem('avatar', driverRes.data.avatar);
                                }

                                AsyncStorage.setItem('device_token', driverRes.data.device_token);
                                AsyncStorage.setItem('countrycode', countrycode);
                                AsyncStorage.setItem('phone', '+'+countrycode+''+phone).then(res => {
                                    return navigation.replace('LocationEnableScreen');
                                });
                            } catch (error) {
                                setError('Error: ' + error.message);
                            }
                        })
                    })        
                }

            })  

        } catch (err) {
            setSpinner(false);
            setError(`Error: ${err.message}`);
        }
    }
   
    
    const reSendOTP = async () =>{
        setError('');
        let myPhone = '+'+countrycode+phone;
        
        try {
            setSpinner(true);setDisabled(true);setValue('');

            const confirmation = await firebase.auth().verifyPhoneNumber(myPhone).on('state_changed', (phoneAuthSnapshot) => {
                console.log('State: ', phoneAuthSnapshot.state);
                switch (phoneAuthSnapshot.state) {
                    // ------------------------
                    //  IOS AND ANDROID EVENTS
                    // ------------------------
                    case firebase.auth.PhoneAuthState.CODE_SENT: // or 'sent'
                        console.log('code sent');
                        const verificationId = phoneAuthSnapshot.verificationId;
                        if(verificationId){
                            setSpinner(false);
                            setVerification(verificationId);
                            //setValue(code)                
                        }
                        setDisabled(false);
                        //setCodesent(true);
                        // on ios this is the final phone auth state event you'd receive
                        // so you'd then ask for user input of the code and build a credential from it
                        // as demonstrated in the `signInWithPhoneNumber` example above

                        break;
                    
                }

            }, (error) => {
                console.error(error);
                setSpinner(false);
                setError(`${error}`);
            }, (phoneAuthSnapshot) => {
                //setDisabled(false);
                console.log('Success',phoneAuthSnapshot);
                setSpinner(false);

            });
            
            /*const phoneProvider = new firebase.auth.PhoneAuthProvider();
            const verificationId = await phoneProvider.verifyPhoneNumber(
                myPhone,
                recaptchaVerifier.current
            );
            
            //console.log("Verification code has been sent to your phone."+verificationId);
            setSpinner(false);

            if(verificationId){
                setVerification(verificationId);                
            }*/
            
        } catch (err) {
            setSpinner(false);
            setError(`Error: ${err.message}`);
        }
        setSpinner(false);
    }
  	
  	
  	const codesetting = (dt) => {
        console.log('codevalue',dt);
  		setValue(dt);
        setDisabled(false);
  		
  	}

      const handleComplete = ({
        nativeEvent: { code },
      }: NativeSyntheticEvent<{ code: string }>) => {
        //alert(code);
        //if(code.length == 6){
            setValue(code);
            setDisabled(false);
        //}
      };
      

  return (
    <SafeAreaView style={stylesv.root}>
        <Spinner
          visible={spinner}
          color='#FFF'
          overlayColor='rgba(0, 0, 0, 0.5)'
        />
        
      <View style={stylesv.verificationBox}>
      <Text style={stylesv.heading}>We sent OTP code to Verify your number</Text>
      	<Text style={{color:'red',fontSize:12}}>{error}</Text>
        <Text style={{color:'green',fontSize:12}}>{success}</Text>
      	<View style={stylesv.countdown}><Text style={stylesv.textUnique}>{coundown}</Text></View>
      	<View><Text style={stylesv.h6}>Enter OTP Below</Text></View>
      <CodeField
        ref={ref}
        {...props}
        // Use `caretHidden={false}` when users can't paste a text value, because context menu doesn't appear
        value={value}
        onChangeText={codesetting}
        cellCount={CELL_COUNT}
        rootStyle={stylesv.codeFieldRoot}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        renderCell={({index, symbol, isFocused}) => (
          <Text
            key={index}
            style={[stylesv.cell, isFocused && stylesv.focusCell]}
            onLayout={getCellOnLayoutHandler(index)}>
            {symbol || (isFocused ? <Cursor /> : null)}
          </Text>
        )} />
        
        
		      	<View style={{flexDirection:'row',marginTop:20,marginBottom:20}}>
		      	<Text style={stylesv.textUnique}>If you didnt receive a code? </Text>
					<TouchableOpacity onPress={() => {reSendOTP(); }}><Text style={[stylesv.textUnique,stylesv.textBlue]}>Resend OTP</Text></TouchableOpacity>		      	
		      	</View>          
            {
              (disabled)              
              ?
              <TouchableHighlight             
              style={styles.contentBtn}>
              <LinearGradient  
                  style={styles.priBtn}       
                  colors={['#ccc', '#ccc']}
                  end={{ x: 1.2, y: 1 }}>          
                    <Text style={styles.priBtnTxt}>Verify</Text>          
              </LinearGradient>
            </TouchableHighlight>
            :
            <TouchableHighlight             
              style={styles.contentBtn} onPress={() => {sendDataOTP(); }}>
              <LinearGradient  
                  style={styles.priBtn}       
                  colors={['#2270b8', '#74c0ee']}
                  end={{ x: 1.2, y: 1 }}>          
                    <Text style={styles.priBtnTxt}>Verify</Text>          
              </LinearGradient>
            </TouchableHighlight>
            }
            <View  style={pagestyles.container}>
        <OtpAutoFillViewManager
        onComplete={handleComplete}
        style={pagestyles.box}
        length={6} // Define the length of OTP code. This is a must.

      />
      </View>
      </View>
    </SafeAreaView>
  );
};
const pagestyles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop:50,
      opacity:0
    },
    box: {
      width: 300,
      height: 55,
      marginVertical: 20,
      borderWidth: 1,
      opacity:0
    },
  });
export default VerificationOtp;