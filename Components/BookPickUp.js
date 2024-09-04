import { StatusBar } from 'expo-status-bar';
import React from "react";
import { StyleSheet, Text, View,Dimensions,Image,ScrollView ,TouchableOpacity,ActivityIndicator,BackHandler} from 'react-native';
//import * as Permissions from 'expo-permissions';
import MapView , { Marker , Polyline ,Callout }from 'react-native-maps';
import * as Location from 'expo-location';
import MapViewDirections from 'react-native-maps-directions';
import { EvilIcons,Ionicons,MaterialCommunityIcons } from '@expo/vector-icons'; 
const imagemarker = require('../assets/location-pin-2965.png');
import Animated from 'react-native-reanimated';
import BottomSheet from 'reanimated-bottom-sheet';
import { Button ,Card, Title,Paragraph} from 'react-native-paper';
import { CheckBox } from 'react-native-elements'
import { Col, Row, Grid } from "react-native-easy-grid";
import AsyncStorage from '@react-native-async-storage/async-storage';
const { width, height } = Dimensions.get('window');
import DateTimePicker from '@react-native-community/datetimepicker';
import SwipeButton from 'rn-swipe-button';

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0043;
const SCREENHEIGHT = height*.80;
//console.log("height");
//console.log(SCREENHEIGHT);

export default class BookPickUpTime extends React.Component {
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
         isLoading:false,
         display:false,
         
    };
    this.mapView = null;
    
   }
   
 
   
    componentDidMount(){
   	const {navigation} = this.props;
   	this.intialLoad();
   	this.setState({ 
             isLoading:false,
         });
  		this.unsubscribe =  navigation.addListener("focus",() => {
  			this.setState({ 
             selectedvehicle:this.props.route.params.selectedvehicle,
             isLoading:false,
         });
  			this.intialLoad();
  		});
  				
  } // end of function
   
   componentWillUnmount() {
    this.unsubscribe();
  }
    
 
	swipicon =() =>{
		return(<Ionicons name="ios-close-outline" size={40} color="black" />)
	} 
	
	_onPressBookNow = () =>{
		this.setState({isLoading:false},()=>{
    		this.props.navigation.navigate('BookProcess',this.state)
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
    <View style={{padding:20}}>
	<Title style={{marginBottom:20}}>Pick-up Time - dummy display</Title>
	<Card style={{borderWidth:1,borderRadius:10,height:100}}>
    <Card.Content>
      
      <Grid>
    	<Row>
    		<Col size={10}>
    			<Title>IMMEDIATE PICK-UP</Title>
     			<Paragraph>Get a ride in a minute</Paragraph>
    		</Col>
    		<Col size={2}>
    		<CheckBox checked={false} />
    		</Col>
    	</Row>
    </Grid>
    </Card.Content>
  </Card>
  <Card style={{borderWidth:2,borderRadius:10,marginTop:10,borderColor:'blue',height:120}}>
    <Card.Content>
    <Grid>
    	<Row>
    		<Col size={10}>
    			<Title>Schedule ride</Title>
	      	<Paragraph>schedule your ride from 60 minute in advance</Paragraph>
    		</Col>
    		<Col size={2}>
    		<CheckBox checked={true} />
    		</Col>
    	</Row>
    </Grid>
    </Card.Content>
  </Card>
  
   </View>
   <Button  mode="contained" color={'#135AA8'} onPress={() => this._onPressBookNow()}>
		Set Pick Up Time
  </Button>  
    </View>
	  
   </>
  );   
  
  
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
		  }
		  
		  
		  
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
      <MapView style={styles.map}
       region={{
         latitude: this.state.latitudecur,
         longitude: this.state.longitudecur,
         latitudeDelta: this.state.latitudeDelta,
         longitudeDelta: this.state.longitudeDelta,
       }}
       
       ref={c => this.mapView = c }
       
	     onRegionChangeComplete ={ (e) => {
  				console.log("map region");
  				this.setState({
  					display:true,
  				});
  			}}
       >	
    <>
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
        >My Location</Text>
        </View>
   	  
    </View>
    <Image
        style={styles.tinyLogo}
        source={imagemarker} />
    </Marker>
   
    
    { this.state.latitudedest != '' && this.state.longitudedest != '' ?
       (
       
       	<Marker
      key={2}
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
        >{this.state.destlocatdesc}</Text>
        </View>
   	  
    </View>
    <Image
        style={styles.tinyLogo}
        source={imagemarker} />
   
    </Marker>
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
	}
});
