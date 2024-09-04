import React, {useEffect, useState} from 'react';
import {  Provider as PaperProvider, Button, Avatar, Caption, Surface, IconButton, Colors,Appbar} from 'react-native-paper';
import {View, ScrollView, Picker, Text, StyleSheet, TouchableOpacity, Image,StatusBar,ActivityIndicator,FlatList, Dimensions} from 'react-native';
import {styles, theme, DOMAIN} from '../Riders/Constant';
import { Input } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Divider } from 'react-native-elements';
import { Col, Row, Grid } from "react-native-easy-grid";
import Spinner from 'react-native-loading-spinner-overlay';
import MapView , { Marker , Polyline ,Callout }from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import {debug} from './Constant';

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

export default class MyReceipts extends React.PureComponent {
  constructor(props) {
    super(props);
    
    this.state = {
        	step:1,
        	myPayments:'today',
        	paymentlist:{},
        	spinner:false,
        	page_no:1,
        	 selectedTrip:{},
    }
    this.mapView = null;  
  }
  
 componentDidMount(){
	const {navigation,state} = this.props;
		this.setState({
	 		spinner:true,
	 	});
	this.getcompletedRide();
 }
 
  getcompletedRide = async() => {

      //setMyPayments(itemValue);
	await AsyncStorage.getItem('accesstoken').then((value) => {
	  fetch('https://www.turvy.net/api/rider/myrides/3/'+this.state.page_no,{
		method: 'GET',
		headers : {
			 'Authorization': 'Bearer '+value, 
			 'Content-Type': 'application/json'
			}
		  }).then(function (response) {
		  return response.json();
		  }).then( (result)=> {
		  console.log("PAYMENT RESPONSE 1 =============",debug(result));
		  	if(this.state.paymentlist && this.state.paymentlist.length > 0){
			  			this.setState({
				  		paymentlist: [ ...this.state.paymentlist, ...result.data ],
				  		spinner:false,
				  	})
		  	}else{
		  	  this.setState({
		  		paymentlist: result.data,
		  		spinner:false,
			  	})
		  	}
		        //setMyPaymentsData(result.data);
		});
	});
 };
 
 handlerArr = () =>{
		//alert("Scroll end reach");
		    this.setState({
		    	pageno:this.state.pageno+1
		    },()=>{
		    	this.getcompletedRide();
		    });
    }
    
     gotodetails = (item) =>{
		this.setState({
			selectedTrip: item,
		},()=>{
			console.log("SELECTED TRIP ",this.state.selectedTrip);
			this.props.navigation.navigate('TripDetails',this.state);
		});
	}
  
 renderItem = (item) =>{
		//console.log("ITEMS",item.item);
		return(<> 
		 <TouchableOpacity onPress={() =>{ this.gotodetails(item.item) }}>
		<Surface style={stylesBg.surface}>
		
      	<Row style={{paddingTop:15}}>
      	   <Col size={6}><Caption style={{fontSize:14}} > {item.item.booking_date} {item.item.booking_time}</Caption></Col>
      		<Col size={4}><Caption style={{fontSize:14,textAlign:'right'}} > {item.item.paymenthod}    </Caption></Col>
      		<Col size={2}><Text style={{fontSize:13,fontWeight:'bold',textAlign:'right'}}>A${item.item.total}</Text></Col>
      	</Row>
     
      	<Divider orientation="vertical"  />
			<Row size={50}>
      		<Col size={7} >
      		{item.item.origin_lat && item.item.origin_lng ?
      		(<MapView style={localStyle.map}
        		ref={c => this.mapView = c}
        		initialRegion={{latitude: item.item.origin_lat,
        		longitude: item.item.origin_lng,
            latitudeDelta: 0.06,
            longitudeDelta:  0.06,}}
            onRegionChangeComplete ={ (e) => {
        	}}
         customMapStyle={stylesArray}  
         	pitchEnabled={false} rotateEnabled={false} scrollEnabled={false} zoomEnabled={false}
       >
         <MapView.Marker.Animated
			    key={'source'+item.item.id}
			      coordinate={{latitude: item.item.origin_lat, longitude: item.item.origin_lng}} 
			      pinColor={'green'}
			    >
		   </MapView.Marker.Animated>	
		    <MapView.Marker.Animated
			    key={'source1'+item.item.id}
			      coordinate={{latitude: item.item.destination_lat, longitude: item.item.destination_lng}} 
			    >
		   </MapView.Marker.Animated>	
			   
    { item.item.origin_lat && item.item.origin_lng && item.item.destination_lng && item.item.destination_lat  ?
    (
    <>
    	<MapViewDirections
    	region={'AU'}
      origin={{latitude: item.item.origin_lat, longitude: item.item.origin_lng}}
      destination={{latitude: item.item.destination_lat, longitude: item.item.destination_lng}}
      strokeWidth={5}
      lineDashPattern={[1]}
      strokeColor="#135AA8"
      apikey="AIzaSyAr2ESV30J7hFsOJ5Qjaa96u9ADSRX6_Sk"
      lineCap={'butt'}
      lineJoin={'miter'}
      onStart={(params) => {
           console.log(`Started routing between "${params.origin}" and "${params.destination}" and `);
           console.log(params.waypoints);       
         }}
      onReady={result => {
      	let duration = result.duration.toFixed();
         let distance = result.distance;
         this.setState({
         	distance:distance,
         	duration:duration,
         });
      	this.mapView.fitToCoordinates(result.coordinates, {
                edgePadding: {
			            right: 20,
			            left:  20,
			            top: 20,
			            bottom: 20	,
			          },
                   animated: true,
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
       </MapView>)
      		:
      		null
      		}
      		</Col>
      	</Row>
      </Surface></TouchableOpacity>
      </>);
	}
   
   renderFooter = () =>{
			return(
			<View><ActivityIndicator size="large" color="#04b1fd"  /></View>
			)    	
    } 
  
  	render(){
  		return(<PaperProvider theme={theme}>
			<StatusBar backgroundColor="#fff" barStyle="light-content"/>
		   <Appbar.Header style={{backgroundColor:'#fff'}}>
		   <Appbar.BackAction onPress={() => this.props.navigation.goBack()} />
		   <Appbar.Content title="My Receipts" />
		  </Appbar.Header>
          <Spinner
					visible={this.state.spinner}
					color='#FFF'
					overlayColor='rgba(0, 0, 0, 0.5)'
				/>
     	{ this.state.paymentlist && Object.keys(this.state.paymentlist).length > 0 ?
        (
      <FlatList
        ref={this.onRefListView}
        data={this.state.paymentlist}
        keyboardShouldPersistTaps="always"
        renderItem={this.renderItem}
         keyExtractor={item => item.id}
		  onEndReachedThreshold={0.5}
        onEndReached={this.handlerArr}
        ListFooterComponent={this.renderFooter}
      />)
      :
      null
   }
  </PaperProvider>);
  	}
}

 
   
const localStyle = StyleSheet.create({
 
  MainTablabel: {
  color: 'silver',
  fontWeight:'bold',
    textAlign: "center",
    marginBottom: 10,
    fontSize: 18,
  },map: {
    width: (Dimensions.get('window').width-65),
    height: 200,
    margin:10,
    flex: 1,
  },

surface: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    margin:15,

  }

});

const stylesBg = StyleSheet.create({
  surface: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    margin:15,

  },
});