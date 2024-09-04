import React, {Component} from "react";
import { StyleSheet, Text, View,Dimensions,Image , TouchableOpacity,TouchableHighlight, Alert,Linking, BackHandler, Animated, AppState} from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import MapView , { Marker, AnimatedRegion}from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';
import { Divider } from 'react-native-elements';
import { Col, Row, Grid } from "react-native-easy-grid";
import { Entypo,Feather,AntDesign,Ionicons,EvilIcons } from '@expo/vector-icons'; 
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { DOMAIN, PUSHER_API} from './Constant';
import BottomSheet from 'reanimated-bottom-sheet';
import Modal from 'react-native-modal';
import TopBar from './TopBar';
import DriverRating from './DriverRating';
import * as TaskManager from 'expo-task-manager';
import Geolocation from 'react-native-geolocation-service';
import { getPermission } from './getLocation';
import Pusher from 'pusher-js/react-native';

import * as firebase from "firebase";
//import "firebase/firestore";
//import { firebase } from '@react-native-firebase/app';

import firestore from '@react-native-firebase/firestore';
import * as geofirestore from 'geofirestore';
import apiKeys from './config/keys';
import { moderateScale } from "react-native-size-matters";

import * as geolib from 'geolib';

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

if (!firebase.apps.length) {
    firebase.initializeApp(apiKeys.firebaseConfig);
}

const db = firestore();
const GeoFirestore = geofirestore.initializeApp(db);
const geocollection = GeoFirestore.collection('driver_locations');
const TASK_FETCH_LOCATION = 'TASK_FETCH_LOCATION';
const TASK_GEO_FENCING = 'TASK_GEO_FENCING';
const LOCATION_TASK_NAME = 'background-location-task';
let callonce = true

TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
    if (error) {
        console.log('error',error);
        return;
    }
    if (data) {
        //console.log('hello background');                
        const { locations } = data;
        //let data = JSON.stringify(locations)
        //let coord = {latitude:data[0].coords.latitude,longitude:data[0].coords.longitude}
        const [location] = locations;
        console.log('background location',location);
        //this.updateDriverCoordinates(location)
        //lat is locations[0].coords.latitude & long is locations[0].coords.longitude
        AsyncStorage.getItem('driverId').then((value) => {
            //console.log('driverId',value);
            geocollection
            .doc(value)
            .update({
                coordinates: new firestore.GeoPoint(location.coords.latitude, location.coords.longitude),
                updated_at: firestore.FieldValue.serverTimestamp(),
                heading:location.coords.heading,
            })
        })

        
        //let destination_lng = AsyncStorage.getItem('destination_lng')
        //console.log('destination_lng',destination_lng);
        let destination_lng, destination_lat;
        AsyncStorage.getItem('destination_lat').then((value) => {
            //console.log('destination_lng',value);
            destination_lat = value;
            //console.log('destination',destination_lng);
            AsyncStorage.getItem('destination_lng').then((val) => {
                destination_lng = val;
                let inRadius = geolib.isPointWithinRadius(
                    { latitude: location.coords.latitude, longitude: location.coords.longitude },
                    { latitude: destination_lat, longitude: destination_lng },
                    10
                );

                console.log('inRadius',inRadius);
                console.log('app state',AppState.currentState);
                if(inRadius && AppState.currentState === 'background' && callonce){
                    callonce = false;
                    Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
                    //alert('You arive')
                    //Linking.openURL('com.turvy.turvydriver://')
                    
                } 
            })
        })
    }
});



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
            latitudeDelta: 0.007683038072176629,
            longitudeDelta: 0.004163794219493866,
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
            book_id:this.props.route.params.bookId,
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
    
    async componentDidMount() {

        Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME).then((value) => {
            console.log('componentDidMount task_value',value)
            if (value) {
                Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
            }
        });
        this.intialLoad();
        
        this.props.navigation.addListener('gestureEnd', this.onBackPress);
        BackHandler.addEventListener('hardwareBackPress', this.onBackPress);

        AppState.addEventListener('change', this._handleAppStateChange);


        
        AsyncStorage.setItem('running_book_id', JSON.stringify(this.state.book_id));
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
        const name =  await  AsyncStorage.getItem('name');

        await AsyncStorage.getItem('driverId').then((value) => {
            if(value != '' && value !== null){
                this.setState({driverId: value},()=>{
                    db.collection('driver_locations')
                    .doc(this.state.driverId)
                    .get()
                    .then((docRef) => {
                        if(docRef.data().isBusy == 'yes'){
                            this.setState({showEndTrip: true})        
                        }
                    })
                })
            }
        })

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

        var pusher1 = new Pusher(PUSHER_API.APP_KEY, {
          cluster: PUSHER_API.APP_CLUSTER
        });
        var channel1 = pusher1.subscribe('turvy-channel');
        channel1.bind('rider_cancel_booking_event', this.isRideCancelByRider);

        //var channel1 = pusher1.subscribe('turvy-channel');
        //channel1.bind('book_tip_event', this.isRideTipToDriver);

        let region = {
            identifier:1, 
            latitude:this.state.origin.latitude, 
            longitude:this.state.origin.longitude, 
            radius:100
        }

        Location.startGeofencingAsync("TASK_GEO_FENCING", [region])
        TaskManager.defineTask("TASK_GEO_FENCING", ({ data: { eventType, region }, error }) => {
            if (error) {
                return;
            }
            if (eventType === Location.GeofencingEventType.Enter) {
                console.log("You've entered region:", region);
            } else if (eventType === Location.GeofencingEventType.Exit) {
                console.log("You've left region:", region);
                if(!this.state.departed){
                    this._onPressDepart()
                }
            }
        });
    }

    isRideTipToDriver = async (data) => {
        //console.log('tipData',data)
        if(data.book_id === this.state.book_id){
            //Alert.alert("Congrats!", "You got $30 tip from rider");
            Alert.alert("Congrats!", `You got A$${data.amount} tip from rider`, [
                {
                  text: "OK",
                  onPress: () => null,
                  style: "cancel"
                }
            ]);
        }
        
    }

    _handleAppStateChange = async (nextAppState) => {
        console.log('appState',this.state.appState,nextAppState)

        if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
            console.log('App has come to the foreground!');
            // 3 when you're done, stop it
            Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME).then((value) => {
                console.log('task_value',value)
                if (value) {
                    Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
                }
            }); 
        }else{
            console.log('App has come to the background!');
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

    updateDriverCoordinates = async (pos) => {
        const newCoordinate = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            latitudeDelta: this.state.latitudeDelta,
            longitudeDelta: this.state.longitudeDelta,
        };

        this.state.driverCoordinate.timing({ ...newCoordinate, useNativeDriver: true,duration: 2000 }).start();
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
            db.collection("trip_path")
            .doc(JSON.stringify(this.state.bookrequest.id))
            .update({
                location: firestore.FieldValue.arrayUnion(new firestore.GeoPoint(pos.coords.latitude, pos.coords.longitude))
            })
            .then(() => {
                console.log('Loc updated DEparted!');
            });
        }
    }

    

    onBackPress () {
        return true;
    }

    isRideCancelByRider = async (data) => {
        let bookId = this.state.bookrequest.id;
        if(data.book_id === bookId){
            this.setState({riderCancel:true})
            AsyncStorage.removeItem('running_book_id');
            this.alertTone();
        }
    }

    alertTone = async () => {
        const { sound: playbackObject} =  await Audio.Sound.createAsync(
            require('../assets/Text_message_alert.mp3'),
            {}
        );
        await playbackObject.playAsync();
        playbackObject.setIsLoopingAsync(true);
        setTimeout(()=>{
            playbackObject.stopAsync(false);
            this.props.navigation.replace('MapViewFirst')
        }, 5000);
    }

    openDialScreen (){
        let number = this.state.bookrequest.rider_mobile;
        if (Platform.OS === 'ios') {
            number = `telprompt:${number}`;
        } else {
            number = `tel:${number}`;
        }
        Linking.openURL(number);
    }

    _startNevigation = async (destCords, callFor) => {
        clearTimeout(this.intervalCancel);

        

        let dest = `${destCords.latitude},${destCords.longitude}`;
        if(Object.keys(this.state.multidest).length > 0 && callFor == 'destination'){
            dest = this.state.multidest.map(value => `${value.latitude},${value.longitude}`)
            .join('+to:')
            dest = `${dest}+to:${destCords.latitude},${destCords.longitude}`
        }
        let mapurl = `https://maps.google.com/?daddr=${dest}&dirflg=d&nav=1`;
        Linking.canOpenURL(mapurl)
        .then(res => {
            Linking.openURL(mapurl)
                .then(result => {
                    //console.log('Nav result: ',result)
                }).catch(err => { console.log('Cannot link app!!!'); })
        }).catch(err => {
            console.log(err)
        })
    }

    _onPressDepart(){
        clearTimeout(this.intervalCancel);
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
            Location.stopGeofencingAsync(TASK_GEO_FENCING)
        }
    }

    async _onPressTripEnd(){
        clearTimeout(this.intervalCancel);
        AsyncStorage.removeItem('running_book_id');
        //Location.stopLocationUpdatesAsync(TASK_FETCH_LOCATION);
        let location={};
        try{
            location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        } catch(e){
            location = await Location.getLastKnownPositionAsync({ accuracy: Location.Accuracy.High });
        }

        db.collection("driver_locations")
        .doc(this.state.driverId)
        .update({
            isBusy: 'no',
            updated_at: firestore.FieldValue.serverTimestamp(),
            coordinates: new firestore.GeoPoint(location.coords.latitude, location.coords.longitude),
        })

        db.collection("trip_path")
        .doc(JSON.stringify(this.state.bookrequest.id))
        .update({
            location: firestore.FieldValue.arrayUnion(new firestore.GeoPoint(location.coords.latitude, location.coords.longitude)),
            updated_at: firestore.FieldValue.serverTimestamp(),
            status:'close',
            distance: this.state.distance+' Km',
            trip_time: this.state.duration+' min',
        })
        .then(() => {
            this.setState({
                tripEndDone:true,
                departed:false,
                display:false,
            },() => {
                db.collection('trip_path')
                .doc(JSON.stringify(this.state.bookrequest.id))
                .get()
                .then((docRef) => {
                    let bookId = this.state.bookrequest.id;
                    fetch(DOMAIN+'api/driver/book/'+bookId+'/end',{
                        method: 'POST',
                        headers : {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'Authorization': 'Bearer '+this.state.accessTokan
                        },
                        body: JSON.stringify({
                            "travel_path" : JSON.stringify(docRef.data().location),
                            "trip_distance" : this.state.distance,
                            "trip_duration" : this.state.duration,
                            "rider_id" : this.state.bookrequest.rider_id
                        })
                    }).then(function (response) {
                        return response.json();
                    }).then( (result)=> {
                        console.log('earning12:',result)
                    })
                })
                .catch((error) => { 
                    console.log('fireError:',error)
                })
            })
        });
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

    renderContent = () => (
        <>
            <View
                style={{
                    backgroundColor: 'white',
                    padding: moderateScale(10),
                    height: '100%',
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
                    <Row style={{height:150, alignItems:'center',justifyContent:'center'}}>
                        <Col size={9}>
                            <Row style={{height:moderateScale(73),justifyContent:'center',alignSelf:'center',marginVertical:5}}>
                                <Col size={4} style={{margin:moderateScale(8),height:moderateScale(52)}}>
                                    <View style={{flex:1,backgroundColor:'#62CD32',alignItems:'center',justifyContent:'center',borderRadius:moderateScale(5),width:75,}} >
                                        <TouchableOpacity onPress={() => this.openDialScreen()}>
                                            <Feather name="phone-call" size={moderateScale(16)} color="white" />
                                            <Text style={{color:'#fff'}}>Call</Text>
                                        </TouchableOpacity>
                                    </View>
                                </Col>
                                <Col size={4} style={{margin:moderateScale(8),height:55,alignItems:'center'}}>
                                    <View style={{flex:1,backgroundColor:'#135AA8',alignItems:'center',justifyContent:'center',borderRadius:moderateScale(5),width:75}}>
                                        <AntDesign name="message1" size={moderateScale(18)} color="white" />
                                        <Text style={{color:'#fff'}}>Message</Text>
                                    </View>
                                </Col>
                                <Col size={4} style={{margin:moderateScale(8),height:55,alignItems:'flex-end'}}>
                                    <View style={{flex:1,backgroundColor:'#E8202A',alignItems:'center',justifyContent:'center',borderRadius:moderateScale(5),width:75}}>
                                        <TouchableOpacity onPress={() => this.cancelTripAlert()} style={{alignItems:'center',justifyContent:'center'}}>
                                            <AntDesign name="closecircleo" size={moderateScale(18)} color="white" />
                                            <Text style={{color:'#fff'}}>Cancel</Text>
                                        </TouchableOpacity>
                                    </View>
                                </Col>
                            </Row>
                            <Row style={{height:moderateScale(50),paddingBottom:moderateScale(10),alignItems:'center',justifyContent:'center'}}>
                                <Col style={{justifyContent:'center',width:moderateScale(180),alignItems:'center'}}>
                                    <Button mode="contained" color={'#155aa8'} style={{fontWeight:'normal'}} labelStyle={{fontSize:12,alignItems:'center',justifyContent:'center'}} onPress={() => this._onPressDepart()}>
                                        Tap when departed
                                    </Button>
                                </Col>
                            </Row>
                        </Col>
                        <Col size={3}>
                            <Row style={{height:moderateScale(40),alignItems:'center',justifyContent:'center'}} >
                                <Col style={{width:moderateScale(180),alignItems:'center'}}>
                                    <TouchableOpacity onPress={() => this._startNevigation(this.state.origin, 'pickup')}>
                                        <Image
                                        style={{width:moderateScale(80),height:moderateScale(85)}}
                                        source={require('../assets/Navigate-pickup.png')}
                                    />
                                    </TouchableOpacity>
                                    
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

    renderEndContent = () => (
        <>
            <View
                style={{
                    backgroundColor: 'white',
                    padding: moderateScale(10),
                    height: '100%',
                    margin:moderateScale(10),
                    elevation: 4,
                    borderRadius:moderateScale(10),
                }}
            >    
                <Grid >
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
                    <Row style={{height:150,alignItems:'center',justifyContent:'center'}}>
                        <Col size={9}>
                            <Row style={{height:moderateScale(60),paddingTop:moderateScale(15),paddingBottom:moderateScale(15),alignItems:'center',justifyContent:'center'}}>
                                <Col style={{justifyContent:'center',alignContent:'center',width:moderateScale(210)}}>
                                    <Button mode="contained" color={'#dc3545'} style={{fontWeight:'normal'}} onPress={() => this._onPressTripEnd()}>
                                        Tap when Trip End
                                    </Button>
                                </Col>
                            </Row>
                        </Col>
                        <Col size={3}>
                            <Row style={{height:moderateScale(60),alignItems:'center',justifyContent:'center'}}>
                                <Col>
                                    <TouchableOpacity onPress={() => this._startNevigation(this.state.destination, 'destination')}>
                                        <Image
                                        style={{width:moderateScale(80),height:moderateScale(85)}}
                                        source={require('../assets/Nav_Dest.png')}
                                    />
                                    </TouchableOpacity>
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
        return (
            <>
                <TopBar />
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
                        onPress={ (e) => {
                            this.setState({
                                snapIndex: this.state.snapIndex ? 0 : 1
                            },() => {
                                this.bottomSheetRef.current.snapTo(this.state.snapIndex)
                            })
                        }}
                        customMapStyle={stylesArray}
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
                                    region={'AU'}
                                    origin={this.state.origin}
                                    destination={this.state.destination}
                                    waypoints={ (Object.keys(this.state.multidest).length > 0 ) ? this.state.multidest : undefined}
                                    strokeWidth={5}
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
                                            this.mapView.animateCamera({
                                                center:this.state.origin,
                                                heading: this.state.pathHeading,
                                            });
                                        });
                                    }}
                                />
                                <MapViewDirections
                                    resetOnChange={false}
                                    region={'AU'}
                                    origin={this.state.driverLocation}
                                    destination={this.state.driverDestination}
                                    strokeWidth={5}
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
                                    }}
                                />
                            </>
                        :
                            <></>
                        }
                    </MapView>
                </View>
                { this.state.display ?
                    <BottomSheet
                        ref={this.bottomSheetRef}
                        snapPoints={[350, 110, 0]}
                        borderRadius={moderateScale(20)}
                        renderContent={(this.state.showEndTrip) ? this.renderEndContent : this.renderContent}
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
                    animationIn="zoomInDown"
                    animationOut="zoomOutDown"
                    animationInTiming={600}
                    animationOutTiming={400}                    
                >
                    <View style={{backgroundColor:'#FFF',height:moderateScale(200),borderRadius:moderateScale(5)}}>
                        <Row style={{height:moderateScale(70)}}>
                            <Col style={{alignItems:'flex-start',justifyContent:'center',marginHorizontal:moderateScale(20)}}>
                                <Text style={{fontSize:moderateScale(20)}}>Hold On!</Text>
                            </Col>
                        </Row>
                        <Divider orientation="vertical"  />
                        <Row style={{height:moderateScale(70)}}>
                            <Col style={{alignItems:'flex-start',justifyContent:'center',marginHorizontal:moderateScale(20)}}>
                                <Text style={{fontSize:moderateScale(16)}}>Unfortunately Rider Cancel this trip! </Text>
                            </Col>
                        </Row>
                    </View>
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
});
