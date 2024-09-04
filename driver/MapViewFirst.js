import { StatusBar } from 'expo-status-bar';
import debounce from 'lodash.debounce';
import React from "react";
import { 
    StyleSheet, 
    Text, 
    View,
    Dimensions,
    Image ,
    TouchableOpacity,
    Animated,
    DeviceEventEmitter,
    Appearance,
    Alert
} from 'react-native';

import { Provider as PaperProvider, TextInput, Appbar, Title, Paragraph, Button, Card, TouchableRipple } from 'react-native-paper';
//import * as Permissions from 'expo-permissions';
//import MapView , { Marker, Circle, AnimatedRegion}from 'react-native-maps';
import {
  ProviderPropType,
  Circle,
  Marker,
  AnimatedRegion,
} from 'react-native-maps';
import * as Location from 'expo-location';

import { EvilIcons, Entypo } from '@expo/vector-icons'; 

//import Animated from 'react-native-reanimated';

import { Col, Row, Grid } from "react-native-easy-grid";
import { FontAwesome ,FontAwesome5,Ionicons } from '@expo/vector-icons'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
import FlashMessage , { showMessage, hideMessage }  from "react-native-flash-message";
import Modal from 'react-native-modal';
import Spinner from 'react-native-loading-spinner-overlay';

import {styles,theme, DOMAIN, changeMode, MapboxCustomURL, debug } from './Constant'

import firestore from '@react-native-firebase/firestore';


import TopBar from './TopBar'


import * as firebase from "firebase";
import "firebase/firestore";
import * as geofirestore from 'geofirestore';

import apiKeys from './config/keys';
import * as geolib from 'geolib';
if (!firebase.apps.length) {
    //console.log('Connected with Firebase')
    firebase.initializeApp(apiKeys.firebaseConfig);
}

const origin = {latitude: -34.07465730, longitude: 151.01108000};
const destination = {latitude:  -34.07465730, longitude: 151.01108000};

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0043;

const db = firestore();
//const firestore = firebase.firestore();
const GeoFirestore = geofirestore.initializeApp(db);
const geocollection = GeoFirestore.collection('driver_locations');

import Geolocation from 'react-native-geolocation-service';

import  MapboxGL, { MapView, Camera, UserLocation } from '@react-native-mapbox-gl/maps';

