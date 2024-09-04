import React, {Component} from "react";
import { StatusBar } from 'expo-status-bar';
import {  StyleSheet, Text, View,Dimensions, Image, TouchableOpacity,TouchableHighlight, Alert,Linking, BackHandler, Animated, AppState, Pressable, DeviceEventEmitter, Switch,FlatList,KeyboardAvoidingView, SafeAreaView, TextInput as MyInput} from 'react-native';
import { Provider as PaperProvider,TextInput, Button, Appbar} from 'react-native-paper';
import { Marker, AnimatedRegion}from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';
import { Divider } from 'react-native-elements';
import { Col, Row, Grid } from "react-native-easy-grid";
import { Entypo,Feather,AntDesign,Ionicons,EvilIcons,MaterialIcons, FontAwesome5,Octicons } from '@expo/vector-icons'; 
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { 
    DOMAIN, 
    PUSHER_API, 
    changeMode, 
    MapboxCustomURL, 
    secondsToHms, 
    toFixed,
    debug,
    theme
} from './Constant';
import BottomSheet from 'reanimated-bottom-sheet';
import Modal from 'react-native-modal';
import TopBar from './TopBar';
import DriverRating from './DriverRating';
import SendMessage from './SendMessage';
import * as TaskManager from 'expo-task-manager';
import Geolocation from 'react-native-geolocation-service';
import { getPermission } from './getLocation';
import Pusher from 'pusher-js/react-native';
import * as firebase from "firebase";
import firestore from '@react-native-firebase/firestore';

import * as geofirestore from 'geofirestore';
import apiKeys from './config/keys';
import { moderateScale } from "react-native-size-matters";
import * as geolib from 'geolib';
import haversine from 'haversine';
import Moment from 'moment';
import NavigationMapbox from "./NavigationMapbox";
//import MapboxDirection from "./MapboxDirection";
import  MapboxGL, { MapView, Camera, UserLocation, PointAnnotation } from '@react-native-mapbox-gl/maps';
import { lineString as makeLineString } from '@turf/helpers';
MapboxGL.setAccessToken("pk.eyJ1IjoibWFsLXdvb2QiLCJhIjoiY2oyZ2t2em50MDAyMzJ3cnltMDFhb2NzdiJ9.X-D4Wvo5E5QxeP7K_I3O8w");
//import Image from 'react-native-image-progress';
//import * as Progress from 'react-native-progress'

let left = require('../assets/images/ic_left.png')
let right = require('../assets/images/ic_right.png')
let ahead = require('../assets/images/ic_ahead.png')
let turn = require('../assets/images/ic_u_turn.png')
let round_left = require('../assets/images/ic_round_about_left.png')
let round_right = require('../assets/images/ic_round_about_right.png')
let round_ahead = require('../assets/images/ic_round_about_ahead.png')
let round_return = require('../assets/images/ic_round_about_return.png')


import messaging from '@react-native-firebase/messaging';

const { width, height } = Dimensions.get('window');
const stylesArray = [
    {
        "featureType": "road.highway",
        "stylers": [
        { "color": "#7E96BC" }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "geometry",
        "stylers": [
            { "color": "#FEFEFE" }
        ]
    },
    {
        "featureType": "water",
        "stylers": [
            { "color": "#8ABFE5"  }
        ]
    },
    {
        "featureType": "landscape.natural",
        "stylers": [
            { "color": "#EBECEF"  }
        ]
    },
    {
        "featureType": "landscape.natural.landcover",
        "stylers": [
            { "color": "#C9E7D2"  }
        ]
    },
    {
        "featureType": "all",
        "elementType": "labels.icon",
        "stylers": [
           { "visibility": "on" }
        ]
    }
]


const darkStylesArray =[
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#263c3f" }],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#6b9a76" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#38414e" }],
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#212a37" }],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9ca5b3" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#746855" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#1f2835" }],
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{ color: "#f3d19c" }],
    },
    {
      featureType: "transit",
      elementType: "geometry",
      stylers: [{ color: "#2f3948" }],
    },
    {
      featureType: "transit.station",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#17263c" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#515c6d" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#17263c" }],
    },
  ]

if (!firebase.apps.length) {
    firebase.initializeApp(apiKeys.firebaseConfig);
}

const db = firestore();
const GeoFirestore = geofirestore.initializeApp(db);
const geocollection = GeoFirestore.collection('driver_locations');
const LOCATION_TASK_NAME = 'background-location-task';

//import  { MapView, Camera, UserLocation } from '@react-native-mapbox-gl/maps';

TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
    if (error) {
        //console.log('error',error);
        return;
    }
    if (data) {
      
        const { locations } = data;
        const [location] = locations;
        //console.log('background location',location);
        /* AsyncStorage.getItem('driverId').then((value) => {
            geocollection
            .doc(value)
            .update({
                coordinates: new firestore.GeoPoint(location.coords.latitude, location.coords.longitude),
                updated_at: firestore.FieldValue.serverTimestamp(),
                heading:location.coords.heading,
            })
        }) */

        if(AppState.currentState == 'active'){
            Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
        }

      
        /* let destination_lng, destination_lat;
        AsyncStorage.getItem('destination_lat').then((value) => {
            console.log('destination_lat ::',value);
            destination_lat = value;
            console.log('destination >>:: ',destination_lat);

            AsyncStorage.getItem('destination_lng').then((val) => {
                
            console.log('destination_lng ::',val);
                destination_lng = val;
                
            console.log('destination_lng >>::',destination_lng);
                let inRadius = geolib.isPointWithinRadius(
                    { latitude: location.coords.latitude, longitude: location.coords.longitude },
                    { latitude: destination_lat, longitude: destination_lng },
                    50
                );

                //console.log('inRadius',inRadius);
                //console.log('app state',AppState.currentState);
                AsyncStorage.getItem('callonce').then((item) => {
                    console.log('callonce',item);
                    if(item == '1'){
                        
                        if(inRadius && AppState.currentState === 'background'){

                            console.log('callonce_1',item);
                            AsyncStorage.setItem('callonce', '0');
                            //callonce = false;
                            //Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
                            console.log('You arive')
                            Linking.openURL('com.turvy.turvydriver://')
                        } 
                    }
                })
                
            })
        }) */
    }
});
/* latitudeDelta: 0.007683038072176629,
longitudeDelta: 0.004163794219493866, */
export default class BookingMap extends Component {

    
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
            latitudedest:'',
            longitudedest:'',
            curlocatdesc:'',
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
            origin:{},
            destination:{},
            pickup:'',
            destinationto:'',
            stateText:'',
            results:{},
            forsourdest:'source',
            accessTokan:'',
            avatar:`${DOMAIN}images/no-person.png`,
            name:'',
            distance:0,
            duration:0,
            bookrequest:{},
            display:true,
            departed:false,
            modalvisible:false,
            showEndTrip:false,
            tripEndDone:false,
            driverLocation:{},
            cancelReason:'',
            cancelModal:false,
            outlineColor:'#ccc',
            cancelError:'',
            cancelSuccess:'',
            riderCancel:false,
            riderRating:0,
            book_id: this.props.route.params.bookId,
            driverId: null,
            multidest:{},
            snapIndex:0,
            ready: true,
            mapCord:[],
            carAngle:0,
            driverCoordinate: new AnimatedRegion({
                latitude: -34.07465730,
                longitude: 151.01108000,
                latitudeDelta: 0.007683038072176629,
                longitudeDelta: 0.004163794219493866,
            }),
            mapLatitude:-33.8688,
            mapLongitude:151.2195,
            rotateValue: new Animated.Value(0),
            appState: AppState.currentState,
            driverDestination:{},
            pathHeading:0,
            pathCenter:{},
            permission:false,
            selectedNavigationOption:0,
            sendMessage:false,
            driverName:'',
            tripStatus:'navpickup',
            distanceTravelled: 0,
            prevLatLng: {},
            finalCost:0,
            bannerDistance:'',
            bannerIcon:'',
            bannerText:'',
            bannerIconNext:'',
            bannerTextNext:'',
            bannerDistanceNext:'',
            toneObject:{},
            isDarkMode : true,
            mapbox:false,
            mapboxSrc:{},
            mapboxDst:{},
            coordinates: [],
            navCallFor:'pickup',
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
                        lineColor:'#fff',
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
                        lineColor:'#fff',
                    },
                    paint: {
                        'fill-color': '#088',
                        'fill-opacity': 0.8,
                    },
                },
                ],
            },
            MapboxStyleURL:MapboxCustomURL,
            durationRemaining:null,
            distanceRemaining:null,
            riderWaiting:0,
            waitTimeStart:0,
            waitTimeStop:0,
            snapHeight:300,
            snapPoints:[300, 68],
            isBottomSheetOpen:true,
            modalSOSvisible:false,
            voiceNavigation:false,
			notifyRider:0,
            chatMessage:{},
            messageText:'',
            messageError:'',
            messageSuccess:'',
            isOtherNevigation:false,
        };
        this.myRefbt = React.createRef();
        this.mapView = null; 
        this._onLongPressButton = this._onLongPressButton.bind(this); 
        this.onBackPress = this.onBackPress.bind(this);
        this.bottomSheetRef = React.createRef();
        this._handleAppStateChange = this._handleAppStateChange.bind(this);
    }
   
    async intialLoad() {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            setErrorMsg('Permission to access location was denied');
            return;
        }
        await Location.requestBackgroundPermissionsAsync();
    }
    //fun call from child componant SendMessage
    handlerCallMessage = async (res) => {
        /* console.log('call from child componant')
        this.setState({
            sendMessage: false
        }) */

        if(Object.keys(this.state.chatMessage).length <= 0){
            let opt = []
            opt[0] = res
            this.setState({
                chatMessage:opt
            },()=>{
                //console.log('New message arrived!=============>',debug(this.state.chatMessage))
            })
        }else{
            
            this.setState({
                chatMessage:[...this.state.chatMessage, ...[res]]
            },()=>{
                //console.log('New message arrived!=============>',debug(this.state.chatMessage))
            })
        }
    }
    
    handleMapBoxState = async () => {
        //console.log('call from NavigationMapbox child componant', this.state.navCallFor)
        
        this.setState({
            snapIndex:0
        }, () => {
            if(this.bottomSheetRef && this.state.navCallFor == 'pickup'){
                this.bottomSheetRef.current.snapTo(this.state.snapIndex)
            }
            
        })
        this.clearWaitTimer()
        if(this.state.navCallFor == 'pickup'){
            this.setState({
                mapbox: false,
                riderWaiting: 120,
                tripStatus:'arivepickup',
                snapHeight:300,
                snapPoints:[300, 68],

            },() => {
                this.riderWaiting()
                this._notifyRemainTimeToRider(0)
            })
        }
        if(this.state.navCallFor == 'destination'){
            this.setState({
                snapIndex:0,
                tripStatus:'arivedesination',
            }, () => {
                if(this.bottomSheetRef){
                    //this.bottomSheetRef.current.snapTo(this.state.snapIndex)
                }
            })
        }
    }

    handleDuration = async (duration, distanceRemain, distTravel) => {
        let dist = toFixed((distanceRemain)/1000, 2);
        let time = secondsToHms(duration)

        this.setState({
            durationRemaining:time,
            distanceRemaining:dist+' KM',
        })

        //console.log('nav distanceTravelled==============:', this.state.distanceTravelled)

        if(distanceRemain <= 500 && this.state.tripStatus != 'arivedesination'){
            if(this.state.navCallFor == 'destination'){
                this.setState({
                    snapHeight:200,
                    snapPoints:[200,140,68],
                    snapIndex:0,
                    tripStatus:'arivedesination',
                }, () => {
                    if(this.bottomSheetRef){
                        this.bottomSheetRef.current.snapTo(this.state.snapIndex)
                    }
                })
            }
        }

        /* if(this.state.notifyRider == 0){
			if(duration <= 300){
				this._notifyRemainTimeToRider(duration)
				this.setState({
					notifyRider:1
				})
			}
		}

		if(this.state.notifyRider == 1 || this.state.notifyRider == 0){
            
			if(duration <= 60 && duration <= 120){
				this._notifyRemainTimeToRider(duration)
				this.setState({
					notifyRider:2
				})
			}
		} */

        /* if(distanceRemain <= 100 && this.state.tripStatus != 'arivepickup'){
            if(this.state.navCallFor == 'pickup'){
                this.setState({
                    mapbox: false,
                    riderWaiting: 5,
                    tripStatus:'arivepickup',
                })
            }
        } */
    }

    _notifyRemainTimeToRider = async (duration) => {
		await fetch(DOMAIN+'api/driver/notifyRiderRemainTime',{
            method: 'POST',
            headers : {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer '+this.state.accessTokan
            },
            body: JSON.stringify({                
                "rider_id" : this.state.bookrequest.rider_id,
                "duration" : duration,
            })
        }).then(function (response) {
            return response.json();
        }).then( (result)=> {
            //console.log('notifyRiderRemainTime',result)            
            
        })
	}

    riderWaiting = () => {
        this.setState({
            riderWaiting: this.state.riderWaiting - 1
        },() => {
            if(this.state.riderWaiting >= 0){
                this.waitTimer = setTimeout(()=>{
                   this.riderWaiting()
                }, 1000);
                
            }

            if(this.state.riderWaiting <= 0){
                this.setState({
                    waitTimeStart: 0,
                    waitTimeStop:1
                },() => {
                    this.clearWaitTimer()
                    this.chargeWaitTimeStart()
                })
            }
        })
        
    }

    chargeWaitTimeStart = () => {
        this.setState({
            waitTimeStart: this.state.waitTimeStart + 1
        },() => {
            if(this.state.waitTimeStop === 1){
                this.chargeWaitTimer = setTimeout(()=>{
                   this.chargeWaitTimeStart()
                }, 1000);
                
            }
            
        })
    }

    callMapboxDirection = async () => {
        //console.log('call from MapboxDirection child componant')
        this.setState({
            snapIndex: this.state.snapIndex ? 0 : 1
        },() => {
            this.bottomSheetRef.current.snapTo(this.state.snapIndex)
        })
    }


    componentDidMount = async () => {
        // console.log("componentDidMount DATE TIME :::: " + new Date())

        this.riderMessages()

        this.setState({
            MapboxStyleURL:changeMode()
        })
        this.intervalModeChange = setInterval(async () => {
            this.setState({
                MapboxStyleURL:changeMode()
            })
            await AsyncStorage.getItem('voiceNav').then((value) => {
                if(value != '' && value !== null){
                    
                    if(value == 'true'){
                        this.setState({
                            voiceNavigation: false
                        })
                    }
                    if(value == 'false'){
                        this.setState({
                            voiceNavigation: true
                        })
                    }
                }
            })
        }, 1000);

        //console.log('timer', this.offtime)
        this.intialLoad();

        var pusher1 = new Pusher(PUSHER_API.APP_KEY, {
            cluster: PUSHER_API.APP_CLUSTER
        });
        
        var channel1 = pusher1.subscribe('turvy-channel');
        channel1.bind('rider_cancel_booking_event', this.isRideCancelByRider);

        this.props.navigation.addListener('gestureEnd', this.onBackPress);
        BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
        AppState.addEventListener('change', this._handleAppStateChange);
        AsyncStorage.setItem('running_book_id', JSON.stringify(this.state.book_id));
        
        
        AsyncStorage.setItem('callonce', '1');

 
        DeviceEventEmitter.addListener('timer', this.clearTimer.bind(this));
        DeviceEventEmitter.addListener('timer', this.clearModeTimer.bind(this));
        DeviceEventEmitter.addListener('timer', this.clearWaitTimer.bind(this));
        

        await AsyncStorage.getItem('driverId').then((value) => {           
            if(value != '' && value !== null){
                this.setState({
                    driverId:value
                })
            }
        })

        await AsyncStorage.getItem('NavigationOption').then(val => {
            let value = JSON.parse(val)
            this.setState({selectedNavigationOption:value})
        })

        await AsyncStorage.getItem('name').then((value) => {
            if(value != '' && value !== null){
                this.setState({driverName: value})
            }
        })

        

        AsyncStorage.getItem('accesstoken').then((value) => {
            if(value != '' && value !== null){
                //console.log('book_id',this.state.book_id)
                this.setState({
                    accessTokan:value
                },() => {
                    fetch(DOMAIN+'api/driver/running-book/'+this.state.book_id,{
                        method: 'GET',
                        headers : {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'Authorization': 'Bearer '+this.state.accessTokan
                        }            
                    }).then(function (response) {
                        return response.json();
                    }).then( (result)=> {
                        if(result.status === 1){
                            //console.log('trip data===============: ', debug(result.data))
                            let bookData = result.data;
                            let origin = {};
                            let destination = {};
                            destination = {
                                latitude: bookData.destination_lat, 
                                longitude: bookData.destination_lng,
                            }
                            AsyncStorage.setItem('destination_lat', JSON.stringify(bookData.destination_lat));
                            AsyncStorage.setItem('destination_lng', JSON.stringify(bookData.destination_lng));
                            
                            origin = {
                                latitude: bookData.origin_lat, 
                                longitude: bookData.origin_lng
                            }
                            this.setState({ 
                                bookrequest:bookData,
                                destination:destination,
                                origin:origin,
                                name:name,
                                latitudecur:bookData.origin_lat, 
                                longitudecur:bookData.origin_lng,
                                latitudedest:bookData.destination_lat,
                                longitudedest:bookData.destination_lng,
                                destlocatdesc:bookData.destination,
                                sourcedesc:bookData.origin,
                                driverDestination:origin,
                                mapboxDst:origin,
                                
                            },()=>{
                                const center = {
                                  latitude: (origin.latitude + destination.latitude) / 2,
                                  longitude: (origin.longitude + destination.longitude) / 2,
                                };
                                const destheading = this.getHeading(this.state.origin, this.state.destination)
                                this.setState({
                                    pathHeading:destheading,
                                    pathCenter:center
                                })
                                //console.log('book data',this.state.bookrequest)
                                
                            });
                            if(bookData.avatar){
                                this.setState({avatar: DOMAIN+bookData.avatar})
                            }
                            if(bookData.multdest){
                                this.setState({multidest: bookData.multdest})
                            }
                            let riderId = bookData.rider_id
                            fetch(DOMAIN+'api/driver/riderRating/'+riderId,{
                                method: 'GET',
                                headers : {
                                    'Content-Type': 'application/json',
                                    'Accept': 'application/json',
                                    'Authorization': 'Bearer '+this.state.accessTokan
                                }
                            }).then(function (response) {
                                return response.json();
                            }).then( (result)=> {
                                this.setState({riderRating:result.data})
                            })

                            //auto redirect to pickup navigation map
                            setTimeout(()=>{
                                this._navToPickUp()
                            }, 5000);
                        }
                    })
                });
            }
        })
        const name = await AsyncStorage.getItem('name');

        if(this.state.book_id){
            try{
                db.collection('trip_path')
                .doc(JSON.stringify(this.state.book_id))
                .get()
                .then((docRef) => {
                    //console.log('booking status',docRef.data())
                    if(docRef.data().status == 'open'){
                        this.setState({
                            tripStatus:'navdesination',
                            showEndTrip:true,
                            departed:true,
                            mapboxDst:this.state.destination,
                        })        
                    }else if(docRef.data().status == 'navigate_to_destination'){
                        this.setState({
                            tripStatus:'arivedesination',
                            showEndTrip:true,
                            departed:true,
                        },() => {
                            this._navToDestination()
                        })  
                    }else if(docRef.data().status == 'arrive_to_destination'){
                        this.setState({
                            tripStatus:'completeTrip',
                            showEndTrip:false,
                            departed:false,
                        }) 
                    }
                    /* this.setState({
                        distanceTravelled : docRef.data().distance
                    }) */
                })
            }catch (error) {
                //console.log('firebase trip_path',error);
            }
        }
        

        if(this.state.showEndTrip){
            this.setState({
                driverDestination:this.state.destination,
            })
        }

        getPermission().then(val => {
            if(val){
                Geolocation.getCurrentPosition(
                    (currntPos) => {
                        this.setState({
                            driverCoordinate: new AnimatedRegion({
                                latitude: currntPos.coords.latitude,
                                longitude: currntPos.coords.longitude,
                                latitudeDelta: this.state.latitudeDelta,
                                longitudeDelta: this.state.longitudeDelta,
                            }),
                        })
                        let driverLocation ={};
                        driverLocation ={
                            latitude : currntPos.coords.latitude,
                            longitude :currntPos.coords.longitude
                        }
                        this.setState({
                            driverLocation:driverLocation,
                            mapLatitude:currntPos.coords.latitude,
                            mapLongitude:currntPos.coords.longitude,
                            coordinates: [currntPos.coords.longitude, currntPos.coords.latitude],
                        })
                    },
                    (error) => {
                        //console.log(error.code, error.message);
                    },
                    { forceRequestLocation: true, distanceFilter:0, enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
                )
            }
        })
        Geolocation.watchPosition((curCoords) => {
                //console.log('curCoords',curCoords);
                this.updateDriverCoordinates(curCoords)
                this.setState({
                    coordinates: [curCoords.coords.longitude, curCoords.coords.latitude],
                    heading:curCoords.coords.heading
                },() => {
                    if(this.camera){
                        this.camera.setCamera({
                            centerCoordinate: this.state.coordinates,
                            animationDuration: 6000,
                            heading:this.state.heading,
                            pitch:50,
                            zoomLevel:16
                        })
                    }
                })

            },
            (error) => {
                //console.log(error.code, error.message);
            },
            { accuracy:Platform.OS == 'android'?'high':'best', distanceFilter:2, interval:2000, fastestInterval:1000, enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );


        let region = {
            identifier:1, 
            latitude:this.state.origin.latitude, 
            longitude:this.state.origin.longitude, 
            radius:100
        }

        
        
    }

    componentWillUnmount = () => {
        //console.log("Componenet Will Un Mount >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>. ")
        
        this.intervalModeChange !== undefined ? clearTimeout(this.intervalModeChange) : null;
        this.clearTimer()
        //NativeEventEmitter.addListener('timer', this.clearTimer.bind(this));
        this.clearWaitTimer()
    }


    riderMessages = () => {
        messaging().onMessage(async remoteMessage => {
            //Alert.alert('New message arrived!', remoteMessage.data.body);
            /* this.setState({
                chatMessage:remoteMessage.data,
                sendMessage:true
            }) */
             
            //console.log('New message length=============>',remoteMessage)
            
            if(Object.keys(this.state.chatMessage).length <= 0){
                let opt = []
                opt[0] = remoteMessage.data
                this.setState({
                    chatMessage:opt,
                    sendMessage:true
                },()=>{
                    //console.log('New message arrived!=============>',debug(this.state.chatMessage))
                })
            }else{
                
                this.setState({
                    chatMessage:[...this.state.chatMessage, ...[remoteMessage.data]],
                    sendMessage:true
                },()=>{
                    //console.log('New message arrived!=============>',debug(this.state.chatMessage))
                })
            }
            //console.log('New message arrived!=============>',debug(remoteMessage.data))
        })
    }

    _handleAppStateChange = async (nextAppState) => {
        //console.log('appState',this.state.appState,nextAppState)

        if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
            //console.log('App has come to the foreground!');
            // 3 when you're done, stop it
            Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME).then((value) => {
                //console.log('task_value',value)
                if (value) {
                    Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
                }
            }); 
        }else{
            //console.log('App has come to the background!');
            await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
                accuracy: Location.Accuracy.BestForNavigation,
                timeInterval: 5000,
                deferredUpdatesInterval:10000,
                showsBackgroundLocationIndicator: true,
                activityType: Location.ActivityType.AutomotiveNavigation,
                foregroundService: {
                    notificationTitle: "Location",
                    notificationBody: "Location tracking in background",
                    notificationColor: "#fff",
                },
            });
        }
        this.setState({appState: nextAppState});
    }

    //dist calculate in KM
    calcDistance(newLatLng) {
        const { prevLatLng } = this.state
        return (haversine(prevLatLng, newLatLng) || 0)
    }

    updateDriverCoordinates = async (pos) => {
        

        const newCoordinate = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            latitudeDelta: this.state.latitudeDelta,
            longitudeDelta: this.state.longitudeDelta,
        };

        //console.log('driver newCoordinate',newCoordinate)

        this.state.driverCoordinate.timing({ 
            ...newCoordinate, 
            useNativeDriver: true,
            duration: 2000 
        }).start();

        this.setState({
            carAngle:pos.coords.heading,
            mapLatitude:pos.coords.latitude,
            mapLongitude:pos.coords.longitude,
        },()=>{
            let rotateAngl = 0;
            rotateAngl = (this.state.carAngle/360);
            if(rotateAngl > 0.5){
                rotateAngl = rotateAngl - 1
            }
            Animated.timing(this.state.rotateValue, {
                toValue: rotateAngl,
                duration: 1000,
                useNativeDriver: true,
            }).start();
        });

        /* if(this.mapView) {
            this.mapView.animateCamera({
                center:{
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                },
                heading: pos.coords.heading
            });
        } */

        /* geocollection
        .doc(this.state.driverId)
        .update({
            coordinates: new firestore.GeoPoint(pos.coords.latitude, pos.coords.longitude),
            updated_at: firestore.FieldValue.serverTimestamp(),
            heading:pos.coords.heading,
        }) */

        let driverLocation ={};
        driverLocation ={
            latitude:pos.coords.latitude,
            longitude:pos.coords.longitude,
        };

        this.setState({
            driverLocation:driverLocation,
        });

        if(this.state.departed == true){

            const { distanceTravelled } = this.state;
            const newLatLngs = {latitude: pos.coords.latitude, longitude: pos.coords.longitude }
            this.setState({
                distanceTravelled: parseFloat(distanceTravelled) + this.calcDistance(newLatLngs),
                prevLatLng: newLatLngs
            },() => {
                //console.log('distanceTravelled=========',distanceTravelled.toFixed(2))
                db.collection("trip_path")
                .doc(JSON.stringify(this.state.bookrequest.id))
                .update({
                    location: firestore.FieldValue.arrayUnion(new firestore.GeoPoint(pos.coords.latitude, pos.coords.longitude)),
                    distance: distanceTravelled,
                })
                .then(() => {
                    //console.log('Loc updated DEparted!');
                });
            })

        }

        this.getLnglatdriver2source()
        //this.onDidFinishLoadingMap()

    }

    onBackPress () {
        return true;
    }

    isRideCancelByRider = async (data) => {
        //console.log("BOOKING CANCEL ",data);
        let bookId = this.state.bookrequest.id;
        if(data.book_id === bookId){
            this.setState({riderCancel:true})
            AsyncStorage.removeItem('running_book_id');
            this.alertTone();
            db.collection("driver_locations")
            .doc(this.state.driverId)
            .update({
                isBusy: 'no'
            })
        }
    }

    alertTone = async () => {
        const { sound: playbackObject} =  await Audio.Sound.createAsync(
            require('../assets/cancel_notice.mp3'),
            {}
        );

        this.setState({
            toneObject:playbackObject,            
        })

        await playbackObject.playAsync();
        playbackObject.setIsLoopingAsync(true);
        setTimeout(()=>{
            playbackObject.stopAsync(false);
            this.props.navigation.replace('MapViewFirst')
        }, 5000);
    }

    openDialScreen (){
        //console.log('bookrequest',this.state.bookrequest)
        fetch(DOMAIN+'api/driver/make-call-driver',{
            method: 'POST',
            headers : {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer '+this.state.accessTokan
            },
            body: JSON.stringify({                
                "rider_id" : this.state.bookrequest.rider_id,
                "rider_name" : this.state.bookrequest.rider_id,
                "rider_phone" : this.state.bookrequest.rider_mobile,
                "booking_id" : this.state.bookrequest.id,
            })
        }).then(function (response) {
            return response.json();
        }).then( (result)=> {
            //console.log('make call:',result)
            let number = '';
            if (Platform.OS === 'ios') {
                number = 'telprompt:${'+result.senderphn+'}';
            } else {
                number = 'tel:${'+result.senderphn+'}';
            }
            Linking.openURL(number);
        })
        
    }

    _startNevigation = async (destCords, callFor) => {
        //clearTimeout(this.intervalCancel);
        //console.log(" _startNevigation START NAVIGATION >>>>>>>>>> " + this.state.selectedNavigationOptio)
        let dest = `${destCords.latitude},${destCords.longitude}`;
        if(Object.keys(this.state.multidest).length > 0 && callFor == 'destination'){
            dest = this.state.multidest.map(value => `${value.latitude},${value.longitude}`)
            .join('+to:')
            dest = `${dest}+to:${destCords.latitude},${destCords.longitude}`
        }

        //console.log('NavigationOption=================',this.state.selectedNavigationOption)
        /* this.state.driverLocation
        this.state.origin
        this.state.destination */

        


        //if(this.state.selectedNavigationOption == 0){
            if(callFor == 'pickup'){
                //this.props.navigation.navigate('NavigationMapbox',{origin:this.state.driverLocation, dest:this.state.origin,bookId:this.state.book_id})
                
                this.setState({
                    mapboxSrc:this.state.driverLocation,
                    mapboxDst:this.state.origin,
                    navCallFor:'pickup',
                    snapHeight:150,
                    snapPoints:[150, 68],

                },() =>{
                    this.setState({
                        mapbox:true
                    })
                })
            }else{
                /* this.props.navigation.navigate('NavigationMapbox',{origin:this.state.origin, dest:this.state.destination,bookId:this.state.book_id}) */
                this.setState({
                    mapboxSrc:this.state.driverLocation,
                    mapboxDst:this.state.destination,
                    navCallFor:'destination',
                    snapHeight:140,
                    snapPoints:[140, 68],
                },() =>{
                    this.setState({
                        mapbox:true
                    })
                })
            }
        //}
        
        if(this.state.selectedNavigationOption != 0){
            this.setState({
                voiceNavigation:true,
                isOtherNevigation:true
            })
        }
        if(this.state.selectedNavigationOption == 1){
            
            let mapurl = `https://maps.google.com/?daddr=${dest}&dirflg=d&nav=1`;
            Linking.canOpenURL(mapurl)
            .then(res => {
                Linking.openURL(mapurl).then(result => {
                    //console.log('Nav result: ',result)
                    //this.handleThirdPartyMapState()
                }).catch(err => { 
                    //console.log('Cannot link app!!!'); 
                    Alert.alert("Google map open error", "Please check google map navigation app is install on your device", [
                        {
                          text: "Ok",
                          onPress: () => null,
                          style: "cancel"
                        },
                        
                    ]);
                })
            }).catch(err => {
                //console.log(err)
                Alert.alert("Google map open error", "Please check google map navigation app is install on your device", [
                    {
                      text: "Ok",
                      onPress: () => null,
                      style: "cancel"
                    },
                    
                ]);
            })
        }
        else if(this.state.selectedNavigationOption == 2){
            //console.log('destCords==========', destCords)
            let wazeUrl = `waze://?ll=${destCords.latitude},${destCords.longitude}&navigate=yes&zoom=17`
            Linking.canOpenURL(wazeUrl).then(res=>{
                //console.log('result=============',res);
                //if(res){
                    Linking.openURL(wazeUrl).then(result => {
                        //console.log('result',result);
                        //this.handleThirdPartyMapState()
                    })
                    .catch(err => { 
                        console.log('waze link error openURL',err)
                        Alert.alert("Waze open error", "Please check waze navigation app is install on your device", [
                            {
                              text: "Ok",
                              onPress: () => null,
                              style: "cancel"
                            },
                            
                        ]);
                    })
                //}
            })
            .catch(err => {
                console.log('waze link error canOpenURL',err)
                Alert.alert("Waze open error", "Please check waze navigation app is install on your device", [
                    {
                      text: "Ok",
                      onPress: () => null,
                      style: "cancel"
                    },
                    
                ]);
            })
        }
    }

    handleThirdPartyMapState = async () => {
        //console.log('call from NavigationMapbox child componant', this.state.navCallFor)
        
        this.setState({
            snapIndex:0
        }, () => {
            if(this.bottomSheetRef && this.state.navCallFor == 'pickup'){
                this.bottomSheetRef.current.snapTo(this.state.snapIndex)
            }
            
        })
        this.clearWaitTimer()
        if(this.state.navCallFor == 'pickup'){
            this.setState({
                tripStatus:'arivepickup',
                snapHeight:300,
                snapPoints:[300, 68],

            },() => {
                //this.riderWaiting()
                //this._notifyRemainTimeToRider(0)
            })
        }
        if(this.state.navCallFor == 'destination'){
            this.setState({
                snapIndex:0,
                tripStatus:'arivedesination',
            })
        }
    }

    _onPressDepart(){
        //clearTimeout(this.intervalCancel);
        Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME).then((value) => {
            //console.log('task_value depart',value)
            if (value) {
                Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
            }
        });
        if(this.state.bookrequest.id > 0){

            
            //console.log('driverId=====================>',this.state.driverId)

            fetch(DOMAIN+'api/driver/tap-depart/'+this.state.bookrequest.id,{
                method: 'GET',
                headers : {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': 'Bearer '+this.state.accessTokan
                }
            }).then(function (response) {
                return response.json();
            }).then( (result)=> {
                //console.log('tap to depart=====================>',result)
            })

            db.collection("driver_locations")
            .doc(this.state.driverId)
            .update({
                isBusy: 'yes',
                updated_at: firestore.FieldValue.serverTimestamp(),
            }).then(() => {
                //console.log('update status busy=====================>')
            });

            db.collection("trip_path")
            .doc(JSON.stringify(this.state.bookrequest.id))
            .set({
                bookingId:this.state.bookrequest.id,
                driverId:this.state.bookrequest.driver_id,
                riderId:this.state.bookrequest.rider_id,
                status:'open',
                location: firestore.FieldValue.arrayUnion(new firestore.GeoPoint(this.state.origin.latitude, this.state.origin.longitude)),
                created_at: firestore.FieldValue.serverTimestamp(),
                updated_at: firestore.FieldValue.serverTimestamp(),
                distance:0,
            })
            
            
            this.setState({
                display:true,
                departed:true,
                origin:this.state.origin,
                showEndTrip:true,
                driverDestination:this.state.destination,
                mapboxDst:this.state.destination
            },() => {
                this.getLnglatdriver2source()
            })
            
            
        }
    }

    async _completeTrip(){

        this.setState({
            tripEndDone:true,
            display:false,
            bannerDistance:'',
            bannerDistanceNext:'',
            mapbox: false
        })

        db.collection("driver_locations")
        .doc(this.state.driverId)
        .update({
            isBusy: 'no'
        })

        //console.log('cmp driverid===========>', this.state.driverId)
        
        this.clearTimer()
        AsyncStorage.removeItem('running_book_id');
        let bookId = this.state.bookrequest.id;
        //console.log('traval distance',this.state.distanceTravelled)
        fetch(DOMAIN+'api/driver/book/'+bookId+'/end',{
            method: 'POST',
            headers : {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer '+this.state.accessTokan
            },
            body: JSON.stringify({
                "trip_distance" : this.state.distanceTravelled,
                "trip_duration" : this.state.duration,
                "rider_id" : this.state.bookrequest.rider_id,
                "endStatus" : 'normal',
                "waitingTime":this.state.waitTimeStart
            })
        }).then(function (response) {
            return response.json();
        }).then( (result)=> {
            console.log('trip end data:',debug(result))
            this.setState({
                finalCost:result.data.totalAmount,
                distanceTravelled:result.data.tripDistance
            })
            
        })
        .catch((error) => { 
            console.error('trip end db:',error)
        });

        db.collection("trip_path")
        .doc(JSON.stringify(this.state.bookrequest.id))
        .update({
            location: firestore.FieldValue.arrayUnion(new firestore.GeoPoint(this.state.mapLatitude, this.state.mapLongitude)),
            updated_at: firestore.FieldValue.serverTimestamp(),
            status:'close',
            distance: this.state.distanceTravelled,
            trip_time: this.state.duration+' min',
        })
        .then(() => {
            //console.log('firebase trip_path update')
            this.setState({
                departed:false,
                display:false,
            })
        })
        .catch((error) => { 
            //console.error('trip_path error:',error)
        });

        db.collection("driver_locations")
        .doc(this.state.driverId)
        .update({
            isBusy: 'no',
            updated_at: firestore.FieldValue.serverTimestamp(),
            coordinates: new firestore.GeoPoint(this.state.mapLatitude, this.state.mapLongitude),
        })
        .then(() => {
            //console.log('firebase driver_locations update')
        })
        .catch((error) => { 
            console.error('driver_locations error:',error)
        })
    }

    

    _onLongPressButton() {
        this.setState({
            modalvisible:true,
        })
    }
 
    _onPressDone(){
        this.setState({
            modalvisible:false
        });
    }

    _sendMessage(){
        this.setState({
            sendMessage:true
        });
    }
    
    async _submitCancelTrip(){
        let bookId = this.state.bookrequest.id;
        let reasonTxt = this.state.cancelReason.trim();
        if(reasonTxt == '') {
            this.setState({
                cancelError:'Please input your cancel reason.'
            })
            return false;
        }

        db.collection("driver_locations")
        .doc(this.state.driverId)
        .update({
            isBusy: 'no'
        })

        fetch(DOMAIN+'api/driver/book/'+bookId+'/cancel',{
            method: 'POST',
            headers : {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer '+this.state.accessTokan
            },
            body: JSON.stringify({
                "reason" : this.state.cancelReason,
                "rider_id" : this.state.bookrequest.rider_id
            })
        }).then(function (response) {
            return response.json();
        }).then( (result)=> {
            //console.log('cancel result',result)
            AsyncStorage.removeItem('running_book_id');
            if(result.status === 1){
                this.setState({
                    cancelSuccess:result.message
                },()=>{
                    setTimeout(()=>{
                        this.props.navigation.replace('MapViewFirst')
                    }, 3000);
                })
            }else{
                this.setState({cancelError:result.message})
            }
        })
    }

    createTable = () => {
        let children = []
        for (let j = 1; j <= 5; j++) {
            if(j <= this.state.riderRating){
                children.push(<Ionicons name="md-star" size={20} color="#fec557" />)
            }else{
                children.push(<Ionicons name="md-star" size={20} color="#ccc" />)
            }
        }
        return children
    }

    onMapReady = (e) => {
        if(!this.state.ready) {
          this.setState({ready: true});
        }
    };

    onRegionChange = (region) => {
        //console.log('onRegionChange', region);
    };

    onRegionChangeComplete = (region) => {
        this.setState({
            latitudeDelta: region.latitudeDelta,
            longitudeDelta: region.longitudeDelta,
        })
    };

    cancelTripAlert = () => {
        Alert.alert("Hold on!", "Are you sure to cancel? A $15 cancellation fee apply.", [
            {
              text: "No",
              onPress: () => null,
              style: "cancel"
            },
            { text: "YES", onPress: () => {
                this.setState({
                    cancelModal:true
                },()=> {
                    this.setState({cancelError:'',cancelSuccess:''})
                })
            } }
        ]);
    }

    toRadians = (degrees) => {
      return (degrees * Math.PI) / 180;
    }

    toDegrees = (radians) => {
      return (radians * 180) / Math.PI;
    }

    getHeading = (origin, destination) => {
        const originLat = this.toRadians(origin.latitude);
        const originLng = this.toRadians(origin.longitude);
        const destLat = this.toRadians(destination.latitude);
        const destLng = this.toRadians(destination.longitude);
        const y = Math.sin(destLng - originLng) * Math.cos(destLat);
        const x = Math.cos(originLat) * Math.sin(destLat) - Math.sin(originLat) * Math.cos(destLat) * Math.cos(destLng - originLng);
        const heading = this.toDegrees(Math.atan2(y, x));
        return (heading + 360) % 360;
    }

    _navToPickUp = () => {
        
        this.setState({
            tripStatus:'tripRunning',
            snapIndex:1
        }, () => {
            this.bottomSheetRef.current.snapTo(this.state.snapIndex)

            db.collection("driver_locations")
            .doc(this.state.driverId)
            .update({
                isBusy: 'yes'
            })
        })
       
        /* this.mapView.animateCamera({
            center:{latitude:this.state.driverLocation.latitude, longitude:this.state.driverLocation.longitude},
            zoom:17,
            pitch:40
        }); */
        this._startNevigation(this.state.origin, 'pickup');

        //this._navigationBannar(this.state.origin)
        //let orgLat = this.state.driverLocation.latitude;
        //let orgLong = this.state.driverLocation.longitude;
    }

    _arivePickUp = () => {
        this.clearTimer()
        this.clearWaitTimer()
        this.setState({
            tripStatus:'tripRunning',
            showEndTrip:true,
            bannerDistance:'',
            bannerDistanceNext:'',
            mapboxDst:this.state.destination,
            waitTimeStop:2,
            snapIndex:1
        }, () => {
            this.bottomSheetRef.current.snapTo(this.state.snapIndex)
        })
        //console.log('_arivePickUp',this.state.origin)
        this._onPressDepart()
        this._navToDestination()
    }

    _navToDestination = () => {
        this.setState({
            tripStatus:'tripRunning'
        },() => {
            db.collection("trip_path")
            .doc(JSON.stringify(this.state.bookrequest.id))
            .update({ 
                status: 'navigate_to_destination',
            })
        })
        //console.log('destination loc',this.state.destination)
        this._startNevigation(this.state.destination, 'destination');
        //this._navigationBannar(this.state.destination)
    }

    _ariveToDestination = () => {
        this.clearTimer()
        this.setState({
            tripStatus:'completeTrip',
            showEndTrip:false,
            bannerDistance:'',
            bannerDistanceNext:''
        },() => {
            db.collection("trip_path")
            .doc(JSON.stringify(this.state.bookrequest.id))
            .update({ 
                status: 'arrive_to_destination',
            })
        })
    }

    alertViolentEndTrip = () => {
        Alert.alert("End Trip", "Are you sure?", [            
            { text: "YES", onPress: () => {this.ViolentEndTrip()}},
            {
                text: "No",
                onPress: () => null,
                style: "cancel"
            },
        ]);
    }

    clearTimer = () => {
        // Handle an undefined timer rather than null
        this.intervalBanner !== undefined ? clearTimeout(this.intervalBanner) : null;
        this.offtime !== undefined ? clearTimeout(this.offtime) : null;
        // this.intervalModeChange !== undefined ? clearTimeout(this.intervalModeChange) : null;
    }

    clearModeTimer = () => {
        // Handle an undefined timer rather than null
        this.intervalModeChange !== undefined ? clearTimeout(this.intervalModeChange) : null;
        //this.offtime !== undefined ? clearTimeout(this.offtime) : null;
    }

    clearWaitTimer = () => {
        // Handle an undefined timer rather than null
        this.chargeWaitTimer !== undefined ? clearTimeout(this.chargeWaitTimer) : null;
        this.waitTimer !== undefined ? clearTimeout(this.waitTimer) : null;
    }

    

    ViolentEndTrip = () => {

        this.setState({
            display:false,
            tripEndDone:true,
            bannerDistance:'',
            mapbox: false
        })
        
        this.clearTimer()

        /* db.collection("driver_locations")
        .doc(this.state.driverId)
        .update({
            isBusy: 'no'
        }) */

        AsyncStorage.removeItem('running_book_id');
        let bookId = this.state.bookrequest.id;
        
        fetch(DOMAIN+'api/driver/book/'+bookId+'/end',{
            method: 'POST',
            headers : {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer '+this.state.accessTokan
            },
            body: JSON.stringify({
                "trip_distance" : this.state.distanceTravelled,
                "trip_duration" : this.state.duration,
                "rider_id" : this.state.bookrequest.rider_id,
                "endStatus" : 'violent',
                "waitingTime":this.state.waitTimeStart
            })
        }).then(function (response) {
            return response.json();
        }).then( (result)=> {
            console.log('trip end db=====================:',debug(result))
            this.setState({
                finalCost:result.data.totalAmount,
                distanceTravelled:result.data.tripDistance
            })
        })
        .catch((error) => { 
            console.error('trip end db===========:',error)
        });

        db.collection("trip_path")
        .doc(JSON.stringify(this.state.bookrequest.id))
        .update({
            location: firestore.FieldValue.arrayUnion(new firestore.GeoPoint(this.state.mapLatitude, this.state.mapLongitude)),
            updated_at: firestore.FieldValue.serverTimestamp(),
            status:'close',
            distance: this.state.distanceTravelled,
            trip_time: this.state.duration+' min',
        })
        .then(() => {
            //console.log('firebase trip_path update')
            this.setState({
                departed:false,
                display:false,
            })
        })
        .catch((error) => { 
            //console.error('trip_path error:',error)
        });

        db.collection("driver_locations")
        .doc(this.state.driverId)
        .update({
            isBusy: 'no',
            updated_at: firestore.FieldValue.serverTimestamp(),
            coordinates: new firestore.GeoPoint(this.state.mapLatitude, this.state.mapLongitude),
        })
        .then(() => {
            //console.log('firebase driver_locations update')
        })
        .catch((error) => { 
            //console.error('driver_locations error:',error)
        })
    }

    _pressRiderCancleModel = () => {
        this.setState({
            riderCancel:false,            
        },() => {
            this.state.toneObject.stopAsync();
            this.props.navigation.replace('MapViewFirst')
        })
        //this.runsound();
         
    }

    toggleSwitch = () => {
        this.clearModeTimer()
        this.setState({
            isDarkMode: !this.state.isDarkMode 
        })
    }

    openSOSModalScreen (){
        this.setState({
            modalSOSvisible:true
        });
    }

    openSOSDialScreenCall (no){
        let number;
        if (Platform.OS === 'ios') {
        number = 'telprompt:${'+no+'}';
        } else {
        number = 'tel:${'+no+'}';
        }
        Linking.openURL(number);
        this.setState({
            modalSOSvisible:false
        });
        
    }

    renderContent = () => (
        <>
            
            <View
                style={{
                    backgroundColor: 'white',
                    paddingHorizontal:10,
                    paddingVertical:5,
                    height: this.state.snapHeight,
                    elevation: 8
                }}
            >
                
                <Grid>
                    <Row style={{height:moderateScale(60),marginBottom:moderateScale(8),alignItems:'center'}}>
                        <Col size={2}>
                            {
                                this.state.mapbox && this.state.navCallFor == 'pickup' &&
                                <TouchableOpacity
                                    onPress={() => this.handleMapBoxState()} >
                                    <AntDesign name="arrowleft" size={24} color="#000" />
                                </TouchableOpacity>
                            }
                        </Col>
                        {
                            this.state.riderWaiting > 0 && !this.state.mapbox
                            ?
                            <Col size={9}>
                                <View style={{justifyContent:'center',alignItems:'center'}}>
                                    <View>
                                        <Text style={styles.pickText}>Waiting for rider</Text>
                                    </View>
                                    <View><Text style={styles.pickText}>{secondsToHms(this.state.riderWaiting)}</Text></View>
                                </View>
                            </Col>
                            :
                            this.state.waitTimeStop === 1 && !this.state.mapbox
                            ?
                            <Col size={9}>
                                <View style={{justifyContent:'center',alignItems:'center'}}>
                                    <View>
                                        <Text style={styles.pickText}>Charge waiting time</Text>
                                    </View>
                                    <View><Text style={[styles.pickText,{color:'#62CD32'}]}>{secondsToHms(this.state.waitTimeStart)}</Text></View>
                                </View>
                            </Col>
                            :
                        <Col size={9}>
                            {
                            this.state.distanceRemaining &&
                            <View style={{flexDirection:'row', justifyContent:'center',alignItems:'center'}}>
                                <Text style={styles.pickText}>{this.state.durationRemaining}</Text>
                                {
                                    this.state.navCallFor != "destination" 
                                    ?
                                    <FontAwesome5 
                                    name="user-alt" 
                                    size={13} 
                                    color="#62CD32"/>
                                    :
                                    <FontAwesome5 
                                    name="user-alt" 
                                    size={13} 
                                    color="#E8202A"/>
                                    
                                }
                                <Text style={styles.pickText}>{this.state.distanceRemaining}</Text>
                            </View>
                            }
                            {
                            this.state.navCallFor == 'pickup'
                            ?
                            <View style={{flexDirection:'row', justifyContent:'center',alignItems:'center'}}>
                                <Text style={styles.pickText}>Picking up {this.state.bookrequest.rider_name}</Text>
                            </View>
                            :
                            this.state.navCallFor == 'destination'
                            ?
                            <View style={{flexDirection:'row', justifyContent:'center',alignItems:'center'}}>
                                <Text style={styles.pickText}>Dropping off {this.state.bookrequest.rider_name}</Text>
                            </View>
                            :
                            <View style={{flexDirection:'row', justifyContent:'center',alignItems:'center'}}>
                                <Text style={styles.pickText}>Picking up {this.state.bookrequest.rider_name}</Text>
                            </View>
                            }
                        </Col>
                        }
                        <Col size={2} style={{alignItems:'center'}}>
                            
                        </Col>
                    </Row>

                    {
                        this.state.mapbox &&
                        <>
                            <Row style={{height:70, alignItems:'center',justifyContent:'center'}}>
                        
                                <Col style={{width:this.state.navCallFor == 'pickup' ? '80%':'50%'}}>

                                    <Row style={{justifyContent:'center',alignItems:'center',marginVertical:5,}}>
                                        <Col size={3} style={{margin:moderateScale(8),height:moderateScale(52),alignItems:'center',justifyContent:'center'}}>
                                            <View style={{flex:1,backgroundColor:'#62CD32',alignItems:'center',justifyContent:'center',borderRadius:moderateScale(5),width:65,}} >
                                                {
                                                this.state.navCallFor == 'pickup'
                                                ?
                                                    <TouchableOpacity onPress={() => this.openDialScreen()}>
                                                        <Feather name="phone-call" size={moderateScale(16)} color="white" />
                                                        <Text style={{color:'#fff',fontSize:12}}>Call</Text>
                                                    </TouchableOpacity>
                                                :
                                                    <TouchableOpacity onPress={() => this.openSOSModalScreen()}>
                                                        <Feather name="phone-call" size={moderateScale(16)} color="white" />
                                                        <Text style={{color:'#fff',fontSize:12}}>SOS</Text>
                                                    </TouchableOpacity>
                                                }
                                            </View>
                                        </Col>
                                        {
                                            this.state.navCallFor == 'pickup' &&
                                        
                                            <Col size={3} style={{margin:moderateScale(8),height:55,alignItems:'center',justifyContent:'center'}}>
                                                <View style={{flex:1,backgroundColor:'#135AA8',alignItems:'center',justifyContent:'center',borderRadius:moderateScale(5),width:65}}>
                                                    <TouchableOpacity onPress={() => this._sendMessage()} style={{alignItems:'center',justifyContent:'center'}}>
                                                        <AntDesign name="message1" size={moderateScale(18)} color="white" />
                                                        <Text style={{color:'#fff',fontSize:12}}>Message</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </Col>
                                        }
                                        {
                                        this.state.tripStatus !== 'completeTrip'
                                        ?
                                        <Col size={3} style={{margin:moderateScale(8),height:55,alignItems:'center',justifyContent:'center'}}>
                                            <View style={{flex:1,backgroundColor:'#E8202A',alignItems:'center',justifyContent:'center',borderRadius:moderateScale(5),width:65}}>
                                                {
                                                this.state.navCallFor == 'pickup' 
                                                ?
                                                <TouchableOpacity onPress={() => this.cancelTripAlert()} style={{alignItems:'center',justifyContent:'center'}}>
                                                    <AntDesign name="closecircleo" size={moderateScale(18)} color="white" />
                                                    <Text style={{color:'#fff',fontSize:12}}>Cancel</Text>
                                                </TouchableOpacity>
                                                :
                                                <TouchableOpacity onPress={() => this.alertViolentEndTrip()} style={{alignItems:'center',justifyContent:'center'}}>
                                                    <AntDesign name="closecircleo" size={moderateScale(18)} color="white" />
                                                    <Text style={{color:'#fff',fontSize:12}}>End Trip</Text>
                                                </TouchableOpacity>
                                                }
                                            </View>
                                        </Col>
                                        : null
                                        }
                                        
                                    </Row>                                    
                                </Col>                                
                            </Row>
                        </>
                    }
                    
                    

                    <Row style={{height:moderateScale(40),marginBottom:moderateScale(8),alignItems:'center',}}>
                        <Col size={12}>
                            {
                            this.state.tripStatus === 'navpickup'
                            ?
                            <TouchableOpacity
                                onPress={() => this._navToPickUp()} 
                                style={styles.navigateBtn}
                            >
                                <View style={{flexDirection:'row'}}>
                                    <View>                                
                                        <MaterialCommunityIcons name="navigation" size={18} color="#FFF" />
                                    </View>
                                    <View>
                                        <Text style={{color:'#FFF',fontSize:12}}>NAVIGATE</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                            :
                            this.state.tripStatus === 'arivepickup'
                            ?
                            <TouchableOpacity style={{alignItems:'center',justifyContent:'center', backgroundColor:'#135AA8',flexDirection:'row',borderRadius:5,paddingHorizontal:10,paddingVertical:8}} onPress={() => this._arivePickUp()}>
                                <View style={{justifyContent:'flex-start'}}>
                                    
                                    <AntDesign name="arrowright" size={24} color="#FFF" />
                                    
                                </View>
                                <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                                    <Text style={{color:'#FFF',fontSize:16,textTransform:'uppercase'}}>Start {this.state.bookrequest.servicetype_name}</Text>
                                </View>
                                 
                            </TouchableOpacity>
                            :
                            this.state.tripStatus === 'arivedesination'
                            && 
                            <TouchableOpacity style={{alignItems:'center',justifyContent:'center', backgroundColor:'#E8202A',flexDirection:'row',borderRadius:5,paddingHorizontal:10,paddingVertical:8}} onPress={() => this._completeTrip()}>
                                <View style={{justifyContent:'flex-start'}}>
                                    
                                    <AntDesign name="arrowright" size={24} color="#FFF" />
                                    
                                </View>
                                <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                                    <Text style={{color:'#FFF',fontSize:16,textTransform:'uppercase'}}>Complete {this.state.bookrequest.servicetype_name}</Text>
                                </View>
                                 
                            </TouchableOpacity>
                            }
                        </Col>
                    </Row>
                    {
                    !this.state.mapbox &&
                    <>
                    <Row style={{height:moderateScale(74),}}>
                        <Col size={3} style={{alignItems:'flex-start',justifyContent:'center'}}>
                            <View style={{width:moderateScale(70),borderWidth:moderateScale(1),borderColor:'silver',borderRadius:moderateScale(5),overflow:'hidden'}}>
                                <TouchableHighlight onLongPress={this._onLongPressButton} underlayColor="white">
                                    <Image
                                        source={{uri: this.state.avatar}}
                                        style={{width:moderateScale(70),height:moderateScale(70)}}
                                        Resizemode={'contain'}
                                    />
                                </TouchableHighlight>
                            </View> 
                        </Col>
                        <Col size={8} style={{alignItems:'flex-start',justifyContent:'center'}}>
                            <Row style={{height:moderateScale(30),alignItems:'center'}}>
                                <Col size={10}>
                                    <Text style={{fontSize:moderateScale(20),color:'#135AA8'}}>{this.state.bookrequest.rider_name}</Text>
                                </Col>
                                <Col size={2} style={{alignItems:'flex-end'}}>
                                    <Text style={{fontSize:moderateScale(14),color:'#135AA8'}}>{this.state.riderRating}</Text>
                                </Col>
                            </Row>
                            <Row style={{height:moderateScale(35),alignItems:'center'}}>
                                {this.createTable()}
                            </Row>
                        </Col>
                    </Row>
                    <Row style={{height:70, alignItems:'center',justifyContent:'center'}}>
                        
                        <Col style={{width:'80%'}}>

                            <Row style={{justifyContent:'center',alignItems:'center',marginVertical:5,}}>
                                <Col size={3} style={{margin:moderateScale(8),height:moderateScale(52),alignItems:'center',justifyContent:'center'}}>
                                    <View style={{flex:1,backgroundColor:'#62CD32',alignItems:'center',justifyContent:'center',borderRadius:moderateScale(5),width:65,}} >
                                        {
                                        this.state.navCallFor == 'pickup'
                                        ?
                                            <TouchableOpacity onPress={() => this.openDialScreen()}>
                                                <Feather name="phone-call" size={moderateScale(16)} color="white" />
                                                <Text style={{color:'#fff',fontSize:12}}>Call</Text>
                                            </TouchableOpacity>
                                        :
                                            <TouchableOpacity onPress={() => this.openSOSModalScreen()}>
                                                <Feather name="phone-call" size={moderateScale(16)} color="white" />
                                                <Text style={{color:'#fff',fontSize:12}}>SOS</Text>
                                            </TouchableOpacity>
                                        }
                                    </View>
                                </Col>
                                <Col size={3} style={{margin:moderateScale(8),height:55,alignItems:'center',justifyContent:'center'}}>
                                    <View style={{flex:1,backgroundColor:'#135AA8',alignItems:'center',justifyContent:'center',borderRadius:moderateScale(5),width:65}}>
                                        <TouchableOpacity onPress={() => this._sendMessage()} style={{alignItems:'center',justifyContent:'center'}}>
                                            <AntDesign name="message1" size={moderateScale(18)} color="white" />
                                            <Text style={{color:'#fff',fontSize:12}}>Message</Text>
                                        </TouchableOpacity>
                                    </View>
                                </Col>
                                {
                                this.state.tripStatus !== 'completeTrip'
                                ?
                                <Col size={3} style={{margin:moderateScale(8),height:55,alignItems:'center',justifyContent:'center'}}>
                                    <View style={{flex:1,backgroundColor:'#E8202A',alignItems:'center',justifyContent:'center',borderRadius:moderateScale(5),width:65}}>
                                        {
                                        this.state.navCallFor == 'pickup' 
                                        ?
                                        <TouchableOpacity onPress={() => this.cancelTripAlert()} style={{alignItems:'center',justifyContent:'center'}}>
                                            <AntDesign name="closecircleo" size={moderateScale(18)} color="white" />
                                            <Text style={{color:'#fff',fontSize:12}}>Cancel</Text>
                                        </TouchableOpacity>
                                        :
                                        <TouchableOpacity onPress={() => this.alertViolentEndTrip()} style={{alignItems:'center',justifyContent:'center'}}>
                                            <AntDesign name="closecircleo" size={moderateScale(18)} color="white" />
                                            <Text style={{color:'#fff',fontSize:12}}>End Trip</Text>
                                        </TouchableOpacity>
                                        }
                                    </View>
                                </Col>
                                : null
                                }
                                
                            </Row>
                            
                        </Col>
                        
                    </Row>
                    <Row style={{height:moderateScale(30),padding:moderateScale(6)}}>
                        <Col size={1}>
                            <View style={styles.inforound}>
                                <MaterialCommunityIcons name="information-variant" size={moderateScale(20)} color="black" />
                            </View>
                        </Col>
                        <Col size={11}>
                            <Text>Long press on image to zoom in</Text>
                        </Col>
                    </Row>
                    </>
                    }
                </Grid>
            </View>
        </>
    );

    handleTravlDist = (dist) => {
        //console.log('call from child with param', dist)
        /* this.setState({
            distanceTravelled:dist
        }) */
    }


    onDidFinishLoadingMap = () => {
        //console.log('onDidFinishLoadingMap',this.state.origin)
        let srcdestCords = []
        let srcdest = [this.state.origin.longitude, this.state.origin.latitude];
        srcdestCords.push(srcdest);

        if(Object.keys(this.state.multidest).length > 0){
            //console.log('multidest length==========================>',Object.keys(this.state.multidest).length)
            this.state.multidest.map((item, index) => {
                srcdest = [item.stop_lng, item.stop_lat];
                srcdestCords.push(srcdest);
            })
        }

        srcdest = [this.state.destination.longitude, this.state.destination.latitude];
        srcdestCords.push(srcdest);

        //console.log('multidest==========================>',this.state.multidest)

        let locationcordsapistr = srcdestCords.join(";");

        //console.log('locationcordsapistr==========================>',locationcordsapistr)

        fetch('https://api.mapbox.com/directions/v5/mapbox/driving/'+locationcordsapistr+'?geometries=geojson&overview=full&access_token=pk.eyJ1IjoibWFsLXdvb2QiLCJhIjoiY2oyZ2t2em50MDAyMzJ3cnltMDFhb2NzdiJ9.X-D4Wvo5E5QxeP7K_I3O8w',{
				method: 'GET',
	 		}).then(function (response) {
	 			return response.json();
	  		}).then( (result)=> {

	  			//console.log("Data from api geomery ===============>",debug(result.routes[0].geometry));


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
                    },() =>{
                        if(this.camera){
                            //console.log('this.state.pathHeading==================>',this.state.pathHeading)
                            this.camera.setCamera({
                                centerCoordinate: this.state.coordinates,
                                animationDuration: 6000,
                                heading:this.state.pathHeading,
                            })
                            this.camera.fitBounds([this.state.origin.longitude, this.state.origin.latitude], [this.state.destination.longitude,this.state.destination.latitude],[150,40,250,20],1000);
                        
                        }

                        this.getLnglatdriver2source()
                        
                    })
                  

            })
    }

    async getLnglatdriver2source(){

        //console.log("dLocation ================>",this.state.mapboxSrc)

        /* mapboxSrc:this.state.driverLocation,
        mapboxDst:this.state.destination, */

    	//let loctstring = this.state.driverLocation.longitude+','+this.state.driverLocation.latitude+';'+this.state.mapboxDst.longitude+','+this.state.mapboxDst.latitude;

        let srcdestCords = []
        let srcdest = [this.state.driverLocation.longitude, this.state.driverLocation.latitude];
        srcdestCords.push(srcdest);

        if(Object.keys(this.state.multidest).length > 0 && this.state.navCallFor == 'destination'){
            
            this.state.multidest.map((item, index) => {
                srcdest = [item.stop_lng, item.stop_lat];
                srcdestCords.push(srcdest);
            })
        }

        srcdest = [this.state.mapboxDst.longitude, this.state.mapboxDst.latitude];
        srcdestCords.push(srcdest);

        //console.log('multidest==========================>',this.state.multidest)

        let locationcordsapistr = srcdestCords.join(";");


        //console.log("loctstring ================>",locationcordsapistr)
    	
    	fetch('https://api.mapbox.com/directions/v5/mapbox/driving/'+locationcordsapistr+'?geometries=geojson&overview=full&access_token=pk.eyJ1IjoibWFsLXdvb2QiLCJhIjoiY2oyZ2t2em50MDAyMzJ3cnltMDFhb2NzdiJ9.X-D4Wvo5E5QxeP7K_I3O8w',{
				method: 'GET',
	 		}).then(function (response) {
	 			return response.json();
	  		}).then( (result)=> {
	  			//console.log("Data from api geomery ================>",result);
                
                /* if(result.waypoints[1].distance > 1){
                    if(this.camera){
                        this.camera.setCamera({
                            centerCoordinate: this.state.coordinates,
                            animationDuration: 6000,
                            heading:this.state.heading,
                            pitch:75,
                            zoomLevel:15
                        })
                    }
                }else{
                    if(this.camera){
                        this.camera.setCamera({
                            centerCoordinate: this.state.coordinates,
                            animationDuration: 6000,
                            heading:this.state.heading,
                            pitch:50,
                            zoomLevel:17
                        })
                    }
                } */
                let dist = toFixed((result.routes[0].distance)/1000, 2);
                let time = secondsToHms(result.routes[0].duration)
                this.setState({
                    durationRemaining:time,
                    distanceRemaining:dist+' KM',
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
             
                },() => {
                    /* this.camera.fitBounds([this.state.origin.longitude, this.state.origin.latitude], [this.state.driverLocation.longitude,this.state.driverLocation.latitude],[150,40,250,20],1000); */
                });
            });
    }

    bottomSheetOpenColse = (stat) => {
        //console.log('bottomsheet stat=====================>', stat)
        if(stat == 'open'){
            this.setState({
                isBottomSheetOpen:true
            })
        }else{
            this.setState({
                isBottomSheetOpen:false
            })
        }
    }

    async _sendMessageToRider(){
        let messageText = this.state.messageText.trim();
        if(messageText == '') {
            this.setState({
                messageError:'Please type your message.'
            })
            return false;
        }

        let opt = {
            title:'',
            body:messageText,
            image:'',
            screen:'Inbox',
            messageFrom:'Driver',
            rider_id:this.state.bookrequest.rider_id,
            driver_id:this.state.driverId
        }

        this.setState({
            messageText:''
        })

        this.handlerCallMessage(opt);

        fetch(DOMAIN+'api/driver/mesaageToRider',{
            method: 'POST',
            headers : {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer '+this.state.accessTokan
            },
            body: JSON.stringify({
                "messageText" : messageText,
                "receiver_id" : this.state.bookrequest.rider_id,
                "bookId":this.state.book_id
            })
        }).then(function (response) {
            return response.json();
        }).then( (result)=> {
            //console.log('message result=================',debug(result))
            
            if(result.status === 1){
                this.setState({
                    messageSuccess:result.message,
                    messageText:''
                })
            }else{
                this.setState({cancelError:result.message})
            }
        })
    }

    _sendPreMessageToRider = (preMsg) => {
        this.setState({
            messageText:preMsg
        },() => {
            this._sendMessageToRider();
        })

    }
    
    render() {
        const spin = this.state.rotateValue.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg']
        })
        const {distanceTravelled, chatMessage} = this.state;
        
        return (
            
               
            <>

               {
                   this.state.bannerDistance 
                   ? 
                   null 
                   :
                   this.state.mapbox
                   ? 
                   null
                   :
                    <TopBar />
                }

                
                    {/* <MapboxDirection 
                        origin={this.state.origin} 
                        dest={this.state.destination} 
                        driverCoordinate={this.state.driverCoordinate}
                        waypoints={ (Object.keys(this.state.multidest).length > 0 ) ? this.state.multidest : undefined}
                        handleMapBoxDirection = {this.callMapboxDirection}    
                        destName={this.state.destlocatdesc}
                        sourceName={this.state.sourcedesc}
                    /> */}
                {
                    this.state.mapbox
                ?
                <>
                <NavigationMapbox 
                    origin={this.state.mapboxSrc} 
                    dest={this.state.mapboxDst} 
                    book_id={this.state.book_id} 
                    handleMapBoxState = {this.handleMapBoxState}
                    handleDuration = {this.handleDuration} 
                    isDeparted={this.state.departed} 
                    handleTravlDist = {this.handleTravlDist}
                    waypoints={this.state.multidest}
                    navCallFor={this.state.navCallFor}
                    isMapDark={this.state.MapboxStyleURL === MapboxGL.StyleURL.Dark ? true : false}
                    mute={this.state.voiceNavigation}
                    isOtherNevigation={this.state.isOtherNevigation}
                />
                </>
                :
                <MapboxGL.MapView
					ref={(c) => (this._map = c)}
					onDidFinishLoadingMap={(index) => {this.onDidFinishLoadingMap()}}
					style={{flex:1}}
					styleURL={this.state.MapboxStyleURL}
                    compassEnabled={true}
                    onPress={ () => {
                            this.setState({
                                snapIndex: this.state.snapIndex ? 0 : 1
                            },() => {
                                this.bottomSheetRef.current.snapTo(this.state.snapIndex)
                            })
                        }}
                    
				>
                    {
                Object.keys(this.state.coordinates).length > 0
                &&
					<Camera 
                        zoomLevel={15} 
                        pitch={50} 
                        centerCoordinate={this.state.coordinates}
                        ref={(c) => (this.camera = c)}
                        animationMode={'flyTo'}
                    />
                    }
					<UserLocation renderMode={'native'} androidRenderMode={'gps'} visible={true} showsUserHeadingIndicator={true} />

                    <MapboxGL.ShapeSource  id="mapbox-directions-source" shape={this.state.routedirect}>
                        <MapboxGL.LineLayer
                            id="mapbox-directions-line"
                            style={{lineColor:'#135AA8',lineWidth:10,lineCap: MapboxGL.LineJoin.Round, lineJoin:'round'}}
                            />
                    </MapboxGL.ShapeSource> 
                    <MapboxGL.ShapeSource 
                        id="mapbox-directions-driver" shape={this.state.routediver}>
			            <MapboxGL.LineLayer
                            id="mapbox-directions-driver-line"
                            style={{lineColor:'#000',lineWidth:10,lineCap: MapboxGL.LineJoin.Round,lineJoin:'round'}}
                            />
                    </MapboxGL.ShapeSource> 
                    {this.state.origin.latitude && this.state.origin.longitude 
                    ?
                    <>
                        <MapboxGL.PointAnnotation 
                        id={'markerorigin'}
                            anchor={{ y: 1, x: 0.5 }}
                        coordinate={[this.state.origin.longitude, this.state.origin.latitude]}>
                        <View style={{height: 35, width: 30, backgroundColor: 'transparent'}}>
                        <FontAwesome5 name="map-marker-alt" size={30} color={"#135AA8"} />
                        </View>
                            
                        </MapboxGL.PointAnnotation>

                        <MapboxGL.PointAnnotation 
                        id={'originName'}
                            anchor={{ y: 1, x: 0 }}
                        coordinate={[+this.state.origin.longitude, +this.state.origin.latitude]}>
                            <View style={{
                                        borderColor:'#135AA8',
                                        borderWidth:moderateScale(1),
                                        width:moderateScale(200),
                                        backgroundColor:'#fff',
                                        alignContent:'flex-start',
                                        flex:1,
                                        flexDirection:'row',
                                        borderRadius:moderateScale(3),
                                        padding:5,
                                        position:'absolute',
                                        left:100,
                                        }}>
                                <Text>{this.state.sourcedesc}</Text>
                            </View>
                        </MapboxGL.PointAnnotation>
                    </>
                    
                    :null
                    }

                    {this.state.destination.latitude && this.state.destination 
                    ?
                    <>
                    <MapboxGL.PointAnnotation 
			           id={'markerdestination'}
			            anchor={{ y: 1, x: 0.5 }}
			           coordinate={[+this.state.destination.longitude, +this.state.destination.latitude]}>
                        <View style={{height: 35, width: 30, backgroundColor: 'transparent'}}>
                        <FontAwesome5 name="map-marker-alt" size={30} color={"#910101"} /></View>
                                
	                </MapboxGL.PointAnnotation>
                    <MapboxGL.PointAnnotation 
			           id={'destinationText'}
			            anchor={{ y: 1, x: 1 }}
			           coordinate={[+this.state.destination.longitude, +this.state.destination.latitude]}>
                        <View style={{
                            borderColor:'#135AA8',
                            borderWidth:moderateScale(1),
                            width:moderateScale(200),
                            backgroundColor:'#fff',
                            alignContent:'flex-start',
                            flex:1,
                            flexDirection:'row',
                            borderRadius:moderateScale(3),
                            padding:5,
                            position:'absolute',
                            left:100,
                            }}>
			             <Text>{this.state.destlocatdesc}</Text>
			           </View>
                                
	                </MapboxGL.PointAnnotation>
                    </>
                    :null
                    }

                    {
                        Object.keys(this.state.multidest).length > 0
                        ?
                            this.state.multidest.map((item, index) => {
                                return (
                                    <>
                                        <MapboxGL.PointAnnotation 
                                        id={'markerdestination'}
                                            anchor={{ y: 1, x: 0.5 }}
                                        coordinate={[+item.stop_lng, +item.stop_lat]}>
                                            <View style={{height: 30, width: 30, backgroundColor: 'transparent'}}>
                                            <FontAwesome5 name="map-marker-alt" size={25} color={"green"} /></View>
                                                    
                                        </MapboxGL.PointAnnotation>
                                        <MapboxGL.PointAnnotation 
                                            id={'destinationText'}
                                                anchor={{ y: 1, x: 1 }}
                                            coordinate={[+item.stop_lng, +item.stop_lat]}>
                                                <View style={{
                                                    borderColor:'#135AA8',
                                                    borderWidth:moderateScale(1),
                                                    width:moderateScale(200),
                                                    backgroundColor:'#fff',
                                                    alignContent:'flex-start',
                                                    flex:1,
                                                    flexDirection:'row',
                                                    borderRadius:moderateScale(3),
                                                    padding:5,
                                                    position:'absolute',
                                                    left:100,
                                                    }}>
                                                
                                                <Text>{item.stopname}</Text>
                                            </View>
                                                        
                                            </MapboxGL.PointAnnotation>
                                    </>
                                )
                            })
                        :null
                    }
                </MapboxGL.MapView>
                }
               
                {/* renderContent={(this.state.showEndTrip) ? this.renderEndContent : this.renderContent} */}
                { this.state.display ?
                    <BottomSheet
                        ref={this.bottomSheetRef}
                        snapPoints={this.state.snapPoints}
                        renderContent={this.renderContent}
                        overdragResistanceFactor={0}
                        enabledManualSnapping={false}
                        enabledContentTapInteraction={false}
                        enabledContentGestureInteraction={true}
                        onOpenEnd={() => this.bottomSheetOpenColse('open')}
                        onCloseEnd={() => this.bottomSheetOpenColse('close')}
                    />
                :
                    <Text></Text>
                }
                {this.state.tripEndDone?
                    <DriverRating {...this.props}  />
                :
                    null
                }
                <Modal
                    animationType="slide"
                    transparent={true}                    
                    isVisible={this.state.modalvisible}
                    onBackdropPress={()=>this._onPressDone()}
                >        
                    <Grid style={{justifyContent:'center',alignContent:'center'}}>            
                        <Row size={32} style={{justifyContent:'center',alignContent:'center'}}>
                            <Col style={{justifyContent:'center',alignItems:'center'}}>
                                <View style={{borderColor:'#135AA8',justifyContent:'center',alignContent:'center',borderRadius:moderateScale(5),overflow:'hidden',borderWidth:moderateScale(1)}}>
                                    <Image
                                        source={{uri:this.state.avatar}}
                                        style={{width:moderateScale(320),height:moderateScale(320)}}
                                        Resizemode={'contain'}
                                    />                        
                                </View>
                            </Col>
                        </Row>
                        <Row size={5} style={{marginTop:moderateScale(20)}}>
                            <Col size={4}></Col>
                            <Col size={4}>
                                <Button mode="contained" color={'#135AA8'} onPress={() => this._onPressDone()}>
                                    Done
                                </Button>
                            </Col>
                            <Col size={4}></Col>
                        </Row>
                        <Row size={40}>
                            <Col></Col>
                        </Row>
                    </Grid>
                </Modal>    
                <Modal 
                    isVisible={this.state.cancelModal}
                    backdropOpacity={0.5}
                    animationIn="zoomInDown"
                    animationOut="zoomOutDown"
                    animationInTiming={600}
                    animationOutTiming={400}                    
                >
                    <View style={{backgroundColor:'#FFF',height:moderateScale(280),borderRadius:moderateScale(5)}}>
                        <Row style={{height:moderateScale(50)}}>
                            <Col style={{alignItems:'center',justifyContent:'center'}}>
                                <Text style={{fontSize:moderateScale(20)}}>Cancel Trip</Text>
                            </Col>
                        </Row>
                        <Divider orientation="vertical"  />
                        {this.state.cancelSuccess === ''?
                            <>
                                <Row style={{height:moderateScale(150)}}>
                                    <Col style={{alignItems:'flex-start',margin:moderateScale(10)}}>
                                        <TextInput
                                            label="Cancel Reason:"
                                            multiline={true}
                                            numberOfLines={5}
                                            mode='outlined'
                                            style={{width:'100%'}}
                                            value={this.state.cancelReason}
                                            onChangeText={value => this.setState({cancelReason:value},()=>{
                                                if(value !== ''){
                                                    this.setState({
                                                        cancelError:''
                                                    });
                                                }
                                            })}
                                        />
                                    </Col>
                                </Row>
                                <Row style={{height:moderateScale(40),marginHorizontal:moderateScale(10)}}>
                                    <Col size={4}>
                                        <Button mode="contained" color={'#135AA8'} onPress={() => this._submitCancelTrip()}>
                                            Done
                                        </Button>
                                    </Col>
                                    <Col size={8} style={{alignItems:'flex-end',justifyContent:'center'}}>
                                        <Button mode="text" color={'#135AA8'} onPress={() => this.setState({cancelModal:false})}>
                                            Don't cancel
                                        </Button>
                                    </Col>
                                </Row>
                                <Row style={{marginHorizontal:moderateScale(10)}}>
                                    <Col style={{alignItems:'center',justifyContent:'center'}}>
                                        <Text style={{fontSize:moderateScale(14),color:'red'}}>{this.state.cancelError}</Text>
                                    </Col>
                                </Row>
                            </>
                        :
                            <Row style={{marginHorizontal:moderateScale(10)}}>
                                <Col style={{alignItems:'center',justifyContent:'center'}}>
                                    <Text style={{fontSize:moderateScale(20),color:'green'}}>{this.state.cancelSuccess}</Text>
                                </Col>
                            </Row>
                        }
                    </View>
                </Modal>
                <Modal 
                    isVisible={this.state.riderCancel}
                    backdropOpacity={0.5}
                    swipeDirection={['up', 'left', 'right', 'down']} 
                    useNativeDriver={true}               
                >
                    <Pressable 
                        onPress={() => this._pressRiderCancleModel()}
                        style={{backgroundColor:'#E8202A',borderRadius:moderateScale(20),paddingVertical:20}}>
                        <Row style={{height:moderateScale(30)}}>
                            <Col style={{alignItems:'center',justifyContent:'center',marginHorizontal:moderateScale(20)}}>
                                <Text style={{fontSize:moderateScale(25),fontWeight:'bold',color:'#FFF'}}>Hold On!</Text>
                            </Col>
                        </Row>
                        <Row style={{height:moderateScale(50)}}>
                            <Col style={{alignItems:'center',justifyContent:'center',marginHorizontal:moderateScale(20)}}>
                                <Text style={{fontSize:moderateScale(20),fontWeight:'bold',color:'#FFF'}}>Rider Has Cancel this trip</Text>
                                <Text style={{fontSize:moderateScale(16),color:'#FFF'}}>You receive cancellation fee</Text>
                            </Col>
                        </Row>

                    </Pressable>
                </Modal>
                {/* {this.state.sendMessage &&
                    <SendMessage 
                        sender={this.state.driverId} 
                        receiver={{
                            rider_name:this.state.bookrequest.rider_name,
                            rider_id:this.state.bookrequest.rider_id
                        }}
                        handlerCallMessage = {this.handlerCallMessage}
                        reciveMessage={this.state.chatMessage}
                        messageType='message'
						buttonText='Send' />
                } */}

                {this.state.sendMessage &&
                    <Modal
                            animationType="slide"
                            visible={this.state.sendMessage}
                            transparent={false}
                            
                        >
                        <View style={{flexDirection:'row',alignItems:'center'}}>
                                <TouchableOpacity
                                    onPress={() => this.setState({sendMessage:false})} >
                                    <AntDesign name="arrowleft" size={24} color="#000" />
                                </TouchableOpacity>
                                <View><Text style={{fontSize:22,paddingLeft:20}}>{this.state.bookrequest.rider_name}</Text></View>
                            </View>
                            <Text style={{paddingVertical:20,textAlign:'center'}}>Keep your account safe - never share personal or account information in this chat</Text>
                            <Divider />
                        <SafeAreaView style={{ flex: 7,backgroundColor:'#fff'}}>
                        <View style={{flexDirection:'row',}}>
                            
                            {
                                Object.keys(chatMessage).length > 0 
                                &&
                                <View style={{flex:1}}>
                                {
                                    <FlatList
                                        data={[...chatMessage].reverse()}
                                        inverted
                                        renderItem={({item, index}) => {
                                            return (
                                                <>
                                                {item.messageFrom != 'Rider' ?
                                                (<View style={{
                                                            marginTop: 10,
                                                            width:'90%',
                                                            marginLeft:'10%'
                                                        }}>
                                                        <View style={{
                                                            backgroundColor: "#135AA8",
                                                            paddingHorizontal:10,
                                                            paddingVertical:8,
                                                            borderRadius: 20,
                                                            alignSelf:'flex-end',
                                                        }}>
                                                        <Text style={{ color: "#fff", }} >{item.body}</Text>
                                    
                                                        
                                                        </View>
                                                        
                                                    </View>)
                                                :
                                                (<View style={{
                                                            marginTop: 10,
                                                            width:'90%',
                                                            marginRight:'10%'
                                                        }}>
                                                        <View style={{
                                                            backgroundColor: "#dedede",
                                                            paddingHorizontal:10,
                                                            paddingVertical:8,
                                                            borderRadius: 20,
                                                            alignSelf:'flex-start'
                                                        }}>
                                                        <Text style={{ color: "#000", }} >{item.body}</Text>
                                    
                                                        
                                                        </View>
                                                        
                                                    </View>)
                                                }
                                                </>
                                            )
                                        }}
                                    />} 
                                </View> 
                            }
                        </View>
                        </SafeAreaView>
                        <View style={{flexDirection:'row',marginTop:10,marginHorizontal:-5,flexWrap:'wrap',justifyContent:'center'}}>
                            <TouchableOpacity
                                style={pageStyles.preDefineMsg}
                                onPress={() => this._sendPreMessageToRider("I've arrived")} >
                                <Text style={{color:'#000'}}>I've arrived</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={pageStyles.preDefineMsg}
                                onPress={() => this._sendPreMessageToRider('OK Got it!')} >
                                <Text style={{color:'#000'}}>OK Got it!</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={pageStyles.preDefineMsg}
                                onPress={() => this._sendPreMessageToRider("I'm on my way")} >
                                <Text style={{color:'#000'}}>I'm on my way</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={pageStyles.inputcontainer}>
                            
                            <View style={{flex:5}}>
                                <MyInput
                                    mode='flat'
                                    style={{height:45,borderWidth:1,borderColor:'#ccc',borderRadius:50,paddingHorizontal:10,elevation:1,backgroundColor:'#FFF'}}
                                    underlineColor='none'
                                    placeholder='Message...'
                                    placeholderTextColor='#000'
                                    underlineColorAndroid='transparent'
                                    value={this.state.messageText}
                                    onChangeText={value => this.setState({messageText:value},()=>{
                                        if(value !== ''){
                                            this.setState({
                                                messageError:''
                                            });
                                        }
                                    })}
                                />
                            </View>
                            <View style={{flex:1,}}>
                                <TouchableOpacity
                                    style={{borderRadius:50,backgroundColor:'#135AA8',width:45,height:45,justifyContent:'center',alignSelf:'flex-end',alignItems:'center',elevation:1}}
                                    onPress={() => this._sendMessageToRider()} >
                                    <MaterialIcons name="send" size={24} color="#FFF" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                }


                <Modal
                    animationType="slide"
                    isVisible={this.state.modalSOSvisible}
                    transparent={true}
                    style={{height:200,flex: 0.5}}
                    
                >
                    <View style={{alignItems:'flex-end',position:'relative',top:20,right:-10,zIndex:99}} >
                        <TouchableOpacity 
                            onPress={ (e) => { 
                                this.setState({
                                    modalSOSvisible: false
                                });
                            }}
                        >
                            <AntDesign name="closecircle" size={30} color="black" />
                        </TouchableOpacity>
                    </View>
                    <Grid style={{justifyContent:'center',alignContent:'center',alignItems:'center',height:160,borderWidth:1,borderColor:'#ccc',flex: 0,backgroundColor:'#fff',}}>
                        <Row size={1} style={{height:30,justifyContent:'center',alignContent:'center',borderBottomWidth:1,borderBottomColor:'#ccc'}}>
                            <Col size={4} style={{justifyContent:'center',padding:5,}}>
                            <Text style={{fontWeight:'bold'}}>Name</Text>
                            </Col>
                            <Col size={4} style={{justifyContent:'center',padding:5,}}>
                            <Text style={{fontWeight:'bold'}}>Number</Text>
                            </Col>
                            <Col size={4} style={{justifyContent:'center',padding:5,}}>
                            <Text style={{fontWeight:'bold'}}>Tap to Call</Text>
                            </Col>
                        </Row>
                        <Row size={1} style={{backgroundColor:'#F9F9F9',borderBottomWidth:1,borderBottomColor:'#ccc'}}>
                            <Col size={4} style={{justifyContent:'center',padding:5,}}>
                            <Text>Police</Text>
                            </Col>
                            <Col size={4} style={{justifyContent:'center',padding:5,}}>
                            <Text>000</Text>
                            </Col>
                            <Col size={4} style={{justifyContent:'center',padding:5,alignItems:'center',}}>
                            <TouchableOpacity onPress={() => this.openSOSDialScreenCall('000')}>
                            <Feather name="phone-call" size={24} color="#474D81" />
                            </TouchableOpacity>
                            </Col>
                        </Row>
                        <Row size={1}>
                            <Col size={4} style={{justifyContent:'center',padding:5,}}>
                            <Text>Turvy Help</Text>
                            </Col>
                            <Col size={4} style={{justifyContent:'center',padding:5,}}>
                            <Text>+61417691066</Text>
                            </Col>
                            <Col size={4} style={{justifyContent:'center',padding:5,alignItems:'center',}}>
                            <TouchableOpacity onPress={() => this.openSOSDialScreenCall('+61417691066')}>
                            <Feather name="phone-call" size={24} color="#474D81" />
                            </TouchableOpacity>
                            </Col>
                        </Row>
                    </Grid>
                </Modal>
            </>
        );
    }
}

