import debounce from 'lodash.debounce';
import React from "react";
import Qs from 'qs';
import { StyleSheet, Text, View,Dimensions,Image ,FlatList,ScrollView, TouchableHighlight,Keyboard,KeyboardAvoidingView,TouchableOpacity,StatusBar,Fragment} from 'react-native';
import { TextInput,Button } from 'react-native-paper';
//import * as Permissions from 'expo-permissions';
import MapView , { Marker , Polyline , PROVIDER_GOOGLE}from 'react-native-maps';
import * as Location from 'expo-location';
import MapViewDirections from 'react-native-maps-directions';
import GooglePlacesInput from './GooglePlacesInput';
import { EvilIcons,MaterialCommunityIcons,Ionicons,Entypo,MaterialIcons } from '@expo/vector-icons'; 
import Animated from 'react-native-reanimated';
import BottomSheet from 'reanimated-bottom-sheet';
import { Col, Row, Grid } from "react-native-easy-grid";
import { FontAwesome ,FontAwesome5 } from '@expo/vector-icons'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
const imagemarker = require('../assets/location-0101.png');
const imageveh = require('../assets/images/driver-veh-images_60.png');
import Spinner from 'react-native-loading-spinner-overlay';


const intiallat = -33.8688;
const intiallngh = 151.2195;
const origin = {latitude: -33.8688, longitude: 151.2195};
const destination = {latitude:  -33.8688, longitude: 151.2195};

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0043;

const StatusBarheight = StatusBar.currentHeight;


//const intiallat = -33.8688;
//const intiallngh = 151.2195;
export default class SearchboxComp extends React.Component {
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
         snaptoval:['53%', '40%', '0%'],
         spinneron:false,
         initialSnap:2,
         drivernear:{}
    };
    this.myRefbt = React.createRef();
   }
   
   componentDidMount(){
   	const {navigation} = this.props;
   	this.intialLoad();	
  } // end of function
  
  
 
  

  
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
		    
		      console.log("after reverse");
		     console.log(response);
		    
		   let address = '';
		   let curlocatdesc ='';
		    for (let item of response) {
		    	//${item.street}, 
		    	 console.log(item);
		    	if(item.street !== null){
		    		console.log(item.street);
		    		address = item.street;
		    		 curlocatdesc = item.name+" "+item.street+" "+item.city+" "+item.postalCode;
		    	}else{
		    		console.log(item.name);
		    		address = item.name;
		    		 curlocatdesc = item.name+" "+item.city+" "+item.postalCode;
		    	}
		      
		       console.log("text default");
		       console.log(item);
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
      	
      });
      
		    this.getPickupaddress(location);
		  }      	
      	
      },
       (error) => {
       	console.log(error);
       		this.errornolocationprov();
       	},
       {enableHighAccuracy: true, timeout: 50000});
      }
 
    }
  
  componentDidUpdate(prevProps,prevState) {
  
  }
   componentWillUnmount() {
      //this.unsubscribe();
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
               },()=>{
               	this.dropoffTextInput.focus();
               	this.myRefbt.current.snapTo(0);
               	this.setState({
               		forsourdest:'dest'
               	});
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
  render() {
  	
  	 return (
	    <>
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
      		<Col size={10} style={{borderBottomWidth:1,borderBottomColor:'#E0E0E0'}}>
      			 <TextInput
      			  ref={(input) => { this.pickupTextInput = input; }}
				      placeholder="Pick Up" 
				      placeholderTextColor="grey"
				      value={this.state.pickup}
				        onChangeText={(val) =>{ this.setState({pickup:val,stateText:val,forsourdest:'source'},()=>{
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
      		<Col size={10} >
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
      	</Row>
      	</Col>
      	</Row>	
  </>
	  );
   }
}

const styles = StyleSheet.create({
  container: {
   ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
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
	 height:90,justifyContent:'center',alignContent:'center',backgroundColor:'#fff', shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 3,
		},
	shadowOpacity: 0.27,
	shadowRadius: 4.65,
	elevation: 7,
	}
});
