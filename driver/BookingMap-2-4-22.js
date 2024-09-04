import React, {Component} from "react";
import { StyleSheet, Text, View,Dimensions, Image, TouchableOpacity,TouchableHighlight, Alert,Linking, BackHandler, Animated, AppState, Pressable, DeviceEventEmitter, Switch} from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import MapView , { Marker, AnimatedRegion}from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';
import { Divider } from 'react-native-elements';
import { Col, Row, Grid } from "react-native-easy-grid";
import { Entypo,Feather,AntDesign,Ionicons,EvilIcons,MaterialIcons } from '@expo/vector-icons'; 
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { DOMAIN, PUSHER_API} from './Constant';
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

//import Image from 'react-native-image-progress';
//import * as Progress from 'react-native-progress'

let left = require('../assets/images/left.png')
let right = require('../assets/images/right.png')
let ahead = require('../assets/images/ahead.png')
let turn = require('../assets/images/u-turn.png')
let round_left = require('../assets/images/round_about_left.png')
let round_right = require('../assets/images/round_about_right.png')
let round_ahead = require('../assets/images/round_about_ahead.png')
let round_return = require('../assets/images/round_about_return.png')

const { width, height } = Dimensions.get('window');
const stylesArray = [
    
    {
        "featureType": "road.highway",
        "stylers": [
        { "color": "#7E96BC" }
        ]
    },
    {
        
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
    },
    {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#d4d0cf" }],
      },
      {
        featureType: "road",
        elementType: "geometry.stroke",
        stylers: [{ color: "#d4d0cf" }],
      },
      
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

TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
    if (error) {
        console.log('error',error);
        return;
    }
    if (data) {
        const { locations } = data;
        const [location] = locations;
        console.log('background location',location);
        AsyncStorage.getItem('driverId').then((value) => {
            geocollection
            .doc(value)
            .update({
                coordinates: new firestore.GeoPoint(location.coords.latitude, location.coords.longitude),
                updated_at: firestore.FieldValue.serverTimestamp(),
                heading:location.coords.heading,
            })
        })

        if(AppState.currentState === 'active'){
            Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
        }

      
        let destination_lng, destination_lat;
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
        })
    }
});
/* latitudeDelta: 0.007683038072176629,
longitudeDelta: 0.004163794219493866, */
export default class BookingMap extends Component {
    constructor(props) {
        super(props);
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
            selectedNavigationOption:3,
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
    handlerCallMessage = async () => {
        console.log('call from child componant')
        this.setState({
            sendMessage: false
        })
    }

    changeMode = async () =>{
               
        Moment.locale('en');
      
        this.intervalModeChange = setInterval(async () => {            
          
            var dt = new Date();
            var newDarkMode =  (Moment(dt).format('HH') >= 19  || Moment(dt).format('HH') < 7) ? true : false;
            console.log("componentDidMount DATE TIME :::: " + new Date() + "::" + Moment(dt).format('HH') +"::" +  this.state.isDarkMode +":::"+newDarkMode )
            if(this.state.isDarkMode != newDarkMode)
                 this.setState({isDarkMode: newDarkMode})
        
        }, 1000);

        // Moment(dt).format('d MMM')

    }
    

    componentDidMount = async () => {
        
        this.changeMode();
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
                console.log('book_id',this.state.book_id)
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
                console.log('firebase trip_path',error);
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
                        })
                    },
                    (error) => {
                        console.log(error.code, error.message);
                    },
                    { forceRequestLocation: true, distanceFilter:0, enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
                )
            }
        })
        Geolocation.watchPosition((curCoords) => {
                console.log('curCoords',curCoords);
                this.updateDriverCoordinates(curCoords)
            },
            (error) => {
                console.log(error.code, error.message);
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
        console.log("Componenet Will Un Mount >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>. ")
        this.clearTimer();
        this.clearModeTimer()
        //NativeEventEmitter.addListener('timer', this.clearTimer.bind(this));
    }

    _handleAppStateChange = async (nextAppState) => {
        console.log('appState',this.state.appState,nextAppState)

        if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
            //console.log('App has come to the foreground!');
            // 3 when you're done, stop it
            Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME).then((value) => {
                console.log('task_value',value)
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

        if(this.mapView) {
            this.mapView.animateCamera({
                center:{
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                },
                heading: pos.coords.heading
            });
        }

        geocollection
        .doc(this.state.driverId)
        .update({
            coordinates: new firestore.GeoPoint(pos.coords.latitude, pos.coords.longitude),
            updated_at: firestore.FieldValue.serverTimestamp(),
            heading:pos.coords.heading,
        })

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
                //console.log('distanceTravelled',distanceTravelled.toFixed(2))
                db.collection("trip_path")
                .doc(JSON.stringify(this.state.bookrequest.id))
                .update({
                    location: firestore.FieldValue.arrayUnion(new firestore.GeoPoint(pos.coords.latitude, pos.coords.longitude)),
                    distance: distanceTravelled,
                })
                .then(() => {
                    console.log('Loc updated DEparted!');
                });
            })

        }

    }

    onBackPress () {
        return true;
    }

    isRideCancelByRider = async (data) => {
        console.log("BOOKING CANCEL ",data);
        let bookId = this.state.bookrequest.id;
        if(data.book_id === bookId){
            this.setState({riderCancel:true})
            AsyncStorage.removeItem('running_book_id');
            this.alertTone();
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
        console.log(" _startNevigation START NAVIGATION >>>>>>>>>> " + this.state.selectedNavigationOptio)
        let dest = `${destCords.latitude},${destCords.longitude}`;
        if(Object.keys(this.state.multidest).length > 0 && callFor == 'destination'){
            dest = this.state.multidest.map(value => `${value.latitude},${value.longitude}`)
            .join('+to:')
            dest = `${dest}+to:${destCords.latitude},${destCords.longitude}`
        }

        console.log('NavigationOption',this.state.selectedNavigationOption)

        if(this.state.selectedNavigationOption == 1){

            let mapurl = `https://maps.google.com/?daddr=${dest}&dirflg=d&nav=1`;
            Linking.canOpenURL(mapurl)
            .then(res => {
                Linking.openURL(mapurl).then(result => {
                    console.log('Nav result: ',result)
                }).catch(err => { console.log('Cannot link app!!!'); })
            }).catch(err => {
                console.log(err)
            })
        }
        else if(this.state.selectedNavigationOption==2){
            let wazeUrl = `waze://?ll=${destCords.latitude},${destCords.longitude}&navigate=yes&zoom=17`
            Linking.canOpenURL(wazeUrl).then(res=>{
                if(res){
                    Linking.openURL(wazeUrl).then(result => {
                        console.log('result',result);
                    })
                    .catch(err => console.log('waze link error',err))
                }
            })
        }
    }

    _onPressDepart(){
        //clearTimeout(this.intervalCancel);
        Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME).then((value) => {
            console.log('task_value depart',value)
            if (value) {
                Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
            }
        });
        if(this.state.bookrequest.id > 0){
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
            
            db.collection("driver_locations")
            .doc(this.state.driverId)
            .update({
                isBusy: 'yes',
                updated_at: firestore.FieldValue.serverTimestamp(),
            }).then(() => {
            });
            this.setState({
                display:true,
                departed:true,
                origin:this.state.origin,
                showEndTrip:true,
                driverDestination:this.state.destination,
            })

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
                console.log('tap to depart:',result)
            })
        }
    }

    async _completeTrip(){

        this.setState({
            tripEndDone:true,
            display:false,
            bannerDistance:'',
            bannerDistanceNext:''
        })
        
        this.clearTimer()
        AsyncStorage.removeItem('running_book_id');
        let bookId = this.state.bookrequest.id;
        console.log('traval distance',this.state.distanceTravelled)
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
            })
        }).then(function (response) {
            return response.json();
        }).then( (result)=> {
            console.log('trip end data:',result)
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
            console.log('firebase trip_path update')
            this.setState({
                departed:false,
                display:false,
            })
        })
        .catch((error) => { 
            console.error('trip_path error:',error)
        });

        db.collection("driver_locations")
        .doc(this.state.driverId)
        .update({
            isBusy: 'no',
            updated_at: firestore.FieldValue.serverTimestamp(),
            coordinates: new firestore.GeoPoint(this.state.mapLatitude, this.state.mapLongitude),
        })
        .then(() => {
            console.log('firebase driver_locations update')
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
            console.log('cancel result',result)
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
            tripStatus:'arivepickup',
        })
        this.mapView.animateCamera({
            center:{latitude:this.state.driverLocation.latitude, longitude:this.state.driverLocation.longitude},
            zoom:17,
            pitch:40
        });
        this._startNevigation(this.state.origin, 'pickup');

        this._navigationBannar(this.state.origin)
        //let orgLat = this.state.driverLocation.latitude;
        //let orgLong = this.state.driverLocation.longitude;
    }

    _arivePickUp = () => {
        this.clearTimer()
        this.setState({
            tripStatus:'navdesination',
            showEndTrip:true,
            bannerDistance:'',
            bannerDistanceNext:''

        })
        console.log('_arivePickUp',this.state.origin)
        this._onPressDepart()
    }

    _navToDestination = () => {
        this.setState({
            tripStatus:'arivedesination'
        },() => {
            db.collection("trip_path")
            .doc(JSON.stringify(this.state.bookrequest.id))
            .update({ 
                status: 'navigate_to_destination',
            })
        })
        console.log('destination loc',this.state.destination)
        this._startNevigation(this.state.destination, 'destination');
        this._navigationBannar(this.state.destination)
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
    }

    clearModeTimer = () => {
        // Handle an undefined timer rather than null
        this.intervalModeChange !== undefined ? clearTimeout(this.intervalModeChange) : null;
        //this.offtime !== undefined ? clearTimeout(this.offtime) : null;
    }
    

    _navigationBannar = async (destination) => {
        this.intervalBanner = setInterval(async () => {            

            if(this.state.driverLocation && destination){
                let orgLat = this.state.driverLocation.latitude;
                let orgLong = this.state.driverLocation.longitude;
                let destLat = destination.latitude;
                let destLong = destination.longitude

                let url = `https://maps.googleapis.com/maps/api/directions/json?origin=${orgLat},${orgLong}&destination=${destLat},${destLong}&key=AIzaSyAr2ESV30J7hFsOJ5Qjaa96u9ADSRX6_Sk`;

                console.log('google banner url',url)

                const response = await fetch(url);
                const text = await response.text();
                const response_1 = text;
                const jsonRes = JSON.parse(response_1);

                // bannerIconCurrent
console.log("ALL STEPS :: " + JSON.stringify(jsonRes.routes[0].legs[0].steps))
                
                let data = jsonRes.routes[0].legs[0].steps[1]
                let dataDist = jsonRes.routes[0].legs[0].steps[0]

                if(dataDist){
                    let str = dataDist.html_instructions
                    //let arr = str.split('style')
                    //let arrstr = arr[0].replace(/<[^>]+>/g, '');
                    let arrstr = str.replace(/<\/?[^>]+(>|$)/g, " ");
                    arrstr = arrstr.replace('&amp;', '&');
                    arrstr = arrstr.replace('&nbsp;', ' ');
                    //let arrstr = str
                    //&amp;
                    let maneuver = dataDist?.maneuver
                    let image;
console.log("maneuver ::" + maneuver)

                    if(maneuver === undefined){
                        image= ahead
                    }
                    else if(maneuver === 'turn-left'){
                        image= left
                    }
                    else if(maneuver === 'turn-right'){
                        image= right
                    }
                    else if(maneuver === 'turn-slight-right'){
                        image= right
                    }
                    else if(maneuver === 'uturn-right'){
                        image= turn
                    }
                    else if(maneuver === 'straight'){
                        image= ahead
                    }
                    else if(maneuver === 'roundabout-left'){
                        image= round_left
                      
                    }
                    else if(maneuver === 'roundabout-right'){
                        image= round_right
                    }
                    
                    this.setState({
                        bannerDistance:dataDist?.distance?.text,
                        bannerIcon: image,
                        bannerText:arrstr
                    })
                }

                if(data){
                    let str = data.html_instructions
                    //let arr = str.split('style')
                    //let arrstr = arr[0].replace(/<[^>]+>/g, '');
                    let arrstr = str.replace(/<\/?[^>]+(>|$)/g, " ");
                    arrstr = arrstr.replace('&amp;', '&');
                    arrstr = arrstr.replace('&nbsp;', ' ');
                    //let arrstr = str
                    //&amp;
                    let maneuver = data?.maneuver
                    let image;
            console.log("maneuver ::" + maneuver)

                    if(maneuver === undefined){
                        image= ahead
                    }
                    else if(maneuver === 'turn-left'){
                        image= left
                    }
                    else if(maneuver === 'turn-right'){
                        image= right
                    }
                    else if(maneuver === 'turn-slight-right'){
                        image= right
                    }
                    else if(maneuver === 'uturn-right'){
                        image= turn
                    }
                    else if(maneuver === 'straight'){
                        image= ahead
                    }
                    else if(maneuver === 'roundabout-left'){
                        image= round_left
                        /* let texts = str.replace( /^\D+/g, '');
                        if(texts.charAt(0) === 1){
                            image= round_left
                        }
                        else if(texts.charAt(0) === 2){
                            image= round_ahead
                        }
                        else if(texts.charAt(0) === 3){
                            image= round_right
                        }
                        else if(texts.charAt(0) === 4){
                            image= round_return
                        } */
                    }
                    else if(maneuver === 'roundabout-right'){
                        image= round_right
                    }
                    
                    this.setState({
                        bannerDistanceNext:data?.distance?.text,
                        bannerIconNext: image,
                        bannerTextNext:arrstr
                    })
                }
            }
        }, 1000);
    }

    ViolentEndTrip = () => {

        this.setState({
            display:false,
            tripEndDone:true,
            bannerDistance:''
        })
        
        this.clearTimer()

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
            })
        }).then(function (response) {
            return response.json();
        }).then( (result)=> {
            console.log('trip end db:',result)
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
            console.log('firebase trip_path update')
            this.setState({
                departed:false,
                display:false,
            })
        })
        .catch((error) => { 
            console.error('trip_path error:',error)
        });

        db.collection("driver_locations")
        .doc(this.state.driverId)
        .update({
            isBusy: 'no',
            updated_at: firestore.FieldValue.serverTimestamp(),
            coordinates: new firestore.GeoPoint(this.state.mapLatitude, this.state.mapLongitude),
        })
        .then(() => {
            console.log('firebase driver_locations update')
        })
        .catch((error) => { 
            console.error('driver_locations error:',error)
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

    renderContent = () => (
        <>
            
            <View
                style={{
                    backgroundColor: 'white',
                    padding: moderateScale(10),
                    height: 235,
                    margin:moderateScale(10),
                    elevation: 8,
                    borderRadius:moderateScale(5),
                }}
            >
                
                <Grid>
                    <Row style={{height:moderateScale(84),marginBottom:moderateScale(8)}}>
                        <Col size={3}>
                            <View style={{width:moderateScale(80),borderWidth:moderateScale(1),borderColor:'silver',borderRadius:moderateScale(5),overflow:'hidden'}}>
                                <TouchableHighlight onLongPress={this._onLongPressButton} underlayColor="white">
                                    <Image
                                        source={{uri: this.state.avatar}}
                                        style={{width:moderateScale(80),height:moderateScale(80)}}
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
                    <Row style={{height:100, alignItems:'center',justifyContent:'center'}}>
                        
                        <Col size={12}>

                            <Row style={{justifyContent:'center',alignItems:'center',marginVertical:5}}>
                                <Col size={3} style={{margin:moderateScale(8),height:moderateScale(52),alignItems:'center',justifyContent:'center'}}>
                                    <View style={{flex:1,backgroundColor:'#62CD32',alignItems:'center',justifyContent:'center',borderRadius:moderateScale(5),width:65,}} >
                                        <TouchableOpacity onPress={() => this.openDialScreen()}>
                                            <Feather name="phone-call" size={moderateScale(16)} color="white" />
                                            <Text style={{color:'#fff',fontSize:12}}>Call</Text>
                                        </TouchableOpacity>
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
                                        this.state.showEndTrip 
                                        ?
                                        <TouchableOpacity onPress={() => this.alertViolentEndTrip()} style={{alignItems:'center',justifyContent:'center'}}>
                                            <AntDesign name="closecircleo" size={moderateScale(18)} color="white" />
                                            <Text style={{color:'#fff',fontSize:12}}>End Trip</Text>
                                        </TouchableOpacity>
                                        :
                                        <TouchableOpacity onPress={() => this.cancelTripAlert()} style={{alignItems:'center',justifyContent:'center'}}>
                                            <AntDesign name="closecircleo" size={moderateScale(18)} color="white" />
                                            <Text style={{color:'#fff',fontSize:12}}>Cancel</Text>
                                        </TouchableOpacity>
                                        }
                                    </View>
                                </Col>
                                : null
                                }
                                <Col size={3} style={{margin:moderateScale(8),height:55,alignItems:'center',justifyContent:'center'}}>
                                    {
                                    this.state.tripStatus === 'navpickup'
                                    ?
                                    <TouchableOpacity onPress={() => this._navToPickUp()}>
                                        <Image
                                        style={{width:60,height:60}}
                                        source={require('../assets/Nav_to_pickup.png')}
                                        resizeMode={'contain'}
                                    />
                                    </TouchableOpacity>
                                    :
                                    this.state.tripStatus === 'arivepickup'
                                    ?
                                    <TouchableOpacity onPress={() => this._arivePickUp()}>
                                        <Image
                                        style={{width:60,height:60}}
                                        source={require('../assets/Arrive-Pickup.png')}
                                        resizeMode={'contain'}
                                    />
                                    </TouchableOpacity>                                    
                                    :
                                    this.state.tripStatus === 'navdesination'
                                    ?
                                    <TouchableOpacity onPress={() => this._navToDestination()}>
                                        <Image
                                        style={{width:60,height:60}}
                                        source={require('../assets/Nav_to_destination.png')}
                                        resizeMode={'contain'}
                                    />
                                    </TouchableOpacity> 
                                    :
                                    this.state.tripStatus === 'arivedesination'
                                    ?
                                    <TouchableOpacity onPress={() => this._ariveToDestination()}>
                                        <Image
                                        style={{width:60,height:60}}
                                        source={require('../assets/Arrive-Destination.png')}
                                        resizeMode={'contain'}
                                    />
                                    </TouchableOpacity>
                                    :
                                    this.state.tripStatus === 'completeTrip'
                                    ?
                                    <TouchableOpacity onPress={() => this._completeTrip()}>
                                        <Image
                                        style={{width:60,height:60}}
                                        source={require('../assets/Complete_trip.png')}
                                        resizeMode={'contain'}
                                    />
                                    </TouchableOpacity>
                                    :
                                    null
                                    }
                                </Col>
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
                </Grid>
            </View>
        </>
    );
    
    render() {
        const spin = this.state.rotateValue.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg']
        })
        const {distanceTravelled} = this.state;
        return (
            <>
               {
                this.state.bannerDistance ? null : <TopBar />}
                

                {
                this.state.bannerDistance
                ?
                <View style={{position:'absolute', zIndex: 100, top:'4%',left:0, right: 0, width: '100%', alignItems:'center', height: 'auto', backgroundColor: 'transparent' }}>
                    
                        <View style={{width:'90%', flexDirection:'row',alignItems:'center', justifyContent:'space-between', backgroundColor: "#135aa8",borderRadius: moderateScale(10), paddingHorizontal: moderateScale(15),paddingVertical: moderateScale(10)}}>
                            <View style={{marginRight: moderateScale(10), alignItems:'center', justifyContent:'space-between'}}>
                                <Image resizeMode='contain' source={this.state.bannerIcon} style={{width:moderateScale(30),height:moderateScale(30)}} />
                                <Text style={{fontSize:moderateScale(14),fontWeight:'bold',color:'#fff'}}>{this.state.bannerDistance}</Text>
                                
                            </View>
                            <Text style={{color:'#fff',width: '80%' , fontWeight:'bold', fontSize: moderateScale(16)}}>{this.state.bannerText}</Text>
                        </View>
                    
                    {  this.state.bannerDistanceNext ?
                     <View style={{ marginTop:-8,
                         marginStart:'5%',  alignItems:'flex-start',flexDirection:'row',alignSelf:'flex-start', backgroundColor: "#135aa8",borderBottomLeftRadius: moderateScale(10), borderBottomRightRadius: moderateScale(10), paddingHorizontal: moderateScale(15),paddingVertical: moderateScale(10)}}>
                         <Text style={{alignSelf:'center',fontSize:moderateScale(14),fontWeight:'bold',color:'#fff'}}>Then</Text>
                         <Image resizeMode='contain' source={this.state.bannerIconNext} style={{width:moderateScale(30),height:moderateScale(30)}} />
                                                
                    </View> : null} 

                </View>
                :null
                }

                <View style={{position:'absolute', zIndex: 100, top:height-290, right: 0, width: '100%', alignItems:'flex-end', height: 'auto', backgroundColor: 'transparent' }}>
                    <View style={{alignItems:'center', justifyContent:'space-between', backgroundColor: "#135aa8", paddingVertical: moderateScale(2), borderBottomLeftRadius:5,borderTopLeftRadius:5,paddingLeft:10,paddingRight:5}}>
                        {
                            this.state.isDarkMode
                            ?
                            <Text style={{color:'#FFF'}}>Night</Text>
                            :
                            <Text  style={{color:'#FFF'}}>Day</Text>
                        }
                        <Switch
                            trackColor={{ false: "#767577", true: "#81b0ff" }}
                            thumbColor={this.state.isDarkMode ? "#f5dd4b" : "#f4f3f4"}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={() => this.toggleSwitch()}
                            value={this.state.isDarkMode}
                        />
                    </View>
                </View>
                <View style={{flex:1}}>
                    <MapView style={styles.map}
                        provider={'google'}
                        ref={c => this.mapView = c}
                        initialRegion={{
                            latitude: this.state.mapLatitude,
                            longitude: this.state.mapLongitude,
                            latitudeDelta:this.state.latitudeDelta,
                            longitudeDelta:this.state.longitudeDelta,
                        }}
                        /* initialCamera={{
                            center:{ latitude: this.state.mapLatitude, longitude: this.state.mapLongitude },
                            pitch: 0,
                            zoom: 14,
                            heading: 0,
                            altitude: 0
                        }} */
                        onPress={ (e) => {
                            this.setState({
                                snapIndex: this.state.snapIndex ? 0 : 1
                            },() => {
                                this.bottomSheetRef.current.snapTo(this.state.snapIndex)
                            })
                        }}
                        customMapStyle={this.state.isDarkMode  ? darkStylesArray : stylesArray}
                        onMapReady={this.onMapReady}
                        onRegionChange={this.onRegionChange}
                        onRegionChangeComplete={this.onRegionChangeComplete}
                        zoomEnabled={true}
                        zoomTapEnabled={true}
                        zoomControlEnabled={true}
                    >
                        <Marker.Animated
                            key={'driverkey'}
                            coordinate={this.state.driverCoordinate}
                            flat
                            anchor={{ x: 0.5, y: 0.5 }}
                            ref={marker => {this.marker = marker;}}
                        >
                            <Animated.Image
                                style={{width:moderateScale(40),height:moderateScale(40),transform: [{rotate: spin}]}}
                                source={require('../assets/driver-veh-images_60.png')}
                            />
                        </Marker.Animated>
                        { this.state.latitudecur && this.state.longitudecur ?
                            <Marker
                                tracksViewChanges={false}
                                key={'sourcekey'}
                                coordinate={{latitude:this.state.latitudecur, longitude:this.state.longitudecur}}
                                style={{ alignItems: "center"}}
                            >   
                                <View
                                    style={{
                                        alignItems: "center",
                                        borderColor:'#135AA8',    
                                        borderWidth:moderateScale(1),
                                        width:moderateScale(200),
                                        backgroundColor:'#fff',
                                        height:moderateScale(40),
                                        alignContent:'center',
                                        flex:1,
                                        flexDirection:'row',
                                        borderRadius:moderateScale(3)
                                    }}
                                >
                                    <Grid>
                                        <Row>
                                            <Col size={2} style={{backgroundColor:'#135AA8',justifyContent:'center',alignItems:'center'}}>
                                                <EvilIcons name="user" size={moderateScale(24)} color="white" />
                                            </Col>
                                            <Col size={10}>
                                            <Text
                                                numberOfLines={2}
                                                style={{
                                                    color: "#000705",
                                                    fontWeight: "bold",
                                                    textAlign: "center",
                                                    fontSize: moderateScale(12),
                                                    padding:moderateScale(4),
                                                }}
                                            >{this.state.sourcedesc}</Text>
                                            </Col>
                                        </Row>
                                    </Grid>
                                </View>
                                <Entypo name="location-pin" size={moderateScale(40)} color="#135AA8" />
                            </Marker>
                        :
                            <></>
                        }
                        { this.state.latitudedest != '' && this.state.longitudedest != '' ?
                            <Marker
                                tracksViewChanges={false}
                                key={'destinationkey'}
                                coordinate={{latitude:this.state.latitudedest, longitude:this.state.longitudedest}}       
                                style={{ alignItems: "center"}} 
                            >
                                <View
                                    style={{
                                        alignItems: "center",
                                        borderColor:'#135AA8',
                                        borderWidth:moderateScale(1),
                                        width:moderateScale(150),
                                        backgroundColor:'#fff',
                                        height: moderateScale(40),
                                        alignContent:'center',
                                        flex:1,
                                        flexDirection:'row',
                                        borderRadius:moderateScale(3)
                                    }}
                                >       
                                    <View  style={{alignItems: 'center',justifyContent:'center',width:'100%',padding:moderateScale(10)}}>
                                        <Text
                                            numberOfLines={2}
                                            style={{
                                                position: "absolute",
                                                color: "#000705",
                                                fontWeight: "bold",
                                                textAlign: "center",
                                                fontSize: moderateScale(12),
                                            }}
                                        >
                                            {this.state.destlocatdesc}
                                        </Text>
                                    </View>
                                </View>
                                <Entypo name="location-pin" size={moderateScale(40)} color="#910101" />
                            </Marker>
                        :
                            <></>
                        }
                        {Object.keys(this.state.multidest).length > 0?
                            this.state.multidest.map((item, index) => {
                                return (
                                    <Marker
                                        tracksViewChanges={false}
                                        key={'destinationkey-'+index}
                                        coordinate={{latitude:item.latitude, longitude:item.longitude}}       
                                        style={{ alignItems: "center"}} 
                                    > 
                                        <View
                                            style={{
                                                alignItems: "center",
                                                borderColor:'#135AA8',
                                                borderWidth:moderateScale(1),
                                                width:moderateScale(150),
                                                backgroundColor:'#fff',
                                                height: moderateScale(40),
                                                alignContent:'center',
                                                flex:1,
                                                flexDirection:'row',
                                                borderRadius:moderateScale(3)
                                            }}
                                        >
                                            <View  style={{alignItems: 'center',justifyContent:'center',width:'100%',padding:moderateScale(10)}}>
                                                <Text
                                                    numberOfLines={3}
                                                    style={{
                                                        position: "absolute",
                                                        color: "#000705",
                                                        fontWeight: "bold",
                                                        textAlign: "center",
                                                        fontSize: moderateScale(12),
                                                    }}
                                                >
                                                    {item.stopname}
                                                </Text>
                                            </View>
                                        </View>
                                        <Entypo name="location-pin" size={moderateScale(30)} color="green" />
                                    </Marker>
                                )
                            })
                        :
                            null
                        }
                        {Object.keys(this.state.origin).length > 0 && Object.keys(this.state.destination).length > 0 ?
                            <>
                                <MapViewDirections
                                    resetOnChange={false}
                                    region={'AU'}
                                    origin={this.state.driverLocation}
                                    destination={this.state.driverDestination}
                                    strokeWidth={13}
                                    lineDashPattern={[1]}
                                    strokeColor="black"
                                    apikey="AIzaSyAr2ESV30J7hFsOJ5Qjaa96u9ADSRX6_Sk"
                                    lineCap={'butt'}
                                    lineJoin={'miter'}
                                    mode={"DRIVING"}
                                    onReady={result => {
                                        this.setState({
                                            pickupTime: result.duration.toFixed(2),
                                            pickupDist: result.distance.toFixed(2)
                                        })
                                        //console.log('current destination',result)
                                        
                                    }}
                                />

                                <MapViewDirections
                                    region={'AU'}
                                    origin={this.state.origin}
                                    destination={this.state.destination}
                                    waypoints={ (Object.keys(this.state.multidest).length > 0 ) ? this.state.multidest : undefined}
                                    strokeWidth={13}
                                    lineDashPattern={[1]}
                                    strokeColor="#5588D9"
                                    apikey="AIzaSyAr2ESV30J7hFsOJ5Qjaa96u9ADSRX6_Sk"
                                    lineCap={'butt'}
                                    lineJoin={'miter'}
                                    mode={"DRIVING"}                            
                                    onReady={result => {
                                        let duration = result.duration.toFixed();
                                        let distance = result.distance;
                                        this.setState({
                                            duration:duration,
                                            distance:distance,
                                        },()=>{

                                            let mapCord = [
                                                {
                                                    latitude:this.state.driverLocation.latitude, 
                                                    longitude:this.state.driverLocation.longitude
                                                },
                                                {
                                                    latitude:this.state.latitudecur, 
                                                    longitude:this.state.longitudecur
                                                },
                                                {
                                                    latitude:this.state.latitudedest, 
                                                    longitude:this.state.longitudedest
                                                }
                                            ]
        
                                            //console.log('mapCord:',mapCord);
        
                                            this.mapView.fitToCoordinates(mapCord, {
                                              edgePadding: {
                                              right: (width / 20),
                                              bottom: (height / 20),
                                              left: (width / 20),
                                              top: (height / 20),
                                              },
                                              animated: false,
                                              });

                                            this.mapView.animateCamera({
                                                center:this.state.origin,
                                                heading: this.state.pathHeading,altitude: 100,zoom: 17,
                                            });
                                        });
                                    }}
                                />
                                
                            </>
                        :
                            <></>
                        }
                    </MapView>
                </View>
                {/* renderContent={(this.state.showEndTrip) ? this.renderEndContent : this.renderContent} */}
                { this.state.display ?
                    <BottomSheet
                        ref={this.bottomSheetRef}
                        snapPoints={[240, 130, 0]}
                        renderContent={this.renderContent}
                        overdragResistanceFactor={0}
                        enabledManualSnapping={false}
                        enabledContentTapInteraction={false}
                        enabledContentGestureInteraction={true}
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
                    visible={this.state.modalvisible}
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
                {this.state.sendMessage?
                    <SendMessage 
                        sender={this.state.driverId} 
                        receiver={{
                            rider_name:this.state.bookrequest.rider_name,
                            rider_id:this.state.bookrequest.rider_id
                        }}
                        handlerCallMessage = {this.handlerCallMessage}
                        messageType='message'
						buttonText='Send' />
                :
                    null
                }
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
});