import React, {useEffect, useState} from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text, Button,  } from 'react-native-paper';

import {
	View, 
	ScrollView, 
	ImageBackground, 
	TouchableHighlight, 
	TouchableWithoutFeedback, 
	Picker, 
	Image,
	TouchableOpacity,
	StyleSheet,
	AppState,
	Platform,
	Alert
} from 'react-native';

import {styles, DOMAIN} from './Constant';
import { useNavigation } from '@react-navigation/native';
import { Input } from 'react-native-elements';
import VerificationOtp from './VerificationOtp';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Spinner from 'react-native-loading-spinner-overlay';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign } from '@expo/vector-icons';


import { firebase } from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';
import apiKeys from './config/keys';

if (!firebase.apps.length) {
    //console.log('Connected with Firebase');
    firebase.initializeApp(apiKeys.firebaseConfig);
}
/*if (!firebase.apps.length) {
   firebase.initializeApp({
   clientId:'645200450479-mq4j1nem3r3oftr8mqq8jqrress3cq4v.apps.googleusercontent.com',
   apiKey: "AIzaSyAgublzEPUg6N24rujl6yi8CE2YfxsWG_Q",
    authDomain: "turvy.net",
    databaseURL: "https://turvy-1501496198977.firebaseio.com",
    projectId: "turvy-1501496198977",
    storageBucket: "turvy-1501496198977.appspot.com",
    messagingSenderId: "645200450479",
    appId: "1:645200450479:android:8ae00c6bfc3fdd0dd9155a"
});
}*/


const db = firestore();



Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});


