import React, {useEffect, useState} from 'react';
import * as Font from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { Text, Button,  } from 'react-native-paper';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import {View, ScrollView,StyleSheet, ImageBackground, TouchableHighlight, TouchableWithoutFeedback, Picker,TouchableOpacity,Image,TextInput} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {styles, DOMAIN} from './Constant'
import { useNavigation } from '@react-navigation/native';
import { Input } from 'react-native-elements';
import Verification from './Verification'
import Createaccount from "./Createaccount";
import PrivacyPolicy from "./PrivacyPolicy";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Spinner from 'react-native-loading-spinner-overlay';
import InternetConnectionAlert from "react-native-internet-connection-alert";
import { AntDesign } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import FlashMessage , { showMessage, hideMessage } from "react-native-flash-message";
//import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import { firebase } from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

//import apiKeys from '../config/keys';
/*const apps = firebase.apps;

apps.forEach(app => {
  console.log('App name: ', app.name);
});

*/

const config = {
  name: 'SECONDARY_APP',
};
console.log("DEFAULT SET ",firebase);
//if (!firebase.apps.length) {

   firebase.initializeApp({
   clientId:'645200450479-qcndv5n2evt0mgehrfttjkjrpebq6ko9.apps.googleusercontent.com',
  appId: '1:645200450479:android:668585276c731d58d9155a',
  apiKey: 'AIzaSyDYXnuC1NPfZcXg9q-HM0CS1Iqd3a0BlqY',
  databaseURL: 'https://turvy-1501496198977.firebaseio.com',
  storageBucket: 'turvy-1501496198977.appspot.com',
  messagingSenderId: '645200450479',
  projectId: 'turvy-1501496198977',
},config);
//}

//const db = firebase.firestore();

const db = firestore();


function listener(user) {
  if (user) {
  	console.log(user);
    // Signed in
  } else {
  	console.log("here",user);
    // Signed out
  }
}


async function registerForPushNotificationsAsync() {
  let token;
  if (Constants.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }

    token = (await Notifications.getDevicePushTokenAsync()).data;
    const devtoken = {token};
    	AsyncStorage.setItem('deviceToken', devtoken.token);
   // console.log({token});

  } else {
    alert('Must use physical device for Push Notifications');
  }

 }

 //const firebaseConfig = secondaryApp.apps.length ? secondaryApp.app().options : undefined;
 const firebaseConfig = firebase.apps.length ? firebase.app().options : undefined;
  /*const [message, showMessage] = React.useState((!firebaseConfig || Platform.OS === 'web')
  ? { text: "To get started, provide a valid firebase config in App.js and open this snack on an iOS or Android device."}
  : undefined);
 */
/*<TouchableWithoutFeedback onPress={()=>navigation.navigate('Createaccount')}><Text>Craete Account</Text></TouchableWithoutFeedback>
<TouchableWithoutFeedback onPress={()=>navigation.navigate('Signupasdriver')}><Text>Signupasdriver </Text></TouchableWithoutFeedback>
<TouchableWithoutFeedback onPress={()=>navigation.navigate('Verification')}><Text>Verification</Text></TouchableWithoutFeedback>
<TouchableWithoutFeedback onPress={()=>navigation.navigate('Thankyou')}><Text>Thankyou</Text></TouchableWithoutFeedback>
<TouchableWithoutFeedback onPress={()=>navigation.navigate('PrivacyPolicy')}><Text>PrivacyPolicy</Text></TouchableWithoutFeedback>*/

