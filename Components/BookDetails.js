import { StatusBar } from 'expo-status-bar';
import React from "react";
import { StyleSheet, Text, View,Dimensions,Image,ScrollView ,TouchableOpacity,ActivityIndicator,BackHandler} from 'react-native';
//import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';
import { EvilIcons,Ionicons,MaterialCommunityIcons,FontAwesome5,Entypo,FontAwesome } from '@expo/vector-icons'; 
const imagemarker = require('../assets/location-pin-2965.png');
import BottomSheet from 'reanimated-bottom-sheet';
import { Button,Divider } from 'react-native-paper';
import { Col, Row, Grid } from "react-native-easy-grid";
import SmartLoader from './SmartLoader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Spinner from 'react-native-loading-spinner-overlay';
const { width, height } = Dimensions.get('window');
const imageveh = require('../assets/images/driver-veh-images_60.png');
import  { changeMode, 
    MapboxCustomURL} from  "../Riders/MapDayNight";
import SwipeButton from 'rn-swipe-button';
import TopBar from "./TopBar";

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0043;
const SCREENHEIGHT = height*.65;

import * as firebase from "firebase";
import "firebase/firestore";
import * as geofirestore from 'geofirestore';
import apiKeys from '../config/keys';


//import MapboxGL from "@rnmapbox/maps";
import  MapboxGL from "@react-native-mapbox-gl/maps"; 
MapboxGL.setAccessToken("pk.eyJ1IjoibWFsLXdvb2QiLCJhIjoiY2oyZ2t2em50MDAyMzJ3cnltMDFhb2NzdiJ9.X-D4Wvo5E5QxeP7K_I3O8w");
import { lineString as makeLineString } from '@turf/helpers';
import { point } from '@turf/helpers';


if (!firebase.apps.length) {
    console.log('Connected with Firebase');
    firebase.initializeApp(apiKeys.firebaseConfig);
}

const db = firebase.firestore();
const firestore = firebase.firestore();

const GeoFirestore = geofirestore.initializeApp(firestore);
const geocollection = GeoFirestore.collection('driver_locations');


