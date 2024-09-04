import React, {useState, useEffect} from 'react';
import {  Provider as PaperProvider,Text,Button, Appbar, Card, Badge } from 'react-native-paper';
import {View,ScrollView, Alert, Image, StyleSheet} from 'react-native'
import {styles, theme, DOMAIN} from './Constant';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome ,FontAwesome5 } from '@expo/vector-icons'; 
import { useNavigation } from '@react-navigation/native';
import { Divider } from 'react-native-elements';
import Spinner from 'react-native-loading-spinner-overlay';
import { AntDesign } from '@expo/vector-icons';
import UploadImage from '../Components/UploadImage';

export default function Profile({route}) {

	const [accessTokan, setAccessTokan] = useState('');
	const [fname, setFname] = useState('');
	const [lname, setLname] = useState('');
	const [image, setImage] = useState('https://www.turvy.net/images/no-person.png');	
	const [mobile, setMobile] = useState('');	
	const [email, setEmail] = useState('');	
	const [deviceType, setDeviceType] = useState('');
	const [countryId, setCountryId] = useState('');		
	const [stateId, setStateId] = useState('');	
	const [cityId, setCityId] = useState('');		
	const [riderId, setRiderId] = useState(0);		
	const [spinner, setSpinner] = useState(true);
	const [countryName, setCountryName] = useState('');		
	const [stateName, setStateName] = useState('');		
	const [cityName, setCityName] = useState('');		
	const [isEmailVerify, setIsEmailVerify] = useState(false);
	const [isPhoneVerify, setIsPhoneVerify] = useState(false);
	
	const navigation = useNavigation();


	useEffect(() => {
		
		getAccessToken()
		//console.log(accessTokan)

		//alert(accessTokan)

		fetch(DOMAIN+'api/rider/profile',{
            method: 'GET',
            headers : {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer '+accessTokan
            }
        }).then(function (response) {
            return response.json();
        }).then( (result)=> {
            console.log(result);
            const data = result.data
            setRiderId(data.id);
            setFname(data.first_name)
            setLname(data.last_name)
            
            if(data.avatar !== null){
	            setImage(DOMAIN+data.avatar);
	              AsyncStorage.setItem('avatar', DOMAIN+data.avatar);
	        }
	        if(data.email_verified_at !== null){
		        setIsEmailVerify(true)
		    }
		    if(data.mobile_verified_at !== null){
		        setIsPhoneVerify(true)
		    }
            setMobile(data.mobile)
            setEmail(data.email)
            setDeviceType(data.device_type)
            setCountryId(data.country_id)
            setStateId(data.state_id)
            setCityId(data.city_id)
            //email_verified_at
            getCity();
            getState();
            getCountry();            
            setSpinner(false);
        })
	})

	async function getCity () {
		await fetch(DOMAIN+'api/cities/2',{
			method: 'GET',
 		}).then(function (response) {
 			return response.json();
  		}).then( (result)=> {
  			//console.log(result.data);
  			for (let item of result.data) {
  				if(item.id === cityId){
  					//console.log(item.name);
  					setCityName(item.name)

  				}
  			}
  				
		});
	}

	async function getState () {
		await fetch(DOMAIN+'api/states/13',{
			method: 'GET',
 		}).then(function (response) {
 			return response.json();
  		}).then( (result)=> {
  			//console.log(result.data);
  			for (let item of result.data) {
  				if(item.id === stateId){
  					//console.log(item.name);
  					setStateName(item.name)

  				}
  			}
  				
		});
	}

	async function getCountry () {
  		await fetch(DOMAIN+'api/countries',{
			method: 'GET',
 		}).then(function (response) {
 			return response.json();
  		}).then( (result)=> {  			
  			for (let item of result.data) {
  				if(item.id === countryId){
  					//console.log(item.name);
  					setCountryName(item.name)

  				}
  			}
		});
	}

	async function getAccessToken(){

		await AsyncStorage.getItem('accesstoken').then((value) => {			
			if(value != '' && value !== null){
				setAccessTokan(value)
			}
		})

	}

	return (<>
			<Spinner
          visible={spinner}
          color='#FFF'
          overlayColor='rgba(0, 0, 0, 0.5)'
        />
			<Appbar.Header style={{backgroundColor:'#FFF'}}>
               <Appbar.BackAction onPress={() => navigation.goBack()} />
                 <Appbar.Content title="Profile" titleStyle={{textAlign:'center',alignContent:'center'}} style={{flex:1}} />
            </Appbar.Header>
            <ScrollView keyboardShouldPersistTaps='handled'>
        	<View style={{padding:20,alignItems:'center'}}>        		
				<UploadImage imageuri={image} onReload={(img) => { setImage(img) }}  riderId={riderId} />
        	</View>
        	<Divider orientation="horizontal" />
        	<View style={{padding:20}}>
        		<View style={pageStyles.infoOuter}>
        			<Text style={pageStyles.lable}>First Name</Text>
        			<Text style={pageStyles.val}>{fname}</Text>
        		</View>
        		<View style={pageStyles.infoOuter}>
        			<Text style={pageStyles.lable}>Last Name</Text>
        			<Text style={pageStyles.val}>{lname}</Text>
        		</View>
        		<View style={pageStyles.infoOuter}>
        			<Text style={pageStyles.lable}>Phone Number</Text>
        			<View style={{flexDirection:'row'}}>
        			<Text style={pageStyles.val}>{mobile} </Text>
        			{(isPhoneVerify)
	        			?	
	        			<AntDesign name="checkcircle" size={24} color="green" />
	        			:
	        			<AntDesign name="closecircle" size={24} color="red" />
	        			}
        			</View>
        		</View>
        		<View style={pageStyles.infoOuter}>
        			<Text style={pageStyles.lable}>Email</Text>
        			<View style={{flexDirection:'row'}}>
	        			<Text style={pageStyles.val}>{email} </Text>
	        			{(isEmailVerify)
	        			?	
	        			<AntDesign name="checkcircle" size={24} color="green" />
	        			:
	        			<AntDesign name="closecircle" size={24} color="red" />
	        			}
        			</View>
        		</View>
        	</View>
        	<Divider orientation="horizontal" />
        	
        	</ScrollView>
        </>	
    );    
}

const pageStyles = StyleSheet.create({
	infoOuter:{
		marginBottom:20
	},
	lable:{
		fontSize:20,
		color:'#a4a4ac',
		marginBottom:5
	},
	val:{
		fontSize:20,
		color:'#000'
	}

})