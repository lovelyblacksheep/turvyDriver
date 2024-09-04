import { StatusBar } from 'expo-status-bar';
import React from "react";
import { StyleSheet, Text, View,Dimensions,Image,ScrollView ,TouchableOpacity,ActivityIndicator,BackHandler,Modal} from 'react-native';
//import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';
import { EvilIcons,Ionicons,MaterialCommunityIcons,FontAwesome5 } from '@expo/vector-icons'; 
const imagemarker = require('../assets/location-pin-2965.png');
import Animated from 'react-native-reanimated';
import BottomSheet from 'reanimated-bottom-sheet';
import { Button } from 'react-native-paper';
import { Col, Row, Grid } from "react-native-easy-grid";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Spinner from 'react-native-loading-spinner-overlay';
const { width, height } = Dimensions.get('window');

//import MapboxGL from "@rnmapbox/maps";
import  MapboxGL from "@react-native-mapbox-gl/maps"; 
MapboxGL.setAccessToken("pk.eyJ1IjoibWFsLXdvb2QiLCJhIjoiY2oyZ2t2em50MDAyMzJ3cnltMDFhb2NzdiJ9.X-D4Wvo5E5QxeP7K_I3O8w");
import { lineString as makeLineString } from '@turf/helpers';
import { point } from '@turf/helpers';

import CancelPopEnroute from './CancelPopEnroute';

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0043;
const SCREENHEIGHT = height*.80;
//console.log("height");
//console.log(SCREENHEIGHT);

export default class BookCancelEnrt extends React.Component {
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
         selectedcancelchr:0,
         selectsurcharge:0,
         selectedvehiclefare:0,
         dedeuctinfo:{},
          routemap:null,
         locationcordsapistr:null,
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
   	const {navigation} = this.props;
   	console.log("PREVIOUS PAGE PROPS",this.props);
   	console.log(this.props.route.params);
   	console.log(this.props.route.params.selectedvehicle);
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
      	this.setState({ 
      	    state:this.props.route.params,	
             selectedvehicle:this.props.route.params.selectedvehicle,
             origin:this.props.route.params.origin,
             destination:this.props.route.params.destination,
             latitudedest:this.props.route.params.latitudedest,
             longitudedest:this.props.route.params.longitudedest,
             latitudecur:this.props.route.params.latitudecur, 
             longitudecur:this.props.route.params.longitudecur,
             selectedcancelchr:this.props.route.params.selectedcancelchr,
              selectsurcharge:this.props.route.params.selectsurcharge,
             selectedvehiclefare:this.props.route.params.selectedvehiclefare,
             dedeuctinfo:this.props.route.params.dedeuctinfo,
             locationcordsapistr:locationcordsapistr
        });
    }
      
   	this.intialLoad();
  		this.unsubscribe =  navigation.addListener("focus",() => {
  			this.setState({ 
  			  state:this.props.route.params,
             selectedvehicle:this.props.route.params.selectedvehicle,
             inprocessing:0,
         });
  			this.intialLoad();
  		});
  			
  } // end of function
   
   componentWillUnmount() {
    //this.unsubscribe();
  }
    
  async _onPressDone(){
  		this.setState({
  			inprocessing:1,
  			isLoading:false,
  		},()=>{
    		//this.props.navigation.navigate('PromoCode',this.state);
    	});	
  }

	swipicon =() =>{
		return(<Ionicons name="ios-close-outline" size={40} color="black" />)
	} 
	  
 
  async intialLoad() {
  	
  	  
     let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
      /*
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
		    let response = await Location.reverseGeocodeAsync(keys);
		    
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
		  }
		  
		  */
		  
      //.finally(() => setLoading(false));
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
		<MapboxGL.MapView style={styles.map}
     		showUserLocatin={true}
     		ref={c => this.mapView = c}
     		showUserLocation={true}
     		cluster
     		coordinates={[this.state.longitudecur,this.state.latitudecur]}
     		heading={this.state.pathHeading}
     		zoomEnabled={true}
     		logoEnabled={false}
     		attributionEnabled={false}
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
	  				this.camera.fitBounds([79.075274, 21.089974], [79.097723,21.131447],[100,40,300,20],1000);
	  			});
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
         
          <MapboxGL.ShapeSource  id="mapbox-directions-source" shape={this.state.routedirect}>
			      <MapboxGL.LineLayer
			        id="mapbox-directions-line"
			        style={{lineColor:'#135AA8',lineWidth:2}}
			        />
    	     </MapboxGL.ShapeSource>  
           </MapboxGL.MapView>
   <CancelPopEnroute {...this.props}  />
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
	mainmodal:{width:'90%',
	backgroundColor:'#fff',
	flex:1,
	shadowColor: "#000",
 			borderRadius:10,
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,},
	modalbox:{
  		position: 'absolute',
  		top: 0, 
  		bottom: 0, 
  		left: 0, 
  		right: 0,
   	backgroundColor: "rgba(255,255,255,0.5)"
}
});
