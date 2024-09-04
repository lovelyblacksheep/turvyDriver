import { StatusBar } from 'expo-status-bar';
import React from "react";
import { StyleSheet, Text, View,Dimensions,Image,ScrollView ,TouchableOpacity,ActivityIndicator,BackHandler,Alert,Modal} from 'react-native';
//import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';
import { EvilIcons,Ionicons,MaterialCommunityIcons,FontAwesome5,Entypo,MaterialIcons } from '@expo/vector-icons'; 
const imagemarker = require('../assets/location-pin-2965.png');
import BottomSheet from 'reanimated-bottom-sheet';
import { Button ,Badge} from 'react-native-paper';
import { Col, Row, Grid } from "react-native-easy-grid";
import SmartLoader from './SmartLoader';
import Pusher from 'pusher-js/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as geolib from 'geolib';
import TopBar from "./TopBar";
import Geolocation from 'react-native-geolocation-service';
import  { changeMode, 
    MapboxCustomURL} from  "../Riders/MapDayNight";

const { width, height } = Dimensions.get('window');
const imageveh = require('../assets/images/driver-veh-images_60.png');
const DEVICE_WIDTH = width;
const DEVICE_HEIGHT = height;		
const drivernear = [];

import SwipeButton from 'rn-swipe-button';

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0043;
const SCREENHEIGHT = height*.60;

import * as firebase from "firebase";
//import "firebase/firestore";
import firestore from '@react-native-firebase/firestore';
import * as geofirestore from 'geofirestore';
import apiKeys from '../config/keys';
import {debug} from './Constant';

//import MapboxGL from "@rnmapbox/maps";
import  MapboxGL from "@react-native-mapbox-gl/maps"; 
//MapboxGL.setAccessToken("pk.eyJ1IjoibWFsLXdvb2QiLCJhIjoiY2oyZ2t2em50MDAyMzJ3cnltMDFhb2NzdiJ9.X-D4Wvo5E5QxeP7K_I3O8w");
import { lineString as makeLineString } from '@turf/helpers';
import { point } from '@turf/helpers';

if (!firebase.apps.length) {
    console.log('Connected with Firebase');
    firebase.initializeApp(apiKeys.firebaseConfig);
}

const db = firestore();
//const firestore = firebase.firestore();

const GeoFirestore = geofirestore.initializeApp(db);
const geocollection = GeoFirestore.collection('driver_locations');





