import React from 'react';
import { StatusBar } from 'expo-status-bar';
import {  Provider as PaperProvider,Text, Button, Appbar, Card, Title, Paragraph,TouchableRipple } from 'react-native-paper';
import {View, ScrollView, TouchableWithoutFeedback,Image,TouchableHighlight, StyleSheet,TouchableOpacity } from 'react-native'
import {styles, theme,DOMAIN} from './Constant'
import Fontisto from 'react-native-vector-icons/Fontisto'
import EvilIcons from 'react-native-vector-icons/EvilIcons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { useNavigation } from '@react-navigation/native';
import { Badge } from 'react-native-elements'
import { Col, Row, Grid } from "react-native-easy-grid";
import { LinearGradient } from 'expo-linear-gradient';
import Spinner from 'react-native-loading-spinner-overlay';
import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FlashMessage , { showMessage, hideMessage }  from "react-native-flash-message";
import { Audio } from 'expo-av';
import Modal from 'react-native-modal';

import firestore from '@react-native-firebase/firestore';

import * as firebase from "firebase";
import "firebase/firestore";

import apiKeys from './config/keys';
import * as geofirestore from 'geofirestore';

if (!firebase.apps.length) {
    console.log('Connected with Firebase')
    firebase.initializeApp(apiKeys.firebaseConfig);
}

const db = firestore();
//const firestore = firebase.firestore();
const GeoFirestore = geofirestore.initializeApp(db);