export default class BookDetails extends React.PureComponent {
  constructor(props) {
    super(props);
     this.startPoint = [151.2195, -33.8688];
    this.finishedPoint = [151.2195, -33.8688];
    this.state = {
        	step:1,
        	locationcur:{},
        	sourceLocation:{},
        	latitudecur:-33.8688,
        	longitudecur:151.2195,
        	waypointslnglat:[],
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
         isLoading:false,
         display:false,
         distance:'',
         bookingresponse:{},
         selectedvehicle:{},
         selectedvehiclefare:0,
         selectedprcperunit:0,
         selectedminprc:0,
         drivernear:{},
         tocancel:false,
         selectedcancelchr:0,
          routemap:null,
         locationcordsapistr:null,
         MapboxStyleURL:MapboxCustomURL,
         routecorrdinates:[
          this.startPoint, //point A "current" ~ From
          this.finishedPoint, //Point B ~ to
         ],
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
    this.mapView = null;
    
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
        	this.getNearBydriver();
      let listcord = [];
   	let locationcordsapi = [];
   	console.log("BEFORE DESINARION",this.props.route.params.origin);
   	 if(Object.keys(this.props.route.params.origin).length > 0){
      	//console.log("origin from");
       	 let origincord = [this.props.route.params.origin.longitude,this.props.route.params.origin.latitude];
       	 let element = { coordinates: origincord };
       	 locationcordsapi.push(origincord);
       	 //listcord = Object.assign(listcord, element);
       	 listcord.push(element);
       	 console.log("ORIGN coordinate List",Object.values(listcord));
		} 
		
	   if(Object.keys(this.props.route.params.destination).length > 0){
	   	 let origincord = [this.props.route.params.destination.longitude,this.props.route.params.destination.latitude]; 
       	 let element = { coordinates: origincord };
       	 locationcordsapi.push(origincord);
       	 //listcord = [...listcord, element];
       	 listcord.push(element);
       	 console.log("DESTINATION coordinate List",Object.values(listcord));
	   }
	   console.log("coordinate List",Object.values(listcord));
	   let locationcordsapistr = locationcordsapi.join(";");
	   
   	if(this.props.route.params.selectedvehicle){
   		   		console.log("SELECTED VEHCILE REsponse");
   		console.log(this.props.route.params.selectedvehicle);
      	this.setState({ 
             selectedvehicle:this.props.route.params.selectedvehicle,
             origin:this.props.route.params.origin,
             destination:this.props.route.params.destination,
             latitudedest:this.props.route.params.latitudedest,
             longitudedest:this.props.route.params.longitudedest,
             latitudecur:this.props.route.params.latitudecur, 
             longitudecur:this.props.route.params.longitudecur,
             bookingresponse:this.props.route.params.bookingresponse,
             selectedvehiclefare:this.props.route.params.selectedvehiclefare,
             selectedprcperunit:this.props.route.params.selectedprcperunit,
             selectedminprc:this.props.route.params.selectedminprc,
              waypointslnglat:this.props.route.params.waypointslnglat,
              selectedcancelchr:this.props.route.params.selectedcancelchr,
              locationcordsapistr:locationcordsapistr
        });
        //console.log(this.props.route.params.selectedvehiclefare);
      }
      
   	this.intialLoad();
  		this.unsubscribe =  navigation.addListener("focus",() => {
  			this.setState({ 
             selectedvehicle:this.props.route.params.selectedvehicle,
             inprocessing:0,
         });
  			this.intialLoad();
  		});			
  } // end of function
   
   async getNearBydriver(){
  		//await AsyncStorage.getItem('accesstoken').then((value) => {
  			
  			const query = geocollection.near({ center: new firebase.firestore.GeoPoint(-33.8688,151.2195 ), radius: 100 });
	 		//.where('isBusy','==','no')
	 		const accesstoken = await AsyncStorage.getItem('accesstoken');
				// Get query (as Promise)
			query.get().then((value) => {
			  // All GeoDocument returned by GeoQuery, like the GeoDocument added above
			  console.log("IN QUERY");
			  console.log(value.docs);
			  const drivernear = [];
			   value.docs.map((item, index) => {
			   		  console.log(item.data().coordinates);
			   	if(item.exists == true){
			   			
			   			drivernear.push({['coordinates']:item.data().coordinates,});
					      this.setState({
		      			drivernear:drivernear,
		      		});
			   	}
			   });
			 });
	 
      	/*fetch('https://turvy.net/api/rider/nearByDrivers',{
     	  	method: 'GET', 
		   headers: new Headers({
		     'Authorization': 'Bearer '+value, 
		     'Content-Type': 'application/json'
		   }),
		   })
      .then((response) => response.json())
      .then((json) =>{ 
      	console.log("NEAR BY DRIVER");
      	console.log(json.data);
      	if(json.status == 1){
      		const drivernear = [];
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
      	}
     	 }
      )
      .catch((error) => console.error(error));
      */
     //});
    }
   componentWillUnmount() {
    this.unsubscribe();
  }
  
  async _retry(){
  			
  			await AsyncStorage.getItem('accesstoken').then((value) => {
      	fetch('https://www.turvy.net/api/rider/book/retry/'+this.state.bookingresponse.id,{
     	  	method: 'POST', 
		   headers: new Headers({
		     'Authorization': 'Bearer '+value, 
		     'Content-Type': 'application/json'
		   }),
		   body:JSON.stringify({
	 				'fee' : this.props.route.params.selectedcancelchr,
	 			}) 
		   })
      .then((response) => response.json())
      .then((json) =>{ 			
      	//console.log("No RESponse CAncellled");
      	console.log("DELTE ",json);
      	if(json.status == 1){
      		this.props.navigation.replace('BookProcess',this.state);
      	}
     	 }	
      )
      .catch((error) =>{
      	console.error(error);	
      });
     }); 	
     
  
  }
    
  async _onPressDone(){
  //	alert(this.state.bookingresponse.id);
  	//alert(this.props.route.params.selectedcancelchr);
  	await AsyncStorage.getItem('accesstoken').then((value) => {
      	fetch('https://www.turvy.net/api/rider/book/cancel/'+this.state.bookingresponse.id,{
     	  	method: 'POST', 
		   headers: new Headers({
		     'Authorization': 'Bearer '+value, 
		     'Content-Type': 'application/json'
		   }),
		   body:JSON.stringify({
	 				'fee' : 0,
	 			}) 
		   })
      .then((response) => response.json())
      .then((json) =>{ 			
      	//console.log("No RESponse CAncellled");
      	console.log("BOOK CANCEL DELTE ",json);
      	if(json.status == 1){
      		this.props.navigation.replace('BookMain',this.state);
      	}
     	 }	
      )
      .catch((error) =>{
      	console.error(error);	
      });
     }); 	
     
  		/*this.setState({
  			isLoading:false,
  		},()=>{
    		this.props.navigation.navigate('BookMain',this.state);
    	});
    	*/	
    	
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
    {this.state.inprocessing == 0 ? 
   	( <Grid >           
   			<Row size={3}>
   			<Col >
   			 	<View style={{backgroundColor:'#cccccc',borderRadius:10,borderColor:'#cccccc',padding:10}}>
				  <Text  style={{color:'#fff',fontWeight:'bold',textAlign:'center',fontSize:20}}>Cab not available on your location or driver not responding.</Text>
				  <Text style={{color:'#fff',fontWeight:'bold',textAlign:'center',fontSize:20}}>Please try again after sometime.</Text>
				 	</View>
   			</Col>
   			</Row>
   			 <Row size={1}>
   			<Col size={12} style={{paddingTop:10}}>
   				<Button  mode="contained" color={'#135AA8'} onPress={() => this._retry() }>
				    Try again
				 	</Button>
   			</Col>
   			
   			</Row>
   			<Row size={1}>
   			<Col size={12} style={{paddingTop:10}}>
   				<Button  mode="contained" color={'#135AA8'} onPress={() => this._onPressDone() }>
				    Cancel
				 	</Button>
   			</Col>
   			</Row>
   			 <Row size={4}>
   			<Col size={12}>
   			</Col>
   			</Row>
       </Grid>)
       :
       (
       	<Grid >
   			<Row style={{height:120,justifyContent:'center',alignContent:'center'}}>
   			<Col size={12}>
   			    <ActivityIndicator size="large" color="#0000ff" />
   			</Col>
   			</Row>
   			<Row style={{height:50,}}>
   			<Col size={12} >
   			    <View style={{ alignItems: 'center' }}><Text style={{fontWeight:'bold',fontSize:20,textAlign:'center'}}>We are processing your Booking ......</Text></View>
   			</Col>
   			</Row>
   			<Row style={{height:50,}}>
   			<Col size={12}>
   			    <View style={{ alignItems: 'center' }}><Text style={{textAlign:'center'}}>Your ride will start soon!</Text></View>
   			</Col>
   			</Row>
   			<Row style={{height:100,}}>
   			<Col>
   			<SwipeButton
                        containerStyles={{borderWidth:1,borderColor:'silver',color:'grey',padding:2}}
            height={50}
            onSwipeFail={() => console.log('Incomplete swipe!')}
            onSwipeStart={() => console.log('Swipe started!')}
            onSwipeSuccess={() =>
              console.log('Submitted successfully!')
            }
            railBackgroundColor="silver"  
            railBorderColor="silver"
            railStyles={{
              backgroundColor: '#44000088',
              borderWidth:1,
              borderColor: 'silver',
              color:'grey',
            }}

            thumbIconBackgroundColor="#FFFFFF"
            titleColor='grey'
            title="Slide to Cancel"
            thumbIconComponent={this.swipicon}
            thumbIconStyles={{
            	borderWidth:0,
            }}
            railFillBackgroundColor="#FFFFFF"
          />
   			</Col>
   			</Row>
   		</Grid>
       )
      } 
    </View>
   </>
  );   
  
  
  async intialLoad() {
  	
  	  
     let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
    
    }
    
   getdriverList(){
		 if(Object.keys(this.state.drivernear).length > 0){
		 	this.state.drivernear.map((marker, index) =>{
		 	if(marker.coordinates.latitude && marker.coordinates.longitude ){
		 		return(<MapView.Marker 
	    key={index}
	      coordinate={marker.coordinates}
	      title={'vehcile'}
	    > 
	    <Image
        style={styles.vehimage}
        source={imageveh} />
	  </MapView.Marker>);
		 	}
		 }); 
		}  
   }
  render() {
  
  	 return (
	    <View style={styles.container}>
	    <StatusBar backgroundColor="#fff" barStyle="light-content"/>
	    <Spinner
          visible={this.state.isLoading}
          color='#FFF'
          overlayColor='rgba(0, 0, 0, 0.5)'
        />
	    <TopBar {...this.props} />
	    <MapboxGL.MapView style={styles.map}
     		showUserLocatin={true}
     		ref={c => this.mapView = c}
     		showUserLocation={true}
     		cluster
     		logoEnabled={false}
     		attributionEnabled={false}
     		coordinates={[this.state.longitudecur,this.state.latitudecur]}
     		heading={this.state.pathHeading}
     		zoomEnabled={true}
     		styleURL={this.state.MapboxStyleURL}
     		onDidFinishRenderingMapFully={(index)=>{
     		  //console.log("map load complete");
     		  //79.075274,21.089974;79.0899,21.0893;79.1069,21.0962;79.097723,21.131447
	       fetch('https://api.mapbox.com/directions/v5/mapbox/driving/'+this.state.locationcordsapistr+'?geometries=geojson&access_token=pk.eyJ1IjoibWFsLXdvb2QiLCJhIjoiY2oyZ2t2em50MDAyMzJ3cnltMDFhb2NzdiJ9.X-D4Wvo5E5QxeP7K_I3O8w',{
				method: 'GET',
	 		}).then(function (response) {
	 			return response.json();
	  		}).then( (result)=> {
	  			console.log("Data from api geomery ",result.routes[0].geometry);
	  			let distance = result.routes[0].distance;
	  			distance = distance/1000;
	  			
	  			//console.log("COORDINATES ARRAY", Object.values(result.routes[0].geometry.coordinates));
	  			this.setState({
	  			routecorrdinates: Object.values(result),
	  			routemap:makeLineString(result.routes[0].geometry.coordinates),
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
	  				if(this.camera && this.state.longitudedest != '' && this.state.latitudedest != '' ){
	  					this.camera.fitBounds([this.state.longitudecur,this.state.latitudecur], [this.state.longitudedest,this.state.latitudedest],[100,40,250,20],1000);
	  				}
	  			});
			});
     		}}
     		 >
     		  {this.state.longitudecur && this.state.latitudecur ?
     		  (<MapboxGL.Camera
	     		 ref={c => this.camera = c}
            animationDuration={250}
            minZoomLevel={1}
            zoomLevel={13}
            maxZoomLevel={20}
            animationMode="flyTo"
            centerCoordinate={[this.state.longitudecur,this.state.latitudecur]}
            Level={10} 
            heading={this.state.pathHeading}
          />)
          :
          (<></>)
         }
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
          <MapboxGL.ShapeSource  id="mapbox-directions-source" shape={this.state.routedirect}>
			      <MapboxGL.LineLayer
			        id="mapbox-directions-line"
			        style={{lineColor:'#135AA8',lineWidth:2}}
			        />
    	     </MapboxGL.ShapeSource>  
           </MapboxGL.MapView>
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
	divider:{
    borderBottomColor: 'black',
    borderBottomWidth: 1,
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
    width: 25,
    aspectRatio: 1 * 1.4,
	 resizeMode: 'contain',
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
	},vehimage:{
    width: 25,
    aspectRatio: 1 * 1.4,
	 resizeMode: 'contain',
	 alignSelf:'center'
	},
});