export default class BookProcess extends React.Component {
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
        	latitudeDelta: 0.00176,
         longitudeDelta: 0.00176,
         origin:{},
         destination:{},
         duration:'',
         servicetypes:[],
         selectedvehicle:{},
         inprocessing:0,
         display:false,
         distance:'',
         rideinfoinprocess:{},
         bookingdriver:{},
         bookingresponse:{},
         interval:[],
         statusrecived:false,
         drivernear:{},
         drivernearAll:[],
         driverdecline:[],
         drivernearRem:{},
         waypointslnglat:[],
         selectedcancelchr:0,
         selectedprcperunit:0,
         selectedvehiclefare:0,
         selectedminprc:0,
         tocancel:false,
         rewardpoints:0,
         modalvisible:false,
         dricetionlnglat:{},
         dedeuctinfo:{},
         previousprewardpoint:0,
         airport_Cord:[],
         overresponstime:false,
         pathHeading:0,
         pathCenter:{},
         messagecount:0,
          routemap:null,
         locationcordsapistr:null,
         MapboxStyleURL:MapboxCustomURL,
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
    };
        	
    this.mapView = null;
    this.myinterval = React.createRef();
    this.settimeout = React.createRef();
    this.myintervalaccp = React.createRef();
    this.onGoBackCallback = this.onGoBackCallback.bind(this);
    
     this.pusher = new Pusher('389d667a3d4a50dc91a6', { cluster: 'ap2' }); 
     this.listenForChanges(); 
   }
   
   listenForChanges = () => {
		const channel = this.pusher.subscribe('turvy-channel'); 
		 channel.bind('book_accept_event', data => {
		 	//this.state.bookingresponse.id
		 	this.getbookingStatusAccpt();
		 	//this.getNearBydriver();
		  //alert(JSON.stringify(data));
		  }); 
		 
		  channel.bind('book_decline_event', data => {
		 	this.getbookingStatus();
		 	//alert(JSON.stringify(data));
		  });		  
		  
	};
	
   
   async getnearestDriver(){
   
      //let location = await Location.getCurrentPositionAsync();

	  await fetch('https://www.turvy.net/api/airport_polygon',{
     	  	method: 'GET', 
		   headers: new Headers({
		     'Content-Type': 'application/json'
		   })
		   })
      .then((response) =>{
      	return response.json();
      })
      .then((json) =>{ 
      	//console.log("Poly Data INFO================ ",debug(json.data));
      	//let result = json.data;
      	if(json.status == 1){
      		this.setState({
      			airport_Cord:json.data,
      		});
      		
     	   }
      })
      .catch((error) =>{
      	console.error(error);
       });

	  
	  //console.log('airport_Cord================',this.state.airport_Cord) 
	  //debug

      let location ='';
        Geolocation.getCurrentPosition(async(location) => {
          //console.log(location);
          //console.log("current position Proceess");
      	//console.log(location);
			/*if (location.coords) {
       	 const origin = {
	      	latitude: location.coords.latitude, 
	      	longitude: location.coords.longitude
	      } 
	      */
	      /* let res = geolib.isPointInPolygon({ latitude: location.coords.latitude, longitude: location.coords.longitude }, this.state.airport_Cord);
		  console.log('is in polygon================',res) */

		  let res = false
		  let airportInfo={}
		  if(this.state.airport_Cord.length > 0){
			for(let k=0; k < this.state.airport_Cord.length; k++){
				//serArr[i] = Number(t[i]);
				//console.log('airport cords', this.state.airportCords[k].coords);
				res = geolib.isPointInPolygon({ latitude: location.coords.latitude, longitude: location.coords.longitude}, this.state.airport_Cord[k].coords);
				if(res){
					airportInfo = {
						'airport_id':this.state.airport_Cord[k].airport_id,
						'airport_name':this.state.airport_Cord[k].airport_name
					}
					break;
				}
			}
			//console.log('airport info=========',airportInfo,res)
		}


	      if(res && airportInfo.airport_id > 0){
			//console.log("Queuen - RESPOSNE 1====================",res);

             firestore().collection('queue')
		 		.where('isBusy','==','no')
		 		.where('services_type','array-contains',this.state.selectedvehicle.id)
				.where('airport_id', airportInfo.airport_id)
		 		.orderBy('position', 'asc')
            .get()
            .then((querySnapshot) => {
                //console.log('Queuen DTAT:',querySnapshot.size)
                querySnapshot.forEach(documentSnapshot => {
					console.log('User ID: ', documentSnapshot.driverId, documentSnapshot.data());
					let coordinates = {
					latitude:documentSnapshot.data().Latitude,
					longitude:documentSnapshot.data().Longitude,
					}
					drivernear.push({['coordinates']:coordinates,
						['driverId']:documentSnapshot.data().driverId,	});
				});
				this.setState({
					drivernear:drivernear,
					drivernearAll:drivernear
				},()=>{	
					//this.assignDriver(driverID);
					let newdriver = [];
					console.log("DRIVER NEAR STATE 1",this.state.drivernearAll);
					if(this.state.drivernearAll.length > 0){
						let newdriver = this.state.drivernearAll;	
						let newdriver1 = newdriver.shift();
						console.log("SHIFTED ELEMENT",newdriver1);
						console.log("SHIFTED AFTER ",newdriver);
						if(newdriver1.driverId > 0){
							this.setState({	
								drivernearRem:newdriver,
							});
							this.assignDriver(newdriver1.driverId);
						}
					}
				});
            }).catch(error=> console.log("QUERY ERROR 2",error));
				
				//return false;
	  }else{
	  	
	  	     let query = '';
         console.log("IN ELSE of firebase Query",this.state.origin);
	     let search_radius = await AsyncStorage.getItem('search_radius');
	     query = geocollection.near({ center: new firestore.GeoPoint(this.state.origin.latitude, this.state.origin.longitude), radius: Number(search_radius) }).where('isBusy','==','no').where('services_type','array-contains',this.state.selectedvehicle.id);
			query.get().then((value) => {
				 value.docs.map((item, index) => {
				 	if(item.exists == true){
				 		console.log("CONDINATES LIST ",item.data().coordinates,item.id);
				 		drivernear.push({['coordinates']:item.data().coordinates,
					      	['driverId']:item.id,	});
				 	}
				});
				this.setState({
	   			drivernear:drivernear,
	   			drivernearAll:drivernear
	   		},()=>{	
	   			//this.assignDriver(driverID);
	   			let newdriver = [];
	   			console.log("DRIVER NEAR STATE 1",this.state.drivernearAll);
	   			if(this.state.drivernearAll.length > 0){
	   				let newdriver = this.state.drivernearAll;	
		   			let newdriver1 = newdriver.shift();
		   			console.log("SHIFTED ELEMENT",newdriver1);
		   			console.log("SHIFTED AFTER ",newdriver);
		   			if(newdriver1.driverId > 0){
		   				this.setState({	
					   		drivernearRem:newdriver,
					   	});
		   				this.assignDriver(newdriver1.driverId);
		   			}
	   			}
	   		})
			});
	  } // end of else
	   
	},
        (error) => {
          // See error code charts below.
           console.log("IN EEROR ", error.message);
          console.log(error.code, error.message);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
       );
       
       console.log("current position Proceess start",location);
      
		console.log("BFORE IF Queuen - RESPOSNE 1",res);
			//alert(res);
		

   }
   
   async getnearestDriver2(){
     //alert(" IN Nearest");
     
		 let location = await Location.getCurrentPositionAsync();
         //console.log("Latitude ",location.coords.latitude);
         //console.log("Lognitude ",location.coords.longitude);
		 console.log('airport_Cord================',this.state.airport_Cord)

      	//let res = geolib.isPointInPolygon({ latitude: location.coords.latitude, longitude: location.coords.longitude }, this.state.airport_Cord);
		
		let res = false
		let airportInfo={}
		if(this.state.airport_Cord.length > 0){
			for(let k=0; k < this.state.airport_Cord.length; k++){
				//serArr[i] = Number(t[i]);
				//console.log('airport cords', this.state.airportCords[k].coords);
				res = geolib.isPointInPolygon({ latitude: location.coords.latitude, longitude: location.coords.longitude}, this.state.airport_Cord[k].coords);
				if(res){
					airportInfo = {
						'airport_id':this.state.airport_Cord[k].airport_id,
						'airport_name':this.state.airport_Cord[k].airport_name
					}
					break;
				}
			}
			//console.log('airport info=========',airportInfo,res)
		}

			//alert(res);
		if(res && airportInfo.airport_id > 0){
			
			console.log("Queuen - RESPOSNE 1==============",res);
			
            
             firestore().collection('queue')
		 		.where('isBusy','==','no')
		 		.where('services_type','array-contains',this.state.selectedvehicle.id)
		 		.where('airport_id', airportInfo.airport_id)
		 		.orderBy('position', 'asc')
            .get()
            .then((querySnapshot) => {
                console.log('Queuen DTAT:',querySnapshot.size)
                querySnapshot.forEach(documentSnapshot => {
					console.log('User ID: ', documentSnapshot.driverId, documentSnapshot.data());
					let coordinates = {
					latitude:documentSnapshot.data().Latitude,
					longitude:documentSnapshot.data().Longitude,
					};
					drivernear.push({['coordinates']:coordinates,
						['driverId']:documentSnapshot.data().driverId,	});
						
				});
				this.setState({
					drivernear:drivernear,
					drivernearAll:drivernear
				},()=>{	
					//this.assignDriver(driverID);
					let newdriver = [];
					console.log("DRIVER NEAR STATE 1",this.state.drivernearAll);
					if(this.state.drivernearAll.length > 0){
						let newdriver = this.state.drivernearAll;	
						let newdriver1 = newdriver.shift();
						console.log("SHIFTED ELEMENT",newdriver1);
						console.log("SHIFTED AFTER ",newdriver);
						if(newdriver1.driverId > 0){
							this.setState({	
								drivernearRem:newdriver,
							});
							this.assignDriver(newdriver1.driverId);
						}
					}
				});
            }).catch(error=> console.log("QUERY ERROR 2",error));
				
				//return false;
				
	   }else {
	     let query = '';
	     let search_radius = await AsyncStorage.getItem('search_radius');
	     query = geocollection.near({ center: new firestore.GeoPoint(this.state.origin.latitude, this.state.origin.longitude), radius: Number(search_radius) }).where('isBusy','==','no').where('services_type','array-contains',this.state.selectedvehicle.id);
			query.get().then((value) => {
				 value.docs.map((item, index) => {
				 	if(item.exists == true){
				 		console.log("CONDINATES LIST",item.data().coordinates,item.id);
				 		drivernear.push({['coordinates']:item.data().coordinates,
					      	['driverId']:item.id,});
				 	}
				});
				this.setState({
	   			drivernear:drivernear,
	   			drivernearAll:drivernear
	   		},()=>{
	   			//this.assignDriver(driverID);
	   			let newdriver = [];
	   			console.log("DRIVER NEAR STATE 1",this.state.drivernearAll);
	   			if(this.state.drivernearAll.length > 0){
	   				let newdriver = this.state.drivernearAll;	
		   			let newdriver1 = newdriver.shift();
		   			console.log("SHIFTED ELEMENT",newdriver1);
		   			console.log("SHIFTED AFTER ",newdriver);
		   			if(newdriver1.driverId > 0){
		   				this.setState({	
					   		drivernearRem:newdriver,
					   	});
		   				this.assignDriverIndiv(newdriver1.driverId);
		   			}
	   			}
	   		})
			});
		}
   }
   
   
   
     assignDriverIndiv = async(driver_id) =>{
   			const accesstoken = await AsyncStorage.getItem('accesstoken');
   			console.log(accesstoken);
   			console.log(this.state.bookingresponse.id);
   		//	alert("BEFORE ASSIGN "+driver_id);
   			fetch('https://www.turvy.net/api/rider/assigndriver/'+this.state.bookingresponse.id,{
				     	  	method: 'POST', 
						   headers: new Headers({
						     'Authorization': 'Bearer '+accesstoken, 
						     'Content-Type': 'application/json'
						   }), 
						   body:JSON.stringify({
					 				'driver_id' : driver_id,
					 			}) 
						   })
				      .then((response) => {
				      	return response.json();
				      	console.log(response);
				      	})
				      .then((json) =>{ 
				      	console.log("IN ASSIGN ");
				      	console.log(json);
				     	 })
				      .catch((error) => console.error(error));
   }
   
   
   
    assignDriver = async(driver_id) =>{
   			const accesstoken = await AsyncStorage.getItem('accesstoken');
   			console.log(accesstoken);
   			console.log(this.state.bookingresponse.id);
   		//	alert("BEFORE ASSIGN "+driver_id);
   	fetch('https://www.turvy.net/api/rider/assigndriver/'+this.state.bookingresponse.id,{
				     	  	method: 'POST', 
						   headers: new Headers({
						     'Authorization': 'Bearer '+accesstoken, 
						     'Content-Type': 'application/json'
						   }), 
						   body:JSON.stringify({
					 				'driver_id' : driver_id,
					 			}) 
						   })
				      .then((response) => {
				      	return response.json();
				      	//console.log(response);
				      	})
				      .then((json) =>{ 
				      	console.log("IN ASSIGN ");
				      	console.log(json);
				      //	alert("AFTER ASSIGN "+driver_id);
				      	
				      	if(json.status == 1){
					      	if(this.state.statusrecived == false){
					      		this.myinterval = setInterval(() => {
					      			console.log("Call Booking status");	
	            	  				this.getbookingStatus();
	            	  			}, 13000);
	            	  			
	            	  		/*	this.myintervalaccp = setInterval(() => {
					      			console.log("Call Booking status");	
	            	  				this.getbookingStatusAccpt();
	            	  			}, 6000);
	            	  			*/
	            	  		}else{
	            	  			clearInterval(this.myinterval);
	            	  			//clearInterval(this.myintervalaccp);
	            	  		}
	            	  		
				      	}else if(json.status == 0){	
				      	  //
				      	  if(this.state.drivernear > 0){
				      	  	//let driverID = drivernear[0].driverId;
				      	  	   let reminingdriver = this.state.drivernear;
							   	let driverIDnew = reminingdriver.shift();
							   	console.log(" BEFORE ASSIGN NEXT DRIVER ID");
							      this.assignDriver(driverIDnew.driverId);
							   }
		   
				      	  if(json.message == "Driver not exits"){
				      	  }
				      	} 
				      	
				      	
				     	 })
				      .catch((error) => console.error(error));
   }
   
   async noresponseYet(){
   	clearInterval(this.myinterval);
   	clearTimeout(this.settimeout);
   	//clearInterval(this.myintervalaccp);
   	//alert(this.state.statusrecived);
   	//alert(this.state.tocancel);
     if(this.state.statusrecived == true || this.state.tocancel == true){
     	 return;
     }
     this.setState({
     	overresponstime:true,
     });
     
   	this.getbookingStatus();
   	this.props.navigation.replace('BookDetails',this.state);
   	//alert(this.state.bookingresponse.id);																																					
   	//console.log("BEFORE No RESponse CAncellled");
   	//alert('https://www.turvy.net/api/rider/book/cancel/'+this.state.bookingresponse.id);
   	//alert(this.props.route.params.selectedcancelchr);
   	/* await AsyncStorage.getItem('accesstoken').then((value) => {
      	fetch('https://www.turvy.net/api/rider/book/cancel/'+this.state.bookingresponse.id,{
     	  	method: 'POST', 
		   headers: new Headers({
		     'Authorization': 'Bearer '+value, 
		     'Content-Type': 'application/json'
		   }),
		   body:JSON.stringify({
	 				'fee' : this.props.route.params.selectedcancelchr,
	 			}) 
		   })
      .then((response) =>{ return response.json() })
      .then((json) =>{ 			
      	//console.log("No RESponse CAncellled");
      	//console.log(json);
      	if(json.status == 1){
      		this.props.navigation.replace('BookDetails',this.state);
      	}
     	 }		
      )
      .catch((error) =>{
      	console.error(error);	
      });
      
     }); 	 */
    
   }
   
    getairportPoly = async() =>{
    	//console.log("Poly Data INFO Start ");
		await fetch('https://www.turvy.net/api/airport_polygon',{
     	  	method: 'GET', 
		   headers: new Headers({
		     'Content-Type': 'application/json'
		   })
		   })
      .then((response) =>{
      	return response.json();
      })
      .then((json) =>{ 
      	console.log("Poly Data INFO ",json.data);
      	//let result = json.data;
      	if(json.status == 1){
      		this.setState({
      			airport_Cord:json.data,
      		});
      		
     	   }
      })
      .catch((error) =>{
      	console.error(error);
       });
          
   
   } 
   
    componentDidMount(){
    	
    	this.setState({
            MapboxStyleURL:changeMode()
        })
        this.intervalModeChange = setInterval(async () => {
            this.setState({
                MapboxStyleURL:changeMode()
            })
        }, 10000);
        
    	const {navigation} = this.props;
    	
    	let listcord = [];
   	let locationcordsapi = [];
   	console.log("BEFORE DESINARION",this.props.route.params.origin);
   	 if(Object.keys(this.props.route.params.origin).length > 0){
      	//console.log("origin from");
       	 let origincord = [this.props.route.params.origin.longitude,this.props.route.params.origin.latitude];
       	 let element = { coordinates: origincord };
       	 locationcordsapi.push(origincord);
       	 //listcord = Object.assign(listcord, element);
       	 listcord.push(element);
       	 console.log("ORIGN coordinate List",Object.values(listcord));
		} 
		
		if(Object.keys(this.props.route.params.waypointslnglat).length > 0){
	      	 this.props.route.params.waypointslnglat.map((item, index) => {
		   	 //console.log("DRIVER MAP");
		   		console.log("waypoint item ",item);
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
       	 console.log("DESTINATION coordinate List",Object.values(listcord));
	   }
	   console.log("coordinate List",Object.values(listcord));
	   let locationcordsapistr = locationcordsapi.join(";");
	   
    	  BackHandler.addEventListener('hardwareBackPress', this.onGoBackCallback);
        navigation.addListener('gestureEnd', this.onGoBackCallback);
        this.getairportPoly();
		// this.getrewards();
		this.unsubscribe =  navigation.addListener("focus",() => {
			BackHandler.addEventListener('hardwareBackPress', this.onGoBackCallback);
       	navigation.addListener('gestureEnd', this.onGoBackCallback);
       	this.getRewards();
      });
      this.unsubscribeblur =  navigation.addListener("blur",() => {
      	clearInterval(this.myinterval);
         //clearInterval(this.myintervalaccp);
         clearTimeout(this.settimeout);
      	BackHandler.removeEventListener('hardwareBackPress', this.onGoBackCallback);
      });
		if(this.props.route.params.selectedvehicle){
			AsyncStorage.setItem('last_booking_id', JSON.stringify(this.props.route.params.bookingresponse.id));
      	this.setState({ 
             selectedvehicle:this.props.route.params.selectedvehicle,
             origin:this.props.route.params.origin,
             destination:this.props.route.params.destination,
             latitudedest:this.props.route.params.latitudedest,
             longitudedest:this.props.route.params.longitudedest,
             latitudecur:this.props.route.params.latitudecur, 
             longitudecur:this.props.route.params.longitudecur,
             bookingresponse:this.props.route.params.bookingresponse,
             waypointslnglat:this.props.route.params.waypointslnglat,
             selectedcancelchr:this.props.route.params.selectedcancelchr,
             selectedprcperunit:this.props.route.params.selectedprcperunit,
             selectedminprc:this.props.route.params.selectedminprc,
             selectsurcharge:this.props.route.params.selectsurcharge,
             selectedvehiclefare:this.props.route.params.selectedvehiclefare,
             dedeuctinfo:this.props.route.params.dedeuctinfo,
             previousprewardpoint:this.props.route.params.previousprewardpoint,
             locationcordsapistr:locationcordsapistr
        },()=>{
        	
        	const center = {
          latitude: (this.props.route.params.origin.latitude + this.props.route.params.destination.latitude) / 2,
          longitude: (this.props.route.params.origin.longitude + this.props.route.params.destination.longitude) / 2,
        };
        console.log("source dest center",center);
        const destheading = this.getHeading(this.props.route.params.origin, this.props.route.params.destination)
        console.log('dest heading',destheading)
        this.setState({
            pathHeading:destheading,
            pathCenter:center
        })
        
        	this.intialLoad();
        	
        	AsyncStorage.getItem('messagecount').then((value) => {           
            if(value != '' && value !== null){
                this.setState({messagecount:value})
                //alert(value)
            }
        });
        	//180000
        	//90000
         this.settimeout = setTimeout(()=>{ 
          if(this.state.statusrecived == false ){
           this.noresponseYet();
          }
         }, 90000);
         
           //db.collection("trip_path")
           this.getnearestDriver();
        }); 
      }
      
      this.getRewards();
     
        /*this.props.navigation.addListener('blur', () => {
            
        });
			*/
      /*
  		this.unsubscribe =  navigation.addListener("focus",() => {
  			   	//
  			this.setState({ 
             selectedvehicle:this.props.route.params.selectedvehicle,
             inprocessing:0,
         },()=>{
         	//setTimeout(()=>{ this.props.navigation.navigate('RideConfirm',this.state) }, 2000)
         });
         
  			this.intialLoad();
  		});	
  		*/		
  } // end of function
  
  onGoBackCallback(){
      console.log('Android hardware back button pressed and iOS back gesture ended');
      this.setState({
      	modalvisible:true
      });
      //alert("are you sure you want to go back !");
     /*  Alert.alert(
        'Go Back',
        'are you sure you want to go back, It will Cancel current trip request?', [{
            text: 'Cancel',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel'
        }, {
            text: 'OK',
            onPress: () => BackHandler.exitApp()
        }, ], {
            cancelable: false
        }
     );
     */
      //this.props.navigation.replace('BookMain',this.state);
     return true;
   }
   
  async getRewards(){
		 await AsyncStorage.getItem('rewardpoints').then((value) => {
			this.setState({
				rewardpoints:value,
			});
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
  
   UNSAFE_componentWillUnmount() {
    //this.unsubscribe();
      
    if(this.myinterval){
      clearInterval(this.myinterval);
    }
    
    if(this.settimeout){
   	 clearTimeout(this.settimeout);
   }
   
  }
  
  async getbookingStatus(){	
  	   if(this.state.statusrecived == true){
  	   	 clearInterval(this.myinterval);
  	   	 clearTimeout(this.settimeout);
  	   	  //clearInterval(this.myintervalaccp);
  	   	 return;
  	   }
  	    //console.log("here in status");	
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
      	console.log("get status if driver accept");
      	console.log(json);
      		
      	if(json.status == 1){
      		console.log("INTERVAL IF "+this.myinterval);
      	   console.log(json.message);
      	  if(this.state.statusrecived == false){
      		if(json.message == 'progress'){
      			 clearInterval(this.myinterval);
      	       clearTimeout(this.settimeout);
      			  //clearInterval(this.myintervalaccp);
      			this.setState({
      					rideinfoinprocess:json.data.booking,
      					bookingdriver:json.data.driver,
      					statusrecived:true,
      			},()=>{
      					this.props.navigation.replace('RideConfirm1',this.state);	
      			})
      		}else if(json.message == 'complete'){
      			 clearInterval(this.myinterval);
      	      clearTimeout(this.settimeout);
      	       //clearInterval(this.myintervalaccp);
      			this.setState({
      					statusrecived:true,
      			},()=>{
      				this.props.navigation.replace('BookMain');
      			})
      		  
      		}else if(json.message == 'cancel'){
      			 clearInterval(this.myinterval);
      	      clearTimeout(this.settimeout);
      	       //clearInterval(this.myintervalaccp);
      			this.setState({
      				statusrecived:true,
      			},()=>{
      				if(this.state.overresponstime == true ){
      					this.props.navigation.replace('BookDetails',this.state);
      				}else{
      					this.props.navigation.replace('BookMain');
      				}
      				
      			})
      			//this.props.navigation.navigate('BookMain');
      			//this.props.navigation.navigate('RideConfirm');
      		}else if(json.message == 'not assigned'){
      			if(this.state.overresponstime == false){
	      			console.log(json.message);
	      			console.log("Driver Not accpeted Yet 1");
	      			console.log("FULL ARRAY ",this.state.drivernearAll);
	      			console.log("REMAING  ARRAY ",this.state.drivernearRem);
	      			let remigdriver = this.state.drivernearRem;
	      			if(this.state.drivernearRem.length > 0){
	      				let remianingdrv = remigdriver.shift();
	      				console.log("SHIFTED ELEMENT",remianingdrv);
	   					console.log("SHIFTED AFTER ",remigdriver);
	   					this.setState({
	   						drivernearRem:remigdriver,
	   					});
	   					this.assignDriverIndiv(remianingdrv.driverId);
	   					//console.log("DECLINE DRIVER", this.state.driverdecline);
	   					//this.declineBydriver(remianingdrv.driverId);
	      			}else{
	      				this.getnearestDriver2();
	      			}
      			}
      		  // not acccpeted yet 	        		  
      		}
      	}
      		/*const drivernear = [];
      		Object.keys(json.data).length > 0 && json.data.map((marker, index) => {
      			//console.log(marker.lat);
      			//console.log(marker.lng);
      			const coordinates = {
      					latitude:Number(marker.lat), 
				      	longitude:Number(marker.lng) };
				  
				      	
			      drivernear.push({['coordinates']:coordinates,
			      	['driverId']:marker.driverId,	});
      		});
      		
      		console.log(drivernear);
      		this.setState({
      			drivernear:drivernear,
      		});
      		*/
      	}
     	 }
      )
      .catch((error) => console.error(error));
     }); 	
  }
  
  
  
   async getbookingStatusAccpt(){
  	   if(this.state.statusrecived == true){
  	   	 clearInterval(this.myinterval);
  	   	 clearTimeout(this.settimeout);
  	   	//  clearInterval(this.myintervalaccp);
  	   	 return;
  	   }
  	   //console.log("here in status");	
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
      	//console.log(json);
      	
      	if(json.status == 1){
      		console.log("INTERVAL IF "+this.myinterval);
      	   console.log(json.message);
      	  if(this.state.statusrecived == false){
      		if(json.message == 'progress'){
      			 clearInterval(this.myinterval);
      	       clearTimeout(this.settimeout);
      	        //clearInterval(this.myintervalaccp);
      			   
      			this.setState({
      					rideinfoinprocess:json.data.booking,
      					bookingdriver:json.data.driver,
      					statusrecived:true,
      			},()=>{
      					this.props.navigation.replace('RideConfirm1',this.state);	
      			})
      		}else if(json.message == 'complete'){
      			 clearInterval(this.myinterval);
      	      clearTimeout(this.settimeout);
      	       //clearInterval(this.myintervalaccp);
      			this.setState({
      					statusrecived:true,
      			},()=>{
      				this.props.navigation.replace('BookMain');
      			})
      		  
      		}else if(json.message == 'cancel'){
      			clearInterval(this.myinterval);
      	      clearTimeout(this.settimeout);
      	      //clearInterval(this.myintervalaccp);
      			this.setState({
      					statusrecived:true,
      			},()=>{
      				this.props.navigation.replace('BookMain');
      			})
      			//this.props.navigation.navigate('BookMain');
      			//this.props.navigation.navigate('RideConfirm');
      		}else if(json.message == 'not assigned'){
      		  // not acccpeted yet 	        		  
      		}
      	}
      		/*const drivernear = [];
      		Object.keys(json.data).length > 0 && json.data.map((marker, index) => {
      			//console.log(marker.lat);
      			//console.log(marker.lng);
      			const coordinates = {
      					latitude:Number(marker.lat), 
				      	longitude:Number(marker.lng) };
				  
				      	
			      drivernear.push({['coordinates']:coordinates,
			      	['driverId']:marker.driverId,	});
      		});
      		
      		console.log(drivernear);
      		this.setState({
      			drivernear:drivernear,
      		});
      		*/
      	}
     	 }
      )
      .catch((error) => console.error(error));
     }); 	
  }
  
    
   declineBydriver = async(driverAId) =>{
   	//alert(driverAId);
   	let accesstoken = await AsyncStorage.getItem('accesstoken');
   	console.log(accesstoken);
   	fetch('https://www.turvy.net/api/rider/getdeclinedriverreq/'+this.state.bookingresponse.id,{
				method: 'POST',
				headers : {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
					'Authorization' : 'Bearer '+accesstoken
				},
	 			body: JSON.stringify({
	 				"driver_id" :driverAId,
	 			})
	 		}).then(function (response) {
	 			return response.json();
	  		}).then( (result)=> {
	  			console.log(result);
	  			if(result.message == 'Driver Decline'){
	  				console.log("IN DECLINE ",this.state.driverdecline);
	  				let driverdecline = [...this.state.driverdecline];
	  				driverdecline.push(driverAId);
	  				this.setState({ 
	  					driverdecline:driverdecline,
	  				})
	  			}else{
	  				this.assignDriverIndiv(driverAId);
	  			}
	  		});
   }
   
   clearinteroncancel = () =>{
		 clearInterval(this.myinterval);
       clearTimeout(this.settimeout);
      //clearInterval(this.myintervalaccp);   
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
  
       	<Grid >
   			<Row size={15}>
   			<Col size={12}>
   			    <ActivityIndicator size="large" color="#04b1fd" />
   			</Col>
   			</Row>
   			<Row size={10}>
   			<Col size={12} >
   			    <View style={{ alignItems: 'center',width:'100%'}}><Text style={{fontWeight:'bold',color:'#3f78ba',fontSize:16,textAlign:'center',textTransform:'uppercase'}}>We are processing your Booking ...</Text></View>
   			</Col>
   			</Row>
   			<Row size={10}>
   			<Col size={12}>
   			    <View style={{ alignItems: 'center' }}><Text style={{textAlign:'center',color:'#3f78ba',fontSize:16,fontWeight:'bold'}}>Your ride will start soon!</Text></View>
   			</Col>
   			</Row>
   			<Row size={50}>
   			<Col>
   			<SwipeButton
             containerStyles={{borderWidth:1,borderColor:'silver',color:'grey',padding:2}}
             shouldResetAfterSuccess={true}
            height={50}
            onSwipeFail={() => console.log('Incomplete swipe!')}
            onSwipeStart={() => console.log('Swipe started!')}
            onSwipeSuccess={() =>{
               console.log('Submitted successfully!');
               //clearTimeout(this.settimeout);
               this.setState({
               	tocancel:true,
               },()=>{
               	this.props.navigation.navigate('BookCancel',this.state);
               })
            }}
            
            railBackgroundColor="silver"  
            railBorderColor="silver"
            railStyles={{
              backgroundColor: '#E5E9F2',
              borderWidth:1,
              borderColor: 'silver',
              color:'grey',
            }}
//979EAD
            thumbIconBackgroundColor="#FFFFFF"
            titleColor='#979EAD'
            title="Slide to cancel"
            thumbIconComponent={this.swipicon}
            thumbIconStyles={{
            	borderWidth:0,
            }}
            railFillBackgroundColor="#E5E9F2"
          />
   			</Col>
   			</Row>
   			<Row size={10}>
   				<Col>
   				</Col>
   			</Row>
   		</Grid>
     </View>
   </>
  );   
  
  
  async intialLoad() {
  	
  	  
     let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
      /*let location = await Location.getCurrentPositionAsync();
       //console.log(location.coords.latitude);
       //console.log(location.coords.longitude);
       const latitudeDelta = location.coords.latitude-location.coords.longitude;
       const longitudeDelta = latitudeDelta * ASPECT_RATIO;
       
        //console.log(latitudeDelta);
       //console.log(longitudeDelta);
       let origin ={};
      // console.log(this.props.route.params.destination);
      if(this.props.route.params.origin){
       	 origin = this.props.route.params.origin;
		}else{
			 origin = {
	      	latitude: location.coords.latitude, 
	      	longitude: location.coords.longitude
	      } 
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
      console.log(this.props.route.params.selectedvehicle);
      if(this.props.route.params.selectedvehicle){
      	selectedvehicle = this.props.route.params.selectedvehicle;
      }
      
      this.setState({
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
      //console.log(location);

       if (location.coords) {
		    const { latitude, longitude } = location.coords;
		      let keys = {
		        latitude : latitudedest,
		        longitude : longitudedest
		    }
		    /*let response = await Location.reverseGeocodeAsync(keys);
		    
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
		  //}
      //.finally(() => setLoading(false));
    }
    
  render() {
  
  	 return (
  	 <View style={styles.container}>
  	  <MapboxGL.MapView style={styles.map}
     		showUserLocatin={true}
     		ref={c => this.mapView = c}
     		cluster
     		logoEnabled={false}
     		attributionEnabled={false}
     		coordinates={[this.state.longitudecur,this.state.latitudecur]}
     		styleURL={this.state.MapboxStyleURL}
     		heading={this.state.pathHeading}
     		zoomEnabled={true}
     		onDidFinishRenderingMapFully={(index)=>{
     		  //console.log("map load complete");
     		  //alert(this.state.locationcordsapistr);
     		  //79.075274,21.089974;79.0899,21.0893;79.1069,21.0962;79.097723,21.131447
	       fetch('https://api.mapbox.com/directions/v5/mapbox/driving/'+this.state.locationcordsapistr+'?geometries=geojson&access_token=pk.eyJ1IjoibWFsLXdvb2QiLCJhIjoiY2oyZ2t2em50MDAyMzJ3cnltMDFhb2NzdiJ9.X-D4Wvo5E5QxeP7K_I3O8w',{
				method: 'GET',
	 		}).then(function (response) {
	 			return response.json();
	  		}).then( (result)=> {
	  			//console.log("Data from api geomery ",result.routes[0].geometry);
	  			let distance = result.routes[0].distance;
	  			distance = distance/1000;
	  			
	  			  
	  			
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
	  					this.camera.fitBounds([this.state.longitudecur,this.state.latitudecur], [this.state.longitudedest,this.state.latitudedest],[100,40,250,20],1000);
	  				}
	  			});
			});
     		}}
     		 >
     		  {this.state.longitudecur && this.state.latitudecur ?
     		  (<MapboxGL.Camera
	     		 ref={c => this.camera = c}
            animationDuration={250}
            minZoomLevel={1}
            zoomLevel={13}
            maxZoomLevel={20}
            animationMode="flyTo"
            centerCoordinate={[this.state.longitudecur,this.state.latitudecur]}
            Level={10} 
            heading={this.state.pathHeading}
          />)
          :
          (<></>)
         }
          <MapboxGL.ShapeSource  id="mapbox-directions-source" shape={this.state.routedirect}>
			      <MapboxGL.LineLayer
			        id="mapbox-directions-line"
			        style={{lineColor:'#135AA8',lineWidth:2}}
			        />
    	     </MapboxGL.ShapeSource>  
    	      { this.state.latitudecur != '' && this.state.longitudecur != '' ?
		       (<MapboxGL.PointAnnotation 
			           id={'markercurr'}
			            anchor={{ y: 1, x: 0.5 }}
			           coordinate={[this.state.longitudecur,this.state.latitudecur]}>
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
    	   {Object.keys(this.state.drivernear).length > 0 ?
		     this.state.drivernear.map((marker, index) => {
		     	return (
					    <MapboxGL.PointAnnotation 
					           id={marker.id}
					           coordinate={[marker.coordinates.longitude,marker.coordinates.latitude]}>
					    <Image
					        style={styles.vehmarkerimage}
					        source={imageveh} />
					    </MapboxGL.PointAnnotation>
		  		    );
		     })
		     : null
		    }	
           </MapboxGL.MapView>
	    
     
  { this.state.display ? (
  <BottomSheet
        
        snapPoints={[SCREENHEIGHT]}
        borderRadius={20}
        renderContent={this.renderContent}
        overdragResistanceFactor={0}
        enabledManualSnapping={false}
         enabledContentTapInteraction={false}
        enabledContentGestureInteraction={false}
      />)
      :(
      	<Text></Text>
      )
    }
    
    <TopBar {...this.props} />
	
	 <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.modalvisible}
          onRequestClose={() => {
            alert('Modal has been closed.');
          }}>
            <Grid style={{justifyContent:'center',alignContent:'center',}}>
          	<Row size={5}>
          		<Col>
          		</Col>
          	</Row>
          	<Row size={20} style={{justifyContent:'center',alignContent:'center'}}>
          		<Col style={{justifyContent:'center',alignContent:'center',alignItems:'center'}}>
          		  <View style={{backgroundColor:'#fff',height:'100%',width:'80%',justifyContent:'center',alignContent:'center',padding:10,borderRadius:5, shadowColor: "#000",
			shadowOffset: {
				width: 0,
				height: 3,
			},
			shadowOpacity: 0.27,
			shadowRadius: 4.65,

			elevation: 6,}}>
             		<Text style={{fontSize:20,fontWeight:'bold'}}>Are you sure you want to go back, It will Cancel current trip request?</Text>
             		<Row size={10} style={{marginTop:10,justifyContent:'center',alignItems:'center'}}>
	          		<Col size={5}>
	          			<Button  mode="contained" color={'grey'} onPress={() =>{ this.setState({
	          		 	modalvisible:false
	          		 }) }}>
							   <Text style={{color:'#fff'}}> Cancel </Text>
					    </Button>
	          		</Col>
	          		<Col size={2}></Col>
	          		<Col size={5}>
	          		 <Button  mode="contained" color={'#135AA8'} onPress={() =>{ 
	          		 this.setState({
	          		 	modalvisible:false
	          		 },()=>{
	          		 	this.props.navigation.replace("BookMain",this.state);
	          		 }); }}>
							    Ok
					    </Button>
	          		</Col>
	          		
	          	</Row>
           		 </View>
           		 
          		</Col>
          	</Row>
          	<Row size={10} style={{marginTop:10}}>
          		
          	</Row>
          	<Row size={40}>
          		<Col>
          		</Col>
          	</Row>
          </Grid>
     </Modal>
     
  </View>	
	  );
   }
 
}

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
    height: '100%',
    aspectRatio: 1 * 1.4,
	 resizeMode: 'contain'
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
yellow:{color:'#fec557'},
btnSmall:{
		backgroundColor:'#3f78ba',
		borderWidth:5,
		borderColor:'#FFF',
		fontSize:50,
		shadowColor: '#000',
	},
	searchSection:{
	 height:80,justifyContent:'center',alignContent:'center',backgroundColor:'#fff', shadowColor: "#000",
			shadowOffset: {
				width: 0,
				height: 3,
			},
			shadowOpacity: 0.27,
			shadowRadius: 4.65,
			elevation: 7,
	},
	vehmarkerimage:{
    width: 20,
    height:35,
	 alignSelf:'center'
	},
});
