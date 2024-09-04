import { StatusBar } from 'expo-status-bar';
import debounce from 'lodash.debounce';
import React from "react";
import { 
    StyleSheet, 
    Text, 
    View,
    Dimensions,
    Image ,
    FlatList,
    ScrollView, 
    TouchableHighlight,
    Keyboard,
    KeyboardAvoidingView, 
    Alert, 
    TouchableOpacity, 
    BackHandler,
    Platform,
    DeviceEventEmitter,
    Animated
} from 'react-native';

import { Provider as PaperProvider, TextInput, Appbar, Title, Paragraph, Button, Card, TouchableRipple } from 'react-native-paper';
//import * as Permissions from 'expo-permissions';
import MapView , { Marker, Circle, AnimatedRegion  }from 'react-native-maps';
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

import {styles,theme, DOMAIN} from './Constant'

import TopBar from './TopBar'

import { firebase } from '@react-native-firebase/app';

import firestore from '@react-native-firebase/firestore';

import * as geofirestore from 'geofirestore';

import apiKeys from './config/keys';
import * as Progress from 'react-native-progress';
if (!firebase.apps.length) {
    console.log('Connected with Firebase')
    firebase.initializeApp(apiKeys.firebaseConfig);
    //firebase.firestore().settings({experimentalForceLongPolling: true});
    //firebase.firestore().enablePersistence()
}
import { getPermission } from './getLocation';
import Geolocation from 'react-native-geolocation-service';


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
            currentLocation:{},
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

    async intialLoad() {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            setErrorMsg('Permission to access location was denied');
            return;
        }
        await Location.requestBackgroundPermissionsAsync();

        await getPermission();
    }
   
    async componentDidMount() {

        this.intialLoad();
        //console.log('offtopbar props',this.props)
        /*this.props.navigation.addListener('gestureEnd', this.onBackPress);
        BackHandler.addEventListener('hardwareBackPress', this.onBackPress);*/
        
        //Dimensions.addEventListener('change', this.onChangeHandler)

        //Dimensions.addEventListener('change', (e) => {
            //const { width, height } = e.window;
            //this.setState({width, height});
            //console.log(e.window)
        //})



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
            
        


        Geolocation.getCurrentPosition(
            (location) => {
                console.log('nwe location',location)
                this.setState({                
                    markCoordinate: new AnimatedRegion({
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        latitudeDelta: this.state.latitudeDelta,
                        longitudeDelta: this.state.longitudeDelta,
                    })
                })
                
                const origin = {
                    latitude: location.coords.latitude, 
                    longitude: location.coords.longitude
                } 
              
                this.setState({
                    locationcur:location,
                    latitudecur:location.coords.latitude,
                    longitudecur:location.coords.longitude,        	
                    origin:origin,
                });
        
                const latitudeDelta = location.coords.latitude-location.coords.longitude;
                const longitudeDelta = latitudeDelta * ASPECT_RATIO;
            },
            (error) => {
                console.error('location error', error.message);
                this.callLocationTimeOut();
                Alert.alert("Location fetch error", "We are unable to fetch your location. Please check your location service is on or Restart App.", [
                    {
                      text: "Ok",
                      onPress: () => null,
                      style: "cancel"
                    },
                    
                ],{ cancelable: true });
            },
            { forceRequestLocation: true, distanceFilter:10, enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
        )
        //location = this.state.currentLocation
        //console.log('nwe location',location)        

        Geolocation.watchPosition((pos) => {
            console.log('cords:',pos.coords)

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
                angle:pos.coords.heading
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
            })

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
            console.log(error.code, error.message);
        },
        { accuracy:Platform.OS == 'android'?'high':'best', distanceFilter:2, interval:2000, fastestInterval:1000, enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 });
        
        //console.log('origin',origin);
        
    }

    callLocationTimeOut = async () => {
        let location={};
        try{
            location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
        } catch(e){
            console.log('Lc error:',e)
            location = await Location.getLastKnownPositionAsync({ accuracy: Location.Accuracy.Low });
        }
        console.log('nwe location timeout',location)
        this.setState({                
            markCoordinate: new AnimatedRegion({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: this.state.latitudeDelta,
                longitudeDelta: this.state.longitudeDelta,
            })
        })
        
        const origin = {
            latitude: location.coords.latitude, 
            longitude: location.coords.longitude
        } 
      
        this.setState({
            locationcur:location,
            latitudecur:location.coords.latitude,
            longitudecur:location.coords.longitude,        	
            origin:origin,
        });

        const latitudeDelta = location.coords.latitude-location.coords.longitude;
        const longitudeDelta = latitudeDelta * ASPECT_RATIO;
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
    
    

    async goOnline (){
        //alert("in function Call");
        //console.log('services',this.state.driverServices)
        var serArr = [];
        if(this.state.driverServices !== null){
            var t = this.state.driverServices.split(',');
            for(let i=0; i < t.length; i++){
                serArr[i] = Number(t[i]);
            }
        }
        this.setState({spinner:true})
        //alert(JSON.stringify(this.state.driverId));
        //console.log('serArr',this.state.origin)

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
       
        await fetch(DOMAIN+'api/driver/online',{
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
            console.log('online',result);
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
                
            }
        })
    }

    onRegionChangeComplete = (region) => {
        console.log('onRegionChangeComplete', region);

        this.setState({
            latitudeDelta: region.latitudeDelta,
            longitudeDelta: region.longitudeDelta,
        })
    };

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
                        
                <View style={{flex:1}}>
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
                </View>                    
                
                {
                    this.state.isDriverApproved
                    ?   
                    <View style={[pageStyles.tripTab,{width:'100%',backgroundColor:'#3f78ba',height:85,}]}>                    
                        <TouchableOpacity                            
                            onPress={() =>{ 
                                this.goOnline() }
                            } 
                             style={{justifyContent:'center',alignItems:'center',alignItems:'center',flex:1,width:'100%'}}
                        >
                            <View>
                                <Title style={[stylesLocal.White,{alignSelf:'center'}]}>You are offline</Title>
                                <Paragraph style={[stylesLocal.White,{alignSelf:'center'}]}>Touch here to go online to start accepting jobs</Paragraph>
                            </View>
                        </TouchableOpacity>                    
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
