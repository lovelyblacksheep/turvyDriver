import React, {useState, useEffect} from 'react';
import {  Provider as PaperProvider,Text,Button, Appbar, Card, Badge } from 'react-native-paper';
import {View,ScrollView, Alert, Image, StyleSheet,TouchableOpacity} from 'react-native'
import {styles, theme, DOMAIN} from './Constant';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome ,FontAwesome5 } from '@expo/vector-icons'; 
import { useNavigation } from '@react-navigation/native';
import { Divider } from 'react-native-elements';
import Spinner from 'react-native-loading-spinner-overlay';
import { AntDesign } from '@expo/vector-icons';
import UploadImage from './UploadImage';
import { MaterialIcons,Ionicons } from '@expo/vector-icons';
export default function Profile({route}) {

	const [accessTokan, setAccessTokan] = useState('');
	const [fname, setFname] = useState('');
	const [lname, setLname] = useState('');
	const [image, setImage] = useState(`${DOMAIN}images/no-person.png`);	
	const [mobile, setMobile] = useState('');	
	const [email, setEmail] = useState('');	
	const [deviceType, setDeviceType] = useState('');
	const [countryId, setCountryId] = useState('');		
	const [stateId, setStateId] = useState('');	
	const [cityId, setCityId] = useState('');		
	const [spinner, setSpinner] = useState(true);
	const [countryName, setCountryName] = useState('');		
	const [stateName, setStateName] = useState('');		
	const [cityName, setCityName] = useState('');		
	const [isEmailVerify, setIsEmailVerify] = useState(false);
	const [isPhoneVerify, setIsPhoneVerify] = useState(false);
	const [isDataFetch, setIsDataFetch] = useState(false);
	const [driverRating, setDriverRating] = useState(0);
	const [acceptPercent, setAcceptPercent] = useState(0);
	const [canceledPercent, setCanceledPercent] = useState(0);
	const [totalTrips, setTotalTrips] = useState(0);
	const [joinTime, setJoinTime] = useState(0);
	
	const navigation = useNavigation();


	useEffect(() => {
		
		getAccessToken()
		//console.log(accessTokan)

		//alert(accessTokan)

		fetch(DOMAIN+'api/driver/profile-info',{
            method: 'GET',
            headers : {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer '+accessTokan
            }
        }).then(function (response) {
            return response.json();
        }).then( (result)=> {
            //console.log('profile',result);
            const data = result.data
            setFname(data.first_name)
            setLname(data.last_name)
            
            if(data.avatar !== null){
	            setImage(DOMAIN+data.avatar)
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
            setCityName(data.city_name)
            setStateName(data.state_name)
            setCountryName(data.country_name)
            setDriverRating(data.rating)
            setJoinTime(data.joinTime)
            //email_verified_at
            
            setSpinner(false);
            setIsDataFetch(true)
        })

        fetch(DOMAIN+'api/driver/acceptance-rate',{
            method: 'GET',
            headers : {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer '+accessTokan
            }
        }).then(function (response) {
            return response.json();
        }).then( (result)=> {
            //console.log('acceptance-rate',result);
            setAcceptPercent(result.data.acceptPercent)
            setCanceledPercent(result.data.canceledPercent)
            setTotalTrips(result.data.totalTrips)
        })


	})

	async function getAccessToken(){

		await AsyncStorage.getItem('accesstoken').then((value) => {			
			if(value != '' && value !== null){
				setAccessTokan(value)
			}
		})

	}

	return (
		<>
		<Spinner
          visible={spinner}
          color='#FFF'
          overlayColor='rgba(0, 0, 0, 0.5)'
        />
        	<Appbar.Header style={{backgroundColor:'#FFF'}}>
                    <AntDesign 
                    	name="arrowleft" 
                    	size={24} 
                    	color="black" 
                    	style={{paddingLeft:10}} 
                    	onPress={()=>navigation.goBack(null)} 
                    />
                    <Appbar.Content 
                    	title="Driver Profile" 
                    	titleStyle={{textAlign:'center',alignContent:'center'}} 
                    />
                    <AntDesign 
                    	name="edit" 
                    	size={24} 
                    	color="black" 
                    	style={{paddingRight:15}} 
                    	onPress={()=>navigation.navigate('EditProfile')} 
                    />
                </Appbar.Header>
			
            {(isDataFetch)
            ?	
            <ScrollView keyboardShouldPersistTaps='handled'>
        	<View style={{paddingTop:20,alignItems:'center'}}>        		
				<UploadImage 
					imageuri={image} 
					onReload={(img) => { setImage(img) }}
				/>
        	</View>
        	<View style={{flexDirection:'row'}}>
	        	<TouchableOpacity
	        		onPress={() => navigation.navigate('DriverFeedback')}
	        		style={{flex:1}}
	        	>
	        	<View style={{height:50,alignItems:'center',justifyContent:'center'}}>
	        		<View style={{alignItems:'center',flexDirection:'row',justifyContent:'center'}}>
		        		<View><Text style={{fontSize:20}}>{driverRating}</Text></View>
		        		<View style={{paddingLeft:3}}>
		        			<Ionicons name="ios-star" size={18} color="#4a4948" />
		        		</View>
	        		</View>	        		
	        	</View>

	        	</TouchableOpacity>

	        	<TouchableOpacity	        		
	        		style={{flex:1}}
	        		onPress={() => navigation.navigate('AcceptanceRate')}
	        	>
	        	<View style={{height:50,alignItems:'center',flexDirection:'row',justifyContent:'center'}}>	        		
	        		<View><Text style={{fontSize:20}}>{acceptPercent}%</Text></View>
	        		<View style={{paddingLeft:3}}><Ionicons name="ios-person" size={18} color="#4a4948" /></View>
	        	</View>
	        	</TouchableOpacity>
	        	<TouchableOpacity	        		
	        		style={{flex:1}}
	        		onPress={() => navigation.navigate('CancellationRate')}
	        	>
	        	<View style={{height:50,alignItems:'center',flexDirection:'row',justifyContent:'center'}}>	        		
	        		<View><Text style={{fontSize:20}}>{canceledPercent}%</Text></View>
	        		<View style={{paddingLeft:3}}><MaterialIcons name="do-not-disturb-alt" size={18} color="#4a4948" /></View>
	        	</View>
	        	</TouchableOpacity>
        	</View>        	
        	<Divider orientation="horizontal" />
        	<View style={{alignItems:'center',paddingTop:20}}>
        		<Text style={{fontSize:16,fontWeight:'bold'}}>{totalTrips} trips <Text>over</Text> {joinTime} years</Text>
        		<Text style={{marginTop:5,marginBottom:5}}>Tell customers a little bit about yourself</Text>
        		<Button mode="contained" color={'#ccc'} style={{fontWeight:'normal',marginTop:5}} onPress={()=>navigation.navigate('EditProfile')} >Add Details</Button>
        	</View>
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
        	<View style={{padding:20}}>	
        		<View style={pageStyles.infoOuter}>
        			<Text style={pageStyles.lable}>City</Text>
        			<Text style={pageStyles.val}>{cityName}</Text>
        		</View>        		
        		<View style={pageStyles.infoOuter}>
        			<Text style={pageStyles.lable}>State</Text>
        			<Text style={pageStyles.val}>{stateName}</Text>
        		</View>        		
        		<View style={pageStyles.infoOuter}>
        			<Text style={pageStyles.lable}>Country</Text>
        			<Text style={pageStyles.val}>{countryName}</Text>
        		</View>        		
        	</View>
        	</ScrollView>
        	:
        	<View></View>
        	}
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