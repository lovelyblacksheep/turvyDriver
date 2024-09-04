import { StatusBar } from 'expo-status-bar';
import debounce from 'lodash.debounce';
import React from "react";
import { StyleSheet, Text, View,Dimensions,Image ,FlatList,ScrollView, TouchableOpacity,TouchableHighlight,Keyboard,KeyboardAvoidingView, Alert,Linking,BackHandler,Animated,Modal} from 'react-native';
import { TextInput, Appbar, Title, Paragraph, Button,Badge } from 'react-native-paper';
//import * as Permissions from 'expo-permissions';

import * as Location from 'expo-location';

import { EvilIcons } from '@expo/vector-icons'; 
//import Animated from 'react-native-reanimated';
import { Divider } from 'react-native-elements';
import { Col, Row, Grid } from "react-native-easy-grid";
import { FontAwesome ,FontAwesome5,Entypo,Feather,AntDesign,Ionicons } from '@expo/vector-icons'; 

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {theme, DOMAIN} from '../Riders/Constant';
import BottomSheet from 'reanimated-bottom-sheet';
const imageveh = require('../assets/images/driver-veh-images_60.png');
import imagevehIcon from '../assets/images/driver-veh-images_60.png';
import Pusher from 'pusher-js/react-native';
import TopBar from "./TopBar";
import AddaStop from './AddaStop';

import * as geolib from 'geolib';
const { width, height } = Dimensions.get('window');
import * as firebase from "firebase";
import firestore from '@react-native-firebase/firestore';
import apiKeys from '../config/keys';

//import Annotation from '@react-native-mapbox-gl/maps/javascript/components/annotations/Annotation'; // eslint-disable-line import/no-cycle
//import MapboxGL from "@rnmapbox/maps";
import  MapboxGL from "@react-native-mapbox-gl/maps"; 
import  { changeMode, 
    MapboxCustomURL} from  "../Riders/MapDayNight";
//MapboxGL.setAccessToken("pk.eyJ1IjoibWFsLXdvb2QiLCJhIjoiY2oyZ2t2em50MDAyMzJ3cnltMDFhb2NzdiJ9.X-D4Wvo5E5QxeP7K_I3O8w");
import { lineString as makeLineString } from '@turf/helpers';
import { point } from '@turf/helpers';
import MapboxNavigation from "@homee/react-native-mapbox-navigation";

if (!firebase.apps.length) {
    console.log('Connected with Firebase')
    firebase.initializeApp(apiKeys.firebaseConfig);
}

const db = firestore();

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0043;
const SCREENHEIGHT = height*.50;
const DEVICE_WIDTH = width;
const DEVICE_HEIGHT = height;		
const faresmap = [];