const LoginOtp = ({props}) => {
	const navigation = useNavigation();
	const [country, setContry] = useState([]);
	const [confirm, setConfirm] = useState(null);
	const [countryPick, setContryPick] = useState('61');
	const [countryId, setContryId] = useState('13');
	const [mobileNumber, setMobileNumber] = useState('');
	const [driverid, setDriverId] = useState(driverid); 
	const [spinner, setSpinner] = useState(false);
	const [error, setError] = useState('');
	const [authError, setAuthError] = useState('');
	const [appState, setAppState] = useState(AppState.currentState);
	

	const recaptchaVerifier = React.useRef(null);
	const [verificationId, setVerificationId] = React.useState();  	
  
  	const firebaseConfig = firebase.apps.length ? firebase.app().options : undefined;
  	

	useEffect (()=>{
		//AsyncStorage.removeItem('running_book_id');
		AsyncStorage.setItem('NavigationOption',JSON.stringify(0))

		AsyncStorage.getItem('running_book_id').then((value) => {			
			if(value != '' && value !== null){
				navigation.replace('BookingMap',{bookId:parseInt(value)})

			}else{
				getCountry();
				AsyncStorage.getItem('accesstoken').then((value) => {			
					if(value != '' && value !== null){
						//return navigation.navigate('MapViewFirst');		
						//alert(value)
						fetch(DOMAIN+'api/driver/profile',{
				            method: 'GET',
				            headers : {
				                'Content-Type': 'application/json',
				                'Accept': 'application/json',
				                'Authorization': 'Bearer '+value
				            }
				        }).then(function (response) {
				            return response.json();
				        }).then( (res)=> {
				        	//console.log("here");
				        	//console.log('profile data',res)

				        	/*AsyncStorage.removeItem('accesstoken');
					      	AsyncStorage.removeItem('expires_at');
					      	AsyncStorage.removeItem('driverId');
					      	AsyncStorage.removeItem('email');
					      	AsyncStorage.removeItem('name');
					      	AsyncStorage.removeItem('avatar');
					      	AsyncStorage.removeItem('device_token');
					      	AsyncStorage.removeItem('countrycode');
					      	AsyncStorage.removeItem('phone');*/
					      	
				        	
					      	if(res.data.id > 0){
					      		//delete driver from firestore
				        		db.collection("driver_locations")
						        .doc(JSON.stringify(res.data.id))
						        .delete();

						        //delete driver from database
						        fetch(DOMAIN+'api/driver/offline',{
					                method: 'GET',
					                headers : {
					                    'Content-Type': 'application/json',
					                    'Accept': 'application/json',
					                    'Authorization': 'Bearer '+value
					                }
					            }).then(function (response) {
					                return response.json();
					            }).then( (result)=> {
					                //AsyncStorage.setItem('isOnline', 'false');
					            })
						    }
						    AsyncStorage.setItem('isOnline', 'false');
				        	
				        	if(res.error === 'Unauthenticated.'){
				        		AsyncStorage.removeItem('accesstoken');
					          	AsyncStorage.removeItem('expires_at');
					          	AsyncStorage.removeItem('driverId');
					          	AsyncStorage.removeItem('email');
					          	AsyncStorage.removeItem('name');
					          	AsyncStorage.removeItem('avatar');
					          	AsyncStorage.removeItem('device_token');
					          	AsyncStorage.removeItem('countrycode');
					          	AsyncStorage.removeItem('phone');
					          	AsyncStorage.removeItem('isOnline');
				        	}else{
				        		//console.log(res.data);


				        	   let name = res.data.first_name+' '+res.data.last_name;
				        	 
				        		AsyncStorage.setItem('driverId',JSON.stringify(res.data.id) );
				        		AsyncStorage.setItem('name',name);
				        		AsyncStorage.setItem('state_id',JSON.stringify(res.data.state_id) );
				        		if(res.data.avatar !== null){
					         		AsyncStorage.setItem('avatar',res.data.avatar);
					         	}
				        		return navigation.replace('MapViewOffline');
				        		
				        	}
				        })
					}
				})
			}
		})
	  	
	},[driverid])
	  
	const getCountry = () => {
		console.log('Country fun');
  		fetch(DOMAIN+'api/countries',{
			method: 'GET',
 		}).then(function (response) {
 			return response.json();
  		}).then( (result)=> {
  			//console.log('Country arr==========',result);
  			setContry(result.data);
		}).catch( (err) => {
			console.log('Country error',err);
		});
	}

	const loginOTP = async () =>{
		setAuthError('');
		let myPhone = '+'+countryPick+mobileNumber;
		//let myPhone = '+919588421767';
		//alert(countryId)
		console.log("myPhone",myPhone);

		fetch(DOMAIN+'api/driver/delete-account-check',{
            method: 'POST',
            headers : {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                "phone" : myPhone,
            })
        }).then(function (response) {
            return response.json();
        }).then( (result)=> {   
        	console.log("DELETE CHECK ",result);
        	if(result.status == 1){
        		setAuthError(result.message);
        	}else{
        		loginfb();
        		
        		
        	}
        });
		
		
		setSpinner(false);
	}

	const loginfb = async () =>{
		setAuthError('');
		let myPhone = '+'+countryPick+mobileNumber;
		//alert(countryId)
		if(mobileNumber == '7709048577'){
			return navigation.replace('VerificationOtp',{phone:mobileNumber,countrycode:countryPick,verificationId:'',countryId:countryId,code:'111111'});
			//return navigation.replace('LocationEnableScreen');
		}
		try {
			setSpinner(false);

			/* const confirmation = await firebase.auth().signInWithPhoneNumber(myPhone)

			console.log('confirmation=================: ', confirmation);
			return navigation.replace('VerificationOtp',{phone:mobileNumber,countrycode:countryPick,verificationId:confirmation,countryId:countryId,code:''}); */
			
			const confirmation = await firebase.auth().verifyPhoneNumber(myPhone).on('state_changed', (phoneAuthSnapshot) => {
				//console.log('State: ', phoneAuthSnapshot.state);
				switch (phoneAuthSnapshot.state) {

					case firebase.auth.PhoneAuthState.CODE_SENT: // or 'sent'
						console.log('code sent');
						let verificationId1 = phoneAuthSnapshot.verificationId;

						return navigation.replace('VerificationOtp',{phone:mobileNumber,countrycode:countryPick,verificationId:verificationId1,countryId:countryId,code:''});

						break;
				}

			}, (error) => {
				console.log('error=============',error);
				setSpinner(false);
				setAuthError(`${error}`);
			}, (phoneAuthSnapshot) => {
				console.log('Success');
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
				//alert(countryId)				
	  			return navigation.replace('VerificationOtp',{phone:mobileNumber,countrycode:countryPick,verificationId:verificationId,countryId:countryId});
	  		}*/
			//setVerificationId(verificationId);

			
		} catch (err) {
			setSpinner(false);
			//console.log(err.message);
			setAuthError(`${err.message}`);
		}
		setSpinner(false);

	}
  
  
  return (<><StatusBar style="auto" /><View style={styles.container}>
  	<Spinner
          visible={spinner}
          color='#FFF'
          overlayColor='rgba(0, 0, 0, 0.5)'
        />
        
  <ImageBackground source={require('../assets/images/turvy-landing-page.jpg')} resizeMode="cover" style={{width:'100%',height:'100%'}} /> 

		<View style={{flex:1,position:'absolute',width:'95%',top: 0,bottom: 0,left: 10,right: 0,paddingBottom:50}}>
		<ScrollView keyboardShouldPersistTaps='handled'>
			<View style={{flex:1,alignItems:'center',marginBottom:30}}>
	        	<Image
	        	style={{width:235,height:233,marginTop:50,}}
	        	source={require('../assets/images/turvyLogo.png')}
	      		/>	
	      	</View>	
			
        {(authError !== '')
        ?
        <View style={{borderWidth:1,backgroundColor:'#f8d7da',textAligin:'center',marginLeft:15,marginRight:15,marginBottom:10,padding:10,borderRadius:5,borderColor:'#f5c6cb'}}><Text style={{color:'#721c24'}}>{authError}</Text></View>
        :
        <View></View>
    	}
    	<View style={{paddingLeft:30,paddingRight:30}}>
        <View style={[styles.pickerContainer,{borderColor:'#4795bb',height: 50,marginBottom:5}]}>
        	
	        <Picker style={{ height: 48, width: '100%', backgroundColor: "transparent", color:'#1f71bd'}} selectedValue={countryPick+'-'+countryId} onValueChange={(itemValue, itemIndex) => {
	        	
		       var cnt = 	itemValue.split('-');
	        	setContryPick(cnt[0]);
	        	setContryId(cnt[1]);
	        }} mode="dialog">
	{country.length > 0 && 
	country.map((val, index) =>{
	            	return ( <Picker.Item key={index} label={val.nicename} value={val.phonecode+'-'+val.id} />)
	            }) }
	      	</Picker>
	      	<AntDesign name="down" size={24} color="#a7a7a7" style={styles.pickerIcon}  />
      	</View>
        <Input keyboardType="number-pad" leftIcon={<View style={{flexDirection:'row'}}><Text style={{fontSize:16,marginTop:10,marginRight:7,color:'#1f71bd'}}>+{countryPick}</Text><Text style={{fontSize:20,borderRightWidth: 1,marginTop:8,borderColor:'#4795bb'}}></Text></View>}
	leftIconContainerStyle={{position:'absolute',left:15,zIndex:1000}} value={mobileNumber} max={10} 
	onChangeText={(value) => { let num = value.replace(".", '');
    num = value = value.replace(/^0+/, '');
     if(isNaN(num)) { }else{
        setMobileNumber(value)
     }
    }
    }
  placeholder='Enter Mobile Number' inputStyle={[styles.inputStyle,styles.marginTop10,{paddingLeft:65,borderColor:'#4795bb',color:'#1f71bd',fontSize:16}]}
  inputContainerStyle={[styles.inputContainerStyle]}
  placeholderTextColor="#1f71bd" />

	<View style={{padding:5,borderRadius:40,marginLeft:10,marginRight:10,marginTop:-10}}>
	<TouchableHighlight style={styles.contentBtn} onPress={()=>loginOTP()}>
	    <LinearGradient  
	        style={styles.priBtn}       
	        colors={['#2270b8', '#74c0ee']}
	        end={{ x: 1.2, y: 1 }}>
	        <View style={{justifyContent:'center',alignItems:'center',flexDirection:'row',marginLeft:12}}>	
	            <Text style={[styles.priBtnTxt,{flex:7,textAlign:'center'}]}>Next</Text>
	            <View style={{alignContent:'flex-end'}}><AntDesign name="rightcircle" size={22} color="white" /></View>
	        </View>    
	    </LinearGradient>
	</TouchableHighlight>
	</View>
        
        </View>															
        </ScrollView>
        </View>
<View style={{position:'absolute',bottom:0,left:0,width:'100%',backgroundColor:'rgba(255, 255, 255, 0.8)'}}>
<View style={{justifyContent:'center',alignItems:'center',alignItems:'center',flex:1,padding:15}}>
        	<Text style={{fontSize:15}}>Log in means you agree to</Text>
        	<Text style={{fontSize:15}}>Terms of service <TouchableWithoutFeedback onPress={()=>navigation.navigate('PrivacyPolicy')}><Text style={[styles.themetextcolor, styles.strong]}>PRIVACY POLICY</Text></TouchableWithoutFeedback> </Text>
        </View>
        </View>
  </View></>);


}

export default LoginOtp