export default class TripPlaner extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			accessTokan:'',
			bookrequest:{},
			fetchnewrequest:true,
			driverId: '',
			destination:{},
			origin:{},
			spinner:false,
		}

	}
  
	async componentDidMount() {
		
		await AsyncStorage.getItem('accesstoken').then((value) => {        		
            if(value != '' && value !== null){
                this.setState({
                    accessTokan:value
                });
            }
        })
        AsyncStorage.getItem('driverId').then((value) => {           
            if(value != '' && value !== null){
                this.setState({driverId:value})
            }
        })
	}
	
  
	async goOffline (){
        this.setState({spinner:true})
        db.collection("driver_locations")
        .doc(this.state.driverId)
        .delete()

        AsyncStorage.setItem('isOnline', 'false');

        await fetch(DOMAIN+'api/driver/offline',{
            method: 'GET',
            headers : {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer '+this.state.accessTokan
            }
        }).then(function (response) {
            return response.json();
        }).then( (result)=> {
            this.setState({spinner:false})
            if(result.status === 1){
            	AsyncStorage.removeItem('driver_timeout');
             	this.props.navigation.replace('MapViewOffline');
            }
        })
    }
	render(){		
  		return (
  			<>
  			<Spinner
	          visible={this.state.spinner}
	          color='#FFF'
	          overlayColor='rgba(0, 0, 0, 0.5)'
	        />
  			<StatusBar style="auto" />
  			<Appbar.Header style={{backgroundColor:'#FFF'}}>
	            <AntDesign 
                    	name="arrowleft" 
                    	size={24} 
                    	color="black" 
                    	style={{paddingLeft:10}} 
                    	onPress={()=> this.props.navigation.goBack(null)} 
                    />      
				<Appbar.Content title="Trip Planer" titleStyle={{textAlign:'center',alignContent:'center'}} />
				<FontAwesome 
					name='search' 
					style={{color:'#fff',fontSize:25,paddingLeft:15,width:50,textAlign:'left'}} 
					color="#111" 
				/>
            </Appbar.Header>   
             <FlashMessage ref="fmLocalIntstance" position={{top:'40%'}} style={{marginTop:70}}/>  
  			<PaperProvider theme={theme}>
				<ScrollView>
          			<View style={styles.content}>
          				<View style={{alignItems:'center',padding:10,marginBottom:10}}>
          					<Text style={{fontSize:18}}>Later Today</Text>
          				</View>
			          	<Card 
			          		mode='elevated' 
			          		style={styles.boxShadow}
			          		onPress={() => this.props.navigation.navigate('Promotions')}
			          	>
						    <Card.Content>
						      <View style={{flex:1,flexDirection:'row'}}>							
							    	<View style={{flex:1,alignItems:'flex-start',flexWrap:'wrap',justifyContent:'center'}}>					
						     			 <Text style={{fontSize:18,}}>See Upcoming Promotions</Text>
							      </View>
							      <View style={{alignItems:'flex-end',justifyContent:'center'}}>
										<EvilIcons name="chevron-right" size={30} />
							      </View>
						      </View>
						    </Card.Content>
						</Card>
						<View style={styles.space30}></View>
			          	<Card 
			          		mode='elevated' 
			          		style={styles.boxShadow}
			          		onPress={() => this.props.navigation.navigate('DrivingTime')}
			          	>
						    <Card.Content>
						      <View style={{flex:1,flexDirection:'row'}}>							
							    	<View style={{flex:1,alignItems:'flex-start',flexWrap:'wrap',justifyContent:'center'}}>					
						     			 <Text style={{fontSize:18,}}>See Driving Time</Text>
							      </View>
							      <View style={{alignItems:'flex-end',justifyContent:'center'}}>
										<EvilIcons name="chevron-right" size={30} />
							      </View>
						      </View>
						    </Card.Content>
						</Card>
						<View style={styles.space30}></View>
						<View style={{alignItems:'center'}}>							
							<TouchableRipple
							    onPress={() => this.props.navigation.navigate('LastTrip')}
							    rippleColor="rgba(0, 0, 0, .32)"
							  >
							    <Text style={{color:'#3f78ba',fontSize:18,padding:5}}>Waybill</Text>
							  </TouchableRipple>
						</View>
					</View>
				</ScrollView>
				<Card mode='elevated' style={[styles.boxShadow,{marginBottom:0}]}>
					<Card.Content>
						<View style={pageStyles.tripTab}>
							<View style={[pageStyles.tripTabChild,{alignItems:'flex-start'}]}>
								<TouchableOpacity onPress={() => this.props.navigation.navigate('DriverPreferences')}>
								<Image
	        						style={{width:25,height:25,}}
	        						source={require('../assets/swapIcon.png')}
	      						/>
	      						</TouchableOpacity>	
							</View>
							<View style={[pageStyles.tripTabChild,{alignItems:'center'}]}>
								<TouchableOpacity                                    
                                    onPress={() => {
                                        this.goOffline()
                                    }} 
                                >
                                    <View>
                                        <View style={pageStyles.offIcon}>
                                            <View style={{backgroundColor:'#135aa8',borderRadius:50,alignItems:'center',justifyContent:'center',width:50,height:50}}>
                                            <FontAwesome name="hand-paper-o" size={25} color="#FFF" />
                                            </View>
                                        </View>
                                        <Text style={{marginTop:5,fontSize:18}}>Go Offline</Text>
                                    </View>
                                </TouchableOpacity>
							</View>
							<View  style={[pageStyles.tripTabChild,{alignItems:'flex-end'}]}>
								<TouchableOpacity                                    
                                    onPress={() => {
                                        this.props.navigation.navigate('SearchDest')
                                    }} 
                                >
								<AntDesign name="search1" size={25} color="#135aa8" />
								</TouchableOpacity>
								
							</View>
						</View>
					</Card.Content>
				</Card>
			</PaperProvider>

  			</>
  		);
	}
}

const pageStyles = StyleSheet.create({
	tripTab:{		
		flexDirection:'row'
	},
	tripTabChild:{
		flex:1,		
		justifyContent:'center'
	},
	offIcon:{
		borderWidth:1,
		borderColor:'#CCC',
		padding:5,
		borderRadius:50,
		backgroundColor:'#FFF',
		color:'#FFF',
		elevation: 8,
		width:62,
        height:62,
        alignSelf:'center'
	},
	offlineBtn:{      
		backgroundColor:"#ccc",
		justifyContent:'center',
		alignItems:'center',
		flexDirection:'row',    
		borderRadius:50,
	}

})