import React from "react";
import { StyleSheet, Text, View,Dimensions,Image,ScrollView ,TouchableOpacity,ActivityIndicator,BackHandler,StatusBar,Platform,Linking,Modal,TouchableHighlight} from 'react-native';
//import * as Permissions from 'expo-permissions';
import MapView , { Marker , Polyline ,Callout }from 'react-native-maps';
import * as Location from 'expo-location';
import MapViewDirections from 'react-native-maps-directions';
import GooglePlacesInput from './GooglePlacesInput';
import { EvilIcons,Ionicons,MaterialCommunityIcons,FontAwesome5,Feather,AntDesign,Entypo } from '@expo/vector-icons';
const imagemarker = require('../assets/location-pin-2965.png');
const driversummy = require('../assets/driversummy.png');

import Animated from 'react-native-reanimated';
import BottomSheet from 'reanimated-bottom-sheet';
import { Button } from 'react-native-paper';
import { Col, Row, Grid } from "react-native-easy-grid";
import AsyncStorage from '@react-native-async-storage/async-storage';
import FlashMessage , { showMessage, hideMessage }  from "react-native-flash-message";
const StatusBarheight = StatusBar.currentHeight+80;
import { Audio } from 'expo-av';
const { width, height } = Dimensions.get('window');
import CancelPop from './CancelPop';

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0043;
const SCREENHEIGHT = height*.60;
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
//const haversine = require('haversine')

import firebase from 'firebase/compat/app';
import "firebase/firestore";
import apiKeys from '../config/keys';

if (!firebase.apps.length) {
    console.log('Connected with Firebase')
    firebase.initializeApp(apiKeys.firebaseConfig);
}

const db = firebase.firestore();

