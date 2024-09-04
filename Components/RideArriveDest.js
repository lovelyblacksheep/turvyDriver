import React from "react";
import { StyleSheet, Text, View,Dimensions,Image,ScrollView ,TouchableOpacity,ActivityIndicator,BackHandler,StatusBar,Platform,Linking,TextInput} from 'react-native';
//import * as Permissions from 'expo-permissions';
//import MapView , { Marker , Polyline ,Callout }from 'react-native-maps';
import * as Location from 'expo-location';
//import MapViewDirections from 'react-native-maps-directions';
import GooglePlacesInput from './GooglePlacesInput';
import { EvilIcons,Ionicons,MaterialCommunityIcons,FontAwesome5,Feather,AntDesign,Entypo } from '@expo/vector-icons'; 
const imagemarker = require('../assets/location-pin-2965.png');
const driversummy = require('../assets/driversummy.png');

import Animated from 'react-native-reanimated';
import BottomSheet from 'reanimated-bottom-sheet';
import { Button,Divider } from 'react-native-paper';
import { Col, Row, Grid } from "react-native-easy-grid";
import SmartLoader from './SmartLoader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FlashMessage , { showMessage, hideMessage }  from "react-native-flash-message";
import { Rating, AirbnbRating } from 'react-native-ratings';
const StatusBarheight = StatusBar.currentHeight+80;
import { Audio } from 'expo-av';
const { width, height } = Dimensions.get('window');
import RiderRating from "./RiderRating";
import TopBar from "./TopBar";

import  { changeMode, 
    MapboxCustomURL} from  "../Riders/MapDayNight";
import SwipeButton from 'rn-swipe-button';

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0043;
const SCREENHEIGHT = height*.80;
//console.log("height");
//console.log(SCREENHEIGHT);
//import MapboxGL from "@rnmapbox/maps";

import  MapboxGL from "@react-native-mapbox-gl/maps"; 
//MapboxGL.setAccessToken("pk.eyJ1IjoibWFsLXdvb2QiLCJhIjoiY2oyZ2t2em50MDAyMzJ3cnltMDFhb2NzdiJ9.X-D4Wvo5E5QxeP7K_I3O8w");
import { lineString as makeLineString } from '@turf/helpers';
import { point } from '@turf/helpers';