export default class BookingMap extends React.Component {
    constructor(props) {
        super(props);
        this.startPoint = [151.2195, -33.8688];
        this.finishedPoint = [151.2195, -33.8688];
        this.state = {
            step:1,
            locationcur:{},
            radius:40,
            sourceLocation:{},
            latitudecur:-33.8688,
            longitudecur:151.2195,
             rotateValue: new Animated.Value(0),
            latitudedest:'',
            longitudedest:'',
            curlocatdesc:'',
             soundcont:'',
            fares:{},
            latitudeDelta: 0.007683038072176629,
            longitudeDelta: 0.004163794219493866,
             driverCoordinate: {
                latitude: -34.07465730,
                longitude: 151.01108000,
            },
            origin:{},
            destination:{},
            pickup:'',
            destinationto:'',
            stateText:'',
            results:{},
            forsourdest:'source',
            accessTokan:'',
            avatar:'',
            name:'',
             distance:0,
             duration:0,
             bookrequest:{},
             display:true,
             departed:false,
             waypointslnglat:[],
             mapfitdone:false,
             endcomplete:false,
             rewardpoints:0,
             selectsurcharge:0,
             selectedvehiclefare:0,
             heading: 0,
         	   pathHeading:0,
            pathCenter:{},
            messagecount:0,
            is_vend:false,
            disttravlled:0,
            distancetravel:0,
            routemap:null,
            snaptoval:['26%', '40%','10%'],
         snapIndex:0,
         locationcordsapistr:null,
         modalvisible:false,
         modalstopvisible:false,
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
        this.myRefbt = React.createRef();
        this.mapView = null;    
        this.myinterval = React.createRef();
        this.myinterval2 = React.createRef();
        this.onGoBackCallback = this.onGoBackCallback.bind(this);
        //this.closeAddastop = this.closeAddastop.bind(this);
        this.pusher = new Pusher('389d667a3d4a50dc91a6', { cluster: 'ap2' }); 
        this.listenForChanges();  
        this.bottomSheetRef = React.createRef();
    }
    
    listenForChanges = () => {
		const channel = this.pusher.subscribe('turvy-channel'); 
		 channel.bind('end_trip_event', data => {
		 	
		 	console.log("END TRIP ",JSON.stringify(data));
		 	let selectedvehiclefare = parseFloat(data.totalAmount);
		 	this.setState({
		 		selectsurcharge:0,
		 		selectedvehiclefare:selectedvehiclefare,
		 		distancetravel:parseFloat(data.tripDistance),
		 	},()=>{
		 		this.getrideEndforPusher();
		 	})
		  	//alert(JSON.stringify(data));
		  }); 
		  channel.bind('violent_end_trip_event', data => {
		  	console.log("VOL END TRIP",JSON.stringify(data));
		  	let selectedvehiclefarev = parseFloat(data.totalAmount);
		  	this.setState({
		  		is_vend:true,
		  		selectsurcharge:0,
		 		selectedvehiclefare:selectedvehiclefarev,
		 		distancetravel:parseFloat(data.tripDistance),
		  	},()=>{
		  		this.getrideEndforPusher();
		  	});
		 	 
		  	 //alert(JSON.stringify(data));
		  }); 
		  //this.getrideEnd();
		 //this.getrideEnd();
		  /*channel.bind('driver_offline_event', data => {
		 	this.getNearBydriver();
		 //alert(JSON.stringify(data));
		  });
		  */ 
	};
	
	
	 getfares(distance){
    		 fetch(DOMAIN+'api/farecardall/2',{
	       method: 'GET',
	      }).then(function (response) {
	      return response.json();
	      }).then( (result)=> {
	      	
	        console.log(result);
	        if(result.status == 1){
	        	console.log("INSIDE IF DATA");
	        	let fareoff =0;
	        	//let distance = 10;
	        	let basechrg = 0;
	        	let surchnageslist =0;
	        	let totalchangre = 0;
	        		console.log("INSIDE IF DATA 1",distance);
	        	if(Object.keys(result.data).length){
	        		 result.data.map((item, key) => {
	        		 	console.log("ITEM SERVICES New "+key+'  '+item.base_ride_distance_charge,item.servicetype_id);
	        		 	console.log("ITEM Selcted  New ",this.state.selectedvehicle.id);
	        		 	console.log("ITEM Selcted  item 1 ",item);
	        		 	//const sid = item.servicetype_id;
	        		 	if( item.servicetype_id == this.state.selectedvehicle.id){
	        		 			console.log("ITEM Selcted IF item 1",item);
	        		 		//faresmap[item.servicetype_id]= item.base_ride_distance_charge;
	        		 		if(distance > item.base_ride_distance){
	        		 			fareoff = parseFloat(distance*item.price_per_unit);
	        		 		}else{
	        		 		  fareoff = parseFloat(distance*item.price_per_unit);
	        		 		}
	        		 		basechrg = item.base_ride_distance_charge;
	        		 		 let minimumfaren = parseFloat(item.price_per_unit)*parseFloat(distance);
				        	 let  gstper =  item.gst_charge;
				        	 gstper = gstper.replace("%", "");
				        	 
				        	  if(item.servicetype_id == 1){
				        	 	 surchnageslist = (parseFloat(item.fuel_surge_charge))+parseFloat(item.nsw_gtl_charge)+parseFloat(item.nsw_ctp_charge)+parseFloat(minimumfaren*(parseFloat(gstper)/100));
				        	 }else{
				        	 	 surchnageslist = (parseFloat(item.fuel_surge_charge))+parseFloat(item.nsw_gtl_charge)+parseFloat(item.nsw_ctp_charge)+parseFloat(minimumfaren*(parseFloat(gstper)/100));
				        	 }
				        	 
				        	  console.log("ITEM SERVICES New FAREMAP ",fareoff);
				        	  console.log("ITEM SERVICES New FAREMAP SUR Charge",surchnageslist);
		        	        totalchangre = parseFloat(fareoff) + parseFloat(surchnageslist);
	        		 	}
	        		 });
	        	}
	        	   console.log("ITEM SERVICES New FAREMAP TOTAL Charge",totalchangre);
		        	this.setState({
		        	fares:faresmap,
		        });
	        }
	    });
    }
	
   
    async intialLoad() {
    	let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            setErrorMsg('Permission to access location was denied');
            return;
        }
        this.getrideEnd();
/*
        let location = await Location.getCurrentPositionAsync();
        //console.log(location.coords.latitude);
        //console.log(location.coords.longitude);
        const latitudeDelta = location.coords.latitude-location.coords.longitude;
        const longitudeDelta = latitudeDelta * ASPECT_RATIO;

        //  console.log(latitudeDelta);
        // console.log(longitudeDelta);

        const origin = {
        	latitude: location.coords.latitude, 
        	longitude: location.coords.longitude
        } 
      
        this.setState({
        	locationcur:location,
        	latitudecur:location.coords.latitude,
        	longitudecur:location.coords.longitude,
        	latitudeDelta:0.00176,
        	longitudeDelta:0.00176,
        	origin:origin,
        });
        //console.log(origin);

        if (location.coords) {
            const { latitude, longitude } = location.coords;
            let response = await Location.reverseGeocodeAsync({
                latitude,
                longitude,
            });
            //console.log(response);

            let address = '';
            for (let item of response) {
                //${item.street}, 
                let address = `${item.name}, ${item.postalCode}, ${item.city}`;
                // console.log(address);
                this.setState({
                	curlocatdesc:address,
                	pickup:address,
                });
            }
        }
        */
        AsyncStorage.getItem('accesstoken').then((value) => {           
            if(value != '' && value !== null){
                this.setState({
                    accessTokan:value
                });
            }
        })
        //alert(this.state.isOnline)
    } 
    