export default class MapViewFirst extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            step:1,
            locationcur:{},
            radius:40,
            sourceLocation:{},
            latitudecur:-34.07465730,
            longitudecur:151.01108000,
            curlocatdesc:'',
            latitudeDelta: 0.0943,
            longitudeDelta: 0.0943,
            origin:{},
            destination:{},
            pickup:'',
            destinationto:'',
            stateText:'',
            results:{},
            forsourdest:'source',
            snaptoval:['80%', '40%', '40%'],
            isDriOnline:false,
            accessTokan:'',
            driverId: '',
            bookrequest:{},
            fetchnewrequest:true,
            FindingTripLable:false,
            isSlideMin:true,
            isModalVisible:false,
            timer:'',
            spinner:false,
            driverServices:'',
            driverName:'',
            isDriverApproved:1,
            driverCoordinate: new AnimatedRegion({
                latitude: -34.07465730,
                longitude: 151.01108000,
                latitudeDelta: 0.0943,
                longitudeDelta: 0.0943,
            }),
            angle:0,
            rotateValue: new Animated.Value(0),
            inAirport: false,
            quePosition:0,
            open_services:'',
            coordinates: [151.01108000, -34.07465730],
            MapboxStyleURL:MapboxCustomURL,
            zoomLevel:15,
            polyShape: {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'Polygon',
                        "coordinates": []
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
            airportCords:{}
        };
        this.myRefbt = React.createRef();

        //this.onBackPress = this.onBackPress.bind(this);
    }

    async checkDriverOnline(){
        if(this.state.driverId){
            const driverRef = db.collection('driver_locations')
            .doc(this.state.driverId)
            .get()
            .then((docRef) => {
                //console.log('TripData===============:',docRef.data()) 
                if(docRef.data()){
                    AsyncStorage.setItem('isOnline', 'true');
                    this.setState({isDriOnline:true})     
                }else{
                    AsyncStorage.setItem('isOnline', 'false');                    
                }
            })
        }
    }
   
    async componentDidMount() {
        
        /*this.props.navigation.addListener('gestureEnd', this.onBackPress);
        BackHandler.addEventListener('hardwareBackPress', this.onBackPress);*/

        /*AsyncStorage.getItem('running_book_id').then((value) => {
            if(value != '' && value !== null){
                this.props.navigation.replace('BookingMap',{bookId:parseInt(value)})
            }
        })*/
        this.getAirportsCoordsOnline()
        //console.log('Appearance mode============>', Appearance.getColorScheme())
        this.setState({
            MapboxStyleURL:changeMode()
        })

        this.intervalModeChange = setInterval(async () => {
            this.setState({
                MapboxStyleURL:changeMode()
            })
        }, 10000);

        DeviceEventEmitter.addListener('timer', this.clearTimer.bind(this));
        DeviceEventEmitter.addListener('timer', this.clearFBTimer.bind(this));

        await AsyncStorage.getItem('accesstoken').then((value) => {           
            
            if(value != '' && value !== null){
                this.setState({
                    accessTokan:value
                });

                fetch(DOMAIN+'api/driver/profile',{
                    method: 'GET',
                    headers : {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': 'Bearer '+value
                    }
                }).then(function (response) {
                    return response.json();
                }).then( (res)=> {                
                    //console.log('driver profile',res)
                    this.setState({
                        isDriverApproved:res.data.is_approved
                    })
                })   

            }
        })

        await AsyncStorage.getItem('driverId').then((value) => {           
            if(value != '' && value !== null){
                this.setState({driverId:value})
            }
        })
        await AsyncStorage.getItem('name').then((value) => {           
            if(value != '' && value !== null){
                this.setState({driverName:value})
                //alert(value)
            }
        })  
        
        await AsyncStorage.getItem('inAirport').then((value) => {           
            if(value != '' && value !== null){
                this.setState({
                    inAirport: true
                })
            }else{
                this.setState({
                    inAirport: false
                })   
            }
        })

        await AsyncStorage.getItem('queuePosition').then((value) => {           
            if(value != '' && value !== null){
                this.setState({quePosition:JSON.parse(value)})
                //alert(value)
            }
        })

        

        //alert(this.state.inAirport)

        await this.checkDriverOnline();
        this.updateisBusy = setTimeout(() => {     
            this.updateFirbaseDriver();
        }, 1000);
        
        /*if(this.state.isDriOnline){
            setInterval(() => {
                if(this.state.FindingTripLable){
                    this.setState({
                        FindingTripLable: false,
                    })    
                }else{
                    this.setState({
                        FindingTripLable: true,
                    })    
                }
            }, 5000);
        }*/

        this.getDriverServices();

        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            //console.log('Permission to access location was denied');
            return;
        }

        await Location.requestBackgroundPermissionsAsync();

        Geolocation.getCurrentPosition(
            (currntPos) => {
                //console.log('currntPos', currntPos);
                const origin = {
                    latitude: currntPos.coords.latitude, 
                    longitude: currntPos.coords.longitude
                } 
              
                this.setState({
                    locationcur:currntPos,
                    latitudecur:currntPos.coords.latitude,
                    longitudecur:currntPos.coords.longitude,        	
                    origin:origin,   
                    coordinates: [currntPos.coords.longitude, currntPos.coords.latitude], 
                    driverCoordinate: new AnimatedRegion({
                        latitude: currntPos.coords.latitude,
                        longitude: currntPos.coords.longitude,
                        latitudeDelta: this.state.latitudeDelta,
                        longitudeDelta: this.state.longitudeDelta,
                    })        
                });
                
            },
            (error) => {
                //console.error(error.code, error.message);
                Alert.alert("Location request timed out", "We are not able to get your location, Please check location service is on or reboot your phone.", [
                    {
                      text: "Ok",
                      onPress: () => null,
                      style: "cancel"
                    },
                    
                ]);
            },
            { forceRequestLocation: true, distanceFilter:0, enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        )
        
        /* let location={};
        try{
            location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
        } catch(e){
            //console.log('Lc error:',e)
            location = await Location.getLastKnownPositionAsync({ accuracy: Location.Accuracy.Low });
        } */

        
        Geolocation.watchPosition((pos) => {
            const { driverCoordinate, quePosition } = this.state;
            const newCoordinate = {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                latitudeDelta: this.state.latitudeDelta,
                longitudeDelta: this.state.longitudeDelta,
            };

            if (this.marker) {
                //console.log(newCoordinate)
                //this.marker.animateMarkerToCoordinate(newCoordinate, 500);
                driverCoordinate.timing({ ...newCoordinate, useNativeDriver: true, duration: 12000 }).start();

            }


            this.setState({
                latitudecur: pos.coords.latitude,
                longitudecur: pos.coords.longitude,
                angle:pos.coords.heading,
                coordinates: [pos.coords.longitude, pos.coords.latitude],
            },()=>{
                let rotateAngl = 0;
                rotateAngl = (this.state.angle/360);
                if(rotateAngl > 0.5){
                    rotateAngl = rotateAngl - 1
                }
                //console.log('rotateAngl',rotateAngl)
                Animated.timing(this.state.rotateValue, {
                    toValue: rotateAngl,
                    duration: 2000,
                    useNativeDriver: true,
                }).start();

                if(this.camera){
                    this.camera.setCamera({
                        centerCoordinate: this.state.coordinates,
                        animationDuration: 6000,
                        pitch:50
                    })
                }
            })

            

            //if(quePosition > 0){
                this._getQueuePos()
            //}

        },
        (error) => {
            //console.log(error.code, error.message);
        },
        { accuracy:Platform.OS == 'android'?'high':'best', distanceFilter:2, interval:2000, fastestInterval:1000, enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );

        /* let locations = await Location.watchPositionAsync({ accuracy: Location.Accuracy.Low, timeInterval: 10000, distanceInterval: 20 }, (pos) => {
            //console.log('cords:',pos.coords)

        }) */
        //

        //  console.log(latitudeDelta);
        // console.log(longitudeDelta);

        
        //console.log(origin);

        

        this._checkDrivingTime()
        
    }

    /* componentDidUpdate = () => {
        
        //console.log('componentDidUpdate=======')
        AsyncStorage.getItem('queuePosition').then((value) => {           
            if(value != '' && value !== null){
                this.setState({quePosition:JSON.parse(value)})
            }
        })
        
    } */

    updateFirbaseDriver = () => {
        if(this.state.isDriOnline){
            //console.log('isDriOnline==========',this.state.isDriOnline);
            geocollection
            .doc(this.state.driverId)
            .update({
                isBusy: 'no',
            })
        }
    }

    componentWillUnmount = () => {
        this.clearTimer()
        this.clearFBTimer()
        //NativeEventEmitter.addListener('timer', this.clearTimer.bind(this));
    }

    _getQueuePos = async () => {

        AsyncStorage.getItem('queuePosition').then((value) => {           
            if(value != '' && value !== null){
                this.setState({quePosition:JSON.parse(value)})
            }
        })

        await AsyncStorage.getItem('accesstoken').then((value) => {
            fetch(DOMAIN+'api/driver/quepos',{
                method: 'GET',
                headers : {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': 'Bearer '+value
                }
            }).then(function (response) {
                return response.json();
            }).then( (res)=> {
                //console.log('queue position:',res.data);
                if(res.data > 0){
                    AsyncStorage.setItem('queuePosition', JSON.stringify(res.data));
                    this.setState({
                        quePosition:res.data
                    })
                }else{
                    AsyncStorage.setItem('queuePosition', '0');
                    this.setState({
                        quePosition:0
                    })
                }
            })
        })
    }

    clearTimer = () => {
        // Handle an undefined timer rather than null
        this.offtime !== undefined ? clearTimeout(this.offtime) : null;
        this.intervalModeChange !== undefined ? clearTimeout(this.intervalModeChange) : null;
    }

    clearFBTimer = () => {
        this.updateisBusy !== undefined ? clearTimeout(this.updateisBusy) : null;
    }

    _checkDrivingTime = async () => {

        await AsyncStorage.getItem('accesstoken').then((value) => {
            fetch(DOMAIN+'api/driver/avialableDrivingTime',{
                method: 'GET',
                headers : {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': 'Bearer '+value
                }
            }).then(function (response) {
                return response.json();
            }).then( (res)=> {
                //console.log('avialableDrivingTime online:',res.data);
                
                if(res.data.driving_time <= 0){
                    this._driverAutoOffline()
                }else{
                    AsyncStorage.getItem('running_book_id').then((value) => {
                        //console.log('running_book_id', value)
                        if(value != '' && value !== null){
                            this.clearTimer();
                        }else{
                            this.offtime = setTimeout(() => {                
                                this._checkDrivingTime();
                            }, 60000);
                        }
                    })
                }
            });
        });
    }

    _driverAutoOffline = async () => {
        this.clearTimer()
        await AsyncStorage.getItem('driverId').then((value) => {
            if(value != '' && value !== null){
                db.collection("driver_locations")
                .doc(value)
                .delete()
            }
        })
        await fetch(DOMAIN+'api/driver/offline',{
            method: 'GET',
            headers : {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer '+this.state.accessTokan
            }
        }).then(function (response) {
            return response.json();
        }).then( (result)=> {
            AsyncStorage.setItem('isOnline', 'false');
            AsyncStorage.removeItem('driver_timeout');
            this.props.navigation.replace('MapViewOffline');
        })
    }

    getDriverServices = async () => {
        //console.log('driver',this.state.driverId)
        fetch(DOMAIN+'api/driver/vehicle-details',{
            method: 'GET',
            headers : {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer '+this.state.accessTokan
            }
        }).then(function (response) {
            return response.json();
        }).then( (result)=> {
            //console.log('servicetype_id',result.data);
            this.setState({
                driverServices:result.data.servicetype_id,
                open_services: result.data.open_serviceName
            })
        })
    }

    onBackPress () {
        /*Alert.alert("Hold on!", "Are you sure you want to exit app?", [
            {
              text: "Cancel",
              onPress: () => null,
              style: "cancel"
            },
            { text: "YES", onPress: () => BackHandler.exitApp() }
        ]);*/
        return true;
    }

    onRegionChangeComplete = (region) => {
        //console.log('onRegionChangeComplete============================>', region.properties.zoomLevel);
        //this.camera.zoomTo(region.properties.zoomLevel)
        /* this.setState({
            zoomLevel:region.properties.zoomLevel
        }) */

        
    };

    getAirportsCoordsOnline = async () => {
        //console.log(this.state.accessTokan)
        fetch(DOMAIN+'api/airport_polygon',{
            method: 'GET',
            headers : {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer '+this.state.accessTokan
            }
        }).then(function (response) {
            return response.json();
        }).then( (result)=> {
            //console.log('airport coords===========>',debug(result.data[3]), result.data[3].coords.length);

            this.setState({
                airportCords:result.data
            })

            
        })
    }

    createPolygon = () => {
        const {airportCords} = this.state
        let children = []
        if(airportCords.length > 0){
            for(let k=0; k < airportCords.length; k++){
                var i
                var cordArr = []
                for(i=0;i< airportCords[k].coords.length; i++){
                    cordArr[i] = [Number(airportCords[k].coords[i].longitude), Number(airportCords[k].coords[i].latitude)]
                }
                //console.log(' coords Array shape===========>',debug(cordArr));
                var polyShape;
                let shapkey = "mapbox-polygon-source-"+k
                let fillkey = "mapbox-polygon-fill-"+k
                polyShape = {
                    type: 'FeatureCollection',
                    features: [{
                        type: 'Feature',
                        properties: {},
                        geometry: {
                            type: 'Polygon',
                            "coordinates": [cordArr]
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
                }
                children.push(
                    <MapboxGL.ShapeSource  id={shapkey} shape={polyShape}>
                        <MapboxGL.FillLayer
                            id={fillkey}
                            style={{fillColor:'red',fillOutlineColor:'#000',fillOpacity:.3}}
                            />
                    </MapboxGL.ShapeSource>
                )
            }
        }
        //console.log(' coords Array children===========>',children);
        return children
    }

    
  
    render() { 
        
        return (
            <>
                
                <Spinner
                    visible={this.state.spinner}
                    color='#FFF'
                    overlayColor='rgba(0, 0, 0, 0.5)'
                />
                <TopBar />
                        
                

                <MapboxGL.MapView
					ref={(c) => (this._map = c)}
					onPress={this.onPress}
					onDidFinishLoadingMap={this.onDidFinishLoadingMap}
					style={{flex:1}}
					styleURL={this.state.MapboxStyleURL}
                    compassViewPosition={3}
				>
					<Camera 
                        zoomLevel={this.state.zoomLevel} 
                        pitch={50} 
                        centerCoordinate={this.state.coordinates}
                        ref={(c) => (this.camera = c)}
                    />

					<UserLocation renderMode={'native'} androidRenderMode={'gps'} visible={true} showsUserHeadingIndicator={true} />
                     {this.createPolygon()}
					
				</MapboxGL.MapView>
                {
                    this.state.quePosition > 0 &&
                    <TouchableOpacity 
                        onPress={() => this.props.navigation.navigate('QueueList')}
                        style={{position:'absolute',backgroundColor:'#FFF',right:20,bottom:80,width:40,height:40,borderRadius:30,alignItems:'center',justifyContent:'center',elevation:5}}>
                        <Ionicons name="airplane" size={25} color="#135aa8" style={{transform: [{rotate: '270deg'}]}} />
                    </TouchableOpacity> 
                }
                <View style={[pageStyles.tripTab,{backgroundColor:'#fff',width:'100%',paddingHorizontal:20,borderRadius:5,height:65}]}>
                    <View style={[pageStyles.tripTabChild,{alignItems:'flex-start',flex:1}]}>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('DriverPreferences')}>
                            <Image
                                style={{width:25,height:25,}}
                                source={require('../assets/swapIcon.png')}
                            />  
                        </TouchableOpacity>
                    </View>                            
                    <TouchableOpacity 
                        style={[pageStyles.tripTabChild,{alignItems:'center',flex:4}]}
                        onPress={() => this.props.navigation.navigate('TripPlaner')}
                    > 
                        {
                            
                            !this.state.quePosition
                            ?
                            <Text style={{fontSize:18}}>You're Online</Text>
                            :
                            <View style={{width:'100%',alignItems:'center'}}>
                                <Text>You are</Text>
                                <View style={{flexDirection:'row',alignItems:'center',justifyContent:'center'}}>
                                    <View style={{flex:1,alignItems:'flex-end'}}>
                                        <Text style={{fontWeight:'bold',fontSize:16}}>{this.state.open_services}</Text>
                                    </View>

                                    <View style={{flex:1,alignItems:'center'}}>
                                        <Text style={{backgroundColor:'#135aa8',paddingHorizontal:15,borderRadius:5,color:'#FFF'}}>{this.state.quePosition}</Text>
                                    </View>

                                    <View style={{flex:1,alignItems:'flex-start'}}>
                                        <Text style={{fontWeight:'bold',fontSize:16}}>ahead</Text>
                                    </View>
                                </View>
                                <Text style={{fontSize:16}}>Waiting in queue</Text>
                            </View>
                        }
                        

                    </TouchableOpacity>
                    <View style={[pageStyles.tripTabChild,{alignItems:'flex-end',flex:1}]}>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('Recommended',{screen:'online'})}>
                        <AntDesign name="bars" size={25} color="#135aa8"  />
                        </TouchableOpacity>
                    </View>
                </View> 
                              
            </>
        );
    }
}


const stylesLocal = StyleSheet.create({    
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    map: {
        flex:1,
        width:width,
        height:height,        
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
    yellow:{color:'#fec557',fontSize:20,marginVertical:4},
    btnSmall:{
        backgroundColor:'#3f78ba',
        borderWidth:3,
        borderColor:'#FFF',        
        elevation: 10,
        borderRadius:5,
        },        
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
        width:50,
        height:50,
    }


});

const pageStyles = StyleSheet.create({
    tripTab:{       
        flexDirection:'row'
    },
    tripTabChild:{
        
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
    sliderMargin:{
        marginLeft:-15,
        marginRight:-15,
        backgroundColor:'#DDD',        
    }

})
