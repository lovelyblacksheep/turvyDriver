import { StatusBar } from 'expo-status-bar';
import debounce from 'lodash.debounce';
import React from "react";
import { 
    StyleSheet, 
    View,
    Dimensions,
    TouchableOpacity,
    DeviceEventEmitter,
    Animated,
    Alert,
    Image,
    Text
} from 'react-native';

import { Provider as PaperProvider, TextInput, Appbar, Title, Paragraph, Button, Card, TouchableRipple } from 'react-native-paper';
//import * as Permissions from 'expo-permissions';
import { Marker, Circle, AnimatedRegion  }from 'react-native-maps';
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

import {styles,theme, DOMAIN, changeMode, MapboxCustomURL} from './Constant'

import TopBar from './TopBar'

import { firebase } from '@react-native-firebase/app';

import firestore from '@react-native-firebase/firestore';

import * as geofirestore from 'geofirestore';

import Geolocation from 'react-native-geolocation-service';

import apiKeys from './config/keys';
import * as Progress from 'react-native-progress';
if (!firebase.apps.length) {
    //console.log('Connected with Firebase')
    firebase.initializeApp(apiKeys.firebaseConfig);
    //firebase.firestore().settings({experimentalForceLongPolling: true});
    //firebase.firestore().enablePersistence()
}

const origin = {latitude: -34.07465730, longitude: 151.01108000};
const destination = {latitude:  -34.07465730, longitude: 151.01108000};

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0043;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const db = firestore();
/*const firestore = firebase.firestore();*/
const GeoFirestore = geofirestore.initializeApp(db);
const geocollection = GeoFirestore.collection('driver_locations');

//console.log('firestore db', db)
//MapboxGL
import  MapboxGL, { MapView, Camera, UserLocation } from '@react-native-mapbox-gl/maps';
const dim = {
    width: width/2,
    height: height/2
}

//Dimensions.set(dim)