/*const distance = require('google-distance-matrix');
distance.key('AIzaSyAr2ESV30J7hFsOJ5Qjaa96u9ADSRX6_Sk');
distance.units('imperial');
*/
export default class RideConfirm extends React.Component {
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
        	latitudeDelta: 0.0043,
         longitudeDelta: 0.0034,
         origin:{},
         destination:{},
         duration:'',
         servicetypes:[],
         selectedvehicle:{},
         inprocessing:0,
         display:false,
         modalvisible:false,
         distance:'',
         bookingdriver:{},
         driverLocation:{},
         distanceTravelled:'',
         drivertoloccord:{},
         bookingresponse:{},
         rideinfoinprocess:{},
         notadjust:false
    };
    this.mapView = null;
    this._onLongPressButton = this._onLongPressButton.bind(this);
   }

   _onLongPressButton() {
    this.setState({
    	modalvisible:true,
    })
  }

   _onPressDone(){
		this.setState({
			modalvisible:false
		});
   }

   renderMessagesDriver = () =>{
    	return (<><View style={{flex:1,alignContent:'center',justifyContent:'center',flexDirection:'row'}}><Text style={{color:'#fff',fontSize:35,padding:3,fontFamily: "Metropolis-Regular",textAlign:'center'}}>Congrats</Text>
    	</View>
    	<View style={{flex:1,alignContent:'center',justifyContent:'center',flexDirection:'row'}}>
    	<Text style={{color:'#fff',fontSize:20,padding:3,fontFamily: "Metropolis-Regular",textAlign:'center'}}>Your driver has arrive</Text></View>
    	</>);
  }

  onPlaybackStatusUpdate(PlaybackStatus){
  	//console.log(PlaybackStatus);

  		if(PlaybackStatus.didJustFinish == true){
  			//console.log("Complete");

  		}
  }

  async getrideStart(){
  	  console.log("BOOKING ID "+this.state.bookingresponse.id);
  	  //.where('status','==','open')
  		db.collection('trip_path').where('bookingId','==',this.state.bookingresponse.id)
			  .get()
			  .then(querySnapshot => {
			    console.log('Total bOOKING STATUS: ', querySnapshot.size);
			    if(querySnapshot.size > 0){
			    	clearInterval(this.interval);
			      this.props.navigation.navigate('BookingMap',this.state);
			    }

			  });
  }

  async runsound(){

  		this.refs.fmLocalIntstance.showMessage({
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
           	return this.renderMessagesDriver();
           },
        	 });

  		   const { sound } = await Audio.Sound.createAsync(
		       require('../assets/rider_driver_arriving.mp3'),
		       {},
		       this.onPlaybackStatusUpdate,
		    );
		    //setSound(sound);
		    console.log('Playing Sound');
		    await sound.playAsync();
		     this.props.navigation.navigate('BookingMap',this.state);
  }

    async updatecarLoc(){

    		//console.log(cords);
    		//const await
    		this.settime =  setInterval(()=>{
    					db.collection('driver_locations').where('driverId','==',this.props.route.params.bookingdriver.id)
			  .get()
			  .then(querySnapshot => {
			    console.log('Total DRIVER LOCA: ', querySnapshot.size);

			    querySnapshot.forEach(documentSnapshot => {
			      console.log('DRIVER COORd: ', documentSnapshot.data().coordinates, documentSnapshot.data());
			       //const distancedriv = haversine(documentSnapshot.data().location, this.props.route.params.destination);
			       //console.log(this.props.route.params.destination);
			       this.setState({driverLocation:documentSnapshot.data().coordinates},()=>{
			       	console.log(" ORGIN SET "+this.state.driverLocation);
			       });
			       //this.setState({driverLocation:documentSnapshot.data().location})
			       //console.log("disatnce"+distancedriv);
			    });
			  });
			  }, 10000);
    }

    componentDidMount(){

			this.refs.fmLocalIntstance.showMessage({
           message: '',
           type: "default",
           backgroundColor: "transparent",
           autoHide:false,
           style:{
           		margin:20,
           		borderRadius:10,
           		alignItems:'center',
           		justifyContent:'center'
           },
           renderCustomContent: ()=>{
           	return this.renderMessagesreward();
           },
        	 });



        	console.log("compoente mount");
   	const {navigation,state} = this.props;
   	console.log(state);
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
             rideinfoinprocess:this.props.route.params.rideinfoinprocess,
             bookingdriver:this.props.route.params.bookingdriver,
        },
        ()=>{
       // 	alert(this.state.latitudecur);
       // 	alert(this.state.longitudecur);
        	 //console.log(this.props.route.params.bookingdriver);
				console.log("STATE SET");
        	//alert(this.props.route.params.bookingdriver.id);

        });
      }
      alert("DRUVER ID "+this.props.route.params.bookingdriver.id);
      db.collection('driver_locations').where('driverId','==',this.props.route.params.bookingdriver.id)
			  .get()
			  .then(querySnapshot => {
			    alert('Total DRIVER LOCA: ', querySnapshot.size);

			    querySnapshot.forEach(documentSnapshot => {
			      console.log('DRIVER COORd: ', documentSnapshot.data().coordinates, documentSnapshot.data());
			       //const distancedriv = haversine(documentSnapshot.data().location, this.props.route.params.destination);
			       //console.log(this.props.route.params.destination);
			       this.setState({driverLocation:documentSnapshot.data().coordinates},()=>{
			       	alert(" ORGIN SET "+this.state.driverLocation);
			       });
			       //this.setState({driverLocation:documentSnapshot.data().location})
			       //console.log("disatnce"+distancedriv);
			    });
			  });


   	this.intialLoad();
   	//console.log(this.props.route.params.bookingdriver);
   	/*setTimeout(()=>{
   		//hideMessage()
   		this.runsound() }, 2000)

   		setTimeout(()=>{
   		//hideMessage()
   		this.props.navigation.navigate('RideArriveDest')  }, 7000)
   		 */

   	this.refs.fmLocalIntstance.showMessage({
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
        /*
  		this.unsubscribe =  navigation.addListener("focus",() => {
  			this.setState({
             selectedvehicle:this.props.route.params.selectedvehicle,
             inprocessing:0,
         });
  			this.intialLoad();
  		});
  		*/


  } // end of function

   renderMessagesreward = () =>{
    	return (<View style={{flex:1,alignContent:'center',justifyContent:'center',flexDirection:'column',shadowColor: '#000000',
    shadowOffset: {
      width: 1,
      height: 3
    },
    shadowRadius: 5,
    shadowOpacity: 1.0}} elevation={5}>
    	<View style={{width:150,height:46,backgroundColor: "#135AA8",flexDirection:'row',borderTopLeftRadius:10,borderTopRightRadius:10,alignContent:'center',justifyContent:'center' }}>
    		<Text style={{color:'#DCAC4B',fontSize:20,padding:3,fontFamily: "Metropolis-Regular",textAlign:'center',fontWeight:'bold'}}>22</Text>
      </View>
      <View style={{width:150,backgroundColor:'#fff',flexDirection:'row',justifyContent:'center',flexDirection:'column'}}>
    	<Text style={{color:'#000',fontSize:15,padding:3,fontFamily: "Metropolis-Regular",textAlign:'center'}}>Reward Points</Text>
    	 </View>
    	</View>);
  }


   openDialScreen (){
    let number = '';
    if (Platform.OS === 'ios') {
      number = 'telprompt:${091123456789}';
    } else {
      number = 'tel:${091123456789}';
    }
    Linking.openURL(number);
  }

  renderMessages = () =>{
    	return (<View style={{flex:1,alignContent:'center',justifyContent:'center',flexDirection:'row'}}><Text style={{color:'#fff',fontSize:20,padding:3,fontFamily: "Metropolis-Regular",textAlign:'center'}}>Your driver arrives in {this.state.duration} minutes</Text></View>);
  }

   componentWillUnmount() {
    //this.unsubscribe();

      clearInterval(this.interval);
    clearInterval( this.settimeout);
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

    {this.state.inprocessing == 0  ?
   	( <Grid >
   	<Row style={{height:30}}>

   	</Row>

   			<Row style={{height:100}}>

   				<Col size={3} style={{padding:10}}>
   				<View style={{borderWidth:1,borderColor:'silver',height:60,padding:10,borderRadius:8,backgroundColor:'#ccc'}}>
						{this.state.bookingdriver.avatar ?
							(<Image
				        source={{uri:"https://www.turvy.net/"+this.state.bookingdriver.avatar}}
				        style={styles.servicebocimage}
				        Resizemode={'contain'}
				         />)
							:
							(<Image
				        source={{uri:"https://www.turvy.net/images/no-person.png"}}
				        style={styles.servicebocimage}
				        Resizemode={'contain'}
				         />)
						}

   				</View>
   				</Col>
   				<Col size={7} style={{padding:10}}>
   					<Text style={{fontSize:20,}}>{this.state.bookingdriver.first_name} {this.state.bookingdriver.last_name}</Text>
   					<Text style={{fontSize:12,fontWeight:'bold'}}>Car No: SD451</Text>
   					<Text style={{fontSize:12,fontWeight:'bold'}}>{this.state.selectedvehicle.name}</Text>
   				</Col>
   				<Col size={3} style={{padding:10}}>
   				 <TouchableHighlight onLongPress={this._onLongPressButton} underlayColor="white">
   				<View style={{borderWidth:1,borderColor:'silver',height:60,padding:10,borderRadius:8,backgroundColor:'#ccc'}}>
   					<Image
				        source={{uri:"https://www.turvy.net/"+this.state.selectedvehicle.image}}
				        style={styles.servicebocimage}
				        Resizemode={'contain'}
				         />
				    </View>
				    </TouchableHighlight>
   				</Col>
   			</Row>
   			<Row style={{height:80}}>
   				<Col size={4} style={{padding:6}}>
   					<View style={{flex:1,backgroundColor:'#7FFF00',alignItems:'center',justifyContent:'center'}} >
   					<TouchableOpacity onPress={() => this.openDialScreen()}>
   					<Feather name="phone-call" size={24} color="white" />
   					<Text style={{color:'#fff'}}>
   						Call
   					</Text>
   					</TouchableOpacity>
   					</View>
   				</Col>
   				<Col size={4} style={{padding:6}}>
   				<View style={{flex:1,backgroundColor:'#ccc',alignItems:'center',justifyContent:'center'}}>

   				<TouchableOpacity onPress={() =>{this.props.navigation.navigate('BookCancel',this.state) }}>
   					<AntDesign name="closecircleo" size={24} color="white" />
   					<Text style={{color:'#fff'}}>
   						Cancel
   					</Text>
   				</TouchableOpacity>
   					</View>
   				</Col>
   				<Col size={4} style={{padding:6}}>
   				<View style={{flex:1,backgroundColor:'#135AA8',alignItems:'center',justifyContent:'center',width:'80%'}}>
   					<MaterialCommunityIcons name="dots-horizontal-circle-outline" size={24} color="white" />
   					<Text style={{color:'#fff'}}>
   						More
   					</Text>
   					</View>
   				</Col>
   			</Row>
   			<Row style={{height:20,padding:6}}>
   				<Col size={1}>
   					<View style={styles.inforound}>
   						<MaterialCommunityIcons name="information-variant" size={20} color="black" />
   					</View>
   				</Col>
   				<Col size={11}>
   				<Text style={{color:'#3f78ba',fontWeight:'bold',fontSize:16}}>  Long press on image to zoom in</Text>
   				</Col>
   			</Row>
   		</Grid>
       ):(
       	<Text></Text>
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
      /*let location = await Location.getCurrentPositionAsync();
       //console.log(location.coords.latitude);
       //console.log(location.coords.longitude);
       const latitudeDelta = location.coords.latitude-location.coords.longitude;
       const longitudeDelta = latitudeDelta * ASPECT_RATIO;
       */
        //console.log(latitudeDelta);
       //console.log(longitudeDelta);
       let origin ={};
      // console.log(this.props.route.params.destination);
      if(this.props.route.params.origin){
       	 origin = this.props.route.params.origin;
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
      	selectedvehicle:selectedvehicle,
      });
      /*this.setState({
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
      */
      //console.log(location);
     /*
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
		 // }

      //.finally(() => setLoading(false));
    }

  render() {

  	 return (
	    <View style={styles.container}>
	    <StatusBar backgroundColor="#fff" barStyle="light-content"/>

	    <TouchableOpacity
   style={{
       borderWidth:1,
       borderColor:'rgba(0,0,0,0.2)',
		position: 'absolute',
	    width: 45,
	    height: 45,
	    top: 50,
	    left: 10,
	    zIndex: 10,
       alignItems:'center',
       justifyContent:'center',
       backgroundColor:'#fff',
       borderRadius:50,
     }}
     onPress={() => this.props.navigation.toggleDrawer()}
 		>
	    <MaterialCommunityIcons name="reorder-horizontal" size={30} color="black"  />
     </TouchableOpacity>
       <FlashMessage ref="fmLocalIntstance" position={{top:80, left:10,right:10}} style={{borderRadius:2}}  />
      <MapView style={styles.map}
       region={{
         latitude: Number(this.state.latitudecur),
         longitude: Number(this.state.longitudecur),
         latitudeDelta: this.state.latitudeDelta,
         longitudeDelta: this.state.longitudeDelta,
       }}
       customMapStyle={stylesArray}
               ref={c => this.mapView = c}
        onRegionChangeComplete ={ (e) => {

  }}

       >
       { Object.keys(this.state.origin).length > 0 && Object.keys(this.state.driverLocation).length > 0 ?
    (
    <>
    	<MapViewDirections
    	region={'AU'}
    origin={this.state.driverLocation}
    destination={this.state.origin}
    strokeWidth={5}
    lineDashPattern={[1]}
      strokeColor="#5588D9"
      apikey="AIzaSyAr2ESV30J7hFsOJ5Qjaa96u9ADSRX6_Sk"
      lineCap={'butt'}
      lineJoin={'miter'}
       mode={"DRIVING"}
      onStart={(params) => {
              console.log(`Started routing between "${params.origin}" and "${params.destination}"`);

            }}
      onReady={result => {
      			//console.log(result);
              //console.log(`Distance: ${result.distance} km`)
              //console.log(`Coorinates: ${result.coordinates} km`)
              console.log(`Duration: ${result.duration} min.`)
              let duration = result.duration.toFixed();
              let distance = result.distance;
              // find amount to display

				  if(duration == 0){
				  		this.runsound();
				  		//this.getrideStart();
				  			/*this.interval = setInterval(() => {
            	  				this.getrideStart();
            	  			}, 5000);
				  		*/
				  }

             const  distancecal = distance/2;
		        const circumference = 40075;
		        //const oneDegreeOfLatitudeInMeters = 111.32 * 1000;
		        const oneDegreeOfLatitudeInMeters = distancecal*4;
		        const angularDistance = distancecal/circumference;

        		  const latitudeDelta = distancecal / oneDegreeOfLatitudeInMeters;
        		  const longitudeDelta = Math.abs(Math.atan2(
                Math.sin(angularDistance)*Math.cos(this.state.latitudedest),
                Math.cos(angularDistance) - Math.sin(this.state.latitudedest) * Math.sin(this.state.latitudedest)))

              console.log(this.state.drivertoloccord);
              this.setState({
              	duration:duration,
              	distance:distance,
              	display:true,
              	drivertoloccord:result.coordinates
              },()=>{
              	//console.log("before fit");
              		this.mapView.fitToCoordinates(result.coordinates, {
                edgePadding: {
	                  right: (width / 20),
	                  bottom: (height / 2.5),
	                  left: (width / 20),
	                  top: (height / 12),
	                },
	                   animated: true,
	              });
              	if(this.state.notadjust == false){

             	 this.updatecarLoc();
              	}

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

    <>
   <Marker
       	tracksViewChanges={false}
      key={'destinationkey'}
      coordinate={{latitude:this.state.latitudecur, longitude:this.state.longitudecur}}

      style={{ alignItems: "center"}} >
     </Marker>

    { Object.keys(this.state.driverLocation).length > 0 ?
       (<Marker.Animated
      coordinate={this.state.driverLocation}
      style={{ alignItems: "center"}} >
    	<Ionicons name="ios-car" size={30} color="black" />
    </Marker.Animated>
       ) :
       (
       <></>
       )
     }
    { Object.keys(this.state.origin).length > 0 && Object.keys(this.state.destination).length > 0 ?
    (
    <>

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
    <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.modalvisible}
          onRequestClose={() => {
            alert('Modal has been closed.');
          }}>

          <Grid style={{justifyContent:'center',alignContent:'center'}}>
          	<Row size={5}>
          		<Col>
          		</Col>
          	</Row>
          	<Row size={40} style={{justifyContent:'center',alignContent:'center'}}>
          		<Col style={{justifyContent:'center',alignContent:'center',alignItems:'center'}}>
          		  <View style={{backgroundColor:'#135AA8',height:'100%',width:'80%',justifyContent:'center',alignContent:'center',padding:10,borderRadius:5,}}>
              <Image
				        source={{uri:"https://www.turvy.net/"+this.state.selectedvehicle.image}}
				        style={styles.servicebocimage}
				        Resizemode={'contain'}
				         />
            </View>
          		</Col>
          	</Row>
          	<Row size={10} style={{marginTop:10}}>
          		<Col size={4}>
          		</Col>
          		<Col size={4}>
          		 <Button  mode="contained" color={'#135AA8'} onPress={() => this._onPressDone()}>
						    Done
				    </Button>
          		</Col>
          		<Col size={4}>
          		</Col>
          	</Row>
          	<Row size={40}>
          		<Col>
          		</Col>
          	</Row>
          </Grid>
        </Modal>
        <View>
        <CancelPop />
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
    aspectRatio: 1 * 1.4,
	 resizeMode: 'contain'
	},
	inforound:{
       borderWidth:2,
       borderColor:'#000',
	    width: 24,
	    height: 24,
	    zIndex: 10,
       alignItems:'center',
       justifyContent:'center',
       backgroundColor:'#fff',
       borderRadius:50,
     }
});
