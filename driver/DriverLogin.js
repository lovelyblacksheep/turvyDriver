import React, {useState, useEffect} from 'react';
import {  Provider as PaperProvider,Text,Button } from 'react-native-paper';
import {View,ScrollView, Alert, TouchableHighlight, TouchableWithoutFeedback,ImageBackground} from 'react-native'
import {styles, theme, DOMAIN} from './Constant'
import { Input } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';


export default function DriverLogin({route}) {

	const [phone, setPhone] = useState('');
	const [password, setPassword] = useState('');
	const [phoneError, setPhoneError] = useState('')
	const [passwordError, setPasswordError] = useState('');	
	const navigation = useNavigation();

	useEffect (()=>{
		//registerForPushNotificationsAsync();

		AsyncStorage.getItem('accesstoken').then((value) => {			
			if(value != '' && value !== null){
				return navigation.navigate('MapViewFirst');		
			}
		})
	  	
	})

	const submit = async () => {		
		(phone === '') ? setPhoneError('Phone is required') : '';
		(password === '') ? setPasswordError('Password is required') : '';
		(phone !== '' && phone.length <= 10) ? setPhoneError('Please provide phone with +phone code like +91') : '';
		
		if(password !== '' && phone !== ''){
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
	  			console.log(result);
	  			if(result.status !== 0){
		  			AsyncStorage.setItem('accesstoken', result.access_token);
					AsyncStorage.setItem('expires_at', result.expires_at);
		            //AsyncStorage.setItem('countrycode', countrycode);
		            AsyncStorage.setItem('phone', phone)
		            navigation.navigate('MapViewFirst');
		        }else{
		        	setPasswordError(result.message)
		        }
			});	
		}
	}

	return (
		<>
		<StatusBar style="auto" />
		
        	<View style={styles.container}>
        	<ImageBackground source={require('../assets/images/background.png')} resizeMode="cover" style={{width:'100%',height:'100%'}} imageStyle= {{opacity:0.5,}} />
        		<View style={{flex:1,position:'absolute',width:'95%'}}>
      			<ScrollView contentContainerStyle={styles.scrollViewStyle} keyboardShouldPersistTaps='handled'>
      				<View style={{marginTop:60}}></View>
			        <Input
						placeholder='+13234259640'
						inputStyle={styles.inputStyle}
						inputContainerStyle={styles.inputContainerStyle}
						onChangeText={value => {setPhone(value);setPhoneError('')}}
						value={phone}
						errorStyle={styles.error}
						errorMessage={phoneError} 
						keyboardType='phone-pad'
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
					<Button
						mode={'contained'}
						style={{padding:5,borderRadius:40,marginLeft:10,marginRight:10}}
						onPress={()=> submit()}>
						Login
					</Button>
					<View style={styles.content}>       
					<View style={{flexDirection:'row'}}>
        				<View style={{alignContent:'flex-start'}}>
							<TouchableWithoutFeedback 
								activeOpacity={0.6} underlayColor="#DDDDDD" 
								onPress={() => navigation.navigate('ForgetPassword')}>
									<Text style={styles.strong}>Forget Password?</Text>
							</TouchableWithoutFeedback>       
        				</View>
        				<View style={{flex:1,justifyContent:'flex-end',alignItems:'flex-end'}}>
							<TouchableWithoutFeedback 
								activeOpacity={0.6} underlayColor="#DDDDDD" 
								onPress={() => navigation.navigate('Login')}>
									<Text>New User? <Text style={styles.strong}>Sign Up</Text></Text>
							</TouchableWithoutFeedback>
				        </View>
				    </View>			
				    </View>
	      		</ScrollView>	  
	      		</View>    		
      		</View>
      		<View style={{position:'absolute',bottom:0,left:0,width:'100%',backgroundColor:'rgba(255, 255, 255, 0.8)'}}>
<View style={{justifyContent:'center',alignItems:'center',alignItems:'center',flex:1,padding:10}}>
        	<Text>Log in means you agree to</Text>
        	<Text>Terms of service <TouchableWithoutFeedback onPress={()=>navigation.navigate('PrivacyPolicy')}><Text style={[styles.themetextcolor, styles.strong]}>PRIVACY POLICY</Text></TouchableWithoutFeedback> </Text>
        </View>
  	</View>
  		</>
  	);
}