const stylesArray = [
  {
    "featureType": "road.highway",
    "stylers": [
      { "color": "#7E96BC" }
    ]
  },{
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

export default class MapViewOffline extends React.Component {
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
            markCoordinate: new AnimatedRegion({
                latitude: -34.07465730,
                longitude: 151.01108000,
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA,
                heading: 0
            }),
            angle:0,
            rotateValue: new Animated.Value(0),
            checkOnlineTime:0,
            offlineTimeText:'',
            coordinates: [151.01108000, -34.07465730],
            MapboxStyleURL:MapboxCustomURL,
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
        //this.onChangeHandler = this.onChangeHandler.bind(this)
    }

    async checkDriverOnline(){
        if(this.state.driverId){
            const driverRef = db.collection('driver_locations')
            .doc(this.state.driverId)
            .get()
            .then((docRef) => {
                //console.log('TripData:',docRef.data()) 
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
        //console.log('offtopbar props',this.props)
        /*this.props.navigation.addListener('gestureEnd', this.onBackPress);
        BackHandler.addEventListener('hardwareBackPress', this.onBackPress);*/
        
        //Dimensions.addEventListener('change', this.onChangeHandler)

        //Dimensions.addEventListener('change', (e) => {
            //const { width, height } = e.window;
            //this.setState({width, height});
            //console.log(e.window)
        //})
        this.getAirportsCoordsOnline()
        //console.log('routename',this.props.route.name)
        this.setState({
            MapboxStyleURL:changeMode()
        })
        this.intervalModeChange = setInterval(async () => {
            this.setState({
                MapboxStyleURL:changeMode()
            })
        }, 10000);

        DeviceEventEmitter.addListener('timer', this.clearTimer.bind(this));

        await AsyncStorage.getItem('accesstoken').then((value) => {           
            //console.log(value)
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

        this.getDriverServices();

        this._checkDrivingTime();

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
                    markCoordinate: new AnimatedRegion({
                        latitude: currntPos.coords.latitude,
                        longitude: currntPos.coords.longitude,
                        latitudeDelta: this.state.latitudeDelta,
                        longitudeDelta: this.state.longitudeDelta,
                    }),
                });

                
                
            },
            (error) => {
                //console.error(error.code, error.message);
                Alert.alert("Location request timed out", "We are not able to get your location, Please check location service is on or reboot your device.", [
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
            console.log('Lc error:',e)
            location = await Location.getLastKnownPositionAsync({ accuracy: Location.Accuracy.Low });
        } */

        //console.log('Lc error:',location)

        
        //console.log('Loc:',location)

        
        Geolocation.watchPosition((pos) => {
            const { markCoordinate } = this.state;
            const newCoordinate = {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                latitudeDelta: this.state.latitudeDelta,
                longitudeDelta: this.state.longitudeDelta,
            };

            if (this.marker) {
                //console.log('newCoordinate',newCoordinate)
                //this.marker.animateMarkerToCoordinate(newCoordinate, 500);
                markCoordinate.timing({ ...newCoordinate, useNativeDriver: true, duration: 10000}).start();

            }
           
            this.setState({
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

            //this._camera
            if(this.camera) {
                
                /* this.camera.setCamera({
                    centerCoordinate: [pos.coords.longitude, pos.coords.latitude],
                    heading: this.state.angle,
                    zoomLevel: 16,
                    animationMode:'flyTo',
                    pitch:50
                  }) */

                  //this.camera.flyTo([pos.coords.longitude, pos.coords.latitude])
                  
            }
            if(this.mapView) {
                this.mapView.animateCamera({
                    center:{
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude,
                    }
                });
            }

            },
            (error) => {
                //console.log(error.code, error.message);
            },
            { accuracy:Platform.OS == 'android'?'high':'best', distanceFilter:2, interval:2000, fastestInterval:1000, enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );

        /* let locations = await Location.watchPositionAsync({ accuracy: Location.Accuracy.Low, timeInterval: 10000, distanceInterval: 20 }, (pos) => {
            //console.log('cords:',pos.coords)

            
        }) */
        
        //console.log('origin',origin);
        
    }

    componentWillUnmount = () => {
        this.clearTimer()
        //NativeEventEmitter.addListener('timer', this.clearTimer.bind(this));
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
            //console.log(result.data.open_services);
            this.setState({
                driverServices:result.data.open_services,
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
                //console.log('avialableDrivingTime mapview:',res.data);
                if(res.status == 1){
                    if(res.data.driving_time == 0 && res.data.offlineTimeDiff > 0){
                        this.setState({
                            offlineTimeText:res.data.offlineTimeTxt,
                            checkOnlineTime:1,
                        },() => {
                            //console.log('checkOnlineTime:',this.state.checkOnlineTime);
                            this.offtime = setTimeout(() => {                
                                this._checkDrivingTime();
                            }, 60000);
                        })
                    }else{
                        this.setState({
                            offlineTimeText:'',
                            checkOnlineTime:2,
                        })
                    }
                }else{
                    this.setState({
                        offlineTimeText:'',
                        checkOnlineTime:2,
                    })
                }
            });
        });
    }
    
    clearTimer = () => {
        // Handle an undefined timer rather than null
        this.offtime !== undefined ? clearTimeout(this.offtime) : null;
        this.intervalModeChange !== undefined ? clearTimeout(this.intervalModeChange) : null;
        
    }

    async goOnline (){
        //alert("in function Call");
        //console.log('services=====================>',this.state.driverServices)
        this.clearTimer() 
        var serArr = [];
        if(this.state.driverServices !== null){
            var t = this.state.driverServices.split(',');
            for(let i=0; i < t.length; i++){
                serArr[i] = Number(t[i]);
            }
        }
        this.setState({spinner:true})
        //alert(JSON.stringify(this.state.driverId));
        
        try{
            await geocollection
            .doc(this.state.driverId)
            .set({
                driver_name: this.state.driverName,
                created_at: firestore.FieldValue.serverTimestamp(),
                updated_at: firestore.FieldValue.serverTimestamp(),
                coordinates:  new firestore.GeoPoint(this.state.origin.latitude, this.state.origin.longitude),
                driverId: Number(this.state.driverId),
                isBusy:'no',
                services_type:firestore.FieldValue.arrayUnion(...serArr),
                heading:0
            })
            .then(() => {
                //console.log('firebase driver_locations update=======================')

                fetch(DOMAIN+'api/driver/online',{
                    method: 'POST',
                    headers : {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': 'Bearer '+this.state.accessTokan
                    },
                    body: JSON.stringify({
                        "lat" : this.state.origin.latitude,
                        "lng": this.state.origin.longitude
                    })
                }).then(function (response) {
                    return response.json();
                }).then( (result)=> {
                    //console.log('online',result);
                    if(result.status === 1){
                        this.setState({
                            isDriOnline:true,
                            spinner:false
                        });
                        AsyncStorage.setItem('isOnline', 'true');
        
                        let timeout = result.data.value;
                        timeout = JSON.stringify(timeout * 1000);
                        //console.log('timeout',timeout);
                        AsyncStorage.setItem('driver_timeout', timeout);
                        //this.props.navigation.navigate('TripPlaner');
        
                        this.props.navigation.replace('MapViewFirst'); 
                        
                    }else{
                        this.setState({
                            spinner:false
                        });
                    }
                })

            })
            .catch((error) => { 
                this.setState({
                    spinner:false
                });
                console.error('driver_locations error====================:',error)
            })
        }catch(e){
            this.setState({
                spinner:false
            },() =>{
                Alert.alert("Location not found", "We are not able to get your location, Please check location service is on or reboot your device.", [
                    {
                      text: "Ok",
                      onPress: () => null,
                      style: "cancel"
                    },
                    
                ]);
            });
            //console.log('goonline firebase error===========:',e)
        }

        //console.log('driver position===========:',this.state.origin)
        
        
    }

    onRegionChangeComplete = (region) => {
        //console.log('onRegionChangeComplete', region);

        this.setState({
            latitudeDelta: region.latitudeDelta,
            longitudeDelta: region.longitudeDelta,
        })
    };

    onDidFinishLoadingMap = (index) => {
        //this.camera.flyTo(this.state.coordinates, 12000)
    }

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
        let angle = this.state.angle || 0;
        const spin = this.state.rotateValue.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg']
        })
        return (
            <>
                
                <Spinner
                    visible={this.state.spinner}
                    color='#FFF'
                    overlayColor='rgba(0, 0, 0, 0.5)'
                />	 
                
                <TopBar {...this.props} />
                        
                {/* <View style={{flex:1}}>
                    <MapView style={stylesLocal.map}
                        ref={c => this.mapView = c}
                        initialRegion={{
                         latitude: this.state.latitudecur,
                         longitude: this.state.longitudecur,
                         latitudeDelta: this.state.latitudeDelta,
                         longitudeDelta: this.state.longitudeDelta,
                        }}                        
                        customMapStyle={stylesArray}
                        zoomEnabled={true}                        
                        zoomTapEnabled={true}
                        zoomControlEnabled={true}
                        onRegionChangeComplete={this.onRegionChangeComplete} 
                    >
                        
                        <Marker.Animated
                            ref={marker => {this.marker = marker;}}                            
                            key={1}                                    
                            coordinate={this.state.markCoordinate} 
                            anchor={{ x: 0.5, y: 0.5 }}
                            flat
                        >
                            <Animated.View style={{
                                borderRadius:50,
                                backgroundColor:'rgba(63, 120, 186, 0.4)',
                                paddingTop:4,
                                paddingLeft:4,
                                paddingRight:4,
                                paddingBottom:2,
                                transform: [{rotate: spin}]
                            }}
                            >
                            <Entypo name="direction" size={25} color="#3f78ba" style={{transform: [{rotate: '315deg'}]}} />
                            </Animated.View>
                        </Marker.Animated>
                    </MapView>
                </View> */}
                <MapboxGL.MapView
					ref={(c) => (this._map = c)}
					onPress={this.onPress}
					onDidFinishLoadingMap={this.onDidFinishLoadingMap}
					style={{flex:1}}
					styleURL={this.state.MapboxStyleURL}
                    compassViewPosition={3}
				>
					<Camera 
                        zoomLevel={15} 
                        pitch={50} 
                        centerCoordinate={this.state.coordinates}
                        ref={(c) => (this.camera = c)}
                    />

					<UserLocation renderMode={'native'} androidRenderMode={'gps'} visible={true} showsUserHeadingIndicator={true} />
					{this.createPolygon()}
				</MapboxGL.MapView>                    
                
                {
                    this.state.isDriverApproved
                    ?   
                    <View style={[pageStyles.tripTab,{width:'100%',backgroundColor:'#3f78ba',height:85,paddingHorizontal:20}]}>
                        <View style={[pageStyles.tripTabChild,{alignItems:'flex-start',flex:1,}]}>
                            <TouchableOpacity onPress={() => this.props.navigation.navigate('DriverPreferences')}>
                                <Image
                                    style={{width:25,height:25,}}
                                    source={require('../assets/swapIcon-white.png')}
                                />  
                            </TouchableOpacity>
                        </View>
                        {                        
                        this.state.checkOnlineTime === 1
                        ?
                        <View style={{justifyContent:'center',alignItems:'center',alignItems:'center',flex:6,width:'100%',backgroundColor:'red'}}>
                            <Title style={[stylesLocal.White,{alignSelf:'center'}]}>You can go online after</Title>
                            <Paragraph style={[stylesLocal.White,{alignSelf:'center',fontSize:20}]}>{this.state.offlineTimeText}</Paragraph>
                        </View>
                        :
                        this.state.checkOnlineTime === 2
                        ?                   
                        <TouchableOpacity                            
                            onPress={() =>{ 
                                this.goOnline() }
                            } 
                             style={{justifyContent:'center',alignItems:'center',alignItems:'center',flex:6,width:'100%',}}
                        >
                            <View>
                                <Title style={[stylesLocal.White,{alignSelf:'center'}]}>You are offline</Title>
                                <Text style={[stylesLocal.White,{alignSelf:'center',textAlign:'center'}]}>Touch here to go online to start accepting jobs</Text>
                            </View>
                        </TouchableOpacity>
                        :
                        null
                        } 
                        <View style={[pageStyles.tripTabChild,{alignItems:'flex-end',flex:1,}]}>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('Recommended',{screen:'offline'})}>
                        <AntDesign name="bars" size={25} color="#FFF"  />
                        </TouchableOpacity>
                    </View>                   
                    </View>
                    :
                    <View style={{position:'absolute',bottom:0,left:0,width:'100%',backgroundColor:'#dc3545'}}>
                        <View style={{justifyContent:'center',alignItems:'center',alignItems:'center',flex:1,padding:10,}}>
                            <Title style={stylesLocal.White}>Pending</Title>
                            <Paragraph style={stylesLocal.White}>Waiting for admin approve.</Paragraph>
                        </View>
                    </View>    
                }
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
        flex: 1,
        width:width,
        height:height
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
