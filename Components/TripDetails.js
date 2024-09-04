import React from 'react';
import { StatusBar } from 'expo-status-bar';
import {  Provider as PaperProvider, Button, Avatar, Caption, Surface, IconButton, Colors,Appbar} from 'react-native-paper';
import {View, ScrollView, Picker, Text, StyleSheet, TouchableOpacity, Image , FlatList ,ActivityIndicator , Dimensions } from 'react-native';
import {styles, theme, DOMAIN} from '../Riders/Constant';
import { Input } from 'react-native-elements';
import { AntDesign , FontAwesome5} from '@expo/vector-icons'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Divider } from 'react-native-elements';
import { Col, Row, Grid } from "react-native-easy-grid";
import Spinner from 'react-native-loading-spinner-overlay';
import MapView , { Marker , Polyline ,Callout }from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';

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

export default class TripDetails extends React.Component{    

    constructor(props) {
        super(props);
        this.state = {
            trips:{},
            accessTokan:'',
            pageno:1,
            tripTime:{
                arrivalTime:'',
                pickupTime:'',
            },
            spinner:false,
            loading:false,
            selectedTrip:{},
            distance:0,
            durtaion:0,
            cancelfee:0
        },
        this.onRefListView = React.createRef();
         this.mapView = null;    
    }
	
	 componentDidMount() {
	 const {navigation} = this.props;
	 console.log("TRIP DTATA",this.props.route.params.selectedTrip);
		if(this.props.route.params.selectedTrip){
		 	this.setState({
		 		spinner:false,
		 		selectedTrip:this.props.route.params.selectedTrip
		 	},()=>{
		 		if(this.state.selectedTrip.status == 2){
		 				this.getcancelamount();
		 		} // end of function 
		 	});
	   }
	 	//this.getMyRider();
	 }
	 
	 
	 	async getcancelamount(){
  		await AsyncStorage.getItem('accesstoken').then((value) => {
  			
			//console.log(value);
  		fetch('https://www.turvy.net/api/rider/getcancelamount/'+this.state.selectedTrip.id,{
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
      	console.log("CANCEL DETAILS INFO ",json.data);
      	let result = json.data;
      	if(json.status == 1){
      		//alert(result.point);
      		/*let point = result.point;
      		let reamingant = 0;
      		if(json.tranasctionamnt){
      			reamingant = json.tranasctionamnt.total_amount;
      		}
      		*/
      		this.setState({
      			cancelfee:result.amount
      		},()=>{
      			
      		});
      		
      	}
     	 }
      )
      .catch((error) =>{
      	console.error(error);
       });
		});
  }
  