const styles = StyleSheet.create({
    map: {
        flex: 1,
        width:width,
        height:height
    },
    navigateBtn:{
        flexDirection:'row',justifyContent:'flex-end',alignItems:'center',backgroundColor:'#135AA8',alignSelf:'flex-end',borderRadius:50,paddingHorizontal:10,paddingVertical:5
    },
    pickText:{
        paddingHorizontal:10,
        fontWeight:'bold',
        color:'#303030'
    }
});

const pageStyles = StyleSheet.create({
	tripTab:{		
		flexDirection:'row'
	},
	tripTabChild:{
		flex:1,		
		justifyContent:'center'
	},
	offIcon:{
		borderWidth:1,
		borderColor:'#CCC',
		padding:5,
		borderRadius:50,
		backgroundColor:'#FFF',
		color:'#FFF',
		elevation: 8,
		width:62,
        height:62,
        alignSelf:'center'
	},
	offlineBtn:{      
		backgroundColor:"#ccc",
		justifyContent:'center',
		alignItems:'center',
		flexDirection:'row',    
		borderRadius:50,
	},
	promoBox:{
			backgroundColor:'#FFF',
			padding:10,
			borderColor:'#ddd',
			borderWidth:1,
			borderRadius:5
	},
	rightArrow: {
  position: "absolute",
  backgroundColor: "#0078fe",
  //backgroundColor:"red",
  width: 20,
  height: 25,
  bottom: 0,
  borderBottomLeftRadius: 25,
  right: -10
},

rightArrowOverlap: {
  position: "absolute",
  backgroundColor: "#eeeeee",
  //backgroundColor:"green",
  width: 20,
  height: 35,
  bottom: -6,
  borderBottomLeftRadius: 18,
  right: -20

},

/*Arrow head for recevied messages*/
leftArrow: {
    position: "absolute",
    backgroundColor: "#dedede",
    //backgroundColor:"red",
    width: 20,
    height: 25,
    bottom: 0,
    borderBottomRightRadius: 25,
    left: -10
},

leftArrowOverlap: {
    position: "absolute",
    backgroundColor: "#eeeeee",
    //backgroundColor:"green",
    width: 20,
    height: 35,
    bottom: -6,
    borderBottomRightRadius: 18,
    left: -20

},
input: {
    borderColor: "gray",
    width: "100%",
    borderWidth: 1,
    borderRadius: 10,
    padding: 0,
    height:50,
},
inputcontainer:{
  	flex:1,
  	flexDirection:'row',
    alignItems:'center',
    justifyContent:'center',
    marginTop:5,
    
},
preDefineMsg:{
    borderRadius:50,backgroundColor:'#ddd',justifyContent:'center',alignItems:'center',paddingHorizontal:10,paddingVertical:8,marginHorizontal:5
}

})