export default class RideArriveDest extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        	step:1,
        	locationcur:{},
        	sourceLocation:{},
        	latitudecur:21.0912724,
        	longitudecur:79.0769456,
         latitudedest:'',
        	longitudedest:'',
        	destlocatdesc:'',
        	latitudeDelta: 0.0043,
         longitudeDelta: 0.0034,
         origin:{},
         destination:{},
         duration:'',
         servicetypes:[],
         selectedvehicle:{},
         inprocessing:0,
         display:false,
         bookingdriver:{},
         rewardpoints:0,
         selectedvehiclefare:0,
         selectsurcharge:0,
         waypointslnglat:[],
         distancetravel:0,
         end_time:'',
         start_time:'',
         rating_driver:'',
         MapboxStyleURL:MapboxCustomURL,
    };
    
    this.mapView = null;
    this.onGoBackCallback = this.onGoBackCallback.bind(this);
   }
 
    componentDidMount(){
    	this.setState({
            MapboxStyleURL:changeMode()
        })
        this.intervalModeChange = setInterval(async () => {
            this.setState({
                MapboxStyleURL:changeMode()
            })
        }, 10000);
    	const {navigation,state} = this.props;
    	  BackHandler.addEventListener('hardwareBackPress', this.onGoBackCallback);
        navigation.addListener('gestureEnd', this.onGoBackCallback);
        
		// this.getrewards();
		this.unsubscribe =  navigation.addListener("focus",() => {
			BackHandler.addEventListener('hardwareBackPress', this.onGoBackCallback);
       	navigation.addListener('gestureEnd', this.onGoBackCallback);
      });
      this.unsubscribeblur =  navigation.addListener("blur",() => {
      	BackHandler.removeEventListener('hardwareBackPress', this.onGoBackCallback);
      });
      console.log("FARE" , this.props.route.params.selectedvehiclefare);
      console.log("FARE SURCHANGWE " , this.props.route.params.selectsurcharge);
    		this.setState({
    			selectedvehiclefare:this.props.route.params.selectedvehiclefare,
    			selectsurcharge:this.props.route.params.selectsurcharge,
    			 waypointslnglat:this.props.route.params.waypointslnglat,
    			 distancetravel:this.props.route.params.distancetravel,
    		})

    
      this.getRewards();  	 
     
   	
   	/*setTimeout(()=>{ 
   		//hideMessage()
   		this.runsound() }, 2000)
   	this.intialLoad();
   	showMessage({
           message: '',
           type: "default",
           backgroundColor: "#135AA8", 
           autoHide:false,
           style:{
           		margin:20,
           		borderRadius:10,
           		alignItems:'center',
           		justifyContent:'center'
           },
          
           renderCustomContent: ()=>{
           	return this.renderMessages();
           },
        	 });
  		this.unsubscribe =  navigation.addListener("focus",() => {
  			this.setState({ 
             selectedvehicle:this.props.route.params.selectedvehicle,
             inprocessing:0,
         });
  			this.intialLoad();
  		});
  		*/			
  } // end of function

	
	

   async getRewards(){
		 await AsyncStorage.getItem('rewardpoints').then((value) => {
			this.setState({
				rewardpoints:value,
			});
		});	    
  }
  
  onGoBackCallback(){
      console.log('Android hardware back button pressed and iOS back gesture ended');
      this.setState({
      	modalvisible:true
      });
      this.props.navigation.replace('BookMain',this.state);
     return true;
   }
   
   
  
    
   componentWillUnmount() {
   // this.unsubscribe();
  }
    

	
  ratingCompleted =(rating) =>{
  		//console.log(rating);
  		this.setState({
  			inprocessing:1,
  		})
  };
	
   
  
  
  async intialLoad() {
  	
 
     let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
      let location = await Location.getCurrentPositionAsync();
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
		   /* let response = await Location.reverseGeocodeAsync(keys);
		    
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
		  }
      //.finally(() => setLoading(false));
    }
    
  render() {
  
  	 return (
	    <View style={styles.container}>
	   <FlashMessage position={{top:80, left:10,right:10}} style={{borderRadius:2}}  />
      <MapboxGL.MapView style={styles.map}
     		showUserLocatin={true}
     		ref={c => this.mapView = c}
			styleURL={this.state.MapboxStyleURL}
     		cluster
     		logoEnabled={false}
     		attributionEnabled={false}
     		coordinates={[this.state.longitudecur,this.state.latitudecur]}
     		heading={this.state.pathHeading}
     		zoomEnabled={true}
     		onDidFinishRenderingMapFully={(index)=>{
	       this.setState({
  					display:true,
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

      { this.state.latitudecur != '' && this.state.longitudecur != '' ?
		       (<MapboxGL.PointAnnotation 
			           id={'markerdest'}
			            anchor={{ y: 1, x: 0.5 }}
			           coordinate={[this.state.longitudecur,this.state.latitudecur]}>
			            <View style={{height: 30, width: 30, backgroundColor: 'transparent'}}>
			              <FontAwesome5 name="map-marker-alt" size={30} color={"#910101"} />
			           </View>
	         </MapboxGL.PointAnnotation>   
          ):
         (
       <></>
       )
     }   
    	  
           </MapboxGL.MapView>
  <TopBar {...this.props} />
  { this.state.display ? (
  <RiderRating {...this.props}  />)
      :(
      	<Text></Text>
      )
    }
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
    aspectRatio: 1 * 1.4,
	 resizeMode: 'contain'
	},
	textInput: {
        borderRadius: 10,
        borderWidth: 1,
        borderColor:'#ddd',
        fontSize: 16,
        paddingHorizontal: 20,
        marginHorizontal: 0,
        padding: 10,
        marginTop: 8,
        height: 80,

    },yellow:{color:'#fec557'},
btnSmall:{
		backgroundColor:'#3f78ba',
		borderWidth:5,
		borderColor:'#FFF',
		fontSize:50,
		shadowColor: '#000',
	},serachbox:{
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
	},menubox:{
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
});
