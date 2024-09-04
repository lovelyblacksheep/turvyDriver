import debounce from 'lodash.debounce';
import React from "react";
import Qs from 'qs';
import { StyleSheet, Text, View,Dimensions,Image ,FlatList,ScrollView, TouchableHighlight,Keyboard,KeyboardAvoidingView,TouchableOpacity,StatusBar,Fragment} from 'react-native';
import { TextInput,Button } from 'react-native-paper';
//import * as Permissions from 'expo-permissions';
import MapView , { Marker , Polyline , PROVIDER_GOOGLE , Geojson}from 'react-native-maps';
import * as Location from 'expo-location';
import MapViewDirections from 'react-native-maps-directions';
import GooglePlacesInput from './GooglePlacesInput';
import { EvilIcons,MaterialCommunityIcons,Ionicons,Entypo,MaterialIcons } from '@expo/vector-icons'; 
import Animated from 'react-native-reanimated';
import BottomSheet from 'reanimated-bottom-sheet';
import { Col, Row, Grid } from "react-native-easy-grid";
import { FontAwesome ,FontAwesome5,Octicons } from '@expo/vector-icons'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
const imagemarker = require('../assets/location-0101.png');
const imageveh = require('../assets/images/driver-veh-images_60.png');
import Spinner from 'react-native-loading-spinner-overlay';
import Pusher from 'pusher-js/react-native';


 // Enable pusher logging - don't include this in production 
 
 
const intiallat = -33.8688;
const intiallngh = 151.2195;
const origin = {latitude: -33.8688, longitude: 151.2195};	
const destination = {latitude:  -33.8688, longitude: 151.2195};

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0043;
 import * as firebase from "firebase";
import firestore from '@react-native-firebase/firestore';

/* 
   import * as firebase from "firebase";
  import "firebase/firestore";
*/
import * as geofirestore from 'geofirestore';
import apiKeys from '../config/keys';


if (!firebase.apps.length) {
    console.log('Connected with Firebase');
    firebase.initializeApp(apiKeys.firebaseConfig);
}

//const db = firebase.firestore();
//const firestore = firebase.firestore();
const db = firestore();
const GeoFirestore = geofirestore.initializeApp(db);
//const geocollection = GeoFirestore.collection('driver_locations');

const StatusBarheight = StatusBar.currentHeight;
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



//const intiallat = -33.8688;
//const intiallngh = 151.2195;
export default class BookMain extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        	step:1,
        	locationcur:{},
        	sourceLocation:{},
        	latitudecur:-33.8688,
        	longitudecur:151.2195,
        	curlocatdesc:'',
        	latitudeDelta: 0.0943,
         longitudeDelta: 0.0934,
         origin:{},
         destination:{},
         pickup:'',
         destinationto:'',
         stateText:'',
         results:{},
         forsourdest:'source',
         snaptoval:['50 %', '40%', '0%'],
         spinneron:false,
         initialSnap:2,
         drivernear:{},
         loadMap:false,
         textInput:[],
         inputData:[],
         rewardpoints:0,
         search_radius:10,
         accesstoken:'',
    };
    this.myRefbt = React.createRef();
    this.mapView = null;   
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
		  	//alert(JSON.stringify(data));
		 	this.getNearBydriver();
		 //
		  }); 
	};
   componentDidMount(){
   	//Pusher.logToConsole = true; 
		
		 
   	const {navigation} = this.props;
   	this.getSettings();

   	this.intialLoad();
   	this.getrewards();

   	 //21.087547232434844,79.07271710207583|21.09763731725872,79.09177151491762|21.073612179271233,79.10739270022036|21.068486313884367,79.09323063662173|21.06464179890505,79.07031384279848|21.068806685647157,79.09245816042544|21.068165941431435,79.09228649904848|21.066964538586916,79.0808710174811|21.064801989013013,79.06979885866762
   	 //21.096836541916716,79.07203045656802|21.072811274451436,79.06396237185122|21.08049978262587,79.08919659426333
  
	//alert(res);

	//console.log("Queuen - RESPOSNE 2");
		
  		this.unsubscribe =  navigation.addListener("focus",() => {
  			console.log("IN FOCUS ",this.props);
  			this.getrewards();
  			this.myRefbt.current.snapTo(2);
  			
  			this.setState({ 
             state:this.props.route.params,
             destinationto:'',
             destination:{},
             initialSnap:2,
         });
  			//this.intialLoad();
  		});		
  } // end of function



