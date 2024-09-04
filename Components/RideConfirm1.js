import React from "react";
import { StyleSheet, Text, View,Dimensions,Image,ScrollView ,TouchableOpacity,ToastAndroid,ActivityIndicator,BackHandler,StatusBar,Platform,Linking,Modal,TouchableHighlight,Animated,Pressable} from 'react-native';
//import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';
import { EvilIcons,Ionicons,MaterialCommunityIcons,FontAwesome5,Feather,AntDesign,Entypo } from '@expo/vector-icons'; 
const imagemarker = require('../assets/location-pin-2965.png');
const driversummy = require('../assets/driversummy.png');
const imageveh = require('../assets/images/driver-veh-images_60.png');
import imagevehIcon from '../assets/images/driver-veh-images_60.png';
//import Animated from 'react-native-reanimated';
import BottomSheet from 'reanimated-bottom-sheet';
import { Button ,Badge,TextInput} from 'react-native-paper';
import { Col, Row, Grid } from "react-native-easy-grid";
import AsyncStorage from '@react-native-async-storage/async-storage';
import FlashMessage , { showMessage, hideMessage }  from "react-native-flash-message";
import { Divider } from 'react-native-elements';
const StatusBarheight = StatusBar.currentHeight+80;
import { Audio } from 'expo-av';
const { width, height } = Dimensions.get('window');
import CancelPop from './CancelPop';
import Pusher from 'pusher-js/react-native';
import TopBar from "./TopBar";
import SendMessage from './SendMessage';
import InMessages from './InMessages';
import messaging from '@react-native-firebase/messaging';
import {debug} from './Constant'; 

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0043;
const SCREENHEIGHT = height*.60;
const DEVICE_WIDTH = width;
const DEVICE_HEIGHT = height;		
//console.log("height");
//console.log(SCREENHEIGHT);

import Annotation from '@react-native-mapbox-gl/maps/javascript/components/annotations/Annotation'; // eslint-disable-line import/no-cycle
//import MapboxGL from "@rnmapbox/maps";
import  MapboxGL from "@react-native-mapbox-gl/maps"; 
//MapboxGL.setAccessToken("pk.eyJ1IjoibWFsLXdvb2QiLCJhIjoiY2oyZ2t2em50MDAyMzJ3cnltMDFhb2NzdiJ9.X-D4Wvo5E5QxeP7K_I3O8w");
import { lineString as makeLineString } from '@turf/helpers';
import { point } from '@turf/helpers';
import  { changeMode, 
    MapboxCustomURL} from  "../Riders/MapDayNight";


//const haversine = require('haversine')

import * as firebase from "firebase";
import firestore from '@react-native-firebase/firestore';
import * as geofirestore from 'geofirestore';
import apiKeys from '../config/keys';

if (!firebase.apps.length) {
    console.log('Connected with Firebase')
    firebase.initializeApp(apiKeys.firebaseConfig);
}

const db = firestore();

const GeoFirestore = geofirestore.initializeApp(db);
const geocollection = GeoFirestore.collection('driver_locations');

