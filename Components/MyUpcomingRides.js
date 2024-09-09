import React from 'react';
import { StatusBar } from 'expo-status-bar';
import {  Provider as PaperProvider, Button, Avatar, Caption, Surface, IconButton, Colors,Appbar} from 'react-native-paper';
import {View, ScrollView, Picker, Text, StyleSheet, TouchableOpacity, Image , FlatList ,ActivityIndicator } from 'react-native';
import {styles, theme, DOMAIN} from '../Riders/Constant';
import { Input } from 'react-native-elements';
import { AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Divider } from 'react-native-elements';
import { Col, Row, Grid } from "react-native-easy-grid";
import Spinner from 'react-native-loading-spinner-overlay';
import {Collapse, CollapseHeader, CollapseBody} from "accordion-collapse-react-native";

import firebase from 'firebase/compat/app';

import 'firebase/compat/firestore';

import apiKeys from '../config/keys';

if (!firebase.apps.length) {
    console.log('Connected with Firebase')
    firebase.initializeApp(apiKeys.firebaseConfig);
}

const db = firebase.firestore();

export default class MyUpcomingRides extends React.Component{

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
            selectedkeyid:'',
            runningtripId:0,
            runningdata:{},
            tripstart:false,
        }


        this.onRefListView = React.createRef();
    }

	 componentDidMount() {
	 	this.setState({
	 		spinner:true,
	 	});

	 	this.getMyRider();
	 	this.getLatestTrip();
	 }


	 getLatestTrip = async (accessTokan) => {
		let last_booking_id = await AsyncStorage.getItem('last_booking_id');
		//alert(last_booking_id);
	await AsyncStorage.getItem('accesstoken').then((value) => {
		fetch(DOMAIN+'api/rider/getCurrentRunningTrip/'+last_booking_id,{
            method: 'GET',
            headers : {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer '+value
            }
        }).then(function (response) {
            return response.json();
        }).then( (result)=> {
        	console.log("Appointment data 1",result);
        	    if(result.data.booking.id > 0){
        	    	this.setState({
        				runningtripId:result.data.booking.id
        			},()=>{
        				//console.log("Assign ID ",this.state.runningtripId);
        				let origin = {
        					latitude:result.data.booking.origin_lat,
        					longitude:result.data.booking.origin_lng,

        				};
        				let destination = {
        					latitude:result.data.booking.destination_lat,
        					longitude:result.data.booking.destination_lng,

        				}
        				let newdata = {
        					origin:origin,
        					destination:destination,
        					latitudedest:result.data.booking.destination_lat,
			             longitudedest:result.data.booking.destination_lng,
			             latitudecur:result.data.booking.origin_lat,
			             longitudecur:result.data.booking.origin_lng,
			             bookingresponse:result.data.booking,
			             bookingdriver:result.data.driverinfo,
			             selectedvehicle:result.data.VehicleType,
			             waypointslnglat:result.data.waypoints,
			             selectedvehiclefare:result.data.PaymentRequest.subtotal,
			             selectsurcharge:result.data.PaymentRequest.surge,
			             selectedcancelchr:result.data.Fare.cancel_charge
        				}

        				this.setState({
        					runningdata:newdata
        				});
        				//
        			});
        	    }

        	 	console.log("LASTTRIP New MY RIDE",result.data.id);
        });
       });
	}


	  async getrideStart(bookinid){
	  	//alert(bookinid);
  	  //console.log("BOOKING ID "+this.state.bookingresponse.id);
  	  //.where('status','==','open')
  		await db.collection('trip_path').where('bookingId','==',bookinid)
		.get()
		.then(querySnapshot => {
			    console.log('Total bOOKING STATUS: ', querySnapshot.size);
			    if(querySnapshot.size > 0){
			    	//clearInterval(this.myinterval);
			    	//clearInterval(this.settime);
			    	this.setState({
			    		tripstart:true
			    	},()=>{
			    		this.props.route.navigation.replace('BookingMap1',this.state.runningdata);
			    		return;
			    	})
			    //	alert("IN NCONFIRM");
			    }else{
			    	this.props.route.navigation.navigate('RideConfirm1',this.state.runningdata);
			    }
		});

  }

	 getMyRider = async() => {
		await AsyncStorage.getItem('accesstoken').then((value) => {
		console.log(value);
			  fetch('https://www.turvy.net/api/rider/myrides/1/'+this.state.pageno,{
				headers : {
				 'Authorization': 'Bearer '+value,
				 'Content-Type': 'application/json'

				},}).then(function (response) {
			  return response.json();
			  }).then( (result)=> {
			  	console.log("UPCOMMING TRIPS PAGE - "+this.state.pageno,this.state.trips);
			  	if(this.state.trips && this.state.trips.length > 0){
			  			this.setState({
				  		trips: [ ...this.state.trips, ...result.data ],
				  		spinner:false,
				  		loading:false,
				  	})
			  	}else{
			  	  this.setState({
			  		trips: result.data,
			  		spinner:false,
			  		loading:false,
				  	})
			  	}

			  //setMyTrips(result.data);
			 // setSpinneron(false); {/* to stop the loading img */}
			});
		});
	}

	gotodetails = (item) =>{
		this.setState({
			selectedTrip: item,
		},()=>{
			console.log("SELECTED TRIP ",this.state.selectedTrip);
			this.props.route.navigation.navigate('TripDetails',this.state);
		});
	}

	renderItem = (item) =>{
		//console.log("ITEMS",item.item);
		return(<>
		<View>

    <Collapse style={{paddingBottom:10,paddingTop:10}} isExpanded={this.state.selectedkeyid == item.item.id ? true : false } onToggle={(isExpanded)=>{ if(isExpanded) { this.setState({selectedkeyid:item.item.id}); }else{ this.setState({selectedkeyid:''});  } }}>
      <CollapseHeader style={{flexDirection:'row',alignItems:'center',padding:10}}>
      	<Grid style={{width:'100%'}}>
      	<Row size={50}>
      		<Col size={2}>
      		{this.state.selectedkeyid == item.item.id ?
      			(<AntDesign name="minus" size={24} color="black" />)
      			:
      			(<AntDesign name="plus" size={24} color="black" />)
      		}

      		</Col>
      		<Col size={5}><Text style={{fontSize:14}}>{item.item.booking_date}, {item.item.booking_time}</Text></Col>
      		<Col size={5}><Text style={{fontSize:14}} numberOfLines={1}>{item.item.origin}</Text></Col>
      	</Row>
      	<Row size={50}>
      		<Col size={2}></Col>
      		<Col size={5} ><Text style={{fontSize:15,fontWeight:'bold'}}>A${item.item.total}</Text></Col>
      		<Col size={5} ><Text style={{fontSize:15,fontWeight:'bold'}}>{item.item.paymenthod}</Text></Col>
      	</Row>
      	</Grid>

      </CollapseHeader>
      <CollapseBody style={{alignItems:'center',justifyContent:'center',backgroundColor:'#EDEDED'}}  >
      	 <Row style={{width:'100%',flex:1, flexDirection:'row'}}>
      	 	<Col size={12}>
      	 		{item.item.first_name || item.item.last_name ?
      	 		 (<Text style={{padding:10,fontWeight:'bold',fontSize:14,}}>Your {item.item.servicename} Trip with {item.item.first_name} {item.item.last_name}</Text>)
      	 		 :
      	 		 (<Text style={{padding:10,fontWeight:'bold',fontSize:14,}}>Your {item.item.servicename} Trip </Text>)
      	 		 }
      	 	</Col>
      	 </Row>
      	 <Row style={{width:'100%',flex:1, flexDirection:'row'}}>
				<Col size={2}>
				  <View style={{borderWidth:1,borderColor:'#3f78ba',height:16,width:16,alignSelf:'center',borderRadius:8,backgroundColor:'#3f78ba',marginTop:10,}}></View>
				  <View style={{borderWidth:1,borderColor:'#3f78ba',height:'100%',width:1,alignSelf:'center'}}></View>
				</Col>
				<Col size={10}>
				<Row size={12} style={{height:30}}>
					<Col size={12} ><Text style={{ paddingTop:8,fontSize:16}} numberOfLines={1}>{item.item.origin}</Text></Col>
				</Row>
				<Row size={12} style={{height:30}}>
					<Col size={12} ><Text style={{ fontSize:15, color:'grey', paddingTop:10}}>{item.item.start_time}</Text></Col>
				</Row>
			</Col>
			</Row>
			<Row style={{flex:1, flexDirection:'row'}}>
			<Col size={2} ><View style={{borderWidth:1,borderColor:'#3f78ba',height:'50%',width:1,alignSelf:'center'}}></View>
			       <View style={{borderWidth:1,borderColor:'#3f78ba',height:12,width:12,alignSelf:'center',backgroundColor:'#3f78ba'}}></View>
				  </Col>
			<Col size={10}>
			<Row size={12}>
			<Col size={12} ><Text style={{ paddingTop:8,fontSize:16}} numberOfLines={1}>{item.item.destination}</Text></Col>
			</Row>
			<Row size={12} style={{height:30}}>
					<Col size={12} ><Text style={{ fontSize:15, color:'grey', paddingTop:10,}}>{item.item.end_time}</Text></Col>
				</Row>
			</Col>
		 </Row>
		  <Row style={{width:'100%',flex:1, flexDirection:'row',borderWidth:1,borderColor:'grey'}}>
		  		<Col size={8}>
      	 	</Col>
      	 	<Col size={4}>
      	 		<TouchableOpacity onPress={() =>{ this.gotodetails(item.item) }}>
      	 			<Text style={{padding:10,fontWeight:'bold',fontSize:14,color:'#3f78ba'}}>Details <AntDesign name="arrowright" size={24} color="#3f78ba" /></Text>
      	 		</TouchableOpacity>
      	 	</Col>
      	 </Row>
      </CollapseBody>
    </Collapse>
  </View></>);
	}

    handlerArr = () =>{
		//alert("Scroll end reach");
		    this.setState({
		    	pageno:this.state.pageno+1,
		    	loading:true,
		    },()=>{
		    	this.getMyRider();
		    });
    }

    renderFooter = () =>{
			return(
			<View><ActivityIndicator size="large" color="#04b1fd" animating={this.state.loading}  /></View>
			)

    }
    render(){
    	console.log("PROPS UPCAOMING RENDER",this.props);
    	 //const { navigate } = this.props.route.navigation;
			return(<PaperProvider theme={theme}>
			<Spinner
					visible={this.state.spinner}
					color='#FFF'
					overlayColor='rgba(0, 0, 0, 0.5)'
				/>
			<View>
			{this.state.runningtripId && this.state.runningtripId > 0 ?
			(
				<View style={{width:'40%',marginTop:20,marginLeft:10}}><Button  mode="contained" color={'#135AA8'} onPress={() => {
				this.getrideStart(this.state.runningtripId);

				 }}>
				Running Trip
				</Button></View>)
			:
			(<></>)
			}
			{ this.state.trips && Object.keys(this.state.trips).length > 0 ?
        (<FlatList
        ref={this.onRefListView}
        data={this.state.trips}
        keyboardShouldPersistTaps={'always'}
        renderItem={this.renderItem}
         keyExtractor={item => item.id}
        onEndReachedThreshold={0.5}
        onEndReached={this.handlerArr}
        ListFooterComponent={this.renderFooter}
      />)
      :
      null
     	}
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
  }


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