async removedriverNotexist(){
  	  	
    // get data from firebase 
    const value = await AsyncStorage.getItem('accesstoken');
     await AsyncStorage.getItem('accesstoken').then((value) => {           
            if(value != '' && value !== null){
                this.setState({accesstoken:value})
                //alert(value)
            }
        }) 
   let query = '';
   //alert(this.state.search_radius);
     const geocollection = GeoFirestore.collection('driver_locations');     
     query = geocollection.near({ center: new firebase.firestore.GeoPoint(this.state.latitudecur,this.state.longitudecur), radius:Number(this.state.search_radius)});

		// Get query (as Promise)
	query.get().then((value) => {
	  // All GeoDocument returned by GeoQuery, like the GeoDocument added above
	  //console.log(value.docs);
	 
	  const driverList = [];
	   value.docs.map((item, index) => {
	   	 //console.log("DRIVER MAP 1");
	   	// console.log(item.data().coordinates);
	   	if(item.exists == true){
			     driverList.push(item.id);
	   	}
	   });
	   
	 
	  	//alert(value);
	   fetch('https://www.turvy.net/api/rider/getRemovedDriver',{
     	  	method: 'POST', 
		   headers: new Headers({
		     'Authorization': 'Bearer '+this.state.accesstoken, 
		     'Content-Type': 'application/json'
		   }), 
		   body:JSON.stringify({
	 				'driverList' : driverList,
	 			}) 
		   })
      .then((response) =>{
      	return response.json();
      })
      .then((json) =>{ 
      	console.log("Remove Driver FB",json);
      	if(json.status == 1){
      		console.log("Remove Driver FB",json.data);
      		if(json.data){
      			json.data.forEach(item => {
      				console.log("DRIVER ID ",item);
      				firestore().collection("driver_locations")
			        .doc(item)
			        .delete();
      			});
      		}
      		
      		/*db.collection("driver_locations")
        .doc(this.state.driverId)
        .delete()
        */  
      	}

     	 }
      )
      .catch((error) =>{
      	console.error(error);
       });

	   console.log("DRIVER LIST",driverList);
	 });

  }
  
  
  async getNearBydriver(){
  	  	
    // get data from firebase 
    //alert("IN NEAR BY BEFORE START");
   const value = await AsyncStorage.getItem('accesstoken');
     await AsyncStorage.getItem('accesstoken').then((value) => {           
            if(value != '' && value !== null){
                this.setState({accesstoken:value})
                //alert(value)
            }
        });
        //alert("IN NEAR BY BEFORE START"+this.state.latitudecur); 
   let query = '';
   //alert(this.state.search_radius);
     const geocollection = GeoFirestore.collection('driver_locations');
           
     query = geocollection.near({ center: new firebase.firestore.GeoPoint(this.state.latitudecur,this.state.longitudecur), radius:Number(this.state.search_radius)});

		// Get query (as Promise)
	query.get().then((value) => {
	  // All GeoDocument returned by GeoQuery, like the GeoDocument added above
	  console.log("DATA RIVER",value.docs.length);
	  const drivernear = [];
	  const driverList = [];
	  if(value.docs.length > 0){
	
	   value.docs.map((item, index) => {
	   	 console.log("DRIVER MAP 2");
	   		  console.log(item.data().coordinates);
	   	if(item.exists == true){
	   			drivernear.push({['coordinates']:item.data().coordinates,
			      	['driverId']:item.id,
			      	['driver_name']:item.data().driver_name,	});
			      driverList.push(item.id);
			      this.setState({
      			drivernear:drivernear
      		},()=>{
      			console.log("DRIVER LIST",this.state.drivernear);
      		});
	   	}
	   });
	  } else{
	  	  this.setState({
      			drivernear:drivernear
        });
	  }
	 
	  	//alert(value);
	   fetch('https://www.turvy.net/api/rider/getRemovedDriver',{
     	  	method: 'POST', 
		   headers: new Headers({
		     'Authorization': 'Bearer '+this.state.accesstoken, 
		     'Content-Type': 'application/json'
		   }), 
		   body:JSON.stringify({
	 				'driverList' : driverList,
	 			}) 
		   })
      .then((response) =>{
      	return response.json();
      })
      .then((json) =>{ 
      	console.log("Remove Driver FB",json);
      	if(json.status == 1){
      		console.log("Remove Driver FB",json.data);
      		if(json.data && json.data.length > 0){
      			json.data.forEach(item => {
      				console.log("DRIVER ID ",item);
      				firestore.collection("driver_locations")
			        .doc(item)
			        .delete();
      			});
      		}
      		
      		/*db.collection("driver_locations")
        .doc(this.state.driverId)
        .delete()
        */  
      	}

     	 }
      )
      .catch((error) =>{
      	console.error(error);
       });
       	
	   console.log("DRIVER LIST",drivernear);
	 });
  }
  
  getSettings(){
  	
  	fetch('http://www.turvy.net/api/settings/info',{
			method: 'GET',
 		}).then(function (response) {
 			return response.json();
  		}).then( (result)=> {
  			//console.log("SEttings",result.data);
  			if(result.data){
  				if(Object.keys(result.data).length){
	              result.data.map((item, key) => {
	              	if(item.key == 'search_radius'){
	              		AsyncStorage.setItem('search_radius', item.value);
	              		this.setState({
	              			search_radius:item.value
	              		});
	              	}
	              	if(item.key == 'is_tips'){
	              		AsyncStorage.setItem('is_tips', item.value);
	              		
	              	}
	              	if(item.key == 'tip_amount'){
	              		AsyncStorage.setItem('tip_amount', item.value);
	              		
	              	}
	            });
             }
  			}
  				//setContry(result.data);
		});
  }
  
  async getrewards(){
  		await AsyncStorage.getItem('accesstoken').then((value) => {
  			//alert(value);
			//console.log(value);
  		fetch('https://www.turvy.net/api/rider/riderrewardpoints',{
     	  	method: 'GET', 
		   headers: new Headers({
		     'Authorization': 'Bearer '+value, 
		     'Content-Type': 'application/json'
		   })
		   })
      .then((response) =>{
      	return response.json();
      })
      .then((json) =>{ 
      	console.log("REWARDS INFO ",json.data);
      	let result = json.data;
      	if(json.status == 1){
      		//alert(result.point);
      		let point = result.point;
      		this.setState({
      			rewardpoints:result.point,
      		},()=>{
      			//alert("BEFORE SET");
      			//alert(result.point);
      			//AsyncStorage.setItem('rewardpoints', result.point);
      			this.setReward(result.point);
      		});
      	}
     	 }
      )
      .catch((error) =>{
      	console.error(error);
       });
		});
  }
  
  async setReward(point){
  		AsyncStorage.setItem('rewardpoints', JSON.stringify(point)).then(() => {
			//alert("SET item ");
		});
  }
  
  async SetOnline(lat,lng){
  		await AsyncStorage.getItem('accesstoken').then((value) => {
  			 this.setState({
	         	isLoading:true,
	         });
			console.log(value);
  		fetch('https://www.turvy.net/api/rider/online',{
     	  	method: 'POST', 
		   headers: new Headers({
		     'Authorization': 'Bearer '+value, 
		     'Content-Type': 'application/json'
		   }), 
		   body:JSON.stringify({
	 				'lat' : lat,
	 				'lng' : lng
	 			}) 
		   })
      .then((response) => response.json())
      .then((json) =>{ 
      	console.log(json);
      	if(json.status == 1){
      		 this.setState({
	         	isLoading:false,
	         });
      	}

     	 }
      )
      .catch((error) =>{
      	console.error(error);
       });
		});
  }
  
  async getPickupaddress(location){
  
  		 const { latitude, longitude } = location.coords;
		    this.SetOnline(latitude,longitude);
		    Location.setGoogleApiKey('AIzaSyAr2ESV30J7hFsOJ5Qjaa96u9ADSRX6_Sk')
		    let response = await Location.reverseGeocodeAsync({
		      latitude,
		      longitude,
		      options:{
		      	useGoogleMaps:true
		      }
		    });
		    
		     // console.log("after reverse");
		    // console.log(response);
		    
		   let address = '';
		   let curlocatdesc ='';
		    for (let item of response) {
		    	//${item.street}, 
		    	 //console.log(item);
		    	if(item.street !== null){
		    		//console.log(item.street);
		    		address = item.street;
		    		 curlocatdesc = item.name+" "+item.street+" "+item.city+" "+item.postalCode;
		    	}else{
		    		//console.log(item.name);
		    		address = item.name;
		    		 curlocatdesc = item.name+" "+item.city+" "+item.postalCode;
		    	}
		      
		       //console.log("text default");
		       //console.log(item);
		       this.setState({
		      	curlocatdesc:curlocatdesc,
		      	pickup:address,
		      	spinneron:false
		      });
		    }
  }
  
  async errornolocationprov(){
  	let location = await Location.getLastKnownPositionAsync();
      if (location == null) {
      	console.log("Geolocation failed");
      	 this.setState({
      	spinneron:false      	
      });
      }else{
      	if (location.coords) {
       	
       	 const origin = {
	      	latitude: location.coords.latitude, 
	      	longitude: location.coords.longitude
	      } 
	      
	      this.setState({
	      	locationcur:location,
	      	latitudecur:location.coords.latitude,
	      	longitudecur:location.coords.longitude,
	      	origin:origin,
	      },()=>{
	      	this.getNearBydriver();
	      });
         
      	this.getPickupaddress(location);
      }
     }
  }
	
  
  async intialLoad() {
  	  
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
      
      this.setState({
      	spinneron:true      	
      });
      
      this.removedriverNotexist();

      let resp = await Location.getProviderStatusAsync();
      let isLocationServicesEnabled = await Location.hasServicesEnabledAsync();
      console.log("isLocationServicesEnabled"+isLocationServicesEnabled);
      if(resp.locationServicesEnabled){
      	 Location.installWebGeolocationPolyfill()
      await navigator.geolocation.getCurrentPosition((location) => {
      	console.log("current position");
      	console.log(location);
			if (location.coords) {
       	 const origin = {
	      	latitude: location.coords.latitude, 
	      	longitude: location.coords.longitude
	      } 
	     
	      this.setState({
      	locationcur:location,
      	latitudecur:location.coords.latitude,
      	longitudecur:location.coords.longitude,
      	origin:origin,
      	
      },()=>{
      	this.getNearBydriver();
      });
      //alert("HERE")
      
     
		    this.getPickupaddress(location);
		  }      	
      	
      },
       (error) => {
       	console.log(error);
       		this.errornolocationprov();
       	},
       {enableHighAccuracy: true, timeout: 50000});
      }
 		this.getNearBydriver();
    }
  
  componentDidUpdate(prevProps,prevState) {
  
  }
  
  UNSAFE_componentWillUnmount() {
      this.unsubscribe();
    
  }
    
 async handleSourceLocDrag (e){  
       if (e.nativeEvent.coordinate) {
       	const { latitude, longitude } = e.nativeEvent.coordinate;
       	    const destination = {
      	latitude: latitude, 
      	longitude:longitude
      } 
      
       	this.setState({
	      	latitudecur:latitude,
	      	longitudecur:longitude,
	      	destination:destination
	      });
		    
		    let response = await Location.reverseGeocodeAsync({
		      latitude,
		      longitude
		    });
		    
		  
      
		   let address = '';
		    for (let item of response) {
		      let address = `${item.street}, ${item.postalCode}, ${item.city}`;
		     //console.log(address);
		       this.setState({
		      	curlocatdesc:address,
		      });
		    }
		  }
 }
 
