import React, {useState, useEffect} from 'react';
import {  Provider as PaperProvider,Text,Button } from 'react-native-paper';
import {View,ScrollView, Alert, TouchableHighlight,Platform} from 'react-native'
import {styles, theme, DOMAIN} from './Constant'
import { Input } from 'react-native-elements';
import Createaccount from './Createaccount';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Spinner from 'react-native-loading-spinner-overlay';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign } from '@expo/vector-icons';

export default function Signupasdriver({route}) {
	const { first_name, last_name, city_id, make_id, model_id, plate, state } = route.params
	const [emailError, setEmailError] = useState('')
	const [passwordError, setPasswordError] = useState('')
	const [email, setEmail] = useState('')
   	const [password, setPassword] = useState('')
   	const [accesstoken, setAccessToken] = useState('')
  	const [driverid, setDriverId] = useState(driverid); 
  	const [phone, setPhone] = useState(''); 
  	const [contryId, setContryId] = useState('13'); 
  	const [deviceToken, setDeviceToken] = useState('');
  	const [phoneRequire, setPhoneRequire] = useState(false);
  	const [spinner, setSpinner] = useState(false);

  	const navigation = useNavigation();
   	useEffect(()=>{
   		AsyncStorage.getItem('phone').then((value) => {
			if(value != '' && value !== null){
				setPhone(value)	
			}
		})
		AsyncStorage.getItem('contryId').then((value) => {
			if(value != '' && value !== null){
				setContryId(value)	
			}
		})
		
   		AsyncStorage.getItem('accesstoken').then((value) => {
			if(value != '' && value !== null){
				setAccessToken(value)
			}
		})
		AsyncStorage.getItem('deviceToken').then((value) => {
			if(value != '' && value !== null){
				setDeviceToken(value)
			}
		})
   	},[driverid, accesstoken, phone, contryId, deviceToken]);
   
	const submit = async () => {
		setSpinner(true);setEmailError('');setPasswordError('');
		if(email == ''){setEmailError('Email Address is required')}
		if(password == ''){setPasswordError('Password is required')}
		if(password.length < 8){setPasswordError('Please provide at least 8 Digit Password')}
		
		if(email != '' && password != '' && password.length >= 8){
			fetch(DOMAIN+'api/driver/register',{
				method: 'POST',
				headers : {
					'Content-Type': 'application/json',
					'Accept': 'application/json'
				},
	 			body: JSON.stringify({
	 				"first_name" : first_name,
	 				"last_name" : last_name,
	 				"email" : email,
	 				"password" : password,
	 				"state_id" : state,
	 				"city_id" : city_id,
	 				"make_id" : make_id,
	 				"model_id" : model_id,
	 				"plate" : plate,
	 				"phone" : phone,
	 				"country_id" : contryId,
	 				"device_type" : Platform.OS,
	 				"device_token" : deviceToken
	 			})
	 		}).then(function (response) {
	 			return response.json();
	  		}).then( (result)=> {
	  			setSpinner(false);
	  			//console.log(result);
	  			//Alert.alert(result.message);
	  			if(result.status  == 0){
	  				setPasswordError(result.message)
	  				//Alert.alert(result.message)

	  				//for Now redirect to login page coz there is error in api
	  				//when api solve error we show actual error here and remove redirect
	  				//return navigation.navigate('Thankyou'); 		
	  			}
	  			if(result.status  == 1){
			  			fetch(DOMAIN+'api/driver/login',{
								method: 'POST',
								headers : {
									'Content-Type': 'application/json',
									'Accept': 'application/json'
								},
					 			body: JSON.stringify({
					 				"phone" : phone,
					 				"password": password
					 			})
					 		}).then(function (response) {
					 			return response.json();
					  		}).then( (result)=> {
					  			//alert(result.message);
					  			if(result.status !== 0){
						  			AsyncStorage.setItem('accesstoken', result.access_token);
										AsyncStorage.setItem('expires_at', result.expires_at);
				            //AsyncStorage.setItem('countrycode', countrycode);
				            AsyncStorage.setItem('phone', phone)
				            AsyncStorage.setItem('email', email);
                    AsyncStorage.setItem('name', first_name+' '+last_name);                    
                    AsyncStorage.setItem('device_token', deviceToken);

                    fetch(DOMAIN+'api/driver/profile',{
			                  method: 'GET',
			                  headers : {
			                      'Content-Type': 'application/json',
			                      'Accept': 'application/json',
			                      'Authorization': 'Bearer '+result.access_token
			                  }
			              }).then(function (response) {
			                  return response.json();
			              }).then( (res)=> {
			                  //console.log('profile:',res.data);
			                  AsyncStorage.setItem('driverId', JSON.stringify(res.data.id));
			              })                      
				            navigation.replace('Thankyou');
						      }else{
						        	setPasswordError(result.message)
						      }
							});	
				  }else{
				  	//alert(result.message);
				  	setPasswordError(result.message)
				  }
			});
		}else{
			setSpinner(false);
		}
	}
	
  return (<PaperProvider theme={theme}>
          <View style={styles.content}>
          <Spinner
          visible={spinner}
          color='#FFF'
          overlayColor='rgba(0, 0, 0, 0.5)'
        />
      <ScrollView contentContainerStyle={styles.scrollViewStyle} keyboardShouldPersistTaps='handled'>
        <Text style={styles.h1}>Please input your account information</Text>
        <View style={styles.space30}></View>
        
        <Input
  placeholder='Email Address'
  inputStyle={styles.inputStyle}
  inputContainerStyle={styles.inputContainerStyle}
  onChangeText={value => {setEmail(value);setEmailError('')}}
  value={email}
  errorStyle={styles.error}
  errorMessage={emailError} 
  />
 <Input
  placeholder='Password'
  inputStyle={styles.inputStyle}
  inputContainerStyle={styles.inputContainerStyle}
  onChangeText={value => {setPassword(value);setPasswordError();}}
  value={password}
  errorStyle={styles.error}
  errorMessage={passwordError}
  secureTextEntry={true} 
/>
        <View style={{marginLeft:10,marginRight:10}}> 
        <TouchableHighlight             
              style={styles.contentBtn} onPress={()=> submit()}>
              <LinearGradient  
                  style={styles.priBtn}       
                  colors={['#2270b8', '#74c0ee']}
                  end={{ x: 1.2, y: 1 }}>          
                    <Text style={styles.priBtnTxt}>Next</Text>          
              </LinearGradient>
            </TouchableHighlight>           		
            </View>
      </ScrollView>
      </View>
  </PaperProvider>);
}