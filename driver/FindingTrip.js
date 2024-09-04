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
    AppState 
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

import * as firebase from "firebase";
import "firebase/firestore";
import * as geofirestore from 'geofirestore';

import apiKeys from './config/keys';

const db = firebase.firestore();

import * as Location from 'expo-location';
import MapView , { Marker, Circle  }from 'react-native-maps';
// install using npm --legacy-peer-deps  install react-native-maps-directions
import MapViewDirections from 'react-native-maps-directions';
import {theme, DOMAIN, PUSHER_API} from './Constant'

import Pusher from 'pusher-js/react-native';

const { width, height } = Dimensions.get('window');
const SCREENHEIGHT = height*.50;

export default class FindingTrip extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            accessTokan:'',
            driverId: null,
            bookrequest:{},
            fetchnewrequest:true,
            isOnline:false,
            spinner:false,
            servicetypes:{},
            startGeo:{},
            endGeo:{},            
            currentLoc:{},
            pickupInfo:{
                duration:'6 min pickup',
                distance:'10Km'
            },
            tripDistance:{
                duration:'',
                distance:''
            },
            runOut:false,
            toneObject:{},
            driver_timeout:8000,
            progressBar:1,
            prcount:8,
            multidest:{},
            appState: AppState.currentState
        }

    }

    async checkDriverOnline(){
        if(this.state.driverId){        
            /*const driverRef = db.collection('driver_locations').doc(this.state.driverId);
            const doc = await driverRef.get();                
            if (!doc.exists) {
                AsyncStorage.setItem('isOnline', 'false');
            } else {
                AsyncStorage.setItem('isOnline', 'true');
                this.setState({isOnline:true})
            }*/

            const driverRef = db.collection('driver_locations')
            .doc(this.state.driverId)
            .get()
            .then((docRef) => {
                //console.log('firebase TripData:',docRef.data().isBusy) 
                if(docRef.data()){
                    AsyncStorage.setItem('isOnline', 'true');
                    this.setState({isOnline:true})
                    if(docRef.data().isBusy == 'no'){
                        this.setState({
                            fetchnewrequest:true
                        });
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
    

    async componentDidMount() {
        //console.log('props:',this.props)
        //alert(PUSHER_API.APP_KEY)       
        
        await AsyncStorage.getItem('driverId').then((value) => {           
            if(value != '' && value !== null){
                this.setState({
                    driverId:value
                })
            }
        })

        await AsyncStorage.getItem('isOnline').then((value) => {           
            if(value === 'true'){
                this.setState({
                    isOnline:true
                },()=>{
                    //console.log('is online',this.state.isOnline)        
                })
            }
        })

        await AsyncStorage.getItem('driver_timeout').then((value) => {           
            if(value != '' && value !== null){
                this.setState({
                    driver_timeout: parseInt(value),
                    prcount: parseInt(value)/1000
                })
            }
        })
        
        //this.recallRequest();

        //get booking request.
        //Pusher.logToConsole = true;

        var pusher = new Pusher(PUSHER_API.APP_KEY, {
          cluster: PUSHER_API.APP_CLUSTER
        });
        var channel = pusher.subscribe('turvy-channel');

        channel.bind('book_request_event', this.getBookingRequest);


        /* let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            console.log('Permission to access location was denied');
            return;
        } */
        let location={};
        try{
            location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        } catch(e){
            //console.log('Lc error:',e)
            location = await Location.getLastKnownPositionAsync({ accuracy: Location.Accuracy.High });
        }
        //let location = await Location.getCurrentPositionAsync({ enableHighAccuracy: true });
        //console.log(location)

        const origin = {
            latitude: location.coords.latitude, 
            longitude: location.coords.longitude
        } 
      
        this.setState({            
            currentLoc:origin,
        });
        //console.log('intr',this.interval)
        
    }


    recallRequest = async (data) => {
        //alert(JSON.stringify(data));
        //alert('bind call')
        /*this.interval = setInterval(() => {
            this.getBookingRequest();
        }, 7000);*/
    }
    
    getBookingRequest = async (data) => {
        
        await AsyncStorage.getItem('accesstoken').then((value) => {  
            if(value != '' && value !== null){
                //console.log(value)
                console.log('book data',data);
                fetch(DOMAIN+'api/driver/getbookingfordriver/'+data.book_id,{
                    method: 'GET', 
                    headers: new Headers({
                    'Authorization': 'Bearer '+value, 
                    'Content-Type': 'application/json'
                    })
                })
                .then((response) =>{ 
                    return response.json();
                }).then((json) =>{ 
                    console.log('request:',json);
                    if(json.status === 1){
                        //clearTimeout(this.interval);
                        this.setState({                                        
                            bookrequest:json.data,                                
                            startGeo:{
                                latitude: json.data.origin_lat,
                                longitude: json.data.origin_lng
                            },
                            endGeo:{
                                latitude: json.data.destination_lat,
                                longitude: json.data.destination_lng
                            },                                
                            runOut:false,
                            progressBar:1,
                            prcount: this.state.driver_timeout/1000
                        },()=>{
                            if(this.state.bookrequest.multdest){
                                this.setState({
                                    multidest: this.state.bookrequest.multdest   
                                })
                            }
                            this.runsound()
                            this.refs.fmLocalIntstance.showMessage({
                                message: '',
                                type: "default",
                                backgroundColor: "#ededed", 
                                autoHide:false,
                                hideOnPress:false,
                                style:{
                                    margin:10,
                                    borderRadius:10,
                                    alignItems:'center',
                                    justifyContent:'center',
                                    elevation:10,
                                },
                                renderCustomContent: ()=>{
                                     return this.renderTrip();
                                },                                 
                            });                                

                            fetch(DOMAIN+'api/servicetypes')
                            .then((response) => response.json())
                            .then((res) =>{ 
                                res.data.map((item,index) =>{
                                    const servicetypes = {};
                                    if(item.id == json.data.servicetype_id){    
                                       //console.log('servicetypes',item)
                                       this.setState({
                                            servicetypes:item
                                       })
                                    }
                                }); // end of map 
                            });
                        } 
                    )};       
                })
                .catch((error) => console.error(error));
            }
        });
    }

    renderTrip = () => {
        return (
            <>
                <Spinner
                    visible={this.state.spinner}
                    color='#FFF'
                    overlayColor='rgba(0, 0, 0, 0.5)'
                />
                <TouchableOpacity onPress={() => this._onPressAccept()}>
                <View 
                    style={{
                        backgroundColor:'#ededed',
                        height:350,
                        borderRadius:10,

                    }}
                >     
                    <Grid style={{flex:1,width:width-20,marginTop:-30}}>
                        <Row style={{height:50}}>
                            <Col size={3} style={{padding:10}}></Col>
                            <Col size={6}>
                                <View style={stylesLocal.vehicelbox}>
                                    <Text style={{fontSize:16,color:'#fff',textAlign:'center'}}>
                                        <FontAwesome5 
                                            name="user-alt" 
                                            size={20} 
                                            color="white"                                 
                                        />
                                        <Text style={{paddingLeft:10,borderWidth:1,color:'#FFF',}}>{this.state.servicetypes.name}</Text>
                                    </Text>
                                </View>
                            </Col>
                            <Col size={3} style={{padding:10}}></Col>
                        </Row>
                        <Row style={{height:50,marginTop:10}}>
                            <Col size={7} style={{justifyContent:'center',alignItems:'flex-end',}}>
                                <Text style={{color:'#155aa8',fontSize:22}}>{this.state.pickupInfo.duration}</Text>
                            </Col>
                            <Col size={5} style={{alignItems:'center',justifyContent:'center',}}>
                                <Text style={{color:'gray',fontSize:18}}>{this.state.pickupInfo.distance}</Text>
                            </Col>
                        </Row>
                        <Row style={{height:40,marginTop:10}}>
                            <Col size={12} style={{alignItems:'center',justifyContent:'center',marginHorizontal:10}}>
                                <Text style={{color:'#155aa8',fontSize:16,textAlign:'center'}}>{this.state.bookrequest.origin}</Text>
                            </Col>
                        </Row>
                        <Row style={{height:30,}}>
                            <Col size={12} style={{alignItems:'center',justifyContent:'center',}}>
                                <Text style={{color:'#155aa8',fontSize:16}}>To</Text>
                            </Col>
                        </Row>
                        <Row style={{height:40,}}>
                            <Col size={12} style={{alignItems:'center',justifyContent:'center',marginHorizontal:10}}>
                                <Text style={{color:'#155aa8',fontSize:16,textAlign:'center'}}>{this.state.bookrequest.destination}
                                    {this.state.bookrequest.is_multidest
                                        ?
                                    <MaterialCommunityIcons name="map-marker-multiple" size={24} color="#dc3545" />
                                    :
                                    null
                                    }
                                </Text>
                            </Col>
                        </Row>
                        <Row style={{height:20,paddingRight:10,justifyContent:'center',alignItems:'center'}}>
                            <Col size={1}>
                                <Text style={{alignSelf:'center',color:'#155aa8'}}>{this.state.prcount}</Text>
                            </Col>
                            <Col size={11}>

                                <Progress.Bar 
                                    progress={this.state.progressBar} 
                                    width={null} 
                                    borderRadius={0}
                                    color={'#155aa8'}
                                    unfilledColor={'#ccc'}
                                    indeterminate={false}
                                    borderWidth={0}
                                    height={1}
                                    useNativeDriver={true}
                                />
                            </Col>        
                        </Row>
                        <Row style={{height:30,}}>
                            <Col size={2} style={{justifyContent:'center',paddingLeft:20}}>
                                <AntDesign name="clockcircleo" size={24} color="black" />
                                {/*<Progress.Circle 
                                    progress={this.state.progressBar} 
                                    size={40}
                                    thickness={2}
                                    showsText={true}                                    
                                    color={'#155aa8'}
                                />*/}
                            </Col>
                            <Col size={8} style={{justifyContent:'center',paddingLeft:10}}>
                                {
                                    this.state.tripDistance.distance > 50
                                    ?
                                <Text style={{fontSize:18,color:'#155aa8'}}>Long Trip ({this.state.tripDistance.distance}+ Km)</Text>
                                    :
                                    <Text style={{fontSize:18,color:'#155aa8'}}>{this.state.tripDistance.duration} min Trip ({this.state.tripDistance.distance}+ Km)</Text>
                                }
                            </Col>                            
                        </Row>
                        <Row style={{height:60}}>
                            <Col style={{paddingTop:10,paddingRight:10}}>
                                <View style={{flexDirection:'column',width:120,alignSelf:'flex-end',}}> 
                                    <Button mode="contained" color={'#135AA8'} onPress={() => this._onPressCancel('manual')}>
                                    Decline
                                    </Button>
                                </View>
                            </Col>
                        </Row>                        
                    </Grid>  
                    
                </View>
                </TouchableOpacity>
            
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

        setTimeout(()=>{
            playbackObject.setIsLoopingAsync(false); 

            if(!this.state.runOut){
                this._onPressCancel('auto')
            }
        }, this.state.driver_timeout);

        this.drtimeout = setInterval(() => {            
            //console.log('progress',this.state.progressBar)           

            this.setState({
                progressBar:(this.state.progressBar - (1000/this.state.driver_timeout)),
                prcount: this.state.prcount - 1
            })
            if(this.state.progressBar <= 0){
                clearTimeout(this.drtimeout);  
            }
            
        }, 1000);
    }

    async _onPressAccept(){
        this.setState({
            runOut:true,            
        })
        //this.runsound();
        this.state.toneObject.stopAsync(); 
        AsyncStorage.getItem('accesstoken').then((value) => {           
            if(value != '' && value !== null){
                this.setState({
                    spinner:true,
                })
                fetch(DOMAIN+'api/driver/book/'+this.state.bookrequest.id+'/accept',{
                    method: 'GET',
                    headers : {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': 'Bearer '+value
                    },
                }).then(function (response) {
                    return response.json();
                }).then( (result)=> {
                    this.setState({
                        spinner:false,
                    })
                    //console.log(result);
                    if(result.status === 1){
                        //clearTimeout(this.interval);
                        this.refs.fmLocalIntstance.hideMessage();
                        this.props.navigation.navigate('BookingMap',{bookId:this.state.bookrequest.id});
                    }
                })
            }
        })
    }

    async _onPressCancel(declineBy){

        this.setState({runOut:true})
        this.state.toneObject.stopAsync(); 
        AsyncStorage.getItem('accesstoken').then((value) => {
            if(value != '' && value !== null){

                fetch(DOMAIN+'api/driver/book/'+this.state.bookrequest.id+'/'+this.state.driverId+'/decline',{
                    method: 'POST',
                    headers : {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': 'Bearer '+value
                    },
                    body:JSON.stringify({
                        "declineBy" : declineBy,
                    })
                }).then(function (response) {
                    return response.json();
                }).then( (result)=> {
                    //console.log(result);
                    if(result.status === 1){
                        this.refs.fmLocalIntstance.hideMessage();                    
                        this.setState({
                            fetchnewrequest:true,
                            spinner:false,
                            progressBar:1,
                            prcount: this.state.driver_timeout/1000
                        },()=>{
                            //this.props.navigation.navigate('MapViewFirst');
                            //this.recallRequest();
                        });

                    }
                })
            }
        })
    }

    render() {      
        return (
            <> 
                <FlashMessage 
                    ref="fmLocalIntstance" 
                    position={{top:'45%'}} 
                />
                <MapView>
                
                    { Object.keys(this.state.startGeo).length > 0 && Object.keys(this.state.endGeo).length > 0 
                     ?
                     (   
                    <MapViewDirections
                        resetOnChange={false}
                        region={'AU'}
                        origin={this.state.startGeo}
                        destination={this.state.endGeo}
                        waypoints={ (Object.keys(this.state.multidest).length > 0 ) ? this.state.multidest : undefined}
                        strokeWidth={5}
                        lineDashPattern={[1]}
                        strokeColor="black"
                        apikey="AIzaSyAr2ESV30J7hFsOJ5Qjaa96u9ADSRX6_Sk"
                        lineCap={'butt'}
                        lineJoin={'miter'}
                        mode={"DRIVING"}                                    
                        onReady={result => {
                            
                            this.setState({
                                tripDistance:{
                                    distance:result.distance.toFixed(),      
                                    duration:result.duration.toFixed(),      
                                }
                            })
                            //console.log('distance:',result.distance.toFixed())
                            //console.log('duration:',result.duration.toFixed())
                        }}
                    />
                    )
                     :
                     <></>
                    }
                    { Object.keys(this.state.startGeo).length > 0 && Object.keys(this.state.currentLoc).length > 0 
                     ?
                     (   
                    <MapViewDirections
                        resetOnChange={false}
                        region={'AU'}
                        origin={this.state.currentLoc}
                        destination={this.state.startGeo}
                        strokeWidth={5}
                        lineDashPattern={[1]}
                        strokeColor="black"
                        apikey="AIzaSyAr2ESV30J7hFsOJ5Qjaa96u9ADSRX6_Sk"
                        lineCap={'butt'}
                        lineJoin={'miter'}
                        mode={"DRIVING"}                                    
                        onReady={result => {                           
                            
                            this.setState({
                                pickupInfo:{
                                    distance:result.distance.toFixed() + 'Km',
                                    duration:result.duration.toFixed()+ ' min pickup' ,
                                }
                            })
                            
                        }}
                    />
                    )
                     :
                     <></>
                    }
                </MapView>
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