const Login = ({props}) => {
	const navigation = useNavigation();
	const recaptchaVerifier = React.useRef(null);
	  const flref = React.useRef(null);
	//const [phoneNumber, setPhoneNumber] = React.useState();
	 const [verificationId, setVerificationId] = React.useState();
   // const [verificationCode, setVerificationCode] = React.useState();

	const [country, setContry] = useState([]);
	const [confirm, setConfirm] = useState(null);
	const [countryPick, setContryPick] = useState('61');
	const [countryId, setContryId] = useState('13');
	const [mobileNumber, setMobileNumber] = useState('');
	const [driverid, setDriverId] = useState(driverid);
	const [devicetoken , setDeviceToken] = useState('');
   const [spinner, setSpinner] = useState(false);
   const [spinnerLg, setSpinnerLg] = useState(true);
   const [islogin, setIslogin] = useState(true);

	 useEffect ( ()=>{
	 	  Font.loadAsync( {
            'Metropolis-Regular': require('../assets/fonts/Metropolis-Regular.ttf'),
            'Uber Move Text': require('../assets/fonts/ubermovetext-medium.ttf'),
        }
   	 )
      //AsyncStorage.setItem('accesstoken','eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6Ijc4NzJmNGI3NzkxMTdhMTUwM2ZiM2U4YzA4YjFjYzBhZWYwZGJiOGVlMjg2NDlhYTU3YzE3YzZkY2Q2MmMwNGNmMjY0ODBlN2ZkNjBmZDY0In0.eyJhdWQiOiIxIiwianRpIjoiNzg3MmY0Yjc3OTExN2ExNTAzZmIzZThjMDhiMWNjMGFlZjBkYmI4ZWUyODY0OWFhNTdjMTdjNmRjZDYyYzA0Y2YyNjQ4MGU3ZmQ2MGZkNjQiLCJpYXQiOjE2Mjk3ODQ2MjMsIm5iZiI6MTYyOTc4NDYyMywiZXhwIjoxNjYxMzIwNjIzLCJzdWIiOiI1NSIsInNjb3BlcyI6W119.v1AeQHN6L9AvAyRaQHGLwSpF_SmwcZz8O1hRQeu-JSf2my5GkCTpLn59eCWULclRTNmIcoscOrAXMYsAMev7QNSWemTzHoHkHj1XISGkpUtM4vnEo3hcjUHq_IzOVXiJ_jXyil-hypoShzCtKf0_8FjoNK9ywjcDokXh9OrtWmtnGwqpWNS-V-K15h_WlUFZTA9DDIokJcXnI23ha2tgeXQaYYY_K_IROpM6ZM5WQPRj_upKoPrh7yrc8RxwhuBd2af9RrFti-5EWN4xKG5p79jgFyNhxAcswa7gP1dJca5jyUZAgEL3CmdmU2esrxkbTKQkF_KlCzLaDwIYa9vFGQ9-ZFpI1qzeCUYM5YGJAK832abYP_esd96Mqz9RJp0OCrX_Ha-6TAdRPGMUg-ngopsNQEWhYYLBcO3v4cLZNdgo5RS54t3XNAppkuSRz0SOU928Zg9larVv-WZ42x01hZaZY-oipWrhkVzVdBtT5MU4yunTo1xIlnb2C1k8llBl8BkLuKwIHuF8nfY-ooEHYLGo2I_vDcY9p6fV0aXgdUPQ_TMEUzbGgvPgwNmxAD0re9rjvedxjXd6DZPdDXnyWqQjsU5P2yrt8lWt1IELeKubZ1LHe4Xz4naGNPYFhC2y6VlAt5Ku5x-MYygOnDSs5dRUUDa2sc3c89mWie12V3k');

	   	AsyncStorage.getItem('accesstoken').then((value) => {
			//alert(value);
			//console.log("API TOKEN",value);
			if(value != '' && value !== null){

		fetch('https://www.turvy.net/api/rider/profile',{
     	  	method: 'GET',
		   headers: new Headers({
		     'Authorization': 'Bearer '+value,
		     'Content-Type': 'application/json'
		   }),
		   })
      .then((response) => response.json())
      .then((json) =>{
         //console.log("here in reso");
      	console.log("RESPONSE ",json);

      	if( json.status == 1 ){
      		if(json.data.id > 0){
	      		setIslogin(true);
	      		setSpinnerLg(false);
	      		//alert(json.data.partner_id);
	      		 getLatestTrip(value);

	      		 AsyncStorage.setItem('partner_id',  JSON.stringify(json.data.partner_id));
	      		 //AsyncStorage.setItem('partner_income', json.data.partner_income);

	      		//this.props.navigation.navigate('BookDetails',this.state)
      		}else{
					setIslogin(false);
	      		setSpinnerLg(false);
	      		 AsyncStorage.removeItem('accesstoken');
	      		this.props.navigation.navigate('Login',this.state)
      		}
      	}else{
      		setIslogin(false);
      		setSpinnerLg(false);
      		 AsyncStorage.removeItem('accesstoken');
      		this.props.navigation.navigate('Login',this.state)
      	}
        }
      )
      .catch((error) =>{
      	setIslogin(false);
      	setSpinnerLg(false);
      	console.error(error)
      });

     }else{
     	setIslogin(false);
     	setSpinnerLg(false);
     }

		getCountry();
			//setDriverId(value);
	})


		registerForPushNotificationsAsync().then(token => console.log(token));
		/*AsyncStorage.getItem('accesstoken').then((value) => {
			//alert(value);
			if(value != '' && value !== null){
				return navigation.navigate('LocationEnableScreen');
			}
			//setDriverId(value);
		})
		*/

	  	  getCountry();
	},[])

	 const getrideStart = async(newdata) => {
	  	//alert(bookinid);
  	  //console.log("BOOKING ID "+this.state.bookingresponse.id);
  	  //.where('status','==','open')
  	  if(newdata.bookingresponse && newdata.bookingresponse.id ){
  	  	let bookingid = newdata.bookingresponse.id;

  		db.collection('trip_path').where('bookingId','==',bookingid)
		.get()
		.then(querySnapshot => {
			    console.log('Total bOOKING STATUS: ', querySnapshot.size);
			    if(querySnapshot.size > 0){
			    	//clearInterval(this.myinterval);
			    	//clearInterval(this.settime);
			    		//this.props.route.navigation.replace('BookingMap1',this.state.runningdata);
			    		return navigation.replace('BookingMap1',newdata);

			    //	alert("IN NCONFIRM");
			    }else{
			    	return navigation.replace('RideConfirm1',newdata);
			    }
		});
  	  }


  }

	const getLatestTrip = async (accessTokan) => {
		let last_booking_id = await AsyncStorage.getItem('last_booking_id');
		//alert(last_booking_id);
		fetch(DOMAIN+'api/rider/getCurrentRunningTrip/'+last_booking_id,{
            method: 'GET',
            headers : {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer '+accessTokan
            }
        }).then(function (response) {
            return response.json();
        }).then( (result)=> {
        	 console.log("LASTTRIP NEw 123",result);
        	  if(result.data && result.data.booking.id > 0){

        				//console.log("Assign ID ",this.state.runningtripId);
        				let origin = {
        					latitude:result.data.booking.origin_lat,
        					longitude:result.data.booking.origin_lng,

        				};
        				let destination = {
        					latitude:result.data.booking.destination_lat,
        					longitude:result.data.booking.destination_lng,

        				}
        				let newdata = {
        					origin:origin,
        					destination:destination,
        					latitudedest:result.data.booking.destination_lat,
			             longitudedest:result.data.booking.destination_lng,
			             latitudecur:result.data.booking.origin_lat,
			             longitudecur:result.data.booking.origin_lng,
			             bookingresponse:result.data.booking,
			             bookingdriver:result.data.driverinfo,
			             selectedvehicle:result.data.VehicleType,
			             waypointslnglat:result.data.waypoints,
			             selectedvehiclefare:result.data.PaymentRequest.subtotal,
			             selectsurcharge:result.data.PaymentRequest.surge,
			             selectedcancelchr:result.data.Fare.cancel_charge
        				}
        				getrideStart(newdata);

        				//
        			//return navigation.replace('LocationEnableScreen');
        	    }else{
        	    	 return navigation.replace('LocationEnableScreen');
        	    	// return navigation.replace('BookMain');
        	    }
        });
	}

	const getCountry = () => {
  		fetch(DOMAIN+'api/countries',{
			method: 'GET',
 		}).then(function (response) {
 			return response.json();
  		}).then( (result)=> {
  			//console.log(result.data);
  				setContry(result.data);
		});
	}

		const sendopt = async () =>{
		const phoneNumber = '+'+countryPick+''+mobileNumber;
		//alert(phoneNumber);
			  try {
			  /*	const  PhoneAuthListener = new firebase.auth.PhoneAuthListener();
	         //console.log(phoneProvider);
	         const verificationId = await  PhoneAuthListener.verifyPhoneNumber(phoneNumber).on('state_changed', (phoneAuthSnapshot) => {
         console.log('Snapshot state: ', phoneAuthSnapshot.state);
       });
       */
	   const confirmation = await firebase.auth().verifyPhoneNumber(phoneNumber).on('state_changed', (phoneAuthSnapshot) => {
         console.log('State: ', phoneAuthSnapshot.state);
       }, (error) => {
         console.error(error);
       }, (phoneAuthSnapshot) => {
         console.log('Success');
       });;

	         setVerificationId(verificationId);

	         console.log("VERIFICATION IF ",confirmation);
	         /*showMessage({
	           text: "Verification code has been sent to your phone.",
	         });
	         */
	         if(verificationId){
	         	return navigation.replace('Verification',{phone:mobileNumber,countrycode:countryPick,fromwhere:'login',verificationId:verificationId});
	         }

	        } catch (err) {
	        	console.log(err);

	       }
	}

	const sendoptreg = async () =>{
		const phoneNumber = '+'+countryPick+''+mobileNumber;
		//alert(phoneNumber);
			  try {
	         const phoneProvider = new firebase.auth.PhoneAuthProvider();
	         //console.log(phoneProvider);
	         const verificationId = await phoneProvider.verifyPhoneNumber(
	           phoneNumber,
	           recaptchaVerifier.current
	         );
	         setVerificationId(verificationId);

	        // console.log(verificationId);
	         /*showMessage({
	           text: "Verification code has been sent to your phone.",
	         });
	         */
	         if(verificationId){
	         	//return navigation.navigate('Verification',{phone:mobileNumber,countrycode:countryPick,fromwhere:'login',verificationId});
	         	return navigation.replace('Verification',{phone:mobileNumber,countrycode:countryPick,fromwhere:'registration',verificationId:verificationId});
	         }

	        } catch (err) {
	        	console.log(err);
	        	setSpinner(false);
	         flref.current.showMessage({ message: ""+err, type: "danger", autoHide:false, });
	       }
	}
  const login = async () =>{

  		/*if(mobileNumber =='' ){
  				 showMessage({
              message: "Simple message",
              type: "info",
            });
  				return
  		}
  		if(mobileNumber.length < 6 && mobileNumber.length > 10){
  				alert('Mobile Number Required')
  				return
  		}
  		*/
  		//alert("here");
  		try {
  			setSpinner(true);
  			/*alert('+'+countryPick+' '+mobileNumber);
	    	const confirmation = await auth().signInWithPhoneNumber('+'+countryPick+' '+mobileNumber);
	    	console.log(confirmation);
	    	alert(confirmation);
	    	setConfirm(confirmation);*/
			// '+'+countryPick+''+mobileNumber,

         // alert(DOMAIN+'api/rider/login/phone');
			fetch(DOMAIN+'api/rider/login/phone',{
				method: 'POST',
				headers : {
					'Content-Type': 'application/json',
					'Accept': 'application/json'
				},
	 			body: JSON.stringify({
	 				"phone" :'+'+countryPick+''+mobileNumber,
	 			})
	 		}).then(function (response) {
	 			return response.json();
	  		}).then( (result)=> {
	  				console.log(result);
	  				if(result.status  == 1){
	  					setSpinner(false);
	  					 sendopt();

	  					//
	  				}else if(result.message == "Not registered yet."){
	  					//alert("here");
	  					sendoptreg();
	  					/*fetch(DOMAIN+'api/rider/register/phone',{
							method: 'POST',
							headers : {
								'Content-Type': 'application/json',
								'Accept': 'application/json'
							},
				 			body: JSON.stringify({
				 				"phone" : '+'+countryPick+''+mobileNumber,
				 			})
				 		}).then(function (response) {
				 			return response.json();
				  		}).then( (result)=> {
				  			console.log(result);
				  			setSpinner(false);
				  			if(result.status  == 1){

		  				  }else{
		  				  		 showMessage({
				              message: result.message,
				              type: "danger",
				            });
						  }
				  				//console.log(result);
						});
						*/
	  					//return navigation.navigate('Createaccount',{phone:mobileNumber,countrycode:countryPick});
	  				}
	  				/*if(result.driverId > 0){
	  				 	AsyncStorage.setItem('driverId', result.driverId)

	  				}
	  				*/
			});

  			/*fetch(DOMAIN+'driver.php',{
				method: 'POST',
				headers : {
					'Content-Type': 'application/json',
					'Accept': 'application/json'
				},
	 			body: JSON.stringify({
	 				"callFor" : "Login",
	 				"mobile" : '+'+countryPick+' '+mobileNumber,
	 				"country_id" : countryId,
	 				"verification_code":confirm
	 			})
	 		}).then(function (response) {
	 			return response.json();
	  		}).then( (result)=> {
	  				if(result.driverId > 0){
	  				 	AsyncStorage.setItem('driverId', result.driverId)
						return navigation.navigate('Verification');
	  				}
			});
			*/

	  	} catch (error) {
	    	console.log(error);
	  	}
  		//if (confirm) return <Verification />;
  }

  if (islogin) {
    return (<><Spinner
          visible={spinnerLg}
          color='#FFF'
          overlayColor='rgba(0, 0, 0, 0.5)'
        /></>);
  }else{

  return (<><View style={styles.container}>
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
	<TouchableHighlight style={styles.contentBtn} onPress={()=>login()}>
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
        <View style={{marginLeft:20,marginTop:10}}>
		<View style={{flexDirection:'row'}}>
			<View style={{alignContent:'flex-start'}}>

			</View>
	    </View>
	    </View>
        </View>
        </ScrollView>
        </View>
<View style={{position:'absolute',bottom:0,left:0,width:'100%',backgroundColor:'rgba(255, 255, 255, 0.8)'}}>
<View style={{justifyContent:'center',alignItems:'center',alignItems:'center',flex:1,padding:15}}>
        	<Text style={{fontSize:15,fontFamily: "Metropolis-Regular"}}>Log in means you agree to</Text>
        	<Text style={{fontSize:15,fontFamily: "Metropolis-Regular"}}>Terms of service <TouchableWithoutFeedback onPress={()=>navigation.navigate('PrivacyPolicy')}><Text style={[styles.themetextcolor, styles.strong]}>PRIVACY POLICY</Text></TouchableWithoutFeedback> </Text>
        </View>
        </View>
            <FlashMessage  ref={flref} position={{top:'2%'}} style={{marginTop:10}} />
  </View></>);
  }
}

export default Login