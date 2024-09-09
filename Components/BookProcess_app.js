import { StatusBar } from 'expo-status-bar';
import React from "react";
import { StyleSheet, Text, View,Dimensions,Image,ScrollView ,TouchableOpacity,ActivityIndicator,BackHandler} from 'react-native';
//import * as Permissions from 'expo-permissions';
import MapView , { Marker , Polyline ,Callout }from 'react-native-maps';
import * as Location from 'expo-location';
import MapViewDirections from 'react-native-maps-directions';
import GooglePlacesInput from './GooglePlacesInput';
import { EvilIcons,Ionicons,MaterialCommunityIcons,FontAwesome5,Entypo } from '@expo/vector-icons';
const imagemarker = require('../assets/location-pin-2965.png');
import Animated from 'react-native-reanimated';
import BottomSheet from 'reanimated-bottom-sheet';
import { Button } from 'react-native-paper';
import { Col, Row, Grid } from "react-native-easy-grid";
import SmartLoader from './SmartLoader';
import AsyncStorage from '@react-native-async-storage/async-storage';
const { width, height } = Dimensions.get('window');
const imageveh = require('../assets/images/driver-veh-images_60.png');
const DEVICE_WIDTH = width;
const DEVICE_HEIGHT = height;
 const drivernear = [];

import SwipeButton from 'rn-swipe-button';

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0043;
const SCREENHEIGHT = height*.60;

import firebase from 'firebase/compat/app';
import "firebase/firestore";
import * as geofirestore from 'geofirestore';
import apiKeys from '../config/keys';


if (!firebase.apps.length) {
    console.log('Connected with Firebase');
    firebase.initializeApp(apiKeys.firebaseConfig);
}

const db = firebase.firestore();
const firestore = firebase.firestore();

const GeoFirestore = geofirestore.initializeApp(firestore);
const geocollection = GeoFirestore.collection('driver_locations');



//console.log("height");
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

//const  intervals = [];

export default class BookProcess extends React.Component {
  constructor(props) {
    super(props);
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
         servicetypes:[],
         selectedvehicle:{},
         inprocessing:0,
         display:false,
         distance:'',
         rideinfoinprocess:{},
         bookingdriver:{},
         bookingresponse:{},
         interval:[],
         statusrecived:false,
         drivernear:{},
         drivernearAll:{},
         drivernearRem:{},
         waypointslnglat:[],
         selectedcancelchr:0
    };