/*const distance = require('google-distance-matrix');
distance.key('AIzaSyAr2ESV30J7hFsOJ5Qjaa96u9ADSRX6_Sk');
distance.units('imperial');
*/
export default class RideConfirm1 extends React.Component {
  constructor(props) {
    super(props);
    this.startPoint = [151.2195, -33.8688];
    this.finishedPoint = [151.2195, -33.8688];
    this.state = {
        	step:1,
        	locationcur:{},
        	sourceLocation:{},
        	latitudecur:-33.8688,
        	longitudecur:151.2195,
         latitudedest:'',
        	longitudedest:'',
        	destlocatdesc:'',
        	latitudeDelta: 0.007683038072176629,
         longitudeDelta: 0.004163794219493866,
         origin:{},
         destination:{},
         duration:'',
         durationdisplay:'',
         servicetypes:[],
         selectedvehicle:{},
         inprocessing:0,
         rotateValue: new Animated.Value(0),
         display:false,
         modalvisible:false,
         sendMessage:false,
         inmessagevisible:false,
         distance:'',
         bookingdriver:{},
         driverLocation:{},
         distanceTravelled:'',
         drivertoloccord:{},
         bookingresponse:{},
         rideinfoinprocess:{},
         snaptoval:['57%', '40%'],
         snapIndex:0,
         notadjust:false,
         displaydriveloc:false,
         imagezoom:'',
         vehinfo:{},
         waypointslnglat:[],
         congdone:false,
         selectedcancelchr:0,
         drivernear:{},
         tripstart:false,
         rewardpoints:0,
         selectedvehiclefare:0,
         selectsurcharge:0,
         heading: 0,
         pathHeading:0,
         pathCenter:{},
         min1ack:false,
         min5ack:false,
         min15ack:false,
         cust15ack:false,
         cust5ack:false,
         cust1ack:false,
         custack:false,
         messagecount:0,
         drivername:'',
         routemap:null,
         soundcont:false,
         locationcordsapistr:null,
         chatMessage:[],
         MapboxStyleURL:MapboxCustomURL,
		 alert5min:false,
		 alert15min:false,
		 alertCongrats:false,
		 alert1min:false,
         routecorrdinates:[
          this.startPoint, //point A "current" ~ From
          this.finishedPoint, //Point B ~ to
         ],
          routedirect: {
            type: 'FeatureCollection',
            features: [{
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'LineString',
                  coordinates: [
                    this.startPoint, //point A "current" ~ From
                    this.finishedPoint, //Point B ~ to
                  ],
                },
                style: {
                  fill: 'red',
                  strokeWidth: '10',
                  fillOpacity: 0.6,
                  lineWidth:6,
                  lineColor:'#fff'
                },
                paint: {
                  'fill-color': '#088',
                  'fill-opacity': 0.8,
                },
              },
            ],
       },
       routediver: {
            type: 'FeatureCollection',
            features: [{
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'LineString',
                  coordinates: [
                    this.startPoint, //point A "current" ~ From
                    this.finishedPoint, //Point B ~ to
                  ],
                },
                style: {
                  fill: 'red',
                  strokeWidth: '10',
                  fillOpacity: 0.6,
                  lineWidth:6,
                  lineColor:'#fff'
                },
                paint: {
                  'fill-color': '#088',
                  'fill-opacity': 0.8,
                },
              },
            ],
       },
         
    };
    this.mapView = null;
    this._onLongPressButton = this._onLongPressButton.bind(this);
    this.myinterval = React.createRef();
     this.bottomSheetRef = React.createRef();
    this.settime = React.createRef();
    this.onGoBackCallback = this.onGoBackCallback.bind(this);
    
    this.pusher = new Pusher('389d667a3d4a50dc91a6', { cluster: 'ap2' }); 
    this.listenForChanges(); 
     //ToastAndroid.show('New message arrive! Test from rider', ToastAndroid.LONG);
     	
   }
   
   listenForChanges = () => {

		
		const channel = this.pusher.subscribe('turvy-channel'); 
		 channel.bind('book_aftercancel_event', data => {
		 	this.getrideCancel();
		  //alert(JSON.stringify(data));
		  }); 
		   	//
        	 	 	//
		 channel.bind('tap_to_depart_event', data => {
		 	this.getrideStart();
		 	//console.log("TAP TO DAPART",JSON.stringify(data));
		 // alert(JSON.stringify(data));
		 });
		 channel.bind('notify_rider_remain_time', data => {
		    console.log("notify_rider_remain_time",data);
		    if(data.rider_id == this.state.bookingresponse.rider_id && data.durationRemaining == 0 && !this.state.alertCongrats){
				
		    	this.runsoundCongrats(); 
		    }
		    
		 });
		  
	};
   
   _onLongPressButton(imagezoom) {
    this.setState({
    	modalvisible:true,
    	imagezoom:imagezoom,
    })
  }
  
   _onPressDone(){
		this.setState({
			modalvisible:false
		});   
   }
   
   renderMessagesDriver = () =>{
    	return (
		<Pressable
			style={{position:'absolute',top:130,zIndex:99,width:'100%',}}
			onPress={() => {
				this.hideCongratsAlert()
			}}
		>
			<View style={{backgroundColor:'#135AA8',marginHorizontal:30,borderRadius:10,paddingVertical:10}}>
				<View style={{flex:1,alignContent:'center',justifyContent:'center',flexDirection:'row'}}><Text style={{color:'#fff',fontSize:35,padding:3,fontFamily: "Metropolis-Regular",textAlign:'center'}}>Congrats</Text>
				</View>
				<View style={{flex:1,alignContent:'center',justifyContent:'center',flexDirection:'row'}}>
				<Text style={{color:'#fff',fontSize:20,padding:3,fontFamily: "Metropolis-Regular",textAlign:'center'}}>Your driver has arrived</Text></View>
			</View>
    	</Pressable>
		);
  }

  
    
   renderDriverLocation = () =>{
   if(this.state.driverLocation && Object.keys(this.state.driverLocation).length > 0 && this.state.driverLocation.latitude != null && this.state.driverLocation.longitude != null ){
    	
    	let rotateAngl = 0;
   rotateAngl = (this.state.heading/360);
  	/*const spin = this.state.rotateValue.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg']
    });
    	console.log("SPIN",spin);
    	*/
    	return (
    	<Annotation
    	   animated={true}
          id="mapboxUserLocation"
           coordinates={[this.state.driverLocation.longitude,this.state.driverLocation.latitude]}
          style={{  
            iconRotate: this.state.heading,
          }}
    	>
    	<MapboxGL.SymbolLayer
              id="symbolLocationSymbols"
              minZoomLevel={1}
              style={{ iconImage:imagevehIcon,
    iconAllowOverlap: true,
    iconSize:0.5,
     iconRotate: rotateAngl,
    }}
            />
		 </Annotation>
     	   );
     	 }else{
     	 	return null;
     	 }
  }
  
  
  onPlaybackStatusUpdate15 = (PlaybackStatus)=>{
  //	console.log("START FOR 15 MIN",PlaybackStatus);
      this.setState({
      	min15ack:true,
      })
  		if(PlaybackStatus.didJustFinish == true){
  			if(this.state.cust15ack == false){
  				this.setState({
	      	 min15ack:false,
	        });
  			}
  			
  			//console.log("START FOR 15 MIN Sound Complete");
  		}
  }
  
  onPlaybackStatusUpdate = (PlaybackStatus) => {
  	//console.log(PlaybackStatus);
     this.setState({
      	congdone:true,
      })

	  //alert(PlaybackStatus.isPlaying)
      
  		if(PlaybackStatus.didJustFinish == true){
  			//console.log("Sound Complete");
  			if(this.state.custack == false){
  				//runsound();
  				this.setState({
	      	 congdone:false,
	        });
  			}
  		}

		if(PlaybackStatus.isPlaying){
			setTimeout(()=>{
				this.stopRunSound()
			}, 5000);
		}
  }
  
  onPlaybackStatusUpdate5 = (PlaybackStatus) => {
  	//console.log("START FOR 5 MIN",PlaybackStatus);
      this.setState({
      	min5ack:true,
      })
  		if(PlaybackStatus.didJustFinish == true){
  			if(this.state.cust5ack == false){
  				this.setState({
	      	 min5ack:false,
	        });
  			}
  			//console.log("START FOR 5 MIN Sound Complete");
  		}
  }
  
  onPlaybackStatusUpdate1m = (PlaybackStatus) => {
  	//console.log("START FOR 5 MIN",PlaybackStatus);
      this.setState({
      	min1ack:true,
      })
  		if(PlaybackStatus.didJustFinish == true){
  			if(this.state.cust1ack == false){
  				this.setState({
	      	 min1ack:false,
	        });
  			}
  			//console.log("START FOR 5 MIN Sound Complete");
  		}
  }
  
  onRegionChangeComplete = (region) => {
        //console.log('onRegionChangeComplete', region);
        //console.log("On region change", region);
        this.setState({
            latitudeDelta: region.latitudeDelta,
            longitudeDelta: region.longitudeDelta,
        })
        
        
        
        /*this.setState({
	         latitudeDelta: 0.008765219166956939,
	         longitudeDelta: 0.005394257605075836,
	     });
	     */
        
       /* this.setState({
            latitudeDelta: 0.007683038072176629,
            longitudeDelta: 0.004163794219493866,
        })
        */
        
    };
  
  async getrideStart(){
  	  //console.log("BOOKING ID "+this.state.bookingresponse.id);
  	  //.where('status','==','open')
  	  //alert(this.state.bookingresponse.id);
  	   //console.log("test abc comp BOOKING ID",this.state.bookingresponse.id);
  		firestore().collection('trip_path').where('bookingId','==',this.state.bookingresponse.id)
		.get()
		.then(querySnapshot => {
			    //console.log('Total bOOKING STATUS: ', querySnapshot.size);
			    
			    if(querySnapshot.size > 0){
			    
			    	clearInterval(this.myinterval);
			    	clearInterval(this.settime);
			    	if(this.state.soundcont){
			      	//alert("SOUND STOP");
			      	this.state.soundcont.setIsLoopingAsync(false)
						this.state.soundcont.stopAsync();
			      }
			    	this.setState({
			    		tripstart:true,
			    	},()=>{
			    		setTimeout( () => {
							this.props.navigation.replace('BookingMap1',this.state);
						},3000);
			    		
			    	})
			    //	alert("IN NCONFIRM");
			    }																												
		});
  }
  
   	async getrideCancel(){
		await AsyncStorage.getItem('accesstoken').then((value) => {
  		 	//alert('https://turvy.net/api/rider/requestbookstatus/'+this.state.bookingresponse.id);
      		fetch('https://www.turvy.net/api/rider/requestbookstatus/'+this.state.bookingresponse.id,{
				method: 'GET', 
				headers: new Headers({
					'Authorization': 'Bearer '+value, 
					'Content-Type': 'application/json'
				}),
		   	})
      		.then((response) => response.json())
      		.then((json) =>{ 
				//console.log("get status if driver accept");
				//console.log("CANCEL RESPONSE ",json);
				if(json.message == 'not assigned'){
						//alert("IN NOT ASSIGNED ");
					if(this.state.soundcont){
						//alert("SOUND STOP");
						this.state.soundcont.setIsLoopingAsync(false)
						this.state.soundcont.stopAsync();
					}
					clearInterval(this.myinterval);
					clearInterval(this.settime);
					this.props.navigation.replace('BookProcess',this.state);
				}
      	
      	
      			if(json.message == 'cancel'){
					this.refs.fmcancelInst.showMessage({
						message: 'Trip Request had been cancelled by Driver!',
						type: "warning",
						autoHide:false,
						style:{
							margin:20,
							borderRadius:10,
							alignItems:'center',
							justifyContent:'center'
						},
		        	});
		      		clearInterval(this.myinterval);
		      		clearInterval(this.settime);
					setTimeout(function(){
						if(this.refs.fmcancelInst){
							this.refs.fmcancelInst.hideMessage();
						}
						if(this.state.soundcont){
							//alert("SOUND STOP");
							this.state.soundcont.setIsLoopingAsync(false)
								this.state.soundcont.stopAsync();
						}
						this.setState({
								tripstart:true
						},()=>{
							this.props.navigation.replace('BookMain');
						});
					}.bind(this), 5000);
      			}
			}); 
     	}); 	  	
   	}
  
  	async runsoundCongrats(){

		console.log('runsoundCongrats===============')
		await this.stopRunSound()

		
	
		if(!this.state.alertCongrats){
			this.setState({
				alertCongrats:true
			})

			const {soundcont} = this.state
			let sndObj = JSON.parse(soundcont._lastStatusUpdate)
			console.log('isPlaying============', sndObj.isPlaying)
			if(!sndObj.isPlaying){
				await soundcont.playAsync();
				soundcont.setIsLoopingAsync(true);
			}
			setTimeout(()=>{
				soundcont.setIsLoopingAsync(false)
				soundcont.stopAsync();
			}, 10000);
		}

		/* const { sound } = await Audio.Sound.createAsync(
			require('../assets/rider_driver_arriving.mp3'),
			{},
			this.onPlaybackStatusUpdate,
		);
		
		//setSound(sound);		
		console.log('Playing Sound');
		await sound.playAsync();
		sound.setIsLoopingAsync(true);
		this.setState({
			soundcont:sound,
		}); */

		
		/*
		this.refs.fmLocalIntstance.showMessage({
			message: '',
			type: "default",
			backgroundColor: "#135AA8", 
			autoHide:false,
			style:{
				borderRadius:10,
				alignItems:'center',
				justifyContent:'center',
				marginHorizontal:20,
				marginTop:50
			},
			onPress: ()=>{
				sound.setIsLoopingAsync(false)
				sound.stopAsync();
				
				this.setState({
					congdone:true,
					custack:true,
				});
				this.refs.fmLocalIntstance.hideMessage()
			},
			renderCustomContent: ()=>{
				return this.renderMessagesDriver();
			},
		});
		*/
		// this.props.navigation.navigate('BookingMap',this.state);
  	}
  
	stopRunSound = async () => {

		const {soundcont} = this.state;
		
		if(soundcont){
			//alert('stop sound')
			soundcont.setIsLoopingAsync(false)
			soundcont.stopAsync();
		}
		if(this.refs.fmLocalIntstance){
			this.refs.fmLocalIntstance.hideMessage()
		}
		
	}

  
  async run15MinSound(){

		this.stopRunSound()
		const {soundcont} = this.state
		this.setState({
			alert15min:true
		})
		await soundcont.playAsync();
		soundcont.setIsLoopingAsync(true)

		setTimeout(()=>{
			soundcont.setIsLoopingAsync(false)
			soundcont.stopAsync();
		}, 10000);

		/* const { sound } = await Audio.Sound.createAsync(
			require('../assets/rider_driver_arriving.mp3'),
			{},
			this.onPlaybackStatusUpdate15,
		);
		await sound.playAsync();
		sound.setIsLoopingAsync(true)
		 this.setState({
		    	soundcont:sound,
		    });
			setTimeout(()=>{
				sound.setIsLoopingAsync(false)
				sound.stopAsync();
			}, 10000); */
		/*
		this.refs.fmLocalIntstance.showMessage({
			message: '',
			type: "default",
			backgroundColor: "#135AA8", 
			autoHide:false,
			style:{
				
				borderRadius:10,
				alignItems:'center',
				justifyContent:'center',
				marginHorizontal:20,
				marginTop:50
			},
			onPress: ()=>{
				sound.setIsLoopingAsync(false)
				sound.stopAsync();
				
				this.setState({
					min15ack:true,
					cust15ack:true,
				});
				this.refs.fmLocalIntstance.hideMessage()
			},
			renderCustomContent: ()=>{
				return this.renderDriverMessage('15');
			},
		});
		*/
		
		//
		// this.props.navigation.navigate('BookingMap',this.state);
	}

	async run5MinSound(){
		this.stopRunSound()

		//this.renderDriverMessage('5');

		const {soundcont} = this.state

		this.setState({
			alert5min:true
		})

		await soundcont.playAsync();
		soundcont.setIsLoopingAsync(true)
		
		setTimeout(()=>{
			soundcont.setIsLoopingAsync(false)
			soundcont.stopAsync();
		}, 10000);

		/* const { sound } = await Audio.Sound.createAsync(
			require('../assets/rider_driver_arriving.mp3'),
			{},
			this.onPlaybackStatusUpdate5,
		);
		await sound.playAsync();
		sound.setIsLoopingAsync(true)
		this.setState({
			soundcont:sound,
		});
		setTimeout(()=>{
			sound.setIsLoopingAsync(false)
			sound.stopAsync();
		}, 10000); */

		/*const { sound } = await Audio.Sound.createAsync(
			require('../assets/rider_driver_arriving.mp3'),
			{},
			this.onPlaybackStatusUpdate5,
		);
		await sound.playAsync();
		sound.setIsLoopingAsync(true)
		 this.setState({
		    	soundcont:sound,
		    });
			setTimeout(()=>{
				sound.setIsLoopingAsync(false)
				sound.stopAsync();
			}, 10000);
		this.refs.fmLocalIntstance.showMessage({
			message: '',
			type: "default",
			backgroundColor: "#135AA8", 
			autoHide:false,
			style:{
				marginHorizontal:20,
				marginTop:50,
				borderRadius:10,
				alignItems:'center',
				justifyContent:'center'
			},
			renderCustomContent: ()=>{
				return this.renderDriverMessage('5');
			},
			onPress: ()=>{
				sound.setIsLoopingAsync(false)
				sound.stopAsync();
				this.setState({
					min5ack:true,
					cust5ack:true,
				});
				this.refs.fmLocalIntstance.hideMessage()
			},
		});
		
		// this.props.navigation.navigate('BookingMap',this.state);
		*/
	}
	
	render1minDriverMessage = (time) =>{
		return (
			<Pressable
			style={{position:'absolute',top:130,zIndex:99,width:'100%',}}
			onPress={() => {
				this.hide1minAlertMessage()
			}}
		>
			<View style={{backgroundColor:'#135AA8',marginHorizontal:30,borderRadius:10,paddingVertical:10}}>
				<View style={{flex:1,alignContent:'center',justifyContent:'center',flexDirection:'row'}}>
					<Text style={{color:'#fff',fontSize:20,padding:3,fontFamily: "Metropolis-Regular",textAlign:'center'}}>Your driver arrives in</Text>
				</View>
				<View style={{flex:1,alignContent:'center',justifyContent:'center',flexDirection:'row'}}>
					<Text style={{color:'#fff',fontSize:25,padding:3,fontFamily: "Metropolis-Regular",textAlign:'center'}}>{time} Minute</Text>
				</View>
				<View style={{flex:1,alignContent:'center',justifyContent:'center',flexDirection:'row'}}>
					<Text style={{color:'#fff',fontSize:25,padding:3,fontFamily: "Metropolis-Regular",textAlign:'center'}}>Please Wave {'\u270B'}</Text>
				</View>
				</View>
			</Pressable>
		);
	}
	
	renderDriverMessage = (time) =>{
		return (
			<Pressable
				style={{position:'absolute',top:130,zIndex:99,width:'100%',}}
				onPress={() => {
					this.hideAlertMessegeTime(time)
				}}
			>
				<View style={{backgroundColor:'#135AA8',marginHorizontal:30,borderRadius:10,paddingVertical:10}}>
					<View style={{flex:1,alignContent:'center',justifyContent:'center',flexDirection:'row'}}>
						<Text style={{color:'#fff',fontSize:20,padding:3,fontFamily: "Metropolis-Regular",textAlign:'center'}}>Your driver arrives in</Text>
					</View>
					<View style={{flex:1,alignContent:'center',justifyContent:'center',flexDirection:'row'}}>
						<Text style={{color:'#fff',fontSize:25,padding:3,fontFamily: "Metropolis-Regular",textAlign:'center'}}>{time} Minutes</Text>
					</View>
				</View>
			</Pressable>
		);
	}

	hideAlertMessegeTime = async (time) => {
		this.stopRunSound()
		if(time == '5'){			
			this.setState({
				min5ack:true,
				cust5ack:true,
				alert5min:false
			});
		}
		if(time == '15'){
			this.setState({
				min15ack:true,
				cust15ack:true,
				alert15min:false
			});
		}
	}

	hide1minAlertMessage = () =>  {
		this.stopRunSound()
		this.setState({
			min1ack:true,
			cust1ack:true,
			alert1min:false
		});
		this.hideAlertMessegeTime('15')
		this.hideAlertMessegeTime('5')
	}

	hideCongratsAlert = () => {

		//console.log('sound object===============', this.state.soundcont)

		//this.stopRunSound()
		this.state.soundcont.setIsLoopingAsync(false)
		this.state.soundcont.stopAsync();

		this.setState({
			congdone:true,
			custack:true,
			alertCongrats:false,
		});
		this.hideAlertMessegeTime('15')
		this.hideAlertMessegeTime('5')
		this.hide1minAlertMessage()
		this.stopRunSound()
	  }
	
	async run1MinSound(){
		this.stopRunSound()
		this.setState({
			alert1min:true
		})

		const {soundcont} = this.state

		await soundcont.playAsync();
		soundcont.setIsLoopingAsync(true)
		
		setTimeout(()=>{
			soundcont.setIsLoopingAsync(false)
			soundcont.stopAsync();
		}, 10000);


		/* const { sound } = await Audio.Sound.createAsync(
			require('../assets/rider_driver_arriving.mp3'),
			{},
			this.onPlaybackStatusUpdate1m,
		);
		await sound.playAsync();
		sound.setIsLoopingAsync(true)
		this.setState({
		    soundcont:sound,
		 });
		 setTimeout(()=>{
			sound.setIsLoopingAsync(false)
			sound.stopAsync();
		}, 10000); */
		/*
		this.refs.fmLocalIntstance.showMessage({
			message: '',
			type: "default",
			backgroundColor: "#135AA8", 
			autoHide:false,
			style:{
				marginHorizontal:20,
				marginTop:50,
				borderRadius:10,
				alignItems:'center',
				justifyContent:'center'
			},
			renderCustomContent: ()=>{
				return this.render1minDriverMessage('1');
			},
			onPress: ()=>{
				sound.setIsLoopingAsync(false)
				sound.stopAsync();
				this.setState({
					min1ack:true,
					cust1ack:true,
				});
				this.refs.fmLocalIntstance.hideMessage()
			},
		});
		*/
		
		// this.props.navigation.navigate('BookingMap',this.state);
	}
   
   async getVehcileDetails(driverId){
   	//alert('https://turvy.net/api/driver/getdriverVeh/'+driverId);
   	fetch('https://www.turvy.net/api/driver/getdriverVeh/'+driverId,{
     	  	method: 'GET', 
		   headers: new Headers({
		     'Content-Type': 'application/json'
		   }),
		   })
      .then((response) => response.json())
      .then((json) =>{ 
      	//console.log("vehcile Details");
      	//console.log(json);
      	
      	if(json.status == 1){
      		this.setState({
      			vehinfo:json.data
      		});
      		
      	}
     	 }
      )
      .catch((error) =>{
      	console.error(error);
      });
      
   }
   
    // Converts from degrees to radians.
    toRadians = (degrees) => {
      return (degrees * Math.PI) / 180;
    }

    // Converts from radians to degrees.
    toDegrees = (radians) => {
      return (radians * 180) / Math.PI;
    }
	
   
    getHeading = (origin, destination) => {
        const originLat = this.toRadians(origin.latitude);
        const originLng = this.toRadians(origin.longitude);
        const destLat = this.toRadians(destination.latitude);
        const destLng = this.toRadians(destination.longitude);

        const y = Math.sin(destLng - originLng) * Math.cos(destLat);
        const x =
        Math.cos(originLat) * Math.sin(destLat) -
        Math.sin(originLat) * Math.cos(destLat) * Math.cos(destLng - originLng);
        const heading = this.toDegrees(Math.atan2(y, x));
        return (heading + 360) % 360;
    }

    async getLnglatdriver2source(dLocation){
    	let loctstring = dLocation.longitude+','+dLocation.latitude+';'+this.state.origin.longitude+','+this.state.origin.latitude;
    	
    	fetch('https://api.mapbox.com/directions/v5/mapbox/driving/'+loctstring+'?overview=full&geometries=geojson&access_token=pk.eyJ1IjoibWFsLXdvb2QiLCJhIjoiY2oyZ2t2em50MDAyMzJ3cnltMDFhb2NzdiJ9.X-D4Wvo5E5QxeP7K_I3O8w',{
				method: 'GET',
	 		}).then(function (response) {
	 			return response.json();
	  		}).then( (result)=> {
	  			//console.log("Data from api geomery ",result.routes[0].geometry);
	  			let distance = result.routes[0].distance;
	  			distance = distance/1000;
	  			//alert(distance);
	  				//alert(result.routes[0].duration);
	  			let duration = result.routes[0].duration;
	  			duration = result.routes[0].duration/60;
	  			//console.log("---- DURATION --- ",duration );
	  			
	  			//alert(duration);
	  			if(duration < 1 && duration > 0){
	  				duration= 1;
	  			}
	  			duration = duration.toFixed();
				//	alert(duration);
	  			   if(duration == 15 && this.state.min15ack == false){
						this.run15MinSound()
					}
					if(duration == 5 && this.state.min5ack == false){
						this.run5MinSound()
					}
					if(duration == 1 && this.state.min1ack == false){
						this.run1MinSound()
					}

	  			//console.log("COORDINATES ARRAY", Object.values(result.routes[0].geometry.coordinates));
	  			this.setState({
	  			
	  			routediver: {
            type: 'FeatureCollection',
            features: [{
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'LineString',
                  coordinates: Object.values(result.routes[0].geometry.coordinates),
                },
                style: {
                  fill: 'red',
                  strokeWidth: '20',
                  fillOpacity: 0.6,
                },
                paint: {
                  'fill-color': '#088',
                  'fill-opacity': 0.8,
                },
              },
            ],
       },
       	display:true,
       	duration:duration,
	  			},()=>{
	  				/*if(this.camera) {
	  				 this.camera.moveTo([this.state.driverLocation.longitude, this.state.driverLocation.latitude], 800); // eases camera to new location based on duration			
	  				}
	  				*/
	  				//this.camera.fitBounds([this.state.origin.longitude, this.state.origin.latitude], [this.state.longitudedest,this.state.latitudedest],[150,40,250,20],1000);
	  				//this.updatecarLoc();
	  			});
			});
  
    }   
     
    async updatecarLoc(){

    		//console.log(cords);
    		//const await 
    		this.settime =  setInterval(()=>{ 
    		       //alert(this.props.route.params.bookingdriver.id);
    		       //console.log("test abc",this.props.route.params.bookingdriver.id);
    				var docRef = firestore().collection("driver_locations").doc(JSON.stringify(this.props.route.params.bookingdriver.id));
                docRef.get().then((doc) => {
                    if (doc.exists) {
                        //console.log("Document data:", doc.data());
                        this.setState({ driverLocation:doc.data().coordinates,
           					 heading:doc.data().heading },()=>{
           					 	 
					       	//console.log(" ORGIN SET ",this.state.driverLocation);      	
					       	//console.log(" ORGIN SET LONGITUDE",this.state.driverLocation.longitude);      
					       	this.getLnglatdriver2source(this.state.driverLocation);	
					       });
					       /*
					        driverCoordinate: new AnimatedRegion({
					                latitude: doc.data().coordinates.latitude,
					                longitude: doc.data().coordinates.longitude,
					                latitudeDelta: 0.0943,
					                longitudeDelta: 0.0943,
					            }),
					       */
                    } else {
                        // doc.data() will be undefined in this case
                        //console.log("No such document!");
                    }
                    
                    let rotateAngl = 0;
                    rotateAngl = (doc.data().heading/360);
                     if(rotateAngl > 0.5){
			                rotateAngl = rotateAngl - 1
			            }
			            
                   Animated.timing(this.state.rotateValue, {
			                toValue: rotateAngl,
			                duration: 2000,
			                useNativeDriver: true,
			            }).start();
		            
					
                    
                    const newCoordinate = {
					                latitude: doc.data().coordinates.latitude,
					                longitude: doc.data().coordinates.longitude,
					                latitudeDelta: this.state.latitudeDelta,
					                longitudeDelta: this.state.longitudeDelta,
					            };

					            
					      if(this.camera) {
					      	//console.log("Heading ",this.state.heading);
					      	this.camera.setCamera({
                            centerCoordinate: [this.state.driverLocation.longitude, this.state.driverLocation.latitude],
                            animationDuration: 6000,
                            heading:this.state.heading,
                            pitch:180,
                            zoomLevel:16
                        })
					      	//this.camera.moveTo([doc.data().coordinates.longitude, doc.data().coordinates.latitude], 200)
					      	
				           /* this.mapView.animateCamera({
				                center:{
				                    latitude: doc.data().coordinates.latitude,
				                    longitude: doc.data().coordinates.longitude,
				                },
				               heading : this.state.pathHeading
				            });
				            */
				        }      
					            
                }).catch((error) => {
                    //console.log("Error getting document:", error);
                });
			  }, 4000);						
    }
	
	createSoundObject = async () => {
		const { sound: playbackObject} = await Audio.Sound.createAsync(
			require('../assets/rider_driver_arriving.mp3'),
			{},
			this.onPlaybackSoundObject,
		);

		this.setState({
			soundcont:playbackObject
		},() =>{
			//console.log('create sound object===========',this.state.soundcont)
		})
	}

	onPlaybackSoundObject = (PlaybackStatus) => {
		//console.log('PlaybackStatus==========', PlaybackStatus)
	}
   	 
    componentDidMount(){
    	this.createSoundObject()
    	this.setState({
            MapboxStyleURL:changeMode()
        })
        this.intervalModeChange = setInterval(async () => {
            this.setState({
                MapboxStyleURL:changeMode()
            })
        }, 10000);
    	const {navigation,state} = this.props;
			
			let listcord = [];
   	let locationcordsapi = [];
   	//console.log("BEFORE DESINARION",this.props.route.params.origin);
   	 if(Object.keys(this.props.route.params.origin).length > 0){
      	//console.log("origin from");
       	 let origincord = [this.props.route.params.origin.longitude,this.props.route.params.origin.latitude];
       	 let element = { coordinates: origincord };
       	 locationcordsapi.push(origincord);
       	 //listcord = Object.assign(listcord, element);
       	 listcord.push(element);
       	 //console.log("ORIGN coordinate List",Object.values(listcord));
		} 
		
		if(Object.keys(this.props.route.params.waypointslnglat).length > 0){
	      	 this.props.route.params.waypointslnglat.map((item, index) => {
		   	 //console.log("DRIVER MAP");
		   		//console.log("waypoint item ",item);
		   		let origincord = [item.longitude,item.latitude]; 
       	     let element = { coordinates: origincord };
       	      locationcordsapi.push(origincord);
       	    //listcord = [...listcord, element];

		     }); 	
	      } 
	      
	   if(Object.keys(this.props.route.params.destination).length > 0){
	   	 let origincord = [this.props.route.params.destination.longitude,this.props.route.params.destination.latitude]; 
       	 let element = { coordinates: origincord };
       	 locationcordsapi.push(origincord);
       	 //listcord = [...listcord, element];
       	 listcord.push(element);
       	 //console.log("DESTINATION coordinate List",Object.values(listcord));
	   }
	   
	   this.riderMessages();
	   //console.log("coordinate List",Object.values(listcord));
	   let locationcordsapistr = locationcordsapi.join(";");
	   
       //console.log("DRIVER Details ",this.props.route.params.bookingdriver);
       //console.log("Booking Details ",this.props.route.params.bookingresponse);
        	// alert(Object.keys(this.state.driverLocation).length);
        	// alert(Object.values(this.state.driverLocation).length);
        	// alert(Object.entries(this.state.driverLocation).length);
     
       BackHandler.addEventListener('hardwareBackPress', this.onGoBackCallback);
        navigation.addListener('gestureEnd', this.onGoBackCallback);
        
		// this.getrewards();
		this.unsubscribe =  navigation.addListener("focus",() => {
			BackHandler.addEventListener('hardwareBackPress', this.onGoBackCallback);
       	navigation.addListener('gestureEnd', this.onGoBackCallback);
      });
      this.unsubscribeblur =  navigation.addListener("blur",() => {
      	//clearInterval(this.myinterval);
         // clearInterval(this.myintervalaccp);
      	BackHandler.removeEventListener('hardwareBackPress', this.onGoBackCallback);
      });
      
      //console.log("compoente mount");
   	
   	//console.log(this.state);
  
   	//console.log("CONS DATA",this.props.route.params.bookingdriver);
      if(this.props.route.params.selectedvehicle){
      	let driver_name = this.props.route.params.bookingdriver.first_name+' '+this.props.route.params.bookingdriver.last_name;
      	this.getVehcileDetails(this.props.route.params.bookingdriver.id);
      	this.setState({ 
             selectedvehicle:this.props.route.params.selectedvehicle,
             origin:this.props.route.params.origin,
             destination:this.props.route.params.destination,
             latitudedest:this.props.route.params.latitudedest,
             longitudedest:this.props.route.params.longitudedest,
             latitudecur:this.props.route.params.latitudecur, 
             longitudecur:this.props.route.params.longitudecur,
             bookingresponse:this.props.route.params.bookingresponse,
             rideinfoinprocess:this.props.route.params.rideinfoinprocess,
             bookingdriver:this.props.route.params.bookingdriver,
             waypointslnglat:this.props.route.params.waypointslnglat,
             selectedcancelchr:this.props.route.params.selectedcancelchr,
             selectedvehiclefare:this.props.route.params.selectedvehiclefare,
             selectsurcharge:this.props.route.params.selectsurcharge,
	         drivername:driver_name,
	         locationcordsapistr:locationcordsapistr,
        },
        ()=>{
        	   
       // 	alert(this.state.latitudecur);
       // 	alert(this.state.longitudecur);
        	 //console.log(this.props.route.params.bookingdriver);
				//console.log("STATE SET");
        	//alert(this.props.route.params.bookingdriver.id);
        		this.getrideStart();
        	  this.getrideCancel();
        });
      }else if(this.props.route.params.bookingdriver.id > 0){
      	//alert(this.props.route.params.bookingdriver.id);
      	let driver_name = this.props.route.params.bookingdriver.first_name+' '+this.props.route.params.bookingdriver.last_name;
      	this.getVehcileDetails(this.props.route.params.bookingdriver.id);
      	this.setState({
      		origin:this.props.route.params.origin,
             destination:this.props.route.params.destination,
             latitudedest:this.props.route.params.latitudedest,
             longitudedest:this.props.route.params.longitudedest,
             latitudecur:this.props.route.params.latitudecur, 
             longitudecur:this.props.route.params.longitudecur,
             bookingdriver:this.props.route.params.bookingdriver,
             bookingresponse:this.props.route.params.bookingresponse,
             waypointslnglat:this.props.route.params.waypointslnglat,
             drivername:driver_name,
             locationcordsapistr:locationcordsapistr,
              
      	},()=>{
      		this.getrideStart();
        	   this.getrideCancel();
      		//
      	});
      
      }
      
      //this.getdriversnear();
      
      this.getRewards();	
      	AsyncStorage.getItem('messagecount').then((value) => {           
            if(value != '' && value !== null){
                this.setState({messagecount:value})
                //alert(value)
            }
        });	 
		 
     // alert("DRUVER ID "+this.props.route.params.bookingdriver.id);
     //console.log("test abc comp",this.props.route.params.bookingdriver.id);
      var docRef = firestore().collection("driver_locations").doc(JSON.stringify(this.props.route.params.bookingdriver.id));
                docRef.get().then((doc) => {
                    if (doc.exists) {
                        //console.log("Document data INITAL 1 :", doc.data());
                        this.setState({driverLocation:doc.data().coordinates,
                        		            heading:doc.data().heading,
                        displaydriveloc:true},()=>{
                        	const center = {
                                  latitude: (this.state.origin.latitude + this.state.destination.latitude) / 2,
                                  longitude: (this.state.origin.longitude + this.state.destination.longitude) / 2,
                                };
                                //console.log("source dest center",center);
                                const destheading = this.getHeading(this.state.origin, this.state.destination)
                                //console.log('dest heading',destheading)
                                this.setState({
                                    pathHeading:destheading,
                                    pathCenter:center
                                })
					       	 //console.log(" ORGIN SET INITAL "+JSON.stringify(this.state.driverLocation));   
					       	 //console.log(" ORGIN SET INITAL LONGITUDE "+this.state.driverLocation.longitude);   
					       	  //console.log(" ORGIN SET INITAL Lati "+this.state.driverLocation.latitude);    	   	
					       });
                    } else {
                        // doc.data() will be undefined in this case
                        //console.log("No such document!");
                    }
                }).catch((error) => {
                    //console.log("Error getting document:", error);
                });
     
                
    
        
   	this.intialLoad();
			
			 /*this.sideBarInt = setInterval(() => {

				 AsyncStorage.getItem('newmessgae').then((value) => {
				 	//alert(value);
					if(value != '' && value == 'yes'){
						AsyncStorage.setItem('newmessgae','no');
						this.refs.fmMessageRecived.showMessage({
			         	  message: '',
				           type: "default",
				           backgroundColor: "#000", 
				           autoHide:false,
				           style:{
				           		margin:20,
				           		borderRadius:2,
				           		alignItems:'center',
				           		justifyContent:'center',
				           		fontSize:10,
				           },
				          
				           renderCustomContent: ()=>{
				           	return this.rendertextRecived();
				           },
			         });

					
				  }
				});
         
        }, 2000);
        */
        
         
         
   	 this.refs.fmLocalIntstance.showMessage({
           message: '',
           type: "default",
           backgroundColor: "#135AA8", 
           autoHide:false,
           style:{
           		borderRadius:10,
           		alignItems:'center',
           		justifyContent:'center',
				marginHorizontal:20,
				marginTop:50
           },
          
           renderCustomContent: ()=>{
           	return this.renderMessages();
           },
        	 });
        	 
			 
        	 
        	 /*this.myinterval = setInterval(() => {
        	 	 if(this.state.tripstart == false){
        	 	 	
        	 	 }	  				
           }, 5000);
           */
            	  			
     	
  } // end of function
 
   onGoBackCallback(){
      //console.log('Android hardware back button pressed and iOS back gesture ended');
      if(this.state.soundcont){
      	//alert("SOUND STOP");
      	this.state.soundcont.setIsLoopingAsync(false)
			this.state.soundcont.stopAsync();
      }
      
      this.setState({
      	modalvisible:true,
      });
      this.props.navigation.replace('BookMain',this.state);
     return true;
   }
   
  async getRewards(){
		 await AsyncStorage.getItem('rewardpoints').then((value) => {
			this.setState({
				rewardpoints:value,
			});
		});	    
  }
  async getdriversnear(){
   let search_radius = await AsyncStorage.getItem('search_radius');
  	const query = geocollection.near({ center: new firestore.GeoPoint(this.state.latitudecur,this.state.longitudecur ), radius: Number(search_radius)});
		 //.where('isBusy','==','no')
		 const accesstoken = await AsyncStorage.getItem('accesstoken');
			// Get query (as Promise)
		query.get().then((value) => {
		  // All GeoDocument returned by GeoQuery, like the GeoDocument added above
		  //console.log("IN QUERY");
		  //console.log(value.docs);
		  const drivernear = [];
		   value.docs.map((item, index) => {
		   	 //console.log("DRIVER MAP");
		   		 //console.log(item.data().coordinates);
		   	if(item.exists == true){
		   			drivernear.push({['coordinates']:item.data().coordinates,
				      	['driverId']:item.id,	});
				      this.setState({
	      			drivernear:drivernear,
	      		},()=>{
	      			//console.log(this.state.drivernear);
	      		});
		   	}
		   });
		 });
		 
  }
   renderMessagesreward = () =>{
    	return (<View style={{flex:1,alignContent:'center',justifyContent:'center',flexDirection:'column',shadowColor: '#000000',
    shadowOffset: {
      width: 1,
      height: 3
    },
    shadowRadius: 5,
    shadowOpacity: 1.0}} elevation={5}>
    	<View style={{width:150,height:46,backgroundColor: "#135AA8",flexDirection:'row',borderTopLeftRadius:10,borderTopRightRadius:10,alignContent:'center',justifyContent:'center' }}>
    		<Text style={{color:'#DCAC4B',fontSize:20,padding:3,fontFamily: "Metropolis-Regular",textAlign:'center',fontWeight:'bold'}}>22</Text>
      </View>
      <View style={{width:150,backgroundColor:'#fff',flexDirection:'row',justifyContent:'center',flexDirection:'column'}}>
    	<Text style={{color:'#000',fontSize:15,padding:3,fontFamily: "Metropolis-Regular",textAlign:'center'}}>Reward Points</Text>
    	 </View>
    	</View>);
  }
  
   
   openDialScreen (){
    let number = '';
   // alert("CALL click	");
    //console.log("Click Call Data",this.state);
    fetch('https://www.turvy.net/api/rider/twiliomakecallrider',{
				     	  	method: 'POST', 
						   headers: new Headers({
						     'Content-Type': 'application/json'
						   }), 
						   body:JSON.stringify({
					 				'driver_id' : this.state.bookingdriver.id,
					 				'booking_id' : this.state.bookingresponse.id,
					 				'first_name' : this.state.bookingdriver.first_name,
					 				'last_name' : this.state.bookingdriver.last_name,
					 				'mobile' : this.state.bookingdriver.mobile,
					 				'rider_phone' : this.state.bookingresponse.rider_mobile,
					 				'rider_name' : this.state.bookingresponse.rider_name,
					 				'rider_id': this.state.bookingresponse.rider_id,
					 			}) 
						   })
				      .then((response) => response.json())
				      .then((json) =>{ 
				      	//console.log("RESPONSE CALL 1",json);
				      	if(json.status == 1){
				      		//alert("IN SUCCESS"+json.senderphn);
					         if (Platform.OS === 'ios') {
								      number = 'telprompt:${'+json.senderphn+'}';
								    } else {
								      number = 'tel:${'+json.senderphn+'}';
								    }
	                       Linking.openURL(number);
				      	}else{
				      		
				      		this.refs.fmcallerror.showMessage({
					           message: json.message,
					           type: "warning",
					           autoHide:false,
					           style:{
					           		margin:20,
					           		alignItems:'center',
					           		justifyContent:'center'
					           },
					        	 });
					        	 
					        	  setTimeout( () => {
								    this.refs.fmcallerror.hideMessage();
								  },2000);
					        	 
		        	 
				      	}
				      	
				      	/*if(json.status == 1){
				      		 this.setState({                                        
					         	isLoading:false,
				    				vehborder:'red',
				    				bookingresponse:json.data
					         });
				      		this.props.navigation.navigate('PromoCode',this.state)
				      	}
				      	*/
				     	 }
				      )
				      .catch((error) => { console.error(" CALL ERROR BLOCK" ,error) });
  }
  
  renderMessages = () =>{
    	return (<View style={{flex:1,alignContent:'center',justifyContent:'center',flexDirection:'row'}}><Text style={{color:'#fff',fontSize:20,padding:3,fontFamily: "Metropolis-Regular",textAlign:'center'}}>Your driver arrives in {this.state.duration} minutes</Text></View>);
  }
  
   rendertextRecived = () =>{
    	return (<View style={{flex:1,alignContent:'center',justifyContent:'center',flexDirection:'row'}}><Text style={{color:'#fff',fontSize:20,padding:3,fontFamily: "Metropolis-Regular",textAlign:'center'}}>Text Message Recived</Text><Button  mode="contained" color={'#135AA8'} onPress={() => this.setState({inmessagevisible:true}) }>
						   Open
				    </Button></View>);
  }
    
  componentWillUnmount() {
    //this.unsubscribe();
	this.stopRunSound()

    if(this.settime){
    	clearInterval(this.settime);
    }
    if(this.myinterval){
      clearInterval(this.myinterval);
    }
   
  }

 
	swipicon =() =>{
		return(<Ionicons name="ios-close-outline" size={40} color="black" />)
	} 
	
    renderContent = () => (
    <>
    <View
      style={{
        backgroundColor: 'white',
        padding: 16,
        height: '100%',
        margin:10,
        shadowColor: "#000",
		  shadowOffset: {
				width: 0,
				height: 2,
			},
			shadowOpacity: 0.23,
			shadowRadius: 2.62,
			elevation: 4,
			borderRadius:10,
      }}
    >
  
    {this.state.inprocessing == 0  ? 
   	( <Grid >
   			<Row style={{height:90}}>
   				
   				<Col size={3.5} style={{padding:3}}>
   				<TouchableHighlight onLongPress={()=>{ this._onLongPressButton(this.state.bookingdriver.avatar) }} underlayColor="white">
   				<View style={{height:100,borderRadius:8}}>																				
						{this.state.bookingdriver.avatar ? 
							(<Image
				        source={{uri:"https://www.turvy.net/"+this.state.bookingdriver.avatar}}
				        style={styles.servicebocimage}
				        Resizemode={'contain'}
				         />)
							:
							(<Image
				        source={{uri:"https://www.turvy.net/images/no-person.png"}}
				        style={styles.servicebocimage}
				        Resizemode={'contain'}
				         />)
						}
   					
   				</View>
   				</TouchableHighlight>
   				</Col>
   				<Col size={6} style={{padding:3}}>
   					<Text style={{fontSize:18,color:'#135AA8',fontWeight:'bold'}}>{this.state.bookingdriver.first_name} {this.state.bookingdriver.last_name}</Text>
   					<Text style={{fontSize:12,fontWeight:'bold',color:'#135AA8'}}>Car Rego: {this.state.vehinfo.plate ? this.state.vehinfo.plate : ''}</Text>
   					<Text style={{fontSize:12,fontWeight:'bold',color:'#135AA8'}}>{this.state.vehinfo.makename ? this.state.vehinfo.makename : ''} : {this.state.vehinfo.modelname ? this.state.vehinfo.modelname : ''} </Text>
   					<Text style={{fontSize:12,fontWeight:'bold',color:'#135AA8'}}>{this.state.vehinfo.color ? this.state.vehinfo.color : ''} , {this.state.selectedvehicle.name}</Text>
   				</Col>
   				<Col size={4} style={{padding:3}}>
   				 <TouchableHighlight onLongPress={()=>{ this._onLongPressButton(this.state.vehinfo.front_photo) }} underlayColor="white">
   				<View style={{height:100,padding:10,borderRadius:8}}>
   				 {this.state.vehinfo.front_photo ?
   					(<Image
				        source={{uri:"https://www.turvy.net/"+this.state.vehinfo.front_photo}}
				        style={styles.servicebocimage}
				        Resizemode={'contain'}
				         />
				         )
				         :null
				    }
				    </View>
				    </TouchableHighlight>
   				</Col>
   			</Row>
   			<Row style={{height:50}}>
   			<Col size={1.5}>
   				</Col>
   				<Col size={3} style={{margin:8,height:55}}>
   					<View style={{flex:1,backgroundColor:'#62CD32',alignItems:'center',justifyContent:'center',width:'90%',borderRadius:5}} >
   					<TouchableOpacity onPress={() => this.openDialScreen()}>
   					<Feather name="phone-call" size={18} color="white" />
   					<Text style={{color:'#fff'}}>
   						Call
   					</Text>
   					</TouchableOpacity>
   					</View>
   				</Col>
   				<Col size={3} style={{alignItems:'center',justifyContent:'center',margin:8,height:55}}>
   				<View style={{flex:1,backgroundColor:'#EA202A',alignItems:'center',justifyContent:'center',width:'90%',alignContent:'center',borderRadius:5}}>
   				   <TouchableOpacity onPress={() =>{this.props.navigation.navigate('BookCancel',this.state) }}>
   					<AntDesign name="closecircleo" size={18} color="white"  style={{textAlign:'center'}} />
   					<Text style={{color:'#fff'}}>
   						Cancel		
   					</Text>	
   					</TouchableOpacity>
   					</View>
   				</Col>
   				<Col size={3} style={{alignItems:'flex-end',margin:8,height:55}}>
   				<View style={{flex:1,backgroundColor:'#135AA8',alignItems:'center',justifyContent:'center',width:'90%',borderRadius:5}}>
   				<TouchableOpacity onPress={() =>{this.setState({inmessagevisible:true}) }}>
   					<AntDesign name="message1" size={24}  color="white" style={{textAlign:'center'}}  />
   					<Text style={{color:'#fff',fontSize:12,}}>
   						Message
   					</Text>
   					</TouchableOpacity>
   					</View>
   				</Col>
   				<Col size={1.5}>
   				</Col>
   			</Row>
   			<Row style={{height:20,padding:6,marginTop:20}}>
   				<Col size={1}>
   					<View style={styles.inforound}>
   						<MaterialCommunityIcons name="information-variant" size={20} color="black" />
   					</View>
   				</Col>
   				<Col size={11}>
   				<Text style={{color:'#3f78ba',fontWeight:'bold',fontSize:15}}>  Long press on image to zoom in</Text>
   				</Col>
   			</Row>
   		</Grid>
       ):(
       	<Text></Text>
       )
      } 
    </View>
   </>
  );   
  
  
  async intialLoad() {
  	
    
     let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
       // setErrorMsg('Permission to access location was denied');
        return;
      }
      /*let location = await Location.getCurrentPositionAsync();
       //console.log(location.coords.latitude);
       //console.log(location.coords.longitude);
       const latitudeDelta = location.coords.latitude-location.coords.longitude;
       const longitudeDelta = latitudeDelta * ASPECT_RATIO;
       */
        //console.log(latitudeDelta);
       //console.log(longitudeDelta);
       let origin ={};
      // console.log(this.props.route.params.destination);
      if(this.props.route.params.origin){
       	 origin = this.props.route.params.origin;
		}      
		let destination = {};
		let longitudedest = '';
		let latitudedest= '';
		if(this.props.route.params.destination){
			destination = this.props.route.params.destination;
			longitudedest = destination.longitude;
			latitudedest = destination.latitude;
		}
      let selectedvehicle = {};
      //console.log(this.props.route.params.selectedvehicle);
      if(this.props.route.params.selectedvehicle){
      	selectedvehicle = this.props.route.params.selectedvehicle;
      }
      
      this.setState({
      	selectedvehicle:selectedvehicle,
      });
      /*this.setState({
      	locationcur:location,
      	latitudecur:location.coords.latitude,
      	longitudecur:location.coords.longitude,
      	latitudeDelta:0.00176,
      	longitudeDelta:0.00176,
      	origin:origin,
      	destination:destination,
      	latitudedest:latitudedest,
      	longitudedest:longitudedest,
      	selectedvehicle:selectedvehicle,
      });
      */
      //console.log(location);
     /*
       if (location.coords) {
		    const { latitude, longitude } = location.coords;
		      let keys = {
		        latitude : latitudedest,
		        longitude : longitudedest
		    }
		   /* let response = await Location.reverseGeocodeAsync(keys);
		    
		     //console.log(response);
		    
		   let address = '';
		    for (let item of response) {
		    	//${item.street}, 
		      let address = `${item.name}, ${item.postalCode}, ${item.city}`;
		       //console.log(address);
		       this.setState({
		      	destlocatdesc:address,
		      });
		    }
		    */
		 // }
		  
      //.finally(() => setLoading(false));
    }
    
    handlerCallMessage = async () => {
        //console.log('call from child componant')
        this.setState({
            sendMessage: false
        })
    }
    
    closeInmessage = () =>{
      this.setState({
      	inmessagevisible:false,
      });
    }
    closeAddastop = () =>{
   	this.closeInmessage();
   	//alert("close Called ")
    }
    appendChat = (text) =>{
    	let textLus = [];
    	//textLus.push(text);
    		this.setState({
    			chatMessage:[...this.state.chatMessage, ...[{'body':text,'from':'rider'}]],
    		},()=>{
    			 AsyncStorage.setItem('chatMessage', JSON.stringify(this.state.chatMessage));
    			 //console.log("CAT MESSAHES",this.state.chatMessage);
    		})
    }
    addChatMessage = (text) =>{
    	//console.log("Message Added",text);
    	this.appendChat(text);
    }
    
    strAsynappendChat = (chatMessage) =>{
    	let textLus = [];
    	//textLus.push(text);
    		this.setState({
    			chatMessage:JSON.parse(chatMessage),
    		},()=>{
    			// AsyncStorage.setItem('chatMessage', JSON.stringify(this.state.chatMessage));
    			//console.log("CAT MESSAHES",this.state.chatMessage);
    		})
    }
    strAsynChatMessage = (chatMessage) =>{
    	//console.log("Message Added",chatMessage);
    	this.strAsynappendChat(chatMessage);
    }
    
     riderMessages = async() => {
        messaging().onMessage(async remoteMessage => {
            //Alert.alert('New message arrived!', remoteMessage.data.body);
            /* this.setState({
                chatMessage:remoteMessage.data,
                sendMessage:true
            }) */
             
            //console.log('New message length=============>',Object.keys(this.state.chatMessage).length)
            
            if(Object.keys(this.state.chatMessage).length <= 0){
            	let dataasynfrm = [];
            		await AsyncStorage.getItem('chatMessage').then((value) => {    
				          //alert(value);  
				          if(value != '' && value !== null){  
				          //console.log("Chat Message asyn NEw assign",value); 
				           dataasynfrm = JSON.parse(value);
				         }   
				      });
                let opt = [];
                opt[0] = remoteMessage.data;
                opt[0].from = 'driver';
                if(Object.keys(dataasynfrm).length > 0){
	                opt = [...dataasynfrm, ...[opt[0]]];
	             }
                this.setState({
                    chatMessage:opt,
                    inmessagevisible:true
                },()=>{
                	  AsyncStorage.setItem('chatMessage', JSON.stringify(this.state.chatMessage));
                    //console.log('New message arrived!=============>',this.state.chatMessage)
                })
            }else{
                remoteMessage.data.from = 'driver';
                this.setState({
                    chatMessage:[...this.state.chatMessage, ...[remoteMessage.data]],
                    inmessagevisible:true,
                },()=>{
                	AsyncStorage.setItem('chatMessage', JSON.stringify(this.state.chatMessage));
                    //console.log('New message arrived!=============>',this.state.chatMessage);
                    
                })
            }
            //console.log('New message arrived!=============>',debug(remoteMessage.data))
        })
    }
    
    
  render() {
  	
    
  	 return (
	    <View style={styles.container}>  
	   	 <TopBar {...this.props} />  	  
       <FlashMessage ref="fmLocalIntstance" position={{top:80, left:10,right:10}} style={{borderRadius:2}}  />
       <FlashMessage ref="fmcancelInst" position={{top:130}} style={{borderRadius:2}}  />
       <FlashMessage ref="fmcallerror" position={{top:50}} style={{borderRadius:2}}  />
       <FlashMessage ref="fmMessageRecived" position={{top:50}} style={{borderRadius:2}}  />
     <MapboxGL.MapView style={styles.map}
     		showUserLocatin={true}
     		ref={c => this.mapView = c}
     		showUserLocation={true}
     		pitch={180}
     		cluster
     		coordinates={[this.state.longitudecur,this.state.latitudecur]}
     		heading={this.state.pathHeading}
     		zoomEnabled={true}
     		logoEnabled={false}
     		attributionEnabled={false}
     		styleURL={this.state.MapboxStyleURL}
     		onDidFinishRenderingMapFully={(index)=>{
     		  //console.log("map load complete");
     		  //alert(this.state.locationcordsapistr);
     		  //79.075274,21.089974;79.0899,21.0893;79.1069,21.0962;79.097723,21.131447
	       fetch('https://api.mapbox.com/directions/v5/mapbox/driving/'+this.state.locationcordsapistr+'?overview=full&geometries=geojson&access_token=pk.eyJ1IjoibWFsLXdvb2QiLCJhIjoiY2oyZ2t2em50MDAyMzJ3cnltMDFhb2NzdiJ9.X-D4Wvo5E5QxeP7K_I3O8w',{
				method: 'GET',
	 		}).then(function (response) {
	 			return response.json();
	  		}).then( (result)=> {
	  			/*console.log("Data from api geomery ",result.routes[0].geometry);
	  			let distance = result.routes[0].distance;
	  			distance = distance/1000;
	  			let duration = result.routes[0].duration;
	  			duration = result.routes[0].duration/60;
	  			duration = duration.toFixed();
	  			
	  			   if(duration == 15 && this.state.min15ack == false){
						this.run15MinSound()
					}
					if(duration == 5 && this.state.min5ack == false){
						this.run5MinSound()
					}
					if(duration == 1 && this.state.min1ack == false){
						this.run1MinSound()
					}
					*/
	  			//console.log("COORDINATES ARRAY", Object.values(result.routes[0].geometry.coordinates));
	  			this.setState({
	  			routecorrdinates: Object.values(result),
	  			routemap:makeLineString(result.routes[0].geometry.coordinates),
	  			routedirect: {
            type: 'FeatureCollection',
            features: [{
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'LineString',
                  coordinates: Object.values(result.routes[0].geometry.coordinates),
                },
                style: {
                  fill: 'red',
                  strokeWidth: '20',
                  fillOpacity: 0.6,
                },
                paint: {
                  'fill-color': '#088',
                  'fill-opacity': 0.8,
                },
              },
            ],
       },
       	display:true,	
	  			},()=>{
	  				if(this.camera && this.state.longitudedest != '' && this.state.latitudedest != '' ){
	  				 this.camera.fitBounds([this.state.origin.longitude, this.state.origin.latitude], [this.state.longitudedest,this.state.latitudedest],[150,40,250,20],1000);
	  				  /*this.camera.setCamera({
					      		centerCoordinate: [this.state.driverLocation.longitude, this.state.driverLocation.latitude],
								  zoomLevel: 16,
								  animationDuration: 2000,
								})
								*/
	  				}
	  				this.updatecarLoc();
	  			});
			});
     		}}
     		 >
     		 {this.state.driverLocation && Object.keys(this.state.driverLocation).length > 0 ?
     		  (<MapboxGL.Camera
	     		 ref={c => this.camera = c}
            animationDuration={500}
            minZoomLevel={1}
            zoomLevel={16}
            pitch={45}
            maxZoomLevel={20}
            animationMode="easeTo"
            centerCoordinate={[Number(this.state.driverLocation.longitude),Number(this.state.driverLocation.latitude)]}
            Level={10} 
            heading={this.state.pathHeading}
           
          />)
          :
          (<></>)
         }
         {Object.keys(this.state.waypointslnglat).length > 0 ?
    this.state.waypointslnglat.map((item, key) => {
    	return(
    	 <MapboxGL.PointAnnotation 
			 id={'waypoint'+key}
			 anchor={{ y: 1, x: 0.5 }}
	           coordinate={[item.longitude,item.latitude]}>
	           <View style={{height: 30, width: 30, backgroundColor: 'transparent'}}>
	           <Entypo name="location-pin" size={30} color="green" />
	           </View>
	    </MapboxGL.PointAnnotation>   
    	)
	 }) 
	 :null
   } 
           <MapboxGL.ShapeSource  id="mapbox-directions-source" shape={this.state.routedirect}>
			      <MapboxGL.LineLayer
			        id="mapbox-directions-line"
			        style={{lineColor:'#0462cf',lineWidth:14,lineJoin:'round',lineCap: MapboxGL.LineJoin.Round,}}
			        />
			 </MapboxGL.ShapeSource>
			 <MapboxGL.ShapeSource  id="mapbox-directions-source-1" shape={this.state.routedirect}>
			      <MapboxGL.LineLayer
			        id="mapbox-directions-line-1"
			        style={{lineColor:'#468DDf',lineWidth:10,lineJoin:'round',lineCap: MapboxGL.LineJoin.Round,}}
			        />
			 </MapboxGL.ShapeSource>  
			   <MapboxGL.ShapeSource  id="mapbox-directions-driver" shape={this.state.routediver}>
			      <MapboxGL.LineLayer
			        id="mapbox-directions-driver-line"
			        style={{lineColor:'#000',lineWidth:14,lineJoin:'round',lineCap: MapboxGL.LineJoin.Round,}}
			        />
    	     </MapboxGL.ShapeSource>  
			 <MapboxGL.ShapeSource  id="mapbox-directions-driver-2" shape={this.state.routediver}>
			      <MapboxGL.LineLayer
			        id="mapbox-directions-driver-line-2"
			        style={{lineColor:'#636362',lineWidth:10,lineJoin:'round',lineCap: MapboxGL.LineJoin.Round,}}
			        />
    	     </MapboxGL.ShapeSource>
    	      {this.state.origin.latitude != '' && this.state.origin.longitude != '' ?
		       (<MapboxGL.PointAnnotation 
			           id={'markerorigin'}
			            anchor={{ y: 1, x: 0.5 }}
			           coordinate={[this.state.origin.longitude,this.state.origin.latitude]}>
			            <View style={{height: 30, width: 30, backgroundColor: 'transparent'}}>
			              <FontAwesome5 name="map-marker-alt" size={30} color={"#910101"} />
			           </View>
	         </MapboxGL.PointAnnotation>   
          ):
         (
       <></>
       )
     }  
      
      { this.state.latitudedest != '' && this.state.longitudedest != '' ?
		       (<MapboxGL.PointAnnotation 
			           id={'markerdest'}
			            anchor={{ y: 1, x: 0.5 }}
			           coordinate={[this.state.longitudedest,this.state.latitudedest]}>
			            <View style={{height: 30, width: 30, backgroundColor: 'transparent'}}>
			              <FontAwesome5 name="map-marker-alt" size={30} color={"#910101"} />
			           </View>
	         </MapboxGL.PointAnnotation>   
          ):
         (
       <></>
       )
     }   
    	  {this.renderDriverLocation()}
           </MapboxGL.MapView>
          
  { this.state.display ? (
  <BottomSheet
        ref={this.bottomSheetRef}
        snapPoints={this.state.snaptoval}
        borderRadius={20}
        renderContent={this.renderContent}
        overdragResistanceFactor={0}
        enabledManualSnapping={false}
         enabledContentTapInteraction={false}
        enabledContentGestureInteraction={false}
        initialSnap={this.state.snapIndex}
      />)
      :(
      	<Text></Text>
      )
    }
    <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.modalvisible}
          onRequestClose={() => {
            alert('Modal has been closed.');
          }}>
        
          <Grid style={{justifyContent:'center',alignContent:'center'}}>
          	<Row size={5}>
          		<Col>
          		</Col>
          	</Row>
          	<Row size={40} style={{justifyContent:'center',alignContent:'center'}}>
          		<Col style={{justifyContent:'center',alignContent:'center',alignItems:'center'}}>
          		  <View style={{backgroundColor:'#135AA8',height:'100%',width:'80%',justifyContent:'center',alignContent:'center',padding:10,borderRadius:5,}}>
              <Image
				        source={{uri:"https://www.turvy.net/"+this.state.imagezoom}}
				        style={styles.servicebocimage}
				        Resizemode={'contain'}
				         />
            </View>
          		</Col>
          	</Row>
          	<Row size={10} style={{marginTop:10}}>
          		<Col size={4}>
          		</Col>
          		<Col size={4}>
          		 <Button  mode="contained" color={'#135AA8'} onPress={() => this._onPressDone()}>
						    Done
				    </Button>
          		</Col>
          		<Col size={4}>
          		</Col>
          	</Row>
          	<Row size={40}>
          		<Col>
          		</Col>
          	</Row>
          </Grid>
        </Modal> 
        
     
        {this.state.sendMessage?
                    <SendMessage 
                        sender={this.state.bookingresponse.rider_id} 
                        receiver={{
                            driver_name:this.state.bookingdriver.last_name,
                            driver_id:this.state.bookingdriver.id,
                            book_id:this.state.bookingresponse.id
                        }}
                        handlerCallMessage = {this.handlerCallMessage}
                         messageType='message'
								buttonText='Send'
                         />
                :
                    null
                }
        <View>
        
        <CancelPop  {...this.props}  />
        </View>
        <Modal
          animationType="slide"
          visible={this.state.inmessagevisible}
          style={{height:200,flex: 0}}
          onRequestClose={() => {
            alert('Modal has been closed.');
          }}>
          
     <InMessages {...this.props} chatMessage={{chatMessage:this.state.chatMessage}} strAsynChatMessage={this.strAsynChatMessage} addChatMessage={this.addChatMessage} closeAddastop={this.closeAddastop} />
     </Modal> 

	 {
		this.state.alert5min &&
		this.renderDriverMessage('5')
	}

	{
		this.state.alert15min &&
		this.renderDriverMessage('15')
	}

	{
		this.state.alertCongrats &&
		this.renderMessagesDriver()
	}
	{
		this.state.alert1min &&
		this.render1minDriverMessage('1')
	}
	 	
  </View>	
	  );
   }
}
const stylesIcon = {
icon: {
    iconImage:imagevehIcon,
    iconAllowOverlap: true,
    iconSize:0.5,
  },
};
  
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: Dimensions.get('window').width,
    height: '100%',
  },
  tinyLogo:{
  	alignContent:'center',
  	height:50,
  	flex:1,
  	flexDirection:'row'
  },
  servicesbox:{
  	flexDirection:'column',
 	flex:1,
 	width:150,
 	height:150,
 	backgroundColor:'#e5e5e5',
 	borderWidth:1,
 	borderColor:'#e5e5e5',
 	padding:10,
 	margin:10,
 	alignItems:'center',
 	borderRadius:10,
 	justifyContent:'center'
  },
  servicebocimage:{
    width: '100%',
    aspectRatio: 1,
	 resizeMode: 'contain'
	},
	inforound:{
       borderWidth:2,
       borderColor:'#000',
	    width: 24,
	    height: 24,
	    zIndex: 10,
       alignItems:'center',
       justifyContent:'center',
       backgroundColor:'#fff',
       borderRadius:50,
     },
     yellow:{color:'#fec557'},
