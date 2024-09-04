import React,{useEffect, useState} from 'react';
import { StatusBar } from 'expo-status-bar';
import {  Provider as PaperProvider,Text, Button, Appbar, Card, Title, Paragraph } from 'react-native-paper';
import {View, ScrollView, TouchableWithoutFeedback,Image,TouchableHighlight } from 'react-native'
import {styles, theme,DOMAIN, debug} from './Constant'
import Fontisto from 'react-native-vector-icons/Fontisto'
import EvilIcons from 'react-native-vector-icons/EvilIcons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { Badge } from 'react-native-elements'
import { Col, Row, Grid } from "react-native-easy-grid";
import { LinearGradient } from 'expo-linear-gradient';
import Spinner from 'react-native-loading-spinner-overlay';
import AsyncStorage from '@react-native-async-storage/async-storage';

import * as firebase from "firebase";
//import "firebase/firestore";
import firestore from '@react-native-firebase/firestore';
import * as geofirestore from 'geofirestore';

import apiKeys from './config/keys';

if (!firebase.apps.length) {
    //console.log('Connected with Firebase')
    firebase.initializeApp(apiKeys.firebaseConfig);
}

const db = firestore();
const GeoFirestore = geofirestore.initializeApp(db);
const geocollection = GeoFirestore.collection('driver_locations');

export default class DriverPreferences extends React.Component {
		
	constructor(props) {
        super(props);
        this.state = {
        	serviceType:[],
        	selectedType:{},
        	spinner: true,
        	isDataFetch:false,
        	accessTokan:'',
        	driverId:''
        }
    }

    async componentDidMount() {
    	await AsyncStorage.getItem('accesstoken').then((value) => {           
	        if(value != '' && value !== null){	        	
	        	this.setState({accessTokan:value})
	        }
	    })
	    await AsyncStorage.getItem('driverId').then((value) => {             
	        if(value != '' && value !== null){	          
	          this.setState({driverId:value})
	        }
	    })
	    //console.log(this.state.driverId)
		
		//this.getServiceType();
		this.getDriverServices();
    }   
		
	
	getDriverServices = async () => {
		//console.log('driver',this.state.driverId)
		await fetch(DOMAIN+'api/driver/vehicle/'+this.state.driverId+'/service',{
            method: 'GET',
            headers : {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer '+this.state.accessTokan
            }            
        }).then(function (response) {
            return response.json();
        }).then( (res)=> {
            //console.log('driver vehicle:',debug(res))
            this.setState({
  				serviceType: res.data,
  				spinner:false,
  				isDataFetch:true
  			})
        })
	}
		
	addResetTheServiceType = async () => {
		//console.log('services:',this.state.serviceType)
		await fetch(DOMAIN+'api/driver/vehicle-details',{
            method: 'GET',
            headers : {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer '+this.state.accessTokan
            }
        }).then(function (response) {
            return response.json();
        }).then( (result)=> {
            //console.log(result);
            let serData = result.data.servicetype_id;
            
			var t = serData.split(',');
	        var serArr = [];        
	        for(let i=0; i < t.length; i++){
	            serArr[i] = Number(t[i]);
	        }
	        geocollection
			.doc(this.state.driverId)
			.update({
	            services_type:firestore.FieldValue.arrayRemove(...serArr)
			})

			db.collection('queue')
			.doc(this.state.driverId)
			.get()
			.then((docQue) => {
				//console.log('firebase queue============:',docQue.data()) 
				if(docQue.data()){

					db.collection("queue")
					.doc(this.state.driverId)
					.update({
						services_type:firestore.FieldValue.arrayRemove(...serArr)
					})

				}
			})

        })

		/*let serArr = []
		geocollection
		.doc(this.state.driverId)
		.update({
            services_type:firebase.firestore.FieldValue.arrayUnion(...[])
		})*/
		await fetch(DOMAIN+'api/driver/service/'+this.state.driverId+'/update',{
            method: 'POST',
            headers : {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer '+this.state.accessTokan
            },
            body: JSON.stringify({
                "servicetype_id" : null
            })
        }).then(function (response) {
            return response.json();
        }).then( (res)=> {
            console.log('driver vehicle:',res)
        })

		

		this.props.navigation.replace('DriverPreferences');                
	}

