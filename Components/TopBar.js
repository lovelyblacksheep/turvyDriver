import React from "react";
import { AppRegistry, Image, StatusBar,StyleSheet,View ,  FlatList,TouchableWithoutFeedback,TouchableOpacity,ImageBackground} from "react-native";
import { Text, List , Divider,Button ,Badge } from "react-native-paper";

import { MaterialCommunityIcons , EvilIcons,Ionicons,Entypo} from '@expo/vector-icons'; 
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Col, Row, Grid } from "react-native-easy-grid";
import { Avatar } from "react-native-elements";
import {styles,theme, DOMAIN} from '../Riders/Constant';
import UploadImage from '../Components/UploadImage';
import * as Font from 'expo-font';
import * as firebase from "firebase";

const imagenot= require('../assets/New-Message-bell_P1-new.png');

if (!firebase.apps.length) {
    console.log('Connected with Firebase');
    firebase.initializeApp(apiKeys.firebaseConfig);
}

console.log('statusBarHeight: ', StatusBar.currentHeight);
const statusBarHeight = StatusBar.currentHeight;
const routes = [
  {"Lable":"Profile","id":"Profile","icon":"sign-direction-plus"},
  {"Lable":"Messages","id":"MyMessages","icon":"sign-direction-plus"},
  {"Lable":"Book Your Ride","id":"BookMain","icon":"home"},
  {"Lable":"My Rides","id":"MyRidesTab","icon":"home"},
  {"Lable":"My Payments","id":"MyPayments","icon":"home"},
  {"Lable":"My Receipts","id":"MyReceipts","icon":"home"},
  {"Lable":"Rate Card","id":"RateCard","icon":"home"},
  {"Lable":"Wallet","id":"Wallet","icon":"home"},
  {"Lable":"Your Charity","id":"Charity","icon":"home"},
  {"Lable":"Change Password","id":"ChangePassword","icon":"home"},
  {"Lable":"Support","id":"Support","icon":"home"},
  {"Lable":"Comment","id":"Comment","icon":"home"},
 ];

export default class TopBar extends React.Component {
	
	 constructor(props) {
    super(props);
    this.state = {
    	messagecount:0,
    	rewardpoints:0
    }
   // alert("IN CONST");
   }
	async componentDidMount() {
  		 await Font.loadAsync({
	     'Uber-Move-Text': require('../assets/fonts/ubermovetext-medium.ttf'),
	    });
      
      
		await AsyncStorage.getItem('messagecount').then((value) => {
			this.setState({
				messagecount:value ,
			})
		});
		this.getrewards();
		
	  
	     this.MessageCountInt = setInterval(() => {
             
				 AsyncStorage.getItem('messagecount').then((value) => {
					if(value != '' && value !== null){
					this.setState({
						messagecount:value ,
					});
				  }
				});
           
        }, 2000);
	 
  }
  
  async getMessageCount(){
  
  	 await AsyncStorage.getItem('accesstoken').then((value) => {
  			//console.log("SYANC TOEN");
			//console.log(value);
			if(value != '' && value != null){
		
            fetch('https://www.turvy.net/api/rider/getunreadmessages',{
		     	  	method: 'GET', 
				   headers: new Headers({
				     'Authorization': 'Bearer '+value, 
				     'Content-Type': 'application/json'
				   }), 
				   })
		      .then((response) => response.json())
		      .then((json) =>{ 
		        console.log("MESSAGE COUNT ",json);
		      //alert(json.data.count);
		         AsyncStorage.setItem('messagecount', JSON.stringify(json.data.count));
		         
		   	}).catch((error) => console.error(error));
		     } 	
			})
  
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
      	//console.log("REWARDS INFO ",json.data);
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
  
  

  
  render() {
    return (
     <View style={{position:'absolute',width:'100%',
  				height:60,top:'7%',left:'0%',zIndex:100,backgroundColor:'transparent',flex:1,flexDirection:'row'}}>
  			 <Grid>		
  			   <Row style={{height:60,justifyContent:'center',alignContent:'center'}}>																																									
				<Col size={4}>
					<TouchableOpacity
				   style={styles1.menubox}
				     onPress={() => this.props.navigation.toggleDrawer()} >
				     <Entypo name="menu" size={40} color="#135aa8" />
				      {this.state.messagecount > 0 ?
				     (<Badge  style={{ position: 'absolute', top: 0, left:25,fontWeight:'bold',backgroundColor:'#1e9bf5',fontSize:12 }}>{this.state.messagecount}</Badge>
)
				     :
				     (<></>)
				      }
		  			</TouchableOpacity>
				</Col>
				<Col size={4}>
					<View style={{alignItems:'center',}}>
                    <Button color="#FFF" mode="contained" labelStyle={styles1.yellow} style={styles1.btnSmall}>
                    <MaterialCommunityIcons size={14} name="cards-diamond" />{this.state.rewardpoints}</Button>
                </View>
				</Col>
				<Col size={4} style={{alignItems:'flex-end', paddingRight:15}}>
				<TouchableOpacity
				   style={styles1.serachbox}
				     onPress={() => this.props.navigation.replace('BookMain') } >
				     <Ionicons name="ios-search-sharp" size={25} color="#135aa8" style={{fontWeight:'bold'}} />
		  			</TouchableOpacity>
				</Col>
			</Row>
			</Grid>
		</View>	
    );
  }
}
const styles1 = StyleSheet.create({
  text: {    
        color: "black",
        fontSize: 25,    
        textAlign: "center", 
    }, menubox:{
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
	},
})