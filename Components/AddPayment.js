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
import { FontAwesome, AntDesign, Entypo } from '@expo/vector-icons'; 
import { WebView } from 'react-native-webview';
import { GooglePay } from 'react-native-google-pay';
const imagegpay = require('../assets/images/gpay.png');
const imagegstripe = require('../assets/images/credit-card_1.png');

import * as firebase from "firebase";
import "firebase/firestore";
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

export default class AddPayment extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        	rewardpoints:0,
    };
   }
   
  componentDidMount(){
    
  }

  render() {
  	 return (
  	<PaperProvider theme={theme}>
  	  <StatusBar backgroundColor="#fff" barStyle="light-content"/>
  	  <View >
  	  		 <Appbar.Header style={{backgroundColor:'#fff'}}>
      		  <Appbar.BackAction onPress={() => this.props.navigation.goBack()} />
        			<Appbar.Content title="Add Payment" />
            </Appbar.Header>
	  </View>
	    <View style={{flex:1}}>
	    <Surface style={stylesBg.surface}>
          <Grid style={{width:'100%'}}>
         <TouchableOpacity onPress={() =>  this.props.navigation.navigate('AddCardWallet')} style={{borderWidth:1,borderColor:'silver',height:50,borderRadius:10}}>
          	<Row size={15} style={{height:65,padding:10}}>
                  <Col size={2}  >
                      <Image
							        style={{width:39,height:22,}}
							        source={imagegstripe} />
                  </Col>
                  <Col size={10}>
                  	<Text style={{fontSize:16,fontWeight:'bold'}}>Add Credit Card</Text>
                  </Col>
              </Row>
           </TouchableOpacity>
            <TouchableOpacity onPress={() => {}} style={{borderWidth:1,borderColor:'silver',height:50,borderRadius:10,marginTop:10,}}>
          	<Row size={15} style={{height:65,padding:10}}>
                  <Col size={2}  >
                      <Image
							        style={{width:40,height:30,}}
							        source={imagegpay} />
                  </Col>
                  <Col size={10}>
                  	<Text style={{fontSize:16,fontWeight:'bold'}}>Gpay</Text>
                  </Col>
              </Row>
           </TouchableOpacity>
            <Row size={70} style={{height:65}}>
                  
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
});