btnSmall:{
		backgroundColor:'#3f78ba',
		borderWidth:5,
		borderColor:'#FFF',
		fontSize:50,
		shadowColor: '#000',
	},
     menubox:{
	       borderWidth:1,
	       borderColor:'rgba(0,0,0,0.2)',
			position: 'absolute',
		    width: 45,
		    height: 45,
		    top: 0,
		    left: 10,
		    zIndex: 10,
	       alignItems:'center',
	       justifyContent:'center',
	       backgroundColor:'#fff',
	       shadowColor: "#000",
			shadowOffset: {
				width: 0,
				height: 3,
			},
			shadowOpacity: 0.27,
			shadowRadius: 4.65,
			
			elevation: 6,
	     },
	serachbox:{
		   borderWidth:0,
	       borderColor:'#135aa8',
		    width: 50,
		    height: 50,
	       alignItems:'center',
	       justifyContent:'center',
	       backgroundColor:'#fff',
	       borderRadius:25,
	        shadowColor: "#000",
			shadowOffset: {
				width: 0,
				height: 3,
			},
			shadowOpacity: 0.27,
			shadowRadius: 4.65,
			elevation: 6,
	},
	vehmarkerimage:{
    width: 20,
    height:35,
	 alignSelf:'center'
	},
	
});
