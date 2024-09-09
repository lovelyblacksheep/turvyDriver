import { StatusBar } from 'expo-status-bar';
import React from "react";
import { StyleSheet, Text, View,Dimensions,Image,ScrollView ,TouchableOpacity,ActivityIndicator,BackHandler,Modal,Alert} from 'react-native';
//import * as Permissions from 'expo-permissions';
import MapView , { Marker , Polyline ,Callout,Circle,PROVIDER_GOOGLE }from 'react-native-maps';
import * as Location from 'expo-location';
import MapViewDirections from 'react-native-maps-directions';
import GooglePlacesInput from './GooglePlacesInput';
import { EvilIcons ,MaterialCommunityIcons,Entypo,Ionicons,FontAwesome5,FontAwesome,Feather,MaterialIcons } from '@expo/vector-icons';

const imageveh = require('../assets/images/driver-veh-images_60.png');
import Animated from 'react-native-reanimated';
import BottomSheet from 'reanimated-bottom-sheet';
import { Button , Divider,TextInput,Badge} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SmartLoader from './SmartLoader';
import Spinner from 'react-native-loading-spinner-overlay';
import FlashMessage , { showMessage, hideMessage }  from "react-native-flash-message";
import {fares} from "./fares";
import { Col, Row, Grid } from "react-native-easy-grid";
import SearchboxComp from './SearchboxComp';
import PickUpTIme from './PickUpTIme';
import Pusher from 'pusher-js/react-native';

import firebase from 'firebase/compat/app';
import firestore from '@react-native-firebase/firestore';
//import "firebase/firestore";
import * as geofirestore from 'geofirestore';
import apiKeys from '../config/keys';
import TopBar from "./TopBar";


if (!firebase.apps.length) {
    console.log('Connected with Firebase');
    firebase.initializeApp(apiKeys.firebaseConfig);
}

const db = firestore();
//const firestore = firebase.firestore();

const GeoFirestore = geofirestore.initializeApp(db);
const geocollection = GeoFirestore.collection('driver_locations');



const { width, height } = Dimensions.get('window');
const screenabc = Dimensions.get("screen");
console.log("Screen Abc",screenabc);
console.log("Width",width);
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0043;
const SCREENHEIGHT = height*.66;
const faresmap = [];
const basechnagre = [];
const perunitcharge = [];
const cancelcharge = [];
const surchnageslist =[];
const DEVICE_WIDTH = width;
const DEVICE_HEIGHT = height;
const fareItems = [];

//alert(DEVICE_WIDTH*0.5);
/*geocollection
.doc('125')
.	set({
  driverId: '370',
  isBusy: 'no',
  // The coordinates field must be a GeoPoint!
  coordinates: new firebase.firestore.GeoPoint(21.0912474, 79.0769057)
})
*/
//console.log(SCREENHEIGHT);

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
      { "visibility": "off" }
    ]
	}
]

import MapboxGL from "@rnmapbox/maps";
MapboxGL.setAccessToken("pk.eyJ1IjoibWFsLXdvb2QiLCJhIjoiY2oyZ2t2em50MDAyMzJ3cnltMDFhb2NzdiJ9.X-D4Wvo5E5QxeP7K_I3O8w");

export default class BookConfirm extends React.PureComponent {
  constructor(props) {
    super(props);

    this.startPoint = [79.075274, 21.089974];
     this.finishedPoint = [79.1069, 21.0962];
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
         distance:'',
         minimumfare:0,
         surchnages:0,
         servicetypes:[],
         selectedvehicle:{},
         isLoading:true,
         display:false,
         drivernear:{},
         vehborder:'#e5e5e5',
         selectedvehiclefare:0,
         selectedprcperunit:0,
         selectedminprc:0,
         bookingresponse:{},
         modalvisible:false,
         scheduleboxvisible:false,
         longpressdata:{},
         longprssitem:{},
         fares:{},
         waypointslnglat:[],
         scheduletime:'',
         scheduledate:'',
         is_schedule:0,
         selectedcancelchr:0,
         selectsurcharge:0,
         rewardpoints:0,
         selectSurInfo:{},
         fareavilable:false,
         dricetionlnglat:{},
         pathHeading:0,
         pathCenter:{},
         messagecount:0,
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


     // Two point state


        this.mapView = null;
        this.camera = null;
        this.pusher = new Pusher('389d667a3d4a50dc91a6', { cluster: 'ap2' });
     	  this.listenForChanges();
   }