debounceLog = debounce(text=> this._request(text),200);
 _request = (text) => {
     
    if (text ) {
      const request = new XMLHttpRequest();
      //_requests.push(request);
      request.timeout = 1000;
      //request.ontimeout = props.onTimeout;
      request.onreadystatechange = () => {
      	//console.log(request);
        if (request.readyState !== 4) {
          return;
        }

        if (request.status === 200) {
          const responseJSON = JSON.parse(request.responseText);
          if (typeof responseJSON.predictions !== 'undefined') {
          	
          	
            // if (_isMounted === true) {
            /*const results =
              props.nearbyPlacesAPI === 'GoogleReverseGeocoding'
                ? _filterResultsByTypes(
                    responseJSON.predictions,
                    props.filterReverseGeocodingByTypes,
                  )
                : responseJSON.predictions;
					*/
				//console.log(responseJSON);
				const results = responseJSON.predictions;
				this.setState({
					results:results,
				})
            //_results = results;
            //setDataSource(buildRowsFromResults(results));
            // }
          }
          if (typeof responseJSON.error_message !== 'undefined') {
            /*if (!props.onFail)
              console.warn(
                'google places autocomplete: ' + responseJSON.error_message,
              );
            else {
              props.onFail(responseJSON.error_message);
            }
            */
          }
        } else {
          // console.warn("google places autocomplete: request could not be completed or has been aborted");
        }
      };
      
      let query =  {
		    key: 'AIzaSyAr2ESV30J7hFsOJ5Qjaa96u9ADSRX6_Sk',
		    language: 'en',
		    types: ['geocode','locality'],
		};
      const url ='https://maps.googleapis.com/maps/api';
       request.open(
        'GET',
        `${url}/place/autocomplete/json?&input=` +
          encodeURIComponent(text) +
          '&'+Qs.stringify(query),
      );
// Qs.stringify(props.query),
      request.withCredentials = true;
      request.send();
  };
}


 _renderRow = (rowData = {}, index) => {
    return (
      <ScrollView
        scrollEnabled={true}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps='handled'
      >
        <TouchableHighlight
          underlayColor={'#c8c7cc'}
          style={
             { width: '100%',} 
          }
           onPress={() => this._onPress(rowData)}
        >
          <View
           	style={{
           		flex:1,
           		flexDirection:'row',
           		backgroundColor:'#fff',
           		borderBottomWidth:1,
           		borderBottomColor:'#ccc'
           	}}
          >
           <View style={{width:40,padding:10,}}> 
           	<FontAwesome name="location-arrow" size={24} color="grey" />
           	</View>
           	<View style={{padding:10,}}> 
            {this._renderRowData(rowData, index)}
            </View>
          </View>
        </TouchableHighlight>
      </ScrollView>
    );
  };
  
 _renderRowData = (rowData, index) => {
    return (
     <>
        {this._renderDescription(rowData)}
		</>
    );
  };
  
 _renderDescription = (rowData) => {
 	//console.log(rowData);
    //return rowData.description || rowData.formatted_address || rowData.name;
     return (
     <>
     <View style={{flex:1,flexDirection:'row'}}>
      <Text
        numberOfLines={2}
      > {rowData.structured_formatting.main_text}
      </Text>
     </View>
     <View style={{flex:1,flexDirection:'row'}}>
      <Text
        multiline={true}
        numberOfLines={2}
        style={{
        	fontSize:12,
        	width:280
        }}
      > {rowData.structured_formatting.secondary_text}
      </Text>
     </View>
       </>
     )
  };

   
   
 _onPress = (rowData) => {
   	//console.log("ON PRESS");
      //Keyboard.dismiss();
    	
      // fetch details
      const request = new XMLHttpRequest();
      //_requests.push(request);
      request.timeout = 1000;
      //request.ontimeout = props.onTimeout;
      request.onreadystatechange = () => {
        if (request.readyState !== 4) return;

        if (request.status === 200) {
          const responseJSON = JSON.parse(request.responseText);

          if (responseJSON.status === 'OK') {
            // if (_isMounted === true) {
            const details = responseJSON.result;
            console.log(details);
            
            if(this.state.forsourdest == 'dest'){
            	 const destination = {
			      	latitude: details.geometry.location.lat, 
			      	longitude: details.geometry.location.lng,
			      } 
            	 this.setState({
            	 	destinationto:rowData.description,
            	 	destination:destination,
               },()=>{
               	
                  this.props.navigation.navigate('BookConfirm',this.state)
              });   
         
            }else{
            	const origin = {
			      	latitude: details.geometry.location.lat, 
			      	longitude: details.geometry.location.lng,
			      } 
            	 this.setState({
            	 	curlocatdesc:rowData.description,
            	 	pickup:rowData.description,
            	 	origin:origin,
            	 	latitudecur:details.geometry.location.lat,
         			longitudecur: details.geometry.location.lng,
               },()=>{
               	this.dropoffTextInput.focus();
               	this.myRefbt.current.snapTo(0);
               	
               	this.setState({
               		forsourdest:'dest'
               	});
  						this.mapView.animateToRegion({
						  latitude: this.state.latitudecur,
						  longitude: this.state.longitudecur,
						  latitudeDelta: 0,
						  longitudeDelta: 0,
						});
						             	
               	this.getNearBydriver();
                 // this.props.navigation.navigate('BookConfirm',this.state)
              });  
            }
          } else {
            /*_disableRowLoaders();

            if (props.autoFillOnNotFound) {
              setStateText(_renderDescription(rowData));
              delete rowData.isLoading;
            }

            if (!props.onNotFound) {
              console.warn(
                'google places autocomplete: ' + responseJSON.status,
              );
            } else {
              props.onNotFound(responseJSON);
            }
            */
          }
        } else {
				console.warn(
              'google places autocomplete: request could not be completed or has been aborted',
            );
         /* if (!props.onFail) {
            console.warn(
              'google places autocomplete: request could not be completed or has been aborted',
            );
          } else {
            props.onFail('request could not be completed or has been aborted');
          }
          */
        }
      };
      
      const query =  {
		    key: 'AIzaSyAr2ESV30J7hFsOJ5Qjaa96u9ADSRX6_Sk',
		    language: 'en',
		    types: ['geocode','locality'],
		};
		const url ='https://maps.googleapis.com/maps/api';
      request.open(
        'GET',
        `${url}/place/details/json?` +
          Qs.stringify({
            key: query.key,
            placeid: rowData.place_id,
            language: query.language,
          }),
      );

      request.withCredentials = true;
      request.send();
      
    
  };
  
 _getFlatList = () => {
    const keyGenerator = () => Math.random().toString(36).substr(2, 10);

    if (this.state.stateText !== '' ) {
      return (
        <FlatList
          nativeID='result-list-id'
          scrollEnabled={true}
         disableScrollViewPanResponder={true}
          data={this.state.results}
          keyExtractor={keyGenerator}
          renderItem={({ item, index }) => this._renderRow(item, index)}
        />
      );
    }

    return null;
  };
 
   renderContent = () => (
    <View
      style={{
        backgroundColor: 'white',
        padding: 16,
        height: '100%',
      }}
    >
      {this._getFlatList()}
    </View>
  );   
   
  rightIconP = () =>(
 	 <TextInput.Icon name="close" color={'#3f78ba'} onPress={()=>this.setState({pickup:'',stateText:''})} />
  );
  
  rightIconD = () =>(
  	<TextInput.Icon name="close" color={'#3f78ba'} onPress={()=>this.setState({destinationto:'',stateText:''})} />
  )
  
 
   
  /* componentWillReceiveProps(nextProps) {
   	const duration = 500;
   	if (this.marker) {
        this.marker._component.animateMarkerToCoordinate(
          nextProps.coordinate,
          duration
        );
      }
   }
   */
   
   getRegion = () =>{
   		return {
         latitude: this.state.latitudecur,
         longitude: this.state.longitudecur,
         latitudeDelta: this.state.latitudeDelta,
         longitudeDelta: this.state.longitudeDelta,
       };
   }
   
   //function to remove TextInput dynamically
  removeTextInput = () => {
    let textInput = this.state.textInput;
    let inputData = this.state.inputData;
    textInput.pop();
    inputData.pop();
    this.setState({ textInput,inputData });
  }

   
    addValues = (text, index) => {
    let dataArray = this.state.inputData;
    let checkBool = false;
    if (dataArray.length !== 0){
      dataArray.forEach(element => {
        if (element.index === index ){
          element.text = text;
          checkBool = true;
        }
      });
    }
    if (checkBool){
    this.setState({
      inputData: dataArray
    });
  }
  else {
    dataArray.push({'text':text,'index':index});
    this.setState({
      inputData: dataArray
    });
  }
  }
  
    addTextInput = (index) => {
    let textInput = this.state.textInput;
    let removebox ='';
    if(index == 0){
    		removebox = <TouchableOpacity
				     onPress={() => this.removeTextInput() } ><Octicons name="eye-closed" size={24} color="black" /></TouchableOpacity>;
    }
    
    //alert(index);
    textInput.push(<Row><Col size={1}><Row style={{height:20,justifyContent:'center',alignContent:'center'}}>
      				<View style={{width:1,height:22,backgroundColor:'#000'}}/>
      			</Row>
      			<Row style={{height:10,justifyContent:'center',alignContent:'center'}}>
      				<View style={styles.square}/>
      		   </Row>
      		   <Row style={{height:20,justifyContent:'center',alignContent:'center'}}>
      				<View style={{width:1,height:20,backgroundColor:'#000'}}/>
      			</Row>
      		   </Col><Col size={9} style={{borderTopWidth:1,borderTopColor:'#E0E0E0'}}><TextInput  
      		        key={index}
                   placeholder="Add a stop" 
				      placeholderTextColor="grey"
				       underlineColor={'transparent'}
				      outlineColor='transparent'
				      selectionColor='#C0C0C0'
				      theme={{roundness:0,colors:{primary:'#fff',underlineColor:'transparent'}}} 
				      style={{backgroundColor:'transparent', 
				      height: 38,
				    borderRadius: 0,
				    paddingVertical: 5,
				    paddingHorizontal: 10,
				    fontSize: 15,
				    flex: 1,
				    marginBottom: 5,}}
      onChangeText={(text) =>{ this.addValues(text, index);
       this.myRefbt.current.snapTo(0); }} /></Col><Col size={2} style={{alignItems:'center',justifyContent:'center'}}><Text>{removebox}</Text></Col></Row>);
    this.setState({ textInput });
  }

  render() {
  	
  	 return (
	    <>
	    <View style={styles.container}>	
	    <Spinner
					visible={this.state.spinneron}
					color='#FFF'
					overlayColor='rgba(0, 0, 0, 0.5)'
				/>
	     
      <MapView style={styles.map}
       ref={c => this.mapView = c}
        provider={PROVIDER_GOOGLE}
       initialRegion={this.getRegion()}
       region={this.getRegion()}
       customMapStyle={stylesArray}  
       mapIds={"af9935eed520f3ec"}
        onRegionChangeComplete ={ (e) => {
		  }}
		  showsCompass={true}
		  
       >	
       { this.state.latitudecur != '' && this.state.longitudecur != '' ?
       ( <Marker
       tracksViewChanges={false}
      key={'markersoucre'}
      zIndex={10}
      coordinate={{latitude:this.state.latitudecur, longitude:this.state.longitudecur}} 
      draggable
      onDragEnd={(e) =>  this.handleSourceLocDrag(e)}
      style={{ alignItems: "center"}} >
    <View  style={{
          alignItems: "center",
          borderColor:'#135AA8',	
          borderWidth:1,
          width:200,
          backgroundColor:'#fff',
          height: 40,
          alignContent:'center',
          flex:1,
          flexDirection:'row',
          shadowOffset: {
				width: 0,
				height: 3,
			},
			shadowOpacity: 0.27,
			shadowRadius: 4.65,
			elevation: 7,
        }}>
        <Grid>
        	<Row>
        		<Col size={2} style={{backgroundColor:'#135AA8',justifyContent:'center',alignContent:'center'}}><EvilIcons name="user" size={24} color="white" /></Col>
        		<Col size={10}><Text
   	    numberOfLines={1}
          style={{
            color: "#000705",
            fontWeight: "bold",
            textAlign: "center",
            fontSize: 12,
            padding:4,
          }}
        >{this.state.curlocatdesc}</Text>
        </Col>
        <Col size={2} style={{backgroundColor:'#fff',justifyContent:'center',alignContent:'center',padding:3}}>
				<MaterialIcons name="keyboard-arrow-right" size={30} color="#135AA8" />
        	</Col>       
        	</Row>
        </Grid>
    </View>
   	  <Image
        style={styles.tinyLogo}
        source={imagemarker} />
    </Marker> ):
    (<></>)
 }
  
  	{Object.keys(this.state.drivernear).length > 0 ?
		 	this.state.drivernear.map((marker, index) =>{
  			return(<MapView.Marker.Animated
	    		key={'marker_drv'+index}
	    		 zIndex={11}
	         coordinate={{latitude: marker.coordinates.latitude, longitude: marker.coordinates.longitude}} 
	      			title={marker.driver_name}
	    				> 
	    <Image
        style={styles.vehimage}
        source={imageveh} />
	  </MapView.Marker.Animated>
	  );
  		})
  		:null
  	}
		
  </MapView> 
  	<View style={{position:'absolute',width:'100%',
  				top:'7%',left:'0%',zIndex:100,backgroundColor:'transparent',flex:1,flexDirection:'row'}}>
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
                    <MaterialCommunityIcons size={14} name="cards-diamond" />{this.state.rewardpoints}</Button>
                </View>
				</Col>
				<Col size={4} style={{alignItems:'flex-end', paddingRight:15}}>
				
				</Col>
			</Row>
      	<Row style={styles.searchSection}>
      		<Col size={12}>
      		  <Row>
      		   <Col size={1}>
      			<Row style={{height:20,justifyContent:'center',alignContent:'flex-end',flex:1,flexWrap:'wrap'}}>
      			<View style={styles.circle}/>
      		  </Row>
      		  <Row style={{height:20,justifyContent:'center',alignContent:'center'}}>
      			<View style={{width:1,height:28,backgroundColor:'#000'}}/>
      		  </Row>
      		</Col>
      		<Col size={9} style={{borderBottomWidth:1,borderBottomColor:'#E0E0E0'}}>
      			 <TextInput
      			  ref={(input) => { this.pickupTextInput = input; }}
				      placeholder="Pick Up" 
				      placeholderTextColor="grey"
				      value={this.state.pickup}
				        onChangeText={(val) =>{ 
				        this.myRefbt.current.snapTo(0);
				        				this.setState({pickup:val,stateText:val,forsourdest:'source'},()=>{
				                //this.calcualteBmi();
				                 //debounce((val)=>this._request(val),100);
				              })
				               this.debounceLog(val);
				              }}
				      onFocus={(e) =>{
				      	 this.myRefbt.current.snapTo(0)
				      }}
				      underlineColor={'transparent'}
				      outlineColor='transparent'
				      selectionColor='#C0C0C0'
				      theme={{roundness:0,colors:{primary:'#fff',underlineColor:'transparent'}}} 
				      style={{backgroundColor:'transparent', 
				      height: 38,
				    borderRadius: 0,
				    paddingVertical: 5,
				    paddingHorizontal: 10,
				    fontSize: 15,
				    flex: 1,
				    marginBottom: 5,}}
				    right={this.rightIconP()}
      				/>
      		</Col>
      		<Col size={2}>
      		</Col>
      		</Row>
      		<Row style={{height:40,justifyContent:'center'}}>
      		<Col size={1}>
      			<Row style={{height:20,justifyContent:'center',alignContent:'center'}}>
      				<View style={{width:1,height:20,backgroundColor:'#000'}}/>
      			</Row>
      			<Row style={{height:20,justifyContent:'center',alignContent:'center'}}>
      				<View style={styles.square}/>
      		   </Row>
      		</Col>
      		<Col size={9} >
      		  <TextInput
      		  ref={(input) => { this.dropoffTextInput = input; }}
      placeholder="Where to?" 
      placeholderTextColor="grey"
       underlineColor={'transparent'}
		 outlineColor='transparent'
       selectionColor='#C0C0C0'
      value={this.state.destinationto}
      theme={{roundness:0,colors:{primary:'#fff',underlineColor:'transparent'}}}      
        onChangeText={(val) => {
        	      this.myRefbt.current.snapTo(0);
        			this.setState({destinationto:val,stateText:val,forsourdest:'dest'},(val)=>{
                 //debounce(()=>this._request(val),100);
              })
              this.debounceLog(val);
              }}
              onFocus={(e) =>{
				    this.myRefbt.current.snapTo(0)
				  }}
          style={{backgroundColor:'transparent', height: 38,
			    borderRadius: 0,
			    paddingVertical: 5,
			    paddingHorizontal: 10,
			    fontSize: 15,
			    flex: 1,
			    marginBottom: 5,
			 }}
			 right={this.rightIconD()}
       />
      		</Col>
      		<Col size={2} style={{alignItems:'center',justifyContent:'center'}}>
      		<TouchableOpacity style={{flex:1,width:'80%',alignItems:'center',justifyContent:'center'}}
				     onPress={() => this.props.navigation.navigate('MultiDestination',this.state)} >
					<FontAwesome name="plus" size={20} color="black" />
				</TouchableOpacity> 
      		</Col>
      	</Row>
      	 {this.state.textInput.map((value) => {
          return value
        })}
      	</Col>
      	</Row>	
      </Grid>
     
	</View>
   <BottomSheet
   		keyboardAware
   		keyboardAwareExtraSnapHeight={true}
   		onChangeKeyboardAwareSnap={true}
        ref={this.myRefbt}
        snapPoints={this.state.snaptoval}
        borderRadius={10}
        renderContent={this.renderContent}
        enabledContentTapInteraction={false}
        enabledBottomClamp={true}
        initialSnap={this.state.initialSnap}
      />
  
  </View>

  </>
	  );
   }
}

const styles = StyleSheet.create({
  container: {
   ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  map: {	
    ...StyleSheet.absoluteFillObject,
  },
  tinyLogo:{
  	alignContent:'center',
  	height:64,
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
	},servicebocimage:{
    width: 25,
    aspectRatio: 1 * 1.4,
	 resizeMode: 'contain',
	 alignSelf:'center'
	},
	searchSection:{
	 marginTop:30,
	 justifyContent:'center',
	 alignContent:'center',
	 backgroundColor:'#fff', 
	 shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 3,
		},
	shadowOpacity: 0.27,
	shadowRadius: 4.65,
	elevation: 7,
	},vehimage:{
	 width: 22,
    height:41,
	 alignSelf:'center'
	},
});