    this.mapView = null;
    this.myinterval = React.createRef();

   }

   async getnearestDriver(){
   	// Create a GeoQuery based on a location
   	console.log(this.state.origin);
   	console.log('NEAREST DRIVER'+this.state.origin.latitude);
   	console.log(this.state.origin.longitude);
		const query = geocollection.near({ center: new firebase.firestore.GeoPoint(this.state.origin.latitude, this.state.origin.longitude), radius: 200 });
		//.where('isBusy','==','no')
		//const accesstoken = await AsyncStorage.getItem('accesstoken');
		// Get query (as Promise)
		query.get().then((value) => {
		  // All GeoDocument returned by GeoQuery, like the GeoDocument added above
		  //console.log("IN QUERY");
		  //console.log(value.docs);

		   value.docs.map((item, index) => {
		   	 //console.log("DRIVER MAP");
		   	//console.log(item.data().coordinates);
		   	if(item.exists == true){
		   			drivernear.push({['coordinates']:item.data().coordinates,
				      	['driverId']:item.id,	});
				      this.setState({
	      			drivernear:drivernear,
	      			drivernearAll:drivernear
	      		},()=>{
	      			console.log("DRIVER LIST 1 ",this.state.drivernear);
	      			console.log("DRIVER LIST 2",this.state.drivernearAll);
	      			 if(index == 0){
	      			 	if(drivernear[0].driverId > 0){
						   	let driverID = drivernear[0].driverId;
						   	let newdriver = drivernear;
						   	newdriver = newdriver.shift();
						   	console.log("DRIVER ABC LIST",drivernear);
						   	this.setState({
						   		drivernearRem:newdriver,
						   	});
						     //console.log(" BEFORE ASSIGN DRIVER ID");
						     this.assignDriver(driverID);
						   }
	      			 }

	      		});
		   	}
		   });

		   //console.log(drivernear);
		   console.log("DRIVER ID");
		   console.log(drivernear[0].driverId);


		   /*	if(item.exists == true){
		   		console.log(item);
		   		const nearestDriver = item.id;
		   		/*CODE SATRT HERE*/

		   		/*fetch('https://turvy.net/api/rider/assigndriver/'+this.state.bookingresponse.id,{
				     	  	method: 'POST',
						   headers: new Headers({
						     'Authorization': 'Bearer '+accesstoken,
						     'Content-Type': 'application/json'
						   }),
						   body:JSON.stringify({
					 				'driver_id' : nearestDriver,

					 			})
						   })
				      .then((response) => response.json())
				      .then((json) =>{
				      	console.log(json);
				      	if(json.status == 1){
					      	if(this.state.statusrecived == false){
					      		this.myinterval = setInterval(() => {
	            	  				this.getbookingStatus()
	            	  			}, 5000);
	            	  		}else{
	            	  			clearInterval(this.myinterval);
	            	  		}
				      	}

				      	//console.log("Payment successful ", paymentIntent);

				   		//hideMessage()
				   		//props.navigation.navigate('BookDetails',this.state);

				      	/*if(json.status == 1){
				      		 this.setState({
					         	isLoading:false,
				    				vehborder:'red',
				    				bookingresponse:json.data
					         });
				      		this.props.navigation.navigate('PromoCode',this.state)
				      	}
				      	*/
				     /*	 }
				      )
				      .catch((error) => console.error(error));
				     */

		   		/********************* END HERE****************/
		   	//}


		   });
		//});
   }

    assignDriver = async(driver_id) =>{
   			const accesstoken = await AsyncStorage.getItem('accesstoken');
   			console.log(accesstoken);
   			console.log(this.state.bookingresponse.id);
   			alert("BEFORE ASSIGN "+driver_id);
   	fetch('https://turvy.net/api/rider/assigndriver/'+this.state.bookingresponse.id,{
				     	  	method: 'POST',
						   headers: new Headers({
						     'Authorization': 'Bearer '+accesstoken,
						     'Content-Type': 'application/json'
						   }),
						   body:JSON.stringify({
					 				'driver_id' : driver_id,
					 			})
						   })
				      .then((response) => {
				      	return response.json();
				      	console.log(response);
				      	})
				      .then((json) =>{
				      	console.log("IN ASSIGN ");
				      	console.log(json);
				      	alert("AFTER ASSIGN "+driver_id);
				      	if(json.status == 1){
					      	if(this.state.statusrecived == false){
					      		this.myinterval = setInterval(() => {
					      			console.log("Call Booking status");
	            	  				this.getbookingStatus()
	            	  			}, 10000);
	            	  		}else{
	            	  			clearInterval(this.myinterval);
	            	  		}
				      	}else if(json.status == 0){
				      	  //
				      	  if(drivernear[0].driverId > 0){
				      	  	let driverID = drivernear[0].driverId;
							   	drivernear.shift();
							   	console.log(" BEFORE ASSIGN NEXT DRIVER ID");
							      this.assignDriver(driverID);
							   }

				      	  if(json.message == "Driver not exits"){
				      	  }
				      	}

				      	//console.log("Payment successful ", paymentIntent);

				   		//hideMessage()
				   		//props.navigation.navigate('BookDetails',this.state);

				      	/*if(json.status == 1){
				      		 this.setState({
					         	isLoading:false,
				    				vehborder:'red',
				    				bookingresponse:json.data
					         });
				      		this.props.navigation.navigate('PromoCode',this.state)
				      	}
				      	*/
				     	 })
				      .catch((error) => console.error(error));
   }
   async noresponseYet(){
   	clearInterval(this.myinterval);
   	clearTimeout(this.settimeout);
   	 await AsyncStorage.getItem('accesstoken').then((value) => {
      	fetch('https://turvy.net/api/rider/book/cancel/'+this.state.bookingresponse.id,{
     	  	method: 'GET',
		   headers: new Headers({
		     'Authorization': 'Bearer '+value,
		     'Content-Type': 'application/json'
		   }),
		   })
      .then((response) => response.json())
      .then((json) =>{
      	//console.log("NEAR BY DRIVER");
      	console.log(json);
      	if(json.status == 1){
      		this.props.navigation.replace('BookDetails',this.state);
      	}
     	 }
      )
      .catch((error) =>{
      	console.error(error);
      });
     });
   }

    componentDidMount(){
    	const {navigation} = this.props;
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
             waypointslnglat:this.props.route.params.waypointslnglat,
             selectedcancelchr:this.props.route.params.selectedcancelchr,
        },()=>{
        	this.intialLoad();
         this.settimeout = setTimeout(()=>{ this.noresponseYet() }, 480000)
         	//alert("here BEFORE FIND NEAREST DRIVER");
          this.getnearestDriver();
        });
      }

        this.props.navigation.addListener('blur', () => {
            clearInterval(this.myinterval);
        });


      /*
  		this.unsubscribe =  navigation.addListener("focus",() => {
  			   	//
  			this.setState({
             selectedvehicle:this.props.route.params.selectedvehicle,
             inprocessing:0,
         },()=>{
         	//setTimeout(()=>{ this.props.navigation.navigate('RideConfirm',this.state) }, 2000)
         });

  			this.intialLoad();
  		});
  		*/
  } // end of function


   UNSAFE_componentWillUnmount() {
    //this.unsubscribe();

    if(this.state.interval){
      clearInterval(this.myinterval);
    }
    if(this.settimeout){
   	 clearTimeout(this.settimeout);
   }
  }

  async getbookingStatus(){
  	   if(this.state.statusrecived == true){
  	   	 clearInterval(this.myinterval);
  	   	 clearTimeout(this.settimeout);
  	   	 return;
  	   }
  	   console.log("here in status");
  		 await AsyncStorage.getItem('accesstoken').then((value) => {
  		 	//alert('https://turvy.net/api/rider/requestbookstatus/'+this.state.bookingresponse.id);
      	fetch('https://turvy.net/api/rider/requestbookstatus/'+this.state.bookingresponse.id,{
     	  	method: 'GET',
		   headers: new Headers({
		     'Authorization': 'Bearer '+value,
		     'Content-Type': 'application/json'
		   }),
		   })
      .then((response) => response.json())
      .then((json) =>{
      	console.log("get status if driver accept");
      	console.log(json);

      	if(json.status == 1){
      		console.log("INTERVAL IF "+this.myinterval);
      	   console.log(json.message);
      	  if(this.state.statusrecived == false){
      		if(json.message == 'progress'){
      			 clearInterval(this.myinterval);
      	       clearTimeout( this.settimeout);
      			    /*this.state.interval.map((i, index) => {
      			    	clearInterval(i);
      			    });
      			    */
      			    /*
      			    });
      			    */
      			//
      			this.setState({
      					rideinfoinprocess:json.data.booking,
      					bookingdriver:json.data.driver,
      					statusrecived:true,
      			},()=>{
      					this.props.navigation.replace('RideConfirm1',this.state);
      			})
      		}else if(json.message == 'complete'){
      			 clearInterval(this.myinterval);
      	      clearTimeout( this.settimeout);
      			this.setState({
      					statusrecived:true,
      			},()=>{
      				this.props.navigation.replace('BookMain');
      			})

      		}else if(json.message == 'cancel'){
      			 clearInterval(this.myinterval);
      	      clearTimeout( this.settimeout);
      			this.setState({
      					statusrecived:true,
      			},()=>{
      				this.props.navigation.replace('BookMain');
      			})
      			//this.props.navigation.navigate('BookMain');
      			//this.props.navigation.navigate('RideConfirm');
      		}else if(json.message == 'not assigned'){
      			console.log(json.message);
      			console.log("Driver Not accpeted Yet");
      			console.log(this.state.drivernearRem);
      			console.log("MAin Array ",this.state.drivernearAll);
      			let remigdriver = this.state.drivernearRem;
      			console.log("Array Length",remigdriver.length);
      			if(this.state.drivernearRem.length > 0){
      				if(this.state.drivernearRem[0].driverId > 0){
					   	let driverID = this.state.drivernearRem[0].driverId;
					   	this.state.drivernearRem.shift();
					   	console.log("REminder ",remigdriver);
					   	if(this.state.drivernearRem.length === 0){
					   		console.log("IN IF");
					   		this.setState({
						   		drivernearRem:this.state.drivernearAll,
						   	});
						   	//this.assignDriver(this.state.drivernearAll[0].driverId);
					   	}else{
					   		console.log("IN ELSE",driverID);
					   		this.setState({
					   			drivernearRem:this.state.drivernearRem,
					   		});
					   		this.assignDriver(driverID);
					   	}

					     //console.log(" BEFORE ASSIGN DRIVER ID");

					   }else{
					    let  remigdriver = this.state.drivernearAll;
					   if(remigdriver.length > 0){
					   	if(remigdriver[0].driverId > 0){
					   		remigdriver.shift();
						   	this.setState({
						   		drivernearRem:remigdriver,
						   	},()=>{
						   		 this.assignDriver(remigdriver[0].driverId);
						   	});
						   } // end of if
						 } //end of length if
					   }
      			}else{
      				console.log("HERE IN ELSE NO ELEMENT",this.state.drivernearAll);
      				remigdriver = this.state.drivernearAll;
      				if(this.state.drivernearAll.length > 0){
      					if(this.state.drivernearAll[0].driverId > 0){
					   		remigdriver.shift();
						   	this.setState({
						   		drivernearRem:remigdriver,
						   	},()=>{
						   		 this.assignDriver(this.state.drivernearAll[0].driverId);
						   	});
						   } // end of if
      				}

      			}

      		  // not acccpeted yet
      		}
      	}
      		/*const drivernear = [];
      		Object.keys(json.data).length > 0 && json.data.map((marker, index) => {
      			//console.log(marker.lat);
      			//console.log(marker.lng);
      			const coordinates = {
      					latitude:Number(marker.lat),
				      	longitude:Number(marker.lng) };


			      drivernear.push({['coordinates']:coordinates,
			      	['driverId']:marker.driverId,	});
      		});

      		console.log(drivernear);
      		this.setState({
      			drivernear:drivernear,
      		});
      		*/
      	}
     	 }
      )
      .catch((error) => console.error(error));
     });
  }


	swipicon =() =>{
		return(<Ionicons name="ios-close-outline" size={40} color="black" />)
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

       	<Grid >
   			<Row size={15}>
   			<Col size={12}>
   			    <ActivityIndicator size="large" color="#04b1fd" />
   			</Col>
   			</Row>
   			<Row size={10}>
   			<Col size={12} >
   			    <View style={{ alignItems: 'center',width:'100%'}}><Text style={{fontWeight:'bold',color:'#3f78ba',fontSize:16,textAlign:'center',textTransform:'uppercase'}}>We are processing your Booking ...</Text></View>
   			</Col>
   			</Row>
   			<Row size={10}>
   			<Col size={12}>
   			    <View style={{ alignItems: 'center' }}><Text style={{textAlign:'center',color:'#3f78ba',fontSize:16,fontWeight:'bold'}}>Your ride will start soon!</Text></View>
   			</Col>
   			</Row>
   			<Row size={50}>
   			<Col>
   			<SwipeButton
             containerStyles={{borderWidth:1,borderColor:'silver',color:'grey',padding:2}}
             shouldResetAfterSuccess={true}
            height={50}
            onSwipeFail={() => console.log('Incomplete swipe!')}
            onSwipeStart={() => console.log('Swipe started!')}
            onSwipeSuccess={() =>{
              console.log('Submitted successfully!')
              	this.props.navigation.navigate('BookCancel',this.state);
            }}
            railBackgroundColor="silver"
            railBorderColor="silver"
            railStyles={{
              backgroundColor: '#E5E9F2',
              borderWidth:1,
              borderColor: 'silver',
              color:'grey',
            }}
//979EAD
            thumbIconBackgroundColor="#FFFFFF"
            titleColor='#979EAD'
            title="Slide to cancel"
            thumbIconComponent={this.swipicon}
            thumbIconStyles={{
            	borderWidth:0,
            }}
            railFillBackgroundColor="#E5E9F2"
          />
   			</Col>
   			</Row>
   			<Row size={10}>
   				<Col>
   				</Col>
   			</Row>
   		</Grid>
     </View>
   </>
  );


  async intialLoad() {


     let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
      /*let location = await Location.getCurrentPositionAsync();
       //console.log(location.coords.latitude);
       //console.log(location.coords.longitude);
       const latitudeDelta = location.coords.latitude-location.coords.longitude;
       const longitudeDelta = latitudeDelta * ASPECT_RATIO;

        //console.log(latitudeDelta);
       //console.log(longitudeDelta);
       let origin ={};
      // console.log(this.props.route.params.destination);
      if(this.props.route.params.origin){
       	 origin = this.props.route.params.origin;
		}else{
			 origin = {
	      	latitude: location.coords.latitude,
	      	longitude: location.coords.longitude
	      }
		}
		let destination = {};
		let longitudedest = '';
		let latitudedest= '';
		if(this.props.route.params.destination){
			destination = this.props.route.params.destination;
			longitudedest = destination.longitude;
			latitudedest = destination.latitude;
		}
      let selectedvehicle = {};
      console.log(this.props.route.params.selectedvehicle);
      if(this.props.route.params.selectedvehicle){
      	selectedvehicle = this.props.route.params.selectedvehicle;
      }

      this.setState({
      	locationcur:location,
      	latitudecur:location.coords.latitude,
      	longitudecur:location.coords.longitude,
      	latitudeDelta:0.00176,
      	longitudeDelta:0.00176,
      	origin:origin,
      	destination:destination,
      	latitudedest:latitudedest,
      	longitudedest:longitudedest,
      	selectedvehicle:selectedvehicle,
      });
      //console.log(location);

       if (location.coords) {
		    const { latitude, longitude } = location.coords;
		      let keys = {
		        latitude : latitudedest,
		        longitude : longitudedest
		    }
		    /*let response = await Location.reverseGeocodeAsync(keys);

		     //console.log(response);

		   let address = '';
		    for (let item of response) {
		    	//${item.street},
		      let address = `${item.name}, ${item.postalCode}, ${item.city}`;
		       //console.log(address);
		       this.setState({
		      	destlocatdesc:address,
		      });
		    }
		    */
		  //}
      //.finally(() => setLoading(false));
    }

  render() {

  	 return (

	    <View style={styles.container}>
	    <StatusBar backgroundColor="#fff" barStyle="light-content"/>
      <MapView style={styles.map}
       region={{
         latitude: this.state.latitudecur,
         longitude: this.state.longitudecur,
         latitudeDelta: this.state.latitudeDelta,
         longitudeDelta: this.state.longitudeDelta,
       }}
       customMapStyle={stylesArray}
               ref={c => this.mapView = c}
        onRegionChangeComplete ={ (e) => {
  				if(this.state.display == false){
  					this.setState({
  					display:true,
  				});
  				}

  }}

       >
     {Object.keys(this.state.drivernear).length > 0 ?
     this.state.drivernear.map((marker, index) => {
     	return (
			    <MapView.Marker.Animated
			    key={marker.id}
			      coordinate={{latitude: marker.coordinates.latitude, longitude: marker.coordinates.longitude}}
			      title={'vehcile'}
			    >
			    <Image
			        style={styles.vehmarkerimage}
			        source={imageveh} />
			   </MapView.Marker.Animated>
  		    );
     })
     : null
    }
    <>
     { this.state.latitudecur  && this.state.longitudecur  ?
       (
     <Marker
      key={1}
      coordinate={{latitude:this.state.latitudecur, longitude:this.state.longitudecur}}

      style={{ alignItems: "center"}} >
    <View  style={{
          alignItems: "center",
          borderColor:'#135AA8',
          borderWidth:1,
          width:150,
          backgroundColor:'#fff',
          height: 40,
          alignContent:'center',
          flex:1,
          flexDirection:'row'
        }}>
        <View style={{alignItems: 'center',
    justifyContent: 'center',width:'30%',height:'100%',backgroundColor:'#135AA8'}}>
         <Text style={{color:'#fff',textAlign:'center'}}>{this.state.duration} min</Text>
        </View>
         <View  style={{alignItems: 'center',
    justifyContent:'center',width:'70%'}}>
         <Text
   	    numberOfLines={1}
          style={{
            position: "absolute",
            color: "#000705",
            fontWeight: "bold",
            textAlign: "center",
            fontSize: 12,
          }}
        >{this.state.bookingresponse.origin}</Text>
        </View>
    </View>
    <FontAwesome5 name="map-pin" size={30} color={"#D23C2F"} />
    </Marker>)
    :(<></>)
    }

    { this.state.latitudedest  && this.state.longitudedest  ?
       (
       	<Marker
      key={'destinationkey'}
      coordinate={{latitude:this.state.latitudedest, longitude:this.state.longitudedest}}

      style={{ alignItems: "center"}} >

       <View  style={{
          alignItems: "center",
          borderColor:'#135AA8',
          borderWidth:1,
          width:150,
          backgroundColor:'#fff',
          height: 40,
          alignContent:'center',
          flex:1,
          flexDirection:'row'
        }}>

         <View  style={{alignItems: 'center',
    justifyContent:'center',width:'100%',padding:10}}>

         <Text
   	    numberOfLines={1}
          style={{
            position: "absolute",
            color: "#000705",
            fontWeight: "bold",
            textAlign: "center",
            fontSize: 12,

          }}
        >{this.state.bookingresponse.destination}</Text>
        </View>
    </View>
   <FontAwesome5 name="map-marker-alt" size={30} color={"#D23C2F"} />

    </Marker>
       ) :
       (
       <></>
       )

     }
      {Object.keys(this.state.waypointslnglat).length > 0 ?
    this.state.waypointslnglat.map((item, key) => {
    	return(
    		<MapView.Marker.Animated
  		coordinate={{latitude: item.latitude,longitude: item.longitude}}
  		>
  		<Entypo name="stopwatch" size={24} color="#D23C2F" />
  		</MapView.Marker.Animated>
    	)
	 })
	 :null
   }
    { Object.keys(this.state.origin).length > 0 && Object.keys(this.state.destination).length > 0 ?
    (
    <>
    	<MapViewDirections
    	region={'AU'}
    origin={this.state.origin}
     waypoints={this.state.waypointslnglat}
    destination={this.state.destination}
    strokeWidth={5}
    lineDashPattern={[1]}
      strokeColor="#5588D9"
      apikey="AIzaSyAr2ESV30J7hFsOJ5Qjaa96u9ADSRX6_Sk"
      lineCap={'butt'}
      lineJoin={'miter'}
      onStart={(params) => {
              console.log(`Started routing between "${params.origin}" and "${params.destination}"`);

            }}
      onReady={result => {
      			//console.log(result);
              //console.log(`Distance: ${result.distance} km`)

              console.log(`Duration: ${result.duration} min.`)
              let duration = result.duration.toFixed();
              let distance = result.distance;
              // find amount to display

             const  distancecal = distance/2;
		        const circumference = 40075;
		        //const oneDegreeOfLatitudeInMeters = 111.32 * 1000;
		        const oneDegreeOfLatitudeInMeters = distancecal*4;
		        const angularDistance = distancecal/circumference;

        		  const latitudeDelta = distancecal / oneDegreeOfLatitudeInMeters;
        		const longitudeDelta = Math.abs(Math.atan2(
                Math.sin(angularDistance)*Math.cos(this.state.latitudedest),
                Math.cos(angularDistance) - Math.sin(this.state.latitudedest) * Math.sin(this.state.latitudedest)))

              console.log(duration);
              this.setState({
              	duration:duration,
              	distance:distance,
              	isLoading:false,
              	display:true
              },()=>{
    				this.mapView.fitToCoordinates(result.coordinates, {
                edgePadding: {
                  right:DEVICE_WIDTH*0.20,
			            left:DEVICE_WIDTH*0.20,
			            top:DEVICE_HEIGHT*0.25,
			            bottom:DEVICE_HEIGHT*0.45	,
                },
                   animated: true,
              });
    	     });

            }}
  			/>
  		</>
    )
    	:
    	(
    	<>
    	</>
    	)
    }
   </>
  </MapView>

  { this.state.display ? (
  <BottomSheet
        snapPoints={[SCREENHEIGHT]}
        borderRadius={20}
        renderContent={this.renderContent}
        overdragResistanceFactor={0}
        enabledManualSnapping={false}
         enabledContentTapInteraction={false}
        enabledContentGestureInteraction={false}
      />)
      :(
      	<Text></Text>
      )
    }

    <View style={{position:'absolute',width:'100%',
  				height:200,top:'9%',left:'0%',zIndex:100,backgroundColor:'transparent',flex:1,flexDirection:'row'}}>
  			 <Grid>
  			 <Row style={{height:60,justifyContent:'center',alignContent:'center'}}>
				<Col size={4}>
					<TouchableOpacity
				   style={styles.menubox}
				     onPress={() => this.props.navigation.toggleDrawer()} >
				     <Entypo name="menu" size={40} color="#135aa8" />
		  			</TouchableOpacity>
				</Col>
				<Col size={4}>
					<View style={{alignItems:'center',}}>
                    <Button color="#FFF" mode="contained" labelStyle={styles.yellow} style={styles.btnSmall}>
                    <MaterialCommunityIcons size={14} name="cards-diamond" />22</Button>
                </View>
				</Col>
				<Col size={4} style={{alignItems:'flex-end', paddingRight:15}}>
				<TouchableOpacity
				   style={styles.serachbox}
				     onPress={() => console.log('serach')} >
				     <Ionicons name="ios-search-sharp" size={25} color="#135aa8" style={{fontWeight:'bold'}} />
		  			</TouchableOpacity>
				</Col>
			</Row>
		</Grid>
	</View>
  </View>
	  );
   }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: Dimensions.get('window').width,
    height: '100%',
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
 	height:150,
 	backgroundColor:'#e5e5e5',
 	borderWidth:1,
 	borderColor:'#e5e5e5',
 	padding:10,
 	margin:10,
 	alignItems:'center',
 	borderRadius:10,
 	justifyContent:'center'
  },
  servicebocimage:{
    width: '100%',
    height: '100%',
    aspectRatio: 1 * 1.4,
	 resizeMode: 'contain'
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
	},
	vehmarkerimage:{
    width: 20,
    height:35,
	 alignSelf:'center'
	},
});