	openToAllTrips = async () => {
		//alert('hghghg')
		let driverSer = '';
		let serArr = []
		this.state.serviceType.map((val, key)=>{			
			driverSer += val.id +',';
			serArr.push(val.id)
		})
		//console.log('serAre',serArr)

		geocollection
		.doc(this.state.driverId)
		.update({
            services_type:firestore.FieldValue.arrayUnion(...serArr)
		})
		//alert(driverSer)
		await fetch(DOMAIN+'api/driver/service/'+this.state.driverId+'/update',{
            method: 'POST',
            headers : {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer '+this.state.accessTokan
            },
            body: JSON.stringify({
                "servicetype_id" : driverSer
            })
        }).then(function (response) {
            return response.json();
        }).then( (res)=> {
            //console.log('driver vehicle:',res)
        })

		db.collection('queue')
		.doc(this.state.driverId)
		.get()
		.then((docQue) => {
			//console.log('firebase queue============:',docQue.data()) 
			if(docQue.data()){

				db.collection("queue")
				.doc(this.state.driverId)
				.update({
					services_type:firestore.FieldValue.arrayUnion(...serArr)
				})

			}
		})
        this.props.navigation.replace('DriverPreferences');
	}
		
	changeSelected = (k) => {

		this.state.serviceType[k].selected = this.state.serviceType[k].selected == 1 ? 0 : 1;
		this.setState({
  			serviceType: this.state.serviceType,
  		},() => {
  			//alert(this.state.serviceType[k].selected)
  			let driverSer = '';
  			let serArr = [this.state.serviceType[k].id]
  			this.state.serviceType.map((val, key)=>{
				if(val.selected === 1){
					driverSer += val.id +',';
				}
			})
			
			if(this.state.serviceType[k].selected === 0)
			{	
				geocollection
				.doc(this.state.driverId)
				.update({
		            services_type:firestore.FieldValue.arrayRemove(...serArr)
				})
			}else{
				geocollection
				.doc(this.state.driverId)
				.update({
		            services_type:firestore.FieldValue.arrayUnion(...serArr)
				})
			}
			//console.log('renderOut==:',driverSer)
			fetch(DOMAIN+'api/driver/service/'+this.state.driverId+'/update',{
	            method: 'POST',
	            headers : {
	                'Content-Type': 'application/json',
	                'Accept': 'application/json',
	                'Authorization': 'Bearer '+this.state.accessTokan
	            },
	            body: JSON.stringify({
                    "servicetype_id" : driverSer
                })
	        }).then(function (response) {
	            return response.json();
	        }).then( (res)=> {
	            //console.log('driver vehicle:',res)
	        })

			db.collection('queue')
			.doc(this.state.driverId)
			.get()
			.then((docQue) => {
				//console.log('firebase queue============:',docQue.data()) 
				if(docQue.data()){

					if(this.state.serviceType[k].selected === 0){
						db.collection("queue")
						.doc(this.state.driverId)
						.update({
							services_type:firestore.FieldValue.arrayRemove(...serArr)
						})
					}else{

						db.collection("queue")
						.doc(this.state.driverId)
						.update({
							services_type:firestore.FieldValue.arrayUnion(...serArr)
						})
					}

				}
			})
				
  		})
	}
		//console.log('renderOut:',serviceType)
	render(){
		//console.log('renderOut:',this.state.serviceType)
  		return (

  			<>
  				<StatusBar style="auto" />
			  	<Spinner
		          visible={this.state.spinner}
		          color='#FFF'
		          overlayColor='rgba(0, 0, 0, 0.5)'
		        />
        		{(this.state.isDataFetch)
            	?
  					<PaperProvider theme={theme}>
            			<View style={styles.content}>
  							<View style={{flexDirection:'row',marginTop:20,}}>
          						<Fontisto name="close-a" size={20} onPress={()=>this.props.navigation.goBack(null)} style={{marginTop:20,marginBottom:20}} />
          						<View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
          							<Title style={{textAlign:'center',fontSize:22,alignContent:'center'}}>Driving Preference</Title>
          						</View>
          					</View>
          				</View>
						<ScrollView>
          					<View style={styles.content}>
          						<View style={styles.space}></View>
				          		<Card mode='elevated' style={styles.cardShadow} onPress={() => this.openToAllTrips()}>
								    <Card.Content>
								      <View style={{flex:1,flexDirection:'row'}}>
									    	<View style={{flex:1,alignItems:'flex-start',flexWrap:'wrap',justifyContent:'center'}}>					
								     			 <Text style={{fontSize:18,}}>Open to all trip</Text>
									      </View>
									      <View style={{alignItems:'flex-end',justifyContent:'center'}}>
												<EvilIcons name="chevron-right" size={30} />
									      </View>
								      </View>
								    </Card.Content>
								</Card>				  
								<View style={styles.space30}></View>
				  				<Card style={styles.cardShadow}>
				  					<Card.Content>
				  						<Title>Services <Badge value="New" status="primary" /></Title>  					
				  						<View>
				  						<ScrollView horizontal={true}>
					          			{
					          				Object.keys(this.state.serviceType).length > 0 
					          				?
					          				this.state.serviceType.map((data,k)=>{
												return (<View key={k} style={[data.selected == 1 ? {borderWidth:2,marginRight:10,borderRadius:5,borderColor:'#3f78ba',width:130,justifyContent: "center",textAlign:'center',lineHeight: 14}: {marginRight:10,borderWidth:2,borderColor:'transparent',width:130,justifyContent: "center",textAlign:'center',lineHeight: 14}]}>
								  				<TouchableWithoutFeedback key={k} onPress={() => this.changeSelected(k)}>
									  				<View  style={{justifyContent:'center',paddingTop:10}}>
									  					<View style={{justifyContent:'center',textAlign:'center',alignItems: 'center',marginBottom:10}}>
															{
															data.cdnimage
															?
															<Image style={{width:70,height:70,borderRadius:5,}} resizeMode="contain" source={{uri:data.cdnimage}} />
															:
															<Image style={{width:70,height:70,borderRadius:5,}} resizeMode="contain" source={{uri:DOMAIN+data.image}} />
															}
								  							
									  					</View>
									  					<Text style={{textAlign:'center',flexShrink: 1,	alignItems: 'flex-end',lineHeight: 16}}>{data.name} </Text>
									  					<Button mode="text" onPress={()=>this.changeSelected(k)}>{data.selected == 1 ? 'ON' : 'Off'}</Button>
									  				</View>
								  				</TouchableWithoutFeedback>
							  				</View>
							  				)
						          			})
						          			:
						          			null
					          			}
					          			</ScrollView>
				  						</View>
				  					</Card.Content>
				  				</Card>
  								<View style={styles.space30}></View>
								<View style={{marginBottom:50,paddingBottom:20}}>
									<TouchableHighlight             
									style={styles.contentBtn} onPress={()=>this.addResetTheServiceType()}>
										<LinearGradient  
										style={styles.priBtn}       
										colors={['#2270b8', '#74c0ee']}
										end={{ x: 1.2, y: 1 }}>          
										<Text style={styles.priBtnTxt}>Reset</Text>          
										</LinearGradient>
									</TouchableHighlight>
								</View>
							</View>
						</ScrollView>
					</PaperProvider>
				:
				<View></View>
				}
  			</>
  		);
	}
}
	