    render(){
			return(<PaperProvider theme={theme}>
			<Spinner
					visible={this.state.spinner}
					color='#FFF'
					overlayColor='rgba(0, 0, 0, 0.5)'
				/>
			<View style={{padding:20,flex:1,flexDirection:'row',backgroundColor:'#fff'}}>
			<Grid style={{width:'100%'}}>
      	<Row size={10}>
      		<Col size={12}><Text >{this.state.selectedTrip.booking_date} {this.state.selectedTrip.booking_time} Request</Text></Col>
      	</Row>
      	{this.state.selectedTrip.status && this.state.selectedTrip.status == 2 ?
      	(<Row size={10}>
      		<Col size={7}><Text>Cancle Reason</Text></Col>
      		<Col size={5}><Text>{this.state.selectedTrip.cancel_reason}</Text></Col>
      	</Row>
      	)
      	:
      	(<Row size={10}>
      		<Col size={7}><TouchableOpacity onPress={() =>{ this.props.navigation.navigate('TripReceipt',this.state); }}><Text style={{color:'#3f78ba',fontWeight:'bold'}}><FontAwesome5 name="receipt" size={24} color="#3f78ba" /> View Receipt</Text></TouchableOpacity></Col>
      		<Col size={5}></Col>
      	</Row>)
      	}
      	{this.state.selectedTrip.status && this.state.selectedTrip.status == 2 ?
      	(<Row size={10}>
      		<Col size={7}><Text>Cancle Fee</Text></Col>
      		<Col size={5}><Text>A${this.state.cancelfee}</Text></Col>
      	</Row>)
      	:(<View></View>)
      	}
      	<Row size={50}>
      		<Col size={7}>
      		{this.state.selectedTrip.origin_lat && this.state.selectedTrip.origin_lng ?
      		(<MapView style={localStyle.map}
        		ref={c => this.mapView = c}
        		initialRegion={{latitude: this.state.selectedTrip.origin_lat,
        		longitude: this.state.selectedTrip.origin_lng,
            latitudeDelta: 0,
            longitudeDelta: 0,}}
            onRegionChangeComplete ={ (e) => {
        	}}
         customMapStyle={stylesArray}  
       onLayout={() => {
       
      }}
       >
         <MapView.Marker.Animated
			    key={'source'}
			      coordinate={{latitude: this.state.selectedTrip.origin_lat, longitude: this.state.selectedTrip.origin_lng}} 
			      pinColor={'green'}
			    >
		   </MapView.Marker.Animated>	
		    <MapView.Marker.Animated
			    key={'source'}
			      coordinate={{latitude: this.state.selectedTrip.destination_lat, longitude: this.state.selectedTrip.destination_lng}} 
			    >
		   </MapView.Marker.Animated>	
			   
    { this.state.selectedTrip.origin_lat && this.state.selectedTrip.origin_lng && this.state.selectedTrip.destination_lng && this.state.selectedTrip.destination_lat  ?
    (
    <>
    	<MapViewDirections
    	region={'AU'}
      origin={{latitude: this.state.selectedTrip.origin_lat, longitude: this.state.selectedTrip.origin_lng}}
      destination={{latitude: this.state.selectedTrip.destination_lat, longitude: this.state.selectedTrip.destination_lng}}
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
      		<Col size={5}></Col>
      	</Row>
      	<Row size={10} style={{paddingTop:10}}>
      		<Col size={3}><Text style={{fontSize:16,color:'silver'}}>{this.state.selectedTrip.servicename}</Text></Col>
      		<Col size={3}><Text style={{fontSize:16,color:'silver'}}>Kilometers</Text><Text style={{fontSize:16}}>{this.state.distance}</Text></Col>
      		<Col size={3}><Text style={{fontSize:16,textAlign:'center'}} >{this.state.duration} (min)s</Text></Col>
				<Col size={3}><Text style={{fontSize:16,color:'silver'}}>Total Fare</Text><Text style={{fontSize:16}}>A${this.state.selectedTrip.total}</Text></Col>
      	</Row>
      	<Row size={20}>
      		<Grid style={{paddingTop:10}}>
      		<Row style={{width:'100%',flex:1, flexDirection:'row'}}>
				<Col size={2}>
				  <View style={{borderWidth:1,borderColor:'silver',height:16,width:16,alignSelf:'center',borderRadius:8,backgroundColor:'silver',marginTop:10,}}></View>
				  <View style={{borderWidth:1,borderColor:'silver',height:'100%',width:1,alignSelf:'center'}}></View>
				</Col>
				<Col size={10}>
				<Row size={12} style={{height:30}}>
					<Col size={12} ><Text style={{ paddingTop:8,fontSize:16}} numberOfLines={1}>{this.state.selectedTrip.origin}</Text></Col>
				</Row>
				<Row size={12} style={{height:30}}>
					<Col size={12} ><Text style={{ fontSize:15, color:'silver', paddingTop:10}}>{this.state.selectedTrip.start_time}</Text></Col>
				</Row>
			</Col>
			</Row>
			<Row style={{flex:1, flexDirection:'row'}}>
			<Col size={2} ><View style={{borderWidth:1,borderColor:'silver',height:'50%',width:1,alignSelf:'center'}}></View> 
			    <View style={{borderWidth:1,borderColor:'silver',height:12,width:12,alignSelf:'center',backgroundColor:'silver'}}></View>
			</Col>
			<Col size={10}>
			<Row size={12}>
			<Col size={12} ><Text style={{ paddingTop:8,fontSize:16}} numberOfLines={1}>{this.state.selectedTrip.destination}</Text></Col>
			</Row>
			<Row size={12} style={{height:30}}>
					<Col size={12} ><Text style={{ fontSize:15, color:'silver', paddingTop:10,}}>{this.state.selectedTrip.end_time}</Text></Col>
				</Row>
			</Col>
		 </Row>
		 </Grid>
      	</Row>
      <Row size={40}>
      </Row>
      	</Grid>
        </View>
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
  },
   map: {
    width: Dimensions.get('window').width,
    height: 400,
    flex: 1,
  },


});


const stylesBg = StyleSheet.create({
  surface: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    margin:15,
    borderRadius:10

  },
});
