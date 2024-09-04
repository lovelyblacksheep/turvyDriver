import React from 'react';

import {  Provider as PaperProvider,
    Text, 
    Button,    
} from 'react-native-paper';

import {
    View,        
    StyleSheet, 
    TouchableOpacity, 
    Dimensions,
    AppState,
    DeviceEventEmitter 
} from 'react-native'

import { Col, Row, Grid } from "react-native-easy-grid";

import Spinner from 'react-native-loading-spinner-overlay';
import { MaterialCommunityIcons, AntDesign, FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FlashMessage , { showMessage, hideMessage }  from "react-native-flash-message";
import { Audio } from 'expo-av';
import Modal from 'react-native-modal';
import BottomSheet from 'reanimated-bottom-sheet';
import * as Progress from 'react-native-progress';
import Geolocation from 'react-native-geolocation-service';
import {useRoute} from '@react-navigation/native';
/* import * as firebase from "firebase";
import "firebase/firestore";
import * as geofirestore from 'geofirestore'; */

import * as firebase from "firebase";
import firestore from '@react-native-firebase/firestore';
import * as geofirestore from 'geofirestore';

import apiKeys from './config/keys';

//const db = firebase.firestore();

if (!firebase.apps.length) {
    firebase.initializeApp(apiKeys.firebaseConfig);
}

const db = firestore();
const GeoFirestore = geofirestore.initializeApp(db);

import * as Location from 'expo-location';
import MapView , { Marker, Circle  }from 'react-native-maps';
// install using npm --legacy-peer-deps  install react-native-maps-directions
import MapViewDirections from 'react-native-maps-directions';
import {theme, DOMAIN, debug} from './Constant'


import * as geolib from 'geolib';

const { width, height } = Dimensions.get('window');
const SCREENHEIGHT = height*.50;


export default class AirportQueue extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            accessTokan:'',
            driverId: null,
            driverName:null,
            accessTokan:null,            
            isOnline:false,            
            servicetypes:{},
            airportCords:[],
            driverServices:'',
            inAirport:false,
            currentLoc:{},
            position:null,
            showAlert:false,
            alertMessage:false,
            showBottomSheet:false,
            airport_info:{},
            enterAirport:false,
            isDriverBusy:false
        }
        this.fmLocalIntstance = React.createRef();

    }

    async checkDriverOnline(){
        if(this.state.driverId){

            db.collection('driver_locations')
            .doc(this.state.driverId)
            .get()
            .then((docRef) => {
                //console.log('firebase TripData==========>',docRef.data().isBusy) 
                if(docRef.data()){
                    AsyncStorage.setItem('isOnline', 'true');
                    this.setState({isOnline:true})

                    if(docRef.data().isBusy == 'yes'){
                        this.setState({isDriverBusy:true}) 
                    }else{
                        this.setState({isDriverBusy:false})
                    }                  
                }else{
                    AsyncStorage.setItem('isOnline', 'false');                    
                    this.setState({
                        isOnline:false,
                    })

                }
            })
        }

    }
    
    
    setAsyncValues = async () => {

        await AsyncStorage.getItem('accesstoken').then((value) => {
            
            if(value != '' && value !== null){
                this.setState({
                    accessTokan:value
                },()=>{
                    
                });
            }
        })
        
        await AsyncStorage.getItem('driverId').then((value) => {           
            if(value != '' && value !== null){
                this.setState({
                    driverId:value
                },()=>{
                    this.checkDriverOnline();
                    this.getDriverServices();
                })
            }
        })

        await AsyncStorage.getItem('name').then((value) => {           
            if(value != '' && value !== null){
                this.setState({driverName:value})
                //alert(value)
            }
        })



    }
    async componentDidMount() {
        //console.log('props:',this.props)
        //this.fmLocalIntstance.current.snapTo(1)
        this.getAirportsCoords();
        this.setAsyncValues()

        /* let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            console.log('Permission to access location was denied');
            return;
        } */

        DeviceEventEmitter.addListener('timer', this.clearSoundTimer.bind(this));
        DeviceEventEmitter.addListener('timer', this.clearMessageTimer.bind(this));
        DeviceEventEmitter.addListener('timer', this.clearLeftAirportTimer.bind(this));
       
        //this.clearAllTimer()

        Geolocation.watchPosition((pos) => {
            //this.checkDriverOnline();
            
            console.log('watchPosition location===============>',pos.coords);

            this.setAsyncValues()

            console.log('airportCords lenght=============',this.state.airportCords.length)
            this.setState({
                currentLoc:pos.coords
            })

            let inPolygon = false;
            let airportInfo={}
            if(this.state.airportCords.length > 0){
                for(let k=0; k < this.state.airportCords.length; k++){
                    //serArr[i] = Number(t[i]);
                    //console.log('airport cords', this.state.airportCords[k].coords);
                    inPolygon = geolib.isPointInPolygon({ latitude: pos.coords.latitude, longitude: pos.coords.longitude}, this.state.airportCords[k].coords);
                    if(inPolygon){
                        airportInfo = {
                            'airport_id':this.state.airportCords[k].airport_id,
                            'airport_name':this.state.airportCords[k].airport_name
                        }
                        break;
                    }
                }
                console.log('airport info',airportInfo,inPolygon)
            }

            

            this.setState({
                airport_info: airportInfo
            },() => {
                if(this.state.driverId){
                    console.log('inPolygon',inPolygon,this.state.isOnline)
                    if(inPolygon){
                        this.setState({
                            inAirport:true,
                        },()=>{
                            //if driver online and is in airport area.
                            //set him in queue
                            if(!this.state.isDriverBusy && this.state.isOnline){
                                this._enterAirportRegion();
                            }
                        })
                    }else{
                        
                        this.setState({
                            inAirport:false,
                        },()=>{
                            if(!this.state.isDriverBusy){
                                this._leftAirportRegion();
                            }
                        })
                        
                    }
                }

            })
            
            //let inPolygon = geolib.isPointInPolygon({ latitude: pos.coords.latitude, longitude: pos.coords.longitude}, this.state.airportCords);
            /*let inPolygon = geolib.isPointInPolygon({ latitude: 51.5125, longitude: 7.485 }, [
                { latitude: 51.5, longitude: 7.4 },
                { latitude: 51.555, longitude: 7.4 },
                { latitude: 51.555, longitude: 7.625 },
                { latitude: 51.5125, longitude: 7.625 },
            ]);*/

        },
        (error) => {
            console.log(error.code, error.message);
        },
        { accuracy:Platform.OS == 'android'?'high':'best', distanceFilter:2, interval:2000, fastestInterval:1000, enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );


       /*  await Location.watchPositionAsync({ accuracy: Location.Accuracy.BestForNavigation, timeInterval: 10000, distanceInterval: 10 }, (pos) => {

        }) */
    }

    getAirportsCoords = async () => {
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
            //console.log('airport coords',debug(result), result.data.length);
            this.setState({
                airportCords:result.data
            },() => {
                if(this.state.airportCords.length > 0){
                    for(let k=0; k < this.state.airportCords.length; k++){
                        //serArr[i] = Number(t[i]);
                        //console.log('airport cords', this.state.airportCords[k].coords)
                    }
                }
            })
        })
    }
    
    _enterAirportRegion = async () => {
        //console.log(loc)
        await AsyncStorage.getItem('running_book_id').then((val) => {			
			if(!val){
                AsyncStorage.getItem('accesstoken').then((value) => {
                    if(!this.state.enterAirport){
                        fetch(DOMAIN+'api/driver/add_queue',{
                            method: 'POST',
                            headers : {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json',
                                'Authorization': 'Bearer '+value
                            },
                            body: JSON.stringify({
                                'airport_id':this.state.airport_info.airport_id,
                                'open_services':this.state.driverServices
                            })
                        }).then(function (response) {
                            return response.json();
                        }).then( (result)=> {
                            console.log('queue',result);
                            this.setState({
                                position:result.data,
                                enterAirport:true
                            },() => {

                                var serArr = [];
                                if(this.state.driverServices !== null){
                                    var t = this.state.driverServices.split(',');
                                    for(let i=0; i < t.length; i++){
                                        serArr[i] = Number(t[i]);
                                    }
                                }
                                //console.log('serArr',serArr)
                        
                                db.collection('queue')
                                .doc(this.state.driverId)
                                .get()
                                .then((docQue) => {
                                    console.log('firebase queue============:',docQue.data()) 
                                    if(docQue.data()){
                        
                                        db.collection("queue")
                                        .doc(this.state.driverId)
                                        .update({
                                            Latitude:this.state.currentLoc.latitude,
                                            Longitude:this.state.currentLoc.longitude,
                                            services_type:firestore.FieldValue.arrayUnion(...serArr)
                                        })
                        
                                    }else{
                                        console.log('firebase queue undifine============:')
                                        db.collection("queue")
                                        .doc(this.state.driverId)
                                        .set({
                                            driver_name: this.state.driverName,
                                            Latitude:this.state.currentLoc.latitude,
                                            Longitude:this.state.currentLoc.longitude,
                                            airport_id:this.state.airport_info.airport_id,            
                                            queddate: firestore.FieldValue.serverTimestamp(),            
                                            driverId: Number(this.state.driverId),
                                            isBusy:'no',
                                            services_type:firestore.FieldValue.arrayUnion(...serArr),
                                            position:this.state.position,
                                            airport_name:this.state.airport_info.airport_name
                                        })
                                        
                                        this._showAlertMessage()

                                        AsyncStorage.setItem('inAirport', '1');
                                        if(this.state.position){
                                        AsyncStorage.setItem('queuePosition', JSON.stringify(this.state.position));
                                        }
                                    }            
                                })


                            })
                        })
                    }
                })
            }
        })
    }

    _leftAirportRegion = async () => {

        AsyncStorage.removeItem('inAirport');
        AsyncStorage.removeItem('queuePosition');
        AsyncStorage.removeItem('service_name');
        
        db.collection('queue')
        .doc(this.state.driverId)
        .get()
        .then((docQue) => {
            //console.log('firebase TripData:',docQue.data()) 
            if(docQue.data()){
                db.collection("queue")
                .doc(this.state.driverId)
                .delete();

                //this.fmLocalIntstance.current.snapTo(0)
                //this.runsound();
                this.setState({                    
                    showAlert:true,
                    position:null,
                    alertMessage:'You left airport area.',
                    showBottomSheet:true
                })

                this.leftTimer = setTimeout(()=>{
                    //this.fmLocalIntstance.current.snapTo(1)
                    this.setState({                            
                        showAlert:false,                        
                        showBottomSheet:false,
                        enterAirport:false
                    })
                    this.clearLeftAirportTimer()
                }, 7000);
                AsyncStorage.setItem('inAirport', '0');
                AsyncStorage.setItem('queuePosition', '0');
            }
        })

        await AsyncStorage.getItem('accesstoken').then((value) => {

            fetch(DOMAIN+'api/driver/remove_queue',{
                method: 'GET',
                headers : {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': 'Bearer '+value
                }
            }).then(function (response) {
                return response.json();
            }).then( (result)=> {
                //console.log('queue',result);
                
            })
        })

    }

    _showAlertMessage = async () => {
        //alert('jkjkj')

        //this.runsound();
        this.setState({
            showAlert:true,
            alertMessage:'You are now in '+this.state.airport_info.airport_name+' area.',
            showBottomSheet:true
        })

        this.alertMessageTimer = setTimeout(()=>{
            //alert('kjjkj')
            //this.fmLocalIntstance.current.snapTo(1)
            this.setState({
                showAlert:false,
                showBottomSheet:false
            })
            this.clearMessageTimer()
        }, 7000);
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
            //console.log('driving service',debug(result.data));
            this.setState({
                driverServices:result.data.open_services,
            },()=>{
                //this._enterAirportRegion();
                //this._leftAirportRegion();
                if(result.data.open_serviceName){
                    AsyncStorage.setItem('service_name', result.data.open_serviceName);
                }
                
            })
        })
    }

    clearSoundTimer = () => {
        this.runsoundTimer !== undefined ? clearTimeout(this.runsoundTimer) : null;
    }

    clearMessageTimer = () => {
        this.alertMessageTimer !== undefined ? clearTimeout(this.alertMessageTimer) : null;
    }

    clearLeftAirportTimer = () => {
        this.leftTimer !== undefined ? clearTimeout(this.leftTimer) : null;
    }

    clearAllTimer = () => {
        this.clearSoundTimer();
        this.clearMessageTimer();
        this.clearLeftAirportTimer();
    }

    renderTrip = () => {
        return (
            <>
                <View 
                    style={{
                        backgroundColor:'#fff',
                        height:200,
                        borderRadius:10,
                        marginHorizontal:20,
                        elevation:2
                    }}
                >     
                    <Grid style={{flex:1,}}>                        
                        <Row style={{height:50,marginTop:10}}>
                            <Col style={{justifyContent:'center',alignItems:'center',}}>
                                <Text style={{color:'#155aa8',fontSize:22}}>Airport Queue</Text>
                            </Col>
                        </Row>
                        <Row>
                            <Col style={{justifyContent:'center',alignItems:'center',paddingVertical:5}}>
                                <Text style={{color:'#155aa8',fontSize:18}}>
                                    {this.state.alertMessage}
                                </Text>
                                {
                                this.state.position
                                ?
                                <Text style={{color:'#155aa8',fontSize:18}}>
                                    Your position : <Text style={{color:'#155aa8',fontSize:20}}>{this.state.position}</Text>
                                </Text>
                                :null
                                }
                            </Col>
                        </Row>
                    </Grid>  
                    
                </View>
            </>
        );
    }

    onPlaybackStatusUpdate(PlaybackStatus){ 
        if(PlaybackStatus.didJustFinish == true){
            //console.log("Complete",playbackObject);            
        }
    }

    async runsound(){
        
        const { sound: playbackObject} =  await Audio.Sound.createAsync(
            require('../assets/Text_message_alert.mp3'),
            {},
            this.onPlaybackStatusUpdate,
        );
        this.setState({
            toneObject:playbackObject,            
        })
        
        await playbackObject.playAsync();        
        playbackObject.setIsLoopingAsync(true);

        this.runsoundTimer = setTimeout(()=>{
            playbackObject.setIsLoopingAsync(false);
            this.clearSoundTimer()
        }, 5000);
    }

    render() {      
        return (
            <> 
                {/*<FlashMessage 
                    ref="fmLocalIntstance" 
                    position={{top:'45%'}} 
                />*/}
                {
                    this.state.showBottomSheet
                    ?
                    <BottomSheet
                        ref={this.fmLocalIntstance}
                        snapPoints={[450, 0]}
                        borderRadius={20}
                        renderContent={this.renderTrip}
                        overdragResistanceFactor={0}
                        enabledManualSnapping={false}
                        enabledContentTapInteraction={false}
                        enabledContentGestureInteraction={true}
                    />
                    :null
                }
            </>
        )
    }        

}  


const stylesLocal = StyleSheet.create({    
    vehicelbox:{
        backgroundColor: '#155aa8',        
        margin:10,        
        elevation: 4,
        borderRadius:5,
        justifyContent:'center',
        alignContent:'center',
        paddingVertical:15,
        width:150,        
    }

});      