   listenForChanges = () => {
		const channel = this.pusher.subscribe('turvy-channel');
		 channel.bind('driver_online_event', data => {
		 	this.getNearBydriver();
		  //alert(JSON.stringify(data));
		  });

		  channel.bind('driver_offline_event', data => {
		 	this.getNearBydriver();
		 //alert(JSON.stringify(data));
		  });
	};


   UNSAFE_componentWillUnmount() {
      this.unsubscribe();
   }

    _onPressService(item,fare) {
    	//console.log(item);
    	this.setState({
    		selectedvehicle:item,
    		selectedvehiclefare:fare[item.id],
    		selectedprcperunit:perunitcharge[item.id],
         selectedminprc:basechnagre[item.id],
         selectedcancelchr:cancelcharge[item.id],
         selectsurcharge:surchnageslist[item.id].toFixed(2),
         selectSurInfo:fareItems[item.id],
    		vehborder:'#e5e5e5'
    	},()=>{
    		console.log("FULL DETAILS",this.state.selectSurInfo);
    		//this.props.navigation.navigate('BookDetails',this.state)
    	});
    }


     async _onPressBookNow() {

         this.setState({
         	isLoading:true,
         });
    		if(Object.keys(this.state.selectedvehicle).length > 0){

    		await AsyncStorage.getItem('accesstoken').then((value) => {
			console.log(value);
			//console.log(this.state.scheduledate);
			//this.props.route.params
			fetch('https://www.turvy.net/api/rider/book',{
     	  	method: 'POST',
		   headers: new Headers({
		     'Authorization': 'Bearer '+value,
		     'Content-Type': 'application/json'
		   }),
		   body:JSON.stringify({
	 				'pickup_address' : `${this.props.route.params.curlocatdesc}`,
	 				 'drop_address' : `${this.state.destlocatdesc}`,
	 				 'servicetype_id':this.state.selectedvehicle.id,
	 				 'pickup_lat':this.state.origin.latitude,
	 				 'pickup_lng':this.state.origin.longitude,
	 				 'drop_lat':this.state.destination.latitude,
	 				 'drop_lng':this.state.destination.longitude,
	 				 'scheduledate':this.state.scheduledate,
	 				 'waypointslnglat':this.state.waypointslnglat,
	 			})
		   })
      .then((response) =>{
      	return response.json();
      }).then((json) =>{
      	console.log(json);
      	if(json.status == 1){
      		 this.setState({
	         	isLoading:false,
    				vehborder:'red',
    				bookingresponse:json.data
	         });
      		this.props.navigation.navigate('PaymentMethods',this.state)
      	}
     	 }
      )
      .catch((error) => console.error(error));

		})
    			 //this.props.navigation.navigate('BookDetails',this.state);
    		}else{
    			this.setState({
         	isLoading:false,
         	vehborder:'red'
         });
         showMessage({
				  message: "Please Choose Vehicle before book !",
				  type: "danger",
				  color: "#ffffff", // text color
				  hideOnPress:true,
				  animated:true,
				  duration:5000,
				  icon:'danger',
				  floating:true,
				  statusBarHeight:false,
				  style:{alignContent:'center',justifyContent:'center',marginTop:20,alignItems:'center'}
				});
    			//alert("Please Choose Vehicle before book !");
    		}
    }

   _onLongPressButton(item) {
   //console.log(item);

    fetch('https://www.turvy.net/api/farecard/2/'+item.id,{
       method: 'GET',
      }).then(function (response) {
      return response.json();
      }).then( (result)=> {
        //console.log(result);
        if(result.status == 1){
        	// minimum fare
        	const minimumfare = parseFloat(result.data.price_per_unit)*parseFloat(this.state.distance);
        	let  gstper =  result.data.gst_charge;
        	gstper = gstper.replace("%", "");
        	//alert(gstper);
        //	if()
          let surchnages =0;
        	//const surchnages = (parseFloat(result.data.fuel_surge_charge)*parseFloat(this.state.distance))+parseFloat(minimumfare*(parseFloat(gstper)/100))+parseFloat(result.data.baby_seat_charge)+parseFloat(result.data.pet_charge)+parseFloat(result.data.nsw_gtl_charge)+parseFloat(result.data.nsw_ctp_charge);
        	 if(item.id == 1){
        	 	 //surchnages = (parseFloat(result.data.fuel_surge_charge)*parseFloat(this.state.distance))+parseFloat(result.data.nsw_gtl_charge)+parseFloat(result.data.nsw_ctp_charge)+parseFloat(minimumfare*(parseFloat(gstper)/100))+parseFloat(result.data.baby_seat_charge);
        	 	 surchnages = (parseFloat(result.data.fuel_surge_charge))+parseFloat(result.data.nsw_gtl_charge)+parseFloat(result.data.nsw_ctp_charge)+parseFloat(minimumfare*(parseFloat(gstper)/100));
        	 }else{
        	 	 surchnages = (parseFloat(result.data.fuel_surge_charge))+parseFloat(result.data.nsw_gtl_charge)+parseFloat(result.data.nsw_ctp_charge)+parseFloat(minimumfare*(parseFloat(gstper)/100));
        	 	 //surchnages = (parseFloat(result.data.fuel_surge_charge)*parseFloat(this.state.distance))+parseFloat(result.data.nsw_gtl_charge)+parseFloat(result.data.nsw_ctp_charge)+parseFloat(minimumfare*(parseFloat(gstper)/100));
        	 }
        	 //alert(surchnages);
        	 //alert(surchnages);
	        	this.setState({
	        	 longpressdata:result.data,
	        	 longprssitem:item,
	        	  modalvisible:true,
	        	  surchnages:surchnages.toFixed(2),
	        	  minimumfare:minimumfare.toFixed(2)
	        });
        }
    });
  }

   _onPressDone(){
		this.setState({
			modalvisible:false,
			longpressdata:{},
		});
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
    <Grid>
    	<Row size={45}>
    		<Col>
    			 <ScrollView horizontal={true} >
			     { Object.keys(this.state.servicetypes).length > 0  && this.state.servicetypes.map((item,index) =>{
			     if(faresmap.length > 0 && faresmap[item.id]){
			     	return(
			    	<View style={[styles.servicesbox,
			    	this.state.selectedvehicle.id == item.id ? {'backgroundColor':'#135AA8'} : {'borderColor':this.state.vehborder}]}>
			    	 <TouchableOpacity onPress={() => this._onPressService(item,faresmap)}  onLongPress={() =>this._onLongPressButton(item)} delayLongPress={500} >
			    	<Image
			        source={{uri:"https://www.turvy.net/"+item.image}}
			        style={styles.servicebocimageblock}
			        Resizemode={'contain'}
			         />
			         <Text style={[this.state.selectedvehicle.id == item.id ? {'color':'#ffffff',textAlign:'center',fontSize:16,fontWeight:'bold'} : {color:'#000000',textAlign:'center',fontSize:16,fontWeight:'bold'}]}>{item.name}  <Text style={{fontWeight:'bold',fontSize:14}}> <FontAwesome name="user-o" size={15} color="black" /> {item.number_seat}</Text></Text>
			         <View style={{flex:1,height:40,justifyContent:'center',alignContent:'center'}}><Text style={[this.state.selectedvehicle.id == item.id ? {'color':'#ffffff',textAlign:'center',fontWeight:'bold'} : {color:'#000000',textAlign:'center',fontWeight:'bold'}]}> A$ { faresmap.length > 0 ? faresmap[item.id]  : '' } </Text></View>
			         <Text numberOfLines={2} style={[this.state.selectedvehicle.id == item.id ? {'color':'#ffffff',textAlign:'center',fontSize:12} : {color:'#000000',textAlign:'center',fontSize:12}]}>{item.description}</Text>
			        </TouchableOpacity>
			    	</View>
			      )
			      }
			      })}
			    </ScrollView>
			    {this.state.fareavilable ?
			    	(<Text style={{color:'#7c7a7a',fontWeight:'bold',fontSize:14,marginLeft:10}}>Choose a ride or scroll for more ...</Text>)
			    :
			      (<View><Text style={{fontWeight:'bold',color:'red'}}>Pickup and destination should not same or Fare info is not available!</Text></View>)
			    }

    		</Col>
    	</Row>

    	 <Row size={10}  style={{justifyContent:'center',alignContent:'center',paddingTop:20}}>
		<Col size={1}>
			<View style={styles.inforound}>
				<MaterialCommunityIcons name="information-variant" size={26} color="black" />
			</View>
		</Col>
		<Col size={11}>
		<Text style={{color:'#135aa8',fontWeight:'bold',fontSize:11}}>  Long press on image to get approximate break-down fare.</Text>
		</Col>
	</Row>
    	<Row size={15} style={{justifyContent:'center'}}>
    		<Col size={9}>
    		  <Button  mode="contained" color={'#135AA8'} onPress={() => this._onPressBookNow()}>
			    Book Now
			  </Button>
    		</Col>
    		<Col size={3} style={{justifyContent: 'flex-start',alignContent:'flex-end',alignItems:'flex-end'}} >
    		<TouchableOpacity onPress={() => this.setState({scheduleboxvisible:true})} >
    		 <View style={{justifyContent:'center',alignContent:'center',alignItems:'center',borderWidth:1,borderColor:'#135AA8',width:'60%',borderRadius:5,padding:6}}><Ionicons name="md-calendar-outline" size={22} color="#135AA8" /></View>
    		 <Text style={{fontSize:8,fontWeight:'bold'}}>schedule booking</Text>
    		 </TouchableOpacity>
    		</Col>
    	</Row>

	<Row size={40} >
		<Col>
		</Col>
	</Row>
    </Grid>
    </View>
   </>
  );


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

  async intialLoad (){

   	let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        //setErrorMsg('Permission to access location was denied');
        console.log('Permission to access location was denied')
         //alert("here");
        //return;

      }

       //console.log("SERVICES TYPE");
		await fetch('https://www.turvy.net/api/servicetypes')
      .then((response) => response.json())
      .then((json) =>{
      console.log("SERVICES TYPE 1");
      console.log(json.data)
      	this.setState({
      		servicetypes:json.data
      	});
     	 }
      )
      .catch((error) => console.error(error));

       let origin ={};
       let curlocatdesc='';
       //console.log("ORIGIN DATA");
      // console.log(this.props.route.params.curlocatdesc);
      if(Object.keys(this.props.route.params.origin).length > 0){
      	//console.log("origin from");
       	 origin = this.props.route.params.origin;
       	 curlocatdesc=this.props.route.params.curlocatdesc;
		}

		let destination = {};
		let longitudedest = '';
		let latitudedest= '';
		let destinationto ='';

		if(this.props.route.params.destination){
			destination = this.props.route.params.destination;
			longitudedest = destination.longitude;
			latitudedest = destination.latitude;
			destinationto = this.props.route.params.destinationto;
		}
		let waypoints = [];
		 console.log("WAY POINT");
     console.log(this.props.route.params.stopmainlnglat);

		if(this.props.route.params.stopmainlnglat){
			waypoints.push(this.props.route.params.stopmainlnglat);
		}
		if(this.props.route.params.inputData){
			console.log("IN INPUT data"+Object.keys(this.props.route.params.inputData).length);
			let totrec = Object.keys(this.props.route.params.inputData).length;
			totrec = totrec-2;
			console.log("TOTAL REC"+totrec);
			if(Object.keys(this.props.route.params.inputData).length > 0){
				this.props.route.params.inputData.map((item, key) => {
					if(key <= totrec ){
						item.coordinates['stopname'] = item.text;
						waypoints.push(item.coordinates);
					}
						console.log("KEY "+key);
						console.log("WAY POINT INFO 2 NEW 1",waypoints);
				});
			}

			console.log(this.props.route.params.inputData);
		}
      //stopmain
      this.setState({
      	latitudecur:origin.latitude,
      	longitudecur:origin.longitude,
      	latitudeDelta:0.00176,
      	longitudeDelta:0.00176,
      	origin:origin,
      	destination:destination,
      	latitudedest:latitudedest,
      	longitudedest:longitudedest,
      	curlocatdesc:curlocatdesc,
      	destlocatdesc:destinationto,
      	waypointslnglat:waypoints
      });
      //console.log(location);

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

       if (latitudedest != '' && longitudedest != '') {

		      let keys = {
		        latitude : latitudedest,
		        longitude : longitudedest
		    }
		    let response = await Location.reverseGeocodeAsync(keys);

		     //console.log(response);

		   let address = '';
		    for (let item of response) {
		    	//${item.street},
		    	if(item.street !== null){
		    		address = `${item.street}, ${item.city}, ${item.postalCode}`;
		    	}else{
		    		address = `${item.name}, ${item.city}, ${item.postalCode}`;
		    	}

		       //console.log(address);
		       this.setState({
		      	destlocatdesc:address,
		      });
		    }
		  }

		this.getNearBydriver();


   }

  async getNearBydriver(){

  		const search_radius = await AsyncStorage.getItem('search_radius');
       const query = geocollection.near({ center: new firestore.GeoPoint(this.state.latitudecur,this.state.longitudecur ), radius:Number(search_radius)});
		 //.where('isBusy','==','no')
		 const accesstoken = await AsyncStorage.getItem('accesstoken');
			// Get query (as Promise)
		query.get().then((value) => {
		  // All GeoDocument returned by GeoQuery, like the GeoDocument added above
		 // console.log("IN QUERY");
		  //console.log(value.docs);
		  const drivernear = [];
		   value.docs.map((item, index) => {
		   	 //console.log("DRIVER MAP");
		   		// console.log(item.data().coordinates);
		   	if(item.exists == true){

		   			drivernear.push({['coordinates']:item.data().coordinates,
				      	['driverId']:item.id,	});
				      this.setState({
	      			drivernear:drivernear,
	      		},()=>{
	      			//console.log(this.state.drivernear);
	      		});

		   	}
		   });
		 });
  }


   async componentDidMount(){
   	const {navigation,state} = this.props;
   	//console.log(this.props.route.params);
   	await this.getfares();
   	this.intialLoad();
   	AsyncStorage.getItem('messagecount').then((value) => {
            if(value != '' && value !== null){
                this.setState({messagecount:value})
                //alert(value)
            }
        });
		this.setState({
		    state:this.props.route.params,
          isLoading:true,
          vehborder:'#e5e5e5'
      });
		await AsyncStorage.getItem('rewardpoints').then((value) => {
			this.setState({
				rewardpoints:value,
			});
		});

		const subscription = Dimensions.addEventListener(
      "change",
      ({ window, screen }) => {
      	//alert("dimesnion chnage");
      	console.log(" WINDOW WIDTH",window);
      	console.log(" SCREEN WIDTH",screen);
        //setDimensions({ window, screen });
      }
    );

  		this.unsubscribe =  navigation.addListener("focus",() => {
  			this.setState({
             state:this.props.route.params,
             isLoading:false,
             vehborder:'#e5e5e5',
             is_schedule:0,
         });
  			this.intialLoad();
  		});
  } // end of function

    getfares(){
    		 fetch('https://www.turvy.net/api/farecardall/2',{
	       method: 'GET',
	      }).then(function (response) {
	      return response.json();
	      }).then( (result)=> {
	      	console.log("FARE DATA");
	        console.log(result);
	        if(result.status == 1){
		        	this.setState({
		        	fares:result.data,
		        });
	        }
	    });
    }


    handleSheetChanges = ((index: number) => {
    //console.log('handleSheetChanges', index);
  });

   rightIconP = () =>(
 	 <TextInput.Icon name="close" color={'#3f78ba'} onPress={()=>this.setState({pickup:'',stateText:''})} />
  );

  rightIconD = () =>(
  	<TextInput.Icon name="close" color={'#3f78ba'} onPress={()=>this.setState({destinationto:'',stateText:''})} />
  )

  async fittomap(){
  		/*const camera = await this.mapView.getCamera();
				  camera.heading += 40;
				  camera.pitch += 10;
				  camera.altitude += 1000;
				  camera.zoom -= 1;
				  camera.center.latitude += 0.5;
  					this.mapView.animateCamera(camera, { duration: 2000 });
  					*/
  					 //const camera = await this.mapView.getCamera();
    /*Alert.alert(
      'Current camera',
      JSON.stringify(camera),
      [
        { text: 'OK' },
      ],
      { cancelable: true }
    );
    */
    this.animateCamera();
  }

   async animateCamera() {
    const camera = await this.mapView.getCamera();
    //alert(JSON.stringify(camera));
    camera.heading += 40;
    camera.pitch += 10;
    camera.zoom = 10;
    //camera.altitude += 1000;
    this.mapView.animateCamera(camera, { duration: 2000 });
    /*
    camera.heading += 40;
    camera.pitch += 10;
    camera.altitude += 1000;
    camera.zoom -= 1;
    camera.center.latitude += 0.5;
    */
    //
  }
  getRandomFloat(min, max) {
    return (Math.random() * (max - min)) + min;
  }

 closePop = () =>{
 	this.setState({
 		scheduleboxvisible:false,
 	});
 }

 setSChedule = (date) =>{
 	console.log(date);
 	this.setState({
 		scheduledate:date,
 		scheduleboxvisible:false,
 		is_schedule:1,
 	});
 }

  render() {

  	 return (
	    <View style={styles.container}>
	    <StatusBar backgroundColor="transparent" barStyle="light-content"/>
	    <FlashMessage position={{top:'40%'}} style={{marginTop:70}}/>
	    <Spinner
          visible={false}
          color='#FFF'
          overlayColor='rgba(0, 0, 0, 0.5)'
        />
	    	<TopBar {...this.props} />
		<MapboxGL.MapView style={styles.map}
     		showUserLocatin={true}
     		ref={c => this.mapView = c}
     		showUserLocation={true}
     		cluster
     		coordinates={[this.state.longitudecur,this.state.latitudecur]}
     		heading={this.state.pathHeading}
     		zoomEnabled={true}
     		onDidFinishRenderingMapFully={(index)=>{
     		  //console.log("map load complete");
	       fetch('https://api.mapbox.com/directions/v5/mapbox/driving/79.075274,21.089974;79.0899,21.0893;79.1069,21.0962;79.097723,21.131447?geometries=geojson&access_token=pk.eyJ1IjoibWFsLXdvb2QiLCJhIjoiY2oyZ2t2em50MDAyMzJ3cnltMDFhb2NzdiJ9.X-D4Wvo5E5QxeP7K_I3O8w',{
				method: 'GET',
	 		}).then(function (response) {
	 			return response.json();
	  		}).then( (result)=> {
	  			console.log("Data from api geomery ",result.routes[0].geometry);
	  			let distance = result.routes[0].distance;
	  			distance = distance/1000;

	  			 if(Object.keys(this.state.fares).length){
             console.log("FARES LIST NEw", this.state.fares);
              this.state.fares.map((item, key) => {
              	 	console.log("fare data");
              	console.log(item);
              	let fareoff =0;
              	if(distance > item.base_ride_distance){
              		//let remindist = distance - item.base_ride_distance
              		//fareoff = parseFloat(item.base_ride_distance_charge)+parseFloat(remindist*item.price_per_unit);
              	  fareoff = parseFloat(distance*item.price_per_unit);
              	}else{
              		fareoff = parseFloat(distance*item.price_per_unit);
              	}

              	fareItems[item.servicetype_id] = item;

					/*faresmap.push({
				    [item.servicetype_id]: fareoff,
				  });
				  */


				 if(fareoff != '' && fareoff != null){
				 	faresmap[item.servicetype_id] = fareoff.toFixed(2);
				 }else{
				 	faresmap[item.servicetype_id] = 0;
				 }

				  basechnagre[item.servicetype_id] = item.base_ride_distance_charge;
				  perunitcharge[item.servicetype_id] = item.price_per_unit;
				  //cancelcharge[item.servicetype_id]	= item.cancel_charge;
				  cancelcharge[item.servicetype_id]	= 15;

				   let minimumfaren = parseFloat(item.price_per_unit)*parseFloat(distance);
		        	let  gstper =  item.gst_charge;
		        	 gstper = gstper.replace("%", "");

				  if(item.servicetype_id == 1){
	        	 	 surchnageslist[item.servicetype_id] = (parseFloat(item.fuel_surge_charge))+parseFloat(item.nsw_gtl_charge)+parseFloat(item.nsw_ctp_charge)+parseFloat(minimumfaren*(parseFloat(gstper)/100));
	        	 }else{
	        	 	 surchnageslist[item.servicetype_id] = (parseFloat(item.fuel_surge_charge))+parseFloat(item.nsw_gtl_charge)+parseFloat(item.nsw_ctp_charge)+parseFloat(minimumfaren*(parseFloat(gstper)/100));
	        	 }


				});
				  }

	  			console.log("COORDINATES ARRAY", Object.values(result.routes[0].geometry.coordinates));
	  			this.setState({
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
	  				this.camera.fitBounds([79.075274, 21.089974], [79.097723,21.131447],[100,40,300,20],1000);
	  			});
	  				//setContry(result.data);
			});
     		}}
     		 >
     		  <MapboxGL.Camera
	     		 ref={c => this.camera = c}
            animationDuration={250}
            minZoomLevel={1}
            zoomLevel={13}
            maxZoomLevel={20}
            animationMode="flyTo"
            centerCoordinate={[this.state.longitudecur,this.state.latitudecur]}
            Level={10}
            heading={this.state.pathHeading}
          />
            <MapboxGL.ShapeSource  id="mapbox-directions-source" shape={this.state.routedirect}>
			      <MapboxGL.LineLayer
			        id="mapbox-directions-line"
			        style={{lineColor:'#135AA8',lineWidth:2}}
			        />
    	     </MapboxGL.ShapeSource>
           <MapboxGL.PointAnnotation
	           id={'markerorigin'}
	           coordinate={[this.state.longitudecur,this.state.latitudecur]}>

	          </MapboxGL.PointAnnotation>
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
      </MapboxGL.MapView>
    <ActivityIndicator
            animating={false}
            size="large"
            color='#135AA8'
          />
  { this.state.display ? (
  <BottomSheet
        snapPoints={[SCREENHEIGHT]}
        borderRadius={20}
        renderContent={this.renderContent}
        overdragResistanceFactor={0}
        enabledManualSnapping={false}
         enabledContentTapInteraction={false}
        enabledContentGestureInteraction={false}
        onOpenStart={(index)=>{
        		console.log("opening");
        }}
         onChange={this.handleSheetChanges}
      />
      )
      :(
      <Text></Text>
      )
   }
    {this.state.scheduleboxvisible ?
	    (<View style={styles.modalboxSchedule}>
	    	<PickUpTIme closePop={this.closePop} setSChedule={this.setSChedule}  />
	    </View>)
	    :
	   (<></>)
    }

       { this.state.modalvisible ?
      	(<View style={styles.modalbox}>
          <Grid style={{justifyContent:'center',alignContent:'center',marginTop:40}}>

          <Row size={100} style={{justifyContent:'center',alignContent:'center'}}>
          		<Col style={{justifyContent:'center',alignContent:'center',alignItems:'center'}}>
          		  <View style={{backgroundColor:'#fefefe',height:'100%',width:'90%',justifyContent:'center',alignContent:'center',padding:10,borderRadius:5,borderWidth:1,borderColor:'#3f78ba',shadowColor: "#3f78ba",
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.27,
		shadowRadius: 4.65,
		elevation: 10,}}>
          		  <Row>
		          <Col size={90}>
		          	</Col>
		          	<Col size={10}>
		          		<Ionicons
			   				name="close"
			   				size={24}
			   				color="#135aa8"
			   				onPress={() => this._onPressDone()}
			   			/>
		          	</Col>
		          </Row>
          		   <Row size={20} style={{justifyContent:'center',alignContent:'center'}}>
          		   <Col size={4} style={{width:100,alignItems:'center'}}>
		              <Image
						        source={{uri:"https://www.turvy.net/"+this.state.longprssitem.image}}
						        style={styles.servicebocimage}
						        Resizemode={'contain'}
						         />
						  </Col>
						  </Row>
						  <Row size={10}>
						  		<Col><View><Text style={{textAlign:'center',color:'#135AA8',fontSize:16,fontWeight:'bold'}}>{this.state.longprssitem.name}</Text></View>
						  		</Col>
						  </Row>
						    <Row size={6}>
						  		<Col size={75}><Text style={styles.label}>Base Fare</Text>
						  		</Col>
						  		<Col size={25}><Text style={styles.label}>A${this.state.longpressdata.base_ride_distance_charge} </Text>
						  		</Col>
						  </Row>

						  <Row size={6}>
						  		<Col size={75}><Text style={styles.label}>Minimum Fare</Text>
						  		</Col>
						  		<Col size={25}><Text style={styles.label}>A${this.state.minimumfare}</Text>
						  		</Col>
						  </Row>

						    <Row size={6}>
						  		<Col size={75}><Text style={styles.label}> <FontAwesome name="plus" size={14} color="black" /> Per minute</Text>
						  		</Col>
						  		<Col size={25}><Text style={styles.label}>A${this.state.longpressdata.price_per_ride_minute}</Text>
						  		</Col>
						  </Row>

						  <Row size={6}>
						  		<Col size={75}><Text style={styles.label}> <FontAwesome name="plus" size={14} color="black" /> Per Kilometer</Text>
						  		</Col>
						  		<Col size={25}><Text style={styles.label}>A${this.state.longpressdata.price_per_unit}</Text>
						  		</Col>
						  </Row>
						  <Row size={6}>
						  		<Col size={75}><Text style={styles.label}>Estimated Surcharges</Text>
						  		</Col>
						  		<Col size={25}><Text style={styles.label}>A${this.state.surchnages} </Text>
						  		</Col>
						  </Row>
						   <Row size={6}>
						  		<Col size={75}><Text style={styles.label}>Booking Fee</Text>
						  		</Col>
						  		<Col size={25}><Text style={styles.label}>A${this.state.longpressdata.booking_charge} </Text>
						  		</Col>
						  </Row>

						     <Row size={20}>
						  		<Col size={12}><Text style={{textAlign:'left',color:'#3f78ba',fontSize:13,fontWeight:'bold'}}>Your fare will be price presented before the trip base on the rate above and other applicable surcharges and adjustments.
						  		Additional waiting charges may apply to your trip if the driver has waited { this.state.longpressdata.fee_waiting_time == 0 ? '' : this.state.longpressdata.fee_waiting_time } A${this.state.longpressdata.waiting_price_per_minute} per minutes.</Text>
						  		</Col>

						  </Row>
           			 </View>

          	</Col>
          	</Row>
          	<Row size={40}>
          		<Col>
          		</Col>
          	</Row>
          </Grid>
          </View>)
          :(<></>)
         }

  </View>
	  );
   }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: Dimensions.get('window').width,
    height: '100%',
    flex: 1,
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
 	height:160,
 	backgroundColor:'#e5e5e5',
 	borderWidth:1,
 	padding:10,
 	margin:6,
 	alignItems:'center',
 	borderRadius:10,
 	justifyContent:'center'
  },
   servicebocimageblock:{
    width: 100,
    aspectRatio:4/2.2,
	 resizeMode: 'contain',
	 alignSelf:'center',
	},
  servicebocimage:{
  	 flex: 1,
    width: 80,
    aspectRatio: 4/2.1,
	 resizeMode: 'contain',
	 alignSelf:'center'
	},
	modalboxSchedule:{
		 flex:1,
		 width:'100%',
       position: 'absolute',
  		bottom: '20%',
  		bottom: 0,
  		left: 0,
  		right: 0,
   	backgroundColor: "transparent",
   	zIndex:200,
   	shadowColor: "#3f78ba",
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.27,
		shadowRadius: 4.65,
		elevation: 10,
    },
	modalbox:{
		 flex:1,
		 width:'100%',
       position: 'absolute',
  		top: '20%',
  		bottom: 0,
  		left: 0,
  		right: 0,
   	backgroundColor: "transparent",
   	zIndex:200,
   	shadowColor: "#3f78ba",
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.27,
		shadowRadius: 4.65,
		elevation: 10,
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
	vehmarkerimage:{
    width: 20,
    height:35,
	 alignSelf:'center'
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
	label:{
		textAlign:'left',
		color:'#000',
		fontSize:13,
		fontWeight:'bold',
		fontFamily: "Uber-Move-Text"
	},
	ubarFont:{
    fontFamily: "Uber-Move-Text"
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
  markerContainer: {
       alignItems: "center",
       width: 150,
       backgroundColor: "transparent",
       height: 200,
   },
   textContainer: {
       borderRadius: 10,
       flex: 1,
       flexDirection: "row",
       alignItems: "center",
   },
   text: {
       textAlign: "center",
       paddingHorizontal: 5,
       flex: 1,
       color: "white",
   },
});