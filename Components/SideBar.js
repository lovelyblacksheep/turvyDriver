import React from "react";
import { AppRegistry, Image, StatusBar,StyleSheet,View ,  FlatList,TouchableWithoutFeedback,TouchableOpacity,ImageBackground} from "react-native";
import { Text, List , Divider  } from "react-native-paper";

import { MaterialCommunityIcons , EvilIcons,Ionicons} from '@expo/vector-icons'; 
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Col, Row, Grid } from "react-native-easy-grid";
import { Avatar ,Badge} from "react-native-elements";
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

export default class SideBar extends React.Component {
	
	 constructor(props) {
    super(props);
    this.state = {
    		profiledat:{},
    		 avatar:DOMAIN+'images/no-person.png',
    		 riderId:0,	
    		 accesstoken:'',
    		 messagecount:0
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
  		await AsyncStorage.getItem('accesstoken').then((value) => {
  			//console.log("SYANC TOEN");
			//console.log(value);
			if(value != '' && value != null){
				this.setState({
					accesstoken:value,																				
				})
			//this.props.route.params
			fetch('https://www.turvy.net/api/rider/profile',{
     	  	method: 'GET', 
		   headers: new Headers({
		     'Authorization': 'Bearer '+value, 
		     'Content-Type': 'application/json'
		   }), 
		 
		   })
      .then((response) => response.json())
      .then((json) =>{ 
      console.log("here in reso");
      	console.log(json);

      	if(json.data.id > 0){
      		 let profiledat = json.data;
      		 let avatar = '';
      		  if(profiledat.avatar && profiledat.avatar !== null){
	           avatar = DOMAIN+profiledat.avatar;
	           
	           console.log("AVATAR",avatar);
	           this.setState({
	           	avatar:avatar,
	           	riderId:profiledat.id,
	           });
	        }
      		 this.setState({
      		 	profiledat:profiledat
      		 });
      		  AsyncStorage.setItem('avatar', avatar);
      		  AsyncStorage.setItem('rider_id', JSON.stringify(profiledat.id));
      		//this.props.navigation.navigate('BookDetails',this.state)
      	}else{
      		 AsyncStorage.removeItem('accesstoken');
      		  AsyncStorage.removeItem('rider_id');
      		this.props.navigation.navigate('Login',this.state)
      	}
        }
      )
      .catch((error) => console.error(error));
      
      
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
      	if(json.data != '' && json.data != null){
         AsyncStorage.setItem('messagecount', JSON.stringify(json.data.count));
         this.setState(
         {
         	messagecount:json.data.count,
         });
      } 
   	}).catch((error) => console.error(error));
     } 	
	})
	
	
	     this.sideBarInt = setInterval(() => {

           
            AsyncStorage.getItem('avatar').then((value) => {      
              //alert(value);       
                if(value != '' && value !== null){
                    this.setState({
                        avatar: value
                    },()=>{
                      //console.log("avatar sidebaer",value);
                    });        
                }
            });
            
				 AsyncStorage.getItem('messagecount').then((value) => {
					if(value != '' && value !== null){
					this.setState({
						messagecount:value ,
					});
				  }
				});
           /* AsyncStorage.getItem('accesstoken').then((value) => {         
                if(value != '' && value !== null){
                    this.setState({
                        accessTokan:value
                    })
                }
            })

            if(this.state.name && this.state.avatar !== DOMAIN+'images/no-person.png'){
               //clearTimeout(this.sideBarInt);
            }
				*/
        }, 2000);
	 
  		
	
  }
  
  

  
  openmenu = async (id) =>{
  		if(id == 'logout'){
  				//console.log('log out ');
  				firebase.auth().signOut();
  				await AsyncStorage.removeItem('accesstoken');
  				this.props.navigation.navigate('Login')
  		}else{
  			this.props.navigation.navigate(id)
  		}
  		
  }
  
  render() {
    return (
     <View style={{background: '#FFFFFF'}}>
          <View style={{height:150}}>  
          	
          	<Grid  style={{height:150,flexDirection: 'row', alignItems: 'center',paddingTop:30 }}>
          		<Row size={75}>
          			<Col size={1}>
          			</Col>
          			<Col size={3} style={{flexDirection: 'row', alignItems: 'center',justifyContent:'center', }}>
                        <UploadImage imageuri={this.state.avatar} onReload={(img) => {  this.setState({avatar:img}) }} width={90} height={90} btnheight={'40%'} riderId={this.state.riderId}/>
          			</Col>
          			<Col size={6}>

                <Text style={{fontWeight:'bold',color:'#000',fontSize:19,padding:5}} >
                  {this.state.profiledat.first_name} {this.state.profiledat.last_name}
                  </Text>                
						<View style={{paddingLeft:5}} >
          		  	<TouchableWithoutFeedback onPress={()=>this.props.navigation.navigate('EditProfile')}><Text style={{fontWeight:'bold',color:'#3f78ba',fontSize:16,paddingLeft:5}}>Edit Profile</Text></TouchableWithoutFeedback>
						</View>
          			</Col>
          		</Row>
          	</Grid>
          </View>
              <Divider />
             <View style={{height:10}}></View>
          <FlatList
            data={routes}
            renderItem={({item, index}) => {
             return (
                        <TouchableOpacity onPress={() => this.openmenu(item.id)}>
                            <View style={{paddingVertical:7,marginLeft:30}}>
                            	{ this.state.messagecount > 0 && item.Lable == 'Messages'  ?
                            	(
                            		<><Text style={[styles.ubarFont,{fontSize:18}]}>{item.Lable} <ImageBackground source={imagenot} resizeMode="cover" style={{width:25,height:32,justifyContent: 'center'}}>
										      <Text style={{textAlign:'center',fontWeight:'bold',color:'#ffffff'}} >{this.state.messagecount}</Text>
										    </ImageBackground></Text>
                            		 </>
                               )
                            	:
                            	(<Text style={[styles.ubarFont,{fontSize:18}]}>{item.Lable}</Text>)
                            	} 
                            </View>
                        </TouchableOpacity> 
                    );
            }}
          />
             <TouchableOpacity onPress={() => this.openmenu('logout')}>
                    <View style={{paddingVertical:7,marginLeft:30,marginTop:25}}>
                        <Text style={[styles.ubarFont,{fontSize:18}]}>Logout</Text>
                    </View>
                </TouchableOpacity> 
          </View>
    );
  }
}
const styles1 = StyleSheet.create({
  text: {    
        color: "black",
        fontSize: 25,    
        textAlign: "center", 
    },
})