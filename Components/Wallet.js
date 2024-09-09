import { StatusBar } from 'expo-status-bar';
import React from "react";
import { StyleSheet, Text, View ,Image,TouchableOpacity} from 'react-native';
import {  Provider as PaperProvider,Button,Appbar,Surface } from 'react-native-paper';
//import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';
import { theme, DOMAIN} from '../Riders/Constant';
import { Col, Row, Grid } from "react-native-easy-grid";
import AsyncStorage from '@react-native-async-storage/async-storage';
const imagemarker = require('../assets/map-pin.png');
import GradientButton from '../Riders/GradientButton';

import { WebView } from 'react-native-webview';

import firebase from 'firebase';
// import firebase from 'firebase/compat/app';
import "firebase/compat/firestore";
import * as geofirestore from 'geofirestore';
import apiKeys from '../config/keys';


if (!firebase.apps.length) {
    console.log('Connected with Firebase');
    firebase.initializeApp(apiKeys.firebaseConfig);
}

const db = firebase.firestore();
const firestore = firebase.firestore();

const GeoFirestore = geofirestore.initializeApp(firestore);
const geocollection = GeoFirestore.collection('driver_locations');

export default class Wallet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        	rewardpoints:0,
        	reamingant:0,
    };
   }

  componentDidMount(){
    this.getrewards();
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
      	console.log("REWARDS INFO ",json);
      	let result = json.data;
      	if(json.status == 1){
      		//alert(result.point);
      		let point = result.point;
      		let reamingant = 0;
      		if(json.tranasctionamnt){
      			reamingant = json.tranasctionamnt.total_amount;
      		}
      		//console.log("REWARDS INFO AFTER ",reamingant);
      		this.setState({
      			rewardpoints:result.point,
      			reamingant:reamingant,
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

  render() {
  	 return (
  	<PaperProvider theme={theme}>
  	  <StatusBar backgroundColor="#fff" barStyle="light-content"/>
  	  <View >
  	  		 <Appbar.Header style={{backgroundColor:'#fff'}}>
      		  <Appbar.BackAction onPress={() => this.props.navigation.goBack()} />
        			<Appbar.Content title="Wallet" />
            </Appbar.Header>
	  </View>
	    <View style={{flex:1}}>
	    <Surface style={stylesBg.surface}>
          <Grid style={{width:'100%'}}>
          	<Row size={20} style={{height:65}}>
                  <Col size={12}  >
                      <Text style={{ paddingTop:8,fontSize:30,}}>Wallet Balance</Text>
                  </Col>
              </Row>

               <Row size={20} style={{height:65}}>
                  <Col size={5}  >
                      <Text style={{ paddingTop:8,fontSize:14,fontWeight:'bold'}}>Reward Points</Text>
                  </Col>
                  <Col size={7}  >
                      <Text style={{ paddingTop:8,fontSize:14,color:'#3f78ba',fontWeight:'bold'}}>{this.state.rewardpoints}</Text>
                  </Col>
              </Row>
               <Row size={20} style={{height:100}}>
                  <Col size={5}  >
                      <Text style={{ paddingTop:10,fontSize:14,fontWeight:'bold'}}>Amount</Text>
                  </Col>
                  <Col size={7}  >
                      <Text style={{ paddingTop:8,fontSize:14,color:'#3f78ba',fontWeight:'bold'}}>${this.state.reamingant}</Text>

                  </Col>
              </Row>
               <Row size={30} style={{height:65}}>
               	 <TouchableOpacity onPress={()=>{ this.props.navigation.navigate('MyTransaction'); }} style={{height:40,}}>
					    	  		<Text style={stylesBg.contentBtn}><GradientButton title='View Transactions' /></Text>
					        	</TouchableOpacity>
               </Row>
               <Row size={70} style={{height:65}}>
                 <TouchableOpacity onPress={()=>{ this.props.navigation.navigate('AddPayment'); }} style={{height:100,}}>
		    	  		<Text style={stylesBg.contentBtn}><GradientButton title='Add Payment Method' /></Text>
		        	</TouchableOpacity>
              </Row>
          </Grid>
          <Grid style={{flex:1, flexDirection:'row'}}>

          </Grid>

         </Surface>
	  </View>
	    </PaperProvider>
	  );
   }
}

const styles = StyleSheet.create({
  servicebocimage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelstyle:{
    fontSize:16,
    textAlign:'left',
    marginTop:10,
    fontFamily: 'WuerthBook'
  },
  inputstyle:{
    color:'black',
    borderBottomColor:'#D9D5DC',
    borderBottomWidth:1,
    paddingBottom: 11,
    fontSize:16,
    fontFamily: 'WuerthBook'
  },
  bgImage: {
        resizeMode: "cover",
        justifyContent: "center",
        height:170,
    },
    text: {
        color: "white",
        fontSize: 25,
        textAlign: "center",
    },
    overlay: {
        justifyContent: "center",
        backgroundColor:'rgba(0,0,0,0.6)',
        height:170,
    },
    scItem:{
      borderRadius:50,
      borderWidth:1,
      marginTop:10,
      marginBottom:10,
      marginLeft:5,
      marginRight:5,
      backgroundColor:'#FFF',
      height:35
    },
    scText:{color:'#000',fontSize:14},
    active:{
      backgroundColor:'#7a49a5',
    },
    actText:{color:'#FFF'},
    boxstyle:{
    	flex:1,
    	backgroundColor:'#fff',
    	borderRadius:10,borderWidth: 1,
    	borderColor: '#fff',
    	padding:10,margin:20,
    	shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
    }
});

const localStyle = StyleSheet.create({
    MainTablabel: {
        color: 'silver',
        fontWeight:'bold',
        textAlign: "center",
        marginBottom: 10,
        fontSize: 18,
    },
    surface: {
        padding: 8,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        marginBottom:15,
        marginHorizontal:15,
        borderRadius:5
    }
});
const stylesBg = StyleSheet.create({
  surface: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    margin:15,
    borderRadius:10,
    flex:3,
  },
  contentBtn:{
      backgroundColor:"#2270b8",
      justifyContent:'center',
    alignItems:'center',
    flexDirection:'row',
    borderRadius:50,
  }
});