    async componentDidMount() {
    	 this.setState({
            MapboxStyleURL:changeMode()
        },()=>{
        //	alert(this.state.MapboxStyleURL);
        });
        this.intervalModeChange = setInterval(async () => {
            this.setState({
                MapboxStyleURL:changeMode()
            })
        }, 10000);
        setTimeout(() => {
			 this.setState({
			 	snapIndex:2,
			 },() => {   
		 		 if(this.bottomSheetRef){
		 		 	this.bottomSheetRef.current.snapTo(this.state.snapIndex)
		 		 }                                     
                     
           });
			}, 60000);
    	const {navigation,state} = this.props;
    	
    	let listcord = [];
   	let locationcordsapi = [];
   	console.log("BEFORE DESINARION",this.props.route.params.origin);
   	console.log("BEFORE DESTINATION",this.props.route.params.destination);
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
    	 //alert("here before load "+this.props.route.params.bookingresponse.id);
    	  this.getRewards();
    	   BackHandler.addEventListener('hardwareBackPress', this.onGoBackCallback);
        navigation.addListener('gestureEnd', this.onGoBackCallback);
        
		// this.getrewards();
		this.unsubscribe =  navigation.addListener("focus",() => {
			BackHandler.addEventListener('hardwareBackPress', this.onGoBackCallback);
       	navigation.addListener('gestureEnd', this.onGoBackCallback);
      });
      this.unsubscribeblur =  navigation.addListener("blur",() => {
      	//clearInterval(this.myinterval);
          //clearInterval(this.myintervalaccp);
      	BackHandler.removeEventListener('hardwareBackPress', this.onGoBackCallback);
      });
      
      console.log("Booking driver",this.props.route.params.bookingdriver);
      if(this.props.route.params.selectedvehicle){
      	
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
             selectsurcharge:this.props.route.params.selectsurcharge,
             selectedvehiclefare:this.props.route.params.selectedvehiclefare,
             locationcordsapistr:locationcordsapistr
        },
        ()=>{
        	 //alert(this.state.longitudedest);
        	const center = {
                latitude: (this.state.origin.latitude + this.state.destination.latitude) / 2,
                longitude: (this.state.origin.longitude + this.state.destination.longitude) / 2,
              };
              const destheading = this.getHeading(this.state.origin, this.state.destination)
              //console.log('dest heading',destheading)
              this.setState({
                  pathHeading:destheading,
                  pathCenter:center,
                  locationcordsapistr:locationcordsapistr
              });
        	        /* const origin = {
		            	latitude: 21.11922760, 
		            	longitude:79.10470160
		            } 
      
		            this.setState({
		            	origin:origin
		            });
        	      */
        });
        
        	
         //console.log("RESPONSE AFTER FARE",faresmap);
       // alert("BEFORE LOOP");
         this.loopfuntions();
         
       
       
         	
         /*	
        let locations = await Location.watchPositionAsync({ accuracy: Location.Accuracy.BestForNavigation, timeInterval: 10000, distanceInterval: 1 }, (pos) => {
	            console.log('cords:',pos.coords);
	             const { latitude, longitude } = pos.coords;
	             const origin = {
		            	latitude: latitude, 
		            	longitude:longitude	
		            } 	
		            this.setState({
		            	latitudecur:latitude,
		            	longitudecur:longitude,
		            	origin:origin
		            });
	            //console.log(driverId);
	        }); 
			*/
        //this.intialLoad()
        //alert("here before load "+this.props.route.params.bookingresponse.id);
    }else if(this.props.route.params.bookingdriver.id > 0){
      	//alert(this.props.route.params.bookingdriver.id);
      	// alert("here IN ELSE");
       console.log("RESPONSE AFTER FARE");
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
              driverCoordinate: {
	              latitude: this.props.route.params.origin.latitude,
	                longitude: this.props.route.params.origin.longitude,
	            },
      	},()=>{
      		
				const center = {
	                latitude: (this.state.origin.latitude + this.state.destination.latitude) / 2,
	                longitude: (this.state.origin.longitude + this.state.destination.longitude) / 2,
	              };
	              const destheading = this.getHeading(this.state.origin, this.state.destination)
	              //console.log('dest heading',destheading)
	              this.setState({
	                  pathHeading:destheading,
	                  pathCenter:center
	              })      		
      		
      		//this.getrideStart();
      	});
      
      }
     
     AsyncStorage.getItem('messagecount').then((value) => {           
            if(value != '' && value !== null){
                this.setState({messagecount:value})
                //alert(value)
            }
        });	 
       
   }
    
	 onRegionChangeComplete = (region) => {
	     //console.log('onRegionChangeComplete', region);
	     /*this.setState({
	         latitudeDelta: region.latitudeDelta,
	         longitudeDelta: region.longitudeDelta,
	     });
	     */
	     
	     this.setState({
	         latitudeDelta: 0.008765219166956939,
	         longitudeDelta: 0.005394257605075836,
	     });
	 };
	 
	 
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
    
   onGoBackCallback(){
      console.log('Android hardware back button pressed and iOS back gesture ended');
      /*this.setState({
      	modalvisible:true
      });
      */
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
  
    loopfuntions =() =>{
    	//alert(" LOOP START");
    		//alert(this.props.route.params.bookingdriver.id);
			/*this.myinterval = setInterval(() => {
        	//alert("")
        	if(this.state.endcomplete == false){
          	this.getrideEnd();
          }
        }, 10000);
        */
        
	   
         this.myinterval2 = setInterval(() => {
          	this.getDriverCoordinate();
        }, 4000);
        

         this.getrideEnd();   
    }
    
     async getLnglatdriver2source(dLocation){
    	let loctstring = dLocation.longitude+','+dLocation.latitude+';'+this.state.destination.longitude+','+this.state.destination.latitude;
    	
    	fetch('https://api.mapbox.com/directions/v5/mapbox/driving/'+loctstring+'?overview=full&geometries=geojson&access_token=pk.eyJ1IjoibWFsLXdvb2QiLCJhIjoiY2oyZ2t2em50MDAyMzJ3cnltMDFhb2NzdiJ9.X-D4Wvo5E5QxeP7K_I3O8w',{
				method: 'GET',
	 		}).then(function (response) {
	 			return response.json();
	  		}).then( (result)=> {
	  			console.log("Data from api geomery ",result.routes[0].geometry);
	  			let distance = result.routes[0].distance;
	  			distance = distance/1000;
	  			let duration = result.routes[0].duration;
	  			duration = result.routes[0].duration/60;
	  			duration = duration.toFixed();
	  			
	  			  
	  			console.log("COORDINATES ARRAY", Object.values(result.routes[0].geometry.coordinates));
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
	  				//alert("here");
	  				//this.camera.flyTo([this.state.driverCoordinate.longitude, this.state.driverCoordinate.latitude], 1000);
	  				//this.camera.fitBounds([this.state.origin.longitude, this.state.origin.latitude], [this.state.longitudedest,this.state.latitudedest],[150,40,250,20],1000);
	  				//this.updatecarLoc();
	  			});
			});
  
    } 
    
  getDriverCoordinate = () =>{
  
  		 var docRef = firestore().collection("driver_locations").doc(JSON.stringify(this.props.route.params.bookingdriver.id));
                docRef.get().then((doc) => {
                		
                    if (doc.exists) {
                    	//alert("IN QUERY DOC");
                        console.log("Document data INITAL BOOOKMAP! :", doc.data());
                        
                         let latitude = doc.data().coordinates.latitude;
                         let longitude= doc.data().coordinates.longitude;
				             let origin = {
					            	latitude: latitude, 
					            	longitude:longitude	
					            } 	
					            this.setState({
					            	latitudecur:latitude,
					            	longitudecur:longitude,
					            	origin:origin,
					            	driverCoordinate:{
					            		 latitude: latitude,
					                   longitude: longitude,
					            	}
					            },()=>{
					            	console.log(" DRIVER COORDINATES ",this.state.driverCoordinate);
					            	console.log(" DESTIN ATION COORDINATES ",this.state.longitudedest);
					            	//this.getLnglatdriver2source(this.state.driverCoordinate);	
					            });
					            
					            
					             /*let rotateAngl = 0;
                             if(rotateAngl > 0.5){
						                rotateAngl = rotateAngl - 1
						            }
			                    rotateAngl = (doc.data().heading/360);
			                    Animated.timing(this.state.rotateValue, {
						                toValue: rotateAngl,
						                duration: 2000,
						                useNativeDriver: true,
						            }).start();
						            */
		            
					            const newCoordinate = {
					                latitude: latitude,
					                longitude: longitude,
					                latitudeDelta:this.state.latitudeDelta,
					                longitudeDelta: this.state.longitudeDelta,
					            };
					
					
					            /*if (this.marker) {
					                console.log('DRIVER COORDINATES ',this.state.driverCoordinate)                
					              //  this.state.driverCoordinate.timing({ ...newCoordinate, useNativeDriver: true,duration: 4000 }).start();
					            }
					            */
					            
					           /* 	if(this.camera){
                        this.camera.setCamera({
                            centerCoordinate: [this.state.driverCoordinate.longitude, this.state.driverCoordinate.latitude],
                            animationDuration: 6000,
                            heading:doc.data().heading,
                            pitch:50,
                            zoomLevel:15
                        })
                        */
                    }
					         
					          /* if(this.mapView) {
						            this.mapView.animateCamera({
						                center:{
						                    latitude: doc.data().coordinates.latitude,
						                    longitude: doc.data().coordinates.longitude,
						                },
						                heading : doc.data().heading
						            });
						        }
						        */
						        

                       /* this.setState({driverLocation:doc.data().coordinates,
                        displaydriveloc:true},()=>{
					       	 console.log(" ORGIN SET INITAL "+JSON.stringify(this.state.driverLocation));      	
					         });
					         */
					         this.getrideEnd();
                    /*} else {
                        // doc.data() will be undefined in this case
                        console.log("No such document!");
                    }
                    */
                }).catch((error) => {
                    console.log("Error getting document:", error);
                });
  }
  
  getrideEndforPusher =()=>{
  	console.log('fares --- ',this.state.fares);
   	let bookId = this.props.route.params.bookingresponse.id;
   	if(this.state.bookingresponse && this.state.bookingresponse.id > 0){
   		bookId = this.state.bookingresponse.id;
   	}
   	//alert(bookId);
   	clearInterval(this.myinterval);
 	  clearInterval(this.myinterval2);
 		this.setState({
    		endcomplete:true,
    		
    	},()=>{
    	  this.setDriverPayment();
    		this.props.navigation.replace('RideArriveDest',this.state);
 	  });
  }
  
  getrideEnd =()=>{
  	console.log('fares --- ',this.state.fares);
   	let bookId = this.props.route.params.bookingresponse.id;
   	if(this.state.bookingresponse && this.state.bookingresponse.id > 0){
   		bookId = this.state.bookingresponse.id;
   	}
   	
   	firestore().collection('trip_path').where('bookingId','==',bookId).where('status','==','close')
			  .get()
			  .then(querySnapshot => {
			    console.log('Total bOOKING STATUS: ', querySnapshot.size);
			    
			    if(querySnapshot.size > 0){
			    	
			    	  //alert(dist);
			    	  clearInterval(this.myinterval);
			    	  clearInterval(this.myinterval2);
			    		this.setState({
				    		endcomplete:true,
				    		
				    	},()=>{
				    	  this.setDriverPayment();
			       		this.props.navigation.replace('RideArriveDest',this.state);
			    	  });
			    	  
			    }																																																																																																																																															
			  });
  }
 
   
   UNSAFE_componentWillUnmount() {
    
    if(this.myinterval){
      clearInterval(this.myinterval);
    }
   
    if(this.myinterval2){
    	clearInterval(this.myinterval2);
    }
  }
  
  
    openDialScreenCall (no){
    	
	    if (Platform.OS === 'ios') {
	      number = 'telprompt:${'+no+'}';
	    } else {
	      number = 'tel:${'+no+'}';
	    }
    	Linking.openURL(number);
   
    }
    openDialScreen (){
    	 this.setState({
    	 	modalvisible:true
    	 });
 	 }
  openAddastop = () => {
    	 this.setState({
    	 	modalstopvisible:true
    	 });
  }
  closeModalAddastop = () =>{
    	 this.setState({
    	 	modalstopvisible:false,
    	 },()=>{
    	 	 if(this.mapView){
	    	 	this.mapView.refresh();
	    	 }
    	 });
    	
    	 
  }
  
  closeAddastop = () =>{
   	this.closeModalAddastop();
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
  

   		 <Grid  >   	
   		 <TouchableOpacity onPress={ (e) => {  
                                
             this.setState({
                 snapIndex: this.state.snapIndex ? 0 : 2
             },() => {                                        
                 this.bottomSheetRef.current.snapTo(this.state.snapIndex)    
             })
             
         }} >
   			<Row style={{height:20,padding:6,paddingBottom:20,}}>
   				<Col size={2}>
   				
   				</Col>
   				<Col size={8} style={{alignContent:'center',alignItems:'center'}}>
   				<Divider   />
   				
   				<Text style={{color:'#51E84f',fontWeight:'bold'}}  >Enroute to Destination </Text>
   				</Col>
   				<Col size={2}>
   			  {this.state.snapIndex == 2 ?
   			  (<Entypo name="arrow-up" size={15} color="#51E84f" />)
   			  :
   			  (<Entypo name="arrow-down" size={15} color="#51E84f" />)
   		     }
   				</Col>
   			</Row>
   			 </TouchableOpacity>
   			<Row style={{height:20,padding:6,paddingBottom:20,}}>
   			<Col size={12} style={{alignContent:'center'}}>
   				<Divider inset={true} insetType="middle" />
   				</Col>
   			</Row>
   			<Row style={{height:80}}>
   			   <Col size={4} style={{padding:6}}>
   				<View style={{flex:1,backgroundColor:'#EA202A',alignItems:'center',justifyContent:'center',borderRadius:5,}}>
   				<TouchableOpacity onPress={() =>{this.props.navigation.navigate('BookCancelEnrt',this.state) }}>
   					<AntDesign name="closecircleo" size={24} color="white" style={{textAlign:'center'}} />
   					<Text style={{color:'#fff'}}>
   						Cancel
   					</Text>
   					</TouchableOpacity>
   					</View>
   				</Col>
   				<Col size={4} style={{padding:6}}>
   					<View style={{flex:1,backgroundColor:'transparent',alignItems:'center',justifyContent:'center',width:'90%',borderRadius:5,borderWidth:2,borderColor:'#808080'}} >
   					<TouchableOpacity onPress={() => this.openDialScreen()}>
   					<Text style={{color:'#000',fontWeight:'bold'}}>
   						Sos
   					</Text>
   					<Ionicons name="ios-call" size={34} color="black" />
   					
   					</TouchableOpacity>
   					</View>
   				</Col>
   					<Col size={4} style={{padding:6}}>
   				<View style={{flex:1,alignItems:'center',justifyContent:'center',width:'90%',borderRadius:5,borderWidth:2,borderColor:'#808080'}}>
   				<TouchableOpacity onPress={() => this.openAddastop()}>
						<FontAwesome name="hand-stop-o" size={24} color="black" style={{textAlign:'center'}} />
   					<Text style={{color:'#808080',textAlign:'center'}}>
   						Add A stop
   					</Text>
   					</TouchableOpacity>
   					</View>
   				</Col>
   				
   			</Row>
   		</Grid>
    </View>
   </>
  );

 setDriverPayment = async() =>{
     //console.log("DRIVER PAYMENT");
 	await AsyncStorage.getItem('accesstoken').then((value) => {
							//console.log(this.state.bookingdriver.id);
							//console.log('https://turvy.net/api/rider/driverrequestPayment/'+this.state.bookingresponse.id);
							//this.props.route.params
							//alert(DOMAIN);
							fetch(DOMAIN+'api/rider/driverrequestPayment/'+this.state.bookingresponse.id,{
				     	  	method: 'POST', 
						   headers: new Headers({
						     'Authorization': 'Bearer '+value, 
						     'Content-Type': 'application/json'
						   }), 
						   body:JSON.stringify({
					 				'driver_id' : this.state.bookingdriver.id ,
					 				'is_vend' : this.state.is_vend ,
					 				'distance' : this.state.disttravlled
					 			}) 
						   })
				      .then((response) => response.json())
				      .then((json) =>{ 
				      	console.log(json);
				      
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
				      .catch((error) => console.error(error));
				      })
 }
  
    render() {  	
    let rotateAngl = 0;
	   rotateAngl = (this.state.heading/360);
	  	/*const spin = this.state.rotateAngl.interpolate({
	          inputRange: [0, 1],
	          outputRange: ['0deg', '360deg']
	        });
	        */
        
        return (
            <View style={styles.container} >	 
                        <View style={{flex:1}}>
                           {this.state.driverCoordinate && Object.keys(this.state.driverCoordinate).length > 0 && this.state.longitudedest != '' && this.state.latitudedest != '' ?
      (<MapboxNavigation
         origin={[this.props.route.params.origin.longitude,this.props.route.params.origin.latitude]}
        destination={[this.props.route.params.destination.longitude,this.props.route.params.destination.latitude]}
        onLocationChange={(event) => {
             //console.log("onLocationChange New",this.state.driverCoordinate);
        		//console.log("onLocationChange New",this.state.latitudedest,this.state.longitudedest);
          const { latitude, longitude } = event.nativeEvent;
        }}
        onRouteProgressChange={(event) => {
          const {
            distanceTraveled,
            durationRemaining,
            fractionTraveled,
            distanceRemaining,
          } = event.nativeEvent;
          //console.log("onRouteProgressChange",event.nativeEvent);
        }}
        onError={(event) => {
          const { message } = event.nativeEvent;
        }}
        onCancelNavigation={() => {
          // User tapped the "X" cancel button in the nav UI
          // or canceled via the OS system tray on android.
          // Do whatever you need to here.
        }}
        onArrive={() => {
          // Called when you arrive at the destination.
        }}
        isMapDark={this.state.MapboxStyleURL === MapboxGL.StyleURL.Dark ? true : false}
        
      />)
      :
      (<></>)
   }
      </View>	
		
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
          visible={this.state.modalvisible}
          transparent={true}
          style={{height:200,flex: 0}}
          onRequestClose={() => {
            alert('Modal has been closed.');
          }}>
          	<View style={{alignItems:'flex-end',zIndex:2000}} >
          	 <TouchableOpacity onPress={ (e) => {  
                                
             this.setState({
                 modalvisible: false
             });
             
         }} ><AntDesign name="closecircle" size={30} color="white" /></TouchableOpacity></View>
          	<Grid style={{justifyContent:'center',alignContent:'center',alignItems:'center',height:160,borderWidth:1,borderColor:'#ccc',flex: 0,backgroundColor:'#fff',}}>
          	<Row size={1} style={{height:30,justifyContent:'center',alignContent:'center',borderBottomWidth:1,borderBottomColor:'#ccc'}}>
          		<Col size={4} style={{justifyContent:'center',padding:5,}}>
          		<Text style={{fontWeight:'bold'}}>Name</Text>
          		</Col>
          		<Col size={4}  style={{justifyContent:'center',padding:5,}}>
          		<Text style={{fontWeight:'bold'}}>Number</Text>
          		</Col>
          		<Col size={4}  style={{justifyContent:'center',padding:5,}}>
          		<Text style={{fontWeight:'bold'}}>Tap to Call</Text>
          		</Col>
          	</Row>
          	<Row size={1} style={{backgroundColor:'#F9F9F9',borderBottomWidth:1,borderBottomColor:'#ccc'}}>
          		<Col size={4}  style={{justifyContent:'center',padding:5,}}>
          		<Text>Police</Text>
          		</Col>
          		<Col size={4}  style={{justifyContent:'center',padding:5,}}>
          		<Text>000</Text>
          		</Col>
          		<Col size={4}  style={{justifyContent:'center',padding:5,alignItems:'center',}}>
          		<TouchableOpacity onPress={() => this.openDialScreenCall('000')}>
          		<Feather name="phone-call" size={24} color="#474D81"  />
          		</TouchableOpacity>
          		</Col>
          	</Row>
          	<Row size={1}>
          		<Col size={4}  style={{justifyContent:'center',padding:5,}}>
          		<Text>Turvy Help</Text>
          		</Col>
          		<Col size={4}  style={{justifyContent:'center',padding:5,}}>
          		<Text>+61417691066</Text>
          		</Col>
          		<Col size={4}  style={{justifyContent:'center',padding:5,alignItems:'center',}}>
          		<TouchableOpacity onPress={() => this.openDialScreenCall('+61417691066')}>
          		<Feather name="phone-call" size={24} color="#474D81" />
          		</TouchableOpacity>
          		</Col>
          	</Row>
          	</Grid>
     </Modal> 
      <Modal
          animationType="slide"
          visible={this.state.modalstopvisible}
          style={{height:200,flex: 0}}
          onRequestClose={() => {
            alert('Modal has been closed.');
          }}>
     <AddaStop {...this.props} closeAddastop={this.closeAddastop} />
     </Modal> 
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
    },
    map: {
    flex: 1,
    height: '100%',
    },
    tinyLogo:{
        alignContent:'center',
        height:50,
        flex:1,
        flexDirection:'row'
    },
    circle:{
        alignItems:'center',justifyContent:'center',
        width: 10,
        height: 10,
        borderRadius: 10/2,
        backgroundColor:'#135AA8'
    },
    square:{
        width: 10,
        height: 10,
        backgroundColor:'#135AA8'
    },
    White: {color:'#FFFFFF'},
    labelStyle:{padding:2,color:'#FFF',fontSize:22},
    contentStyle:{paddingTop:5,paddingBottom:5,},
    btnGo:{backgroundColor:'#3f78ba',borderWidth:3,borderColor:'#FFF',borderRadius:100,fontSize:50, shadowColor: '#000',shadowOffset: { width: 40, height: 40 },shadowOpacity: 8.8,shadowRadius: 30,elevation: 50,
    },
    yellow:{color:'#fec557'},
    btnSmall:{backgroundColor:'#3f78ba',borderWidth:5,borderColor:'#FFF',fontSize:50,shadowColor: '#000',
    shadowOffset: { width: 40, height: 40 },shadowOpacity: 2.8,shadowRadius: 30,elevation: 50,},
    offIcon:{
        borderWidth:1,
        borderColor:'#ddd',
        padding:5,
        borderRadius:45,
        backgroundColor:'#FFF',
        color:'#FFF',
        elevation: 10,
    },
    offlineBtn:{      
        backgroundColor:"#ccc",
        justifyContent:'center',
        alignItems:'center',
        flexDirection:'row',    
        borderRadius:45,
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
	},vehimage:{
     width: 20,
    height:35,
	 alignSelf:'center'
	},
});