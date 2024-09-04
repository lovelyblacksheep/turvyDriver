import React, {useEffect, useState} from 'react';
import {  Provider as PaperProvider, Button,   } from 'react-native-paper';
import {View, ScrollView, Picker, Text, StyleSheet, TouchableHighlight,StatusBar } from 'react-native'
import {styles, theme, DOMAIN} from './Constant'
import { Input } from 'react-native-elements';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign } from '@expo/vector-icons';
import FlashMessage , { showMessage, hideMessage }  from "react-native-flash-message";
const StatusBarheight = StatusBar.currentHeight;

export default class Createaccount extends React.Component  {
	constructor(props) {
    super(props);
    this.state = {
    		cities:{},
    		states:{},
    		vehicle:{},
    		models:{},
    		firstName:'',
    		firstNameError:'',
    		lastName:'',
    		lastNameError:'',
    		stateval:'', 
    		city:'',
    		vehicleMake:'',
    		vehicleModel:'',
    		carNumber:'',
    		stateError:'',
    		cityError:'',
    		errorVehicle:'',
    		errorVehicleModel:'',
    		errorCarNumber:'',
    }
   }
   
   componentDidMount(){
   	const {navigation} = this.props;
   	this.getState();
   	this.getCity();
		this.getVehicle();
		this.getModels('');
   	//this.intialLoad();
   	
  		this.unsubscribe =  navigation.addListener("focus",() => {
	  	   this.getState();
	  	   this.getCity();
			this.getVehicle();
			this.getModels('');
  		});		
  } // end of function
  
  async getCity() {
  		fetch(DOMAIN+'api/cities/2',{
			method: 'GET',
 		}).then(function (response) {
 			return response.json();
  		}).then( (result)=> {
  			//console.log(result);
  				this.setState({
  					cities:result.data});
		});
    }
    
   async getState (){
		 fetch(DOMAIN+'api/states/13',{
			method: 'GET',
 		}).then(function (response) {
 			return response.json();
  		}).then( (result)=> {
  			//console.log(result);
  			this.setState({
  				states:result.data
  			});
		});
    }
    
    async getVehicle(){
  		fetch(DOMAIN+'api/makes',{
			method: 'GET',
 		}).then(function (response) {
 			return response.json();
  		}).then( (result)=> {
  			//console.log(result);
  				this.setState({
  					vehicle:result.data
  					});
		});
    }
    async getModels(id) {
		if(id > 0){
    	fetch(DOMAIN+'api/models/'+id,{
			method: 'GET'
 		}).then(function (response) {
 			return response.json();
  		}).then( (result)=> {
  				this.setState({
  					models:result.data});
		});
		}
    }
    
    
   
  
  async submit (){
    	let firstNameError = '';
    	let lastNameError = '';
    	let cityError = '';
    	let stateError = '';
    	let errorVehicle = '';
    	let errorVehicleModel = '';
    	let errorCarNumber = '';
    	if(this.state.firstName.trim() == '') { 
    		//setFirstNameError('First Name is required')
    		 firstNameError = 'Please input your first name.'
    	}
    	if(this.state.lastName.trim() == '') { 
    		lastNameError = 'Please input your last name.';
    	}
    	
    	if(this.state.city <= 0) { 
    		cityError = 'Please choose city.';
    	}
    	
    	if(this.state.stateval <= 0) { 
    		stateError = 'Please choose state.'; 
    	}
    	if(this.state.vehicleMake <= 0) { 
    		errorVehicle = 'Please choose vehicle.';
    	}
    	if(this.state.vehicleModel <= 0){ 
    		errorVehicleModel = 'Vehicle Model is required'; 
    	}
    	
    	if(this.state.carNumber.trim() == '') { 
    		errorCarNumber = 'Please input car number.'; 
    	}
    	


    	if(this.state.firstName.trim() != '' && this.state.lastName.trim() != '' &&  this.state.city > 0 &&  this.state.vehicleMake > 0 && this.state.vehicleModel > 0 && this.state.carNumber.trim() !='' && this.state.stateval > 0){
    		return this.props.navigation.navigate('Signupasdriver',{"first_name" : this.state.firstName, "last_name" : this.state.lastName, "city_id" : this.state.city, "make_id" : this.state.vehicleMake, "model_id" : this.state.vehicleModel,"plate" : this.state.carNumber,"state":this.state.stateval});
    	}else{
    		this.setState({
    					firstNameError:firstNameError,
                   lastNameError :lastNameError,
                   cityError:cityError,
                   stateError:stateError,
                   errorVehicle:errorVehicle,
                   errorCarNumber:errorCarNumber,
                   errorVehicleModel:errorVehicleModel
    				},()=>{
    					showMessage({
           			message: '',
           			type: "danger",
           			renderCustomContent: ()=>{           	 		
           				return this.renderMessages();
           			},
        	 		});
    	});
    	}
    }

 renderMessages = () =>{
    	return (<View >
    	{this.state.firstNameError ? 
    		(<Text style={{color:'#fff',padding:3,fontFamily: "Metropolis-Regular"}}><AntDesign name="closecircle" size={15} color="white" /> {this.state.firstNameError}</Text>)
    	:
	    	(<></>)
      }
     {this.state.lastNameError ? 
    	( <Text style={{color:'#fff',padding:3,fontFamily: "Metropolis-Regular"}}><AntDesign name="closecircle" size={15} color="white" /> {this.state.lastNameError}</Text>)
    	:
    	(<></>)
     }
     {this.state.stateError ? 
    	(<Text style={{color:'#fff',padding:3,fontFamily: "Metropolis-Regular"}}><AntDesign name="closecircle" size={15} color="white" /> {this.state.stateError}</Text>)
    	:
      (<></>)
    }	
    {this.state.cityError ? 
    	(<Text style={{color:'#fff',padding:3,fontFamily: "Metropolis-Regular"}}><AntDesign name="closecircle" size={15} color="white" /> {this.state.cityError}</Text>)
    	:
    	(<></>)
    }
    {this.state.errorVehicle ? 
    	(<Text style={{color:'#fff',padding:3,fontFamily: "Metropolis-Regular"}}><AntDesign name="closecircle" size={15} color="white" /> {this.state.errorVehicle}</Text>)
    	:
    	(<></>)
    }
    {this.state.errorVehicleModel ? 
    	(<Text style={{color:'#fff',padding:3,fontFamily: "Metropolis-Regular"}}><AntDesign name="closecircle" size={15} color="white" /> {this.state.errorVehicleModel}</Text>)
    	:
    	(<></>)
    }
     {this.state.errorCarNumber ? 
    	(<Text style={{color:'#fff',padding:3,fontFamily: "Metropolis-Regular"}}><AntDesign name="closecircle" size={15} color="white" /> {this.state.errorCarNumber}</Text>)
    	:
    	(<></>)
    }
   
    	</View>);
    }
  
  
	render(){
		return (<PaperProvider theme={theme}>
          <ScrollView keyboardShouldPersistTaps='handled'>
          <FlashMessage position="top" style={{borderRadius:2,marginTop:-30}}  />
          <View style={{paddingTop:30,marginLeft:10,marginRight:10}}>
				<View style={{flexDirection:'row',}}>
					<View style={{flex:1}}>
		        		<Input placeholder='First Name' inputStyle={[styles.inputStyle,{ borderColor : this.state.firstNameError ? 'red' : '#ddd' }]} inputContainerStyle={styles.inputContainerStyle}  value={this.state.firstName} onChangeText={(value) =>{
		        			this.setState({firstName:value},()=>{
		        					if(value == ''){
		        						this.setState({
		        								firstNameError:'Please input first name.'
		        							});
		        					}else{
		        						this.setState({
		        								firstNameError:''
		        							});
		        					}
		        		});
		        		}}
		        			placeholderTextColor="#8c8c8c" />
		          </View>
					<View style={{flex:1}}>
		           <Input placeholder='Last Name' inputStyle={[styles.inputStyle,{ borderColor : this.state.lastNameError ? 'red' : '#ddd' }]} inputContainerStyle={styles.inputContainerStyle}   value={this.state.lastName} onChangeText={(value) =>{
		           	
		           	this.setState({lastName:value},()=>{
		        					if(value == ''){
		        						this.setState({
		        								lastNameError:'Please input last name.'
		        							});
		        					}else{
		        						this.setState({
		        								lastNameError:''
		        							});
		        					}
		        		});
		        		
		           }}
		           		placeholderTextColor="#8c8c8c" />
		        </View>
        		</View>
        		
        		<View style={[styles.pickerContainer,{borderColor : this.state.stateError ? 'red' : '#ddd' }]}>
		        	<Picker style={{ height: 55, width: '100%', backgroundColor: "transparent", color:'#8c8c8c' }} mode="dialog" placeholder="Default"
		        	onValueChange={(itemValue, itemIndex) =>{
		        		this.setState({stateval:itemValue},()=>{
		        					if(itemValue == ''){
		        						this.setState({
		        								stateError:'Please choose state.'
		        							});
		        					}else{
		        						this.setState({
		        								stateError:''
		        							});
		        					}
		        		});
		        	} 
		        	}
		        	selectedValue={this.state.stateval} >
		        		<Picker.Item label="Select State" value="" />
		        		 {this.state.states.length > 0 && this.state.states.map((val, index) =>{
            	return ( <Picker.Item key={index} label={val.name} value={val.id} />)
            		})}
		      	</Picker>
		      	<AntDesign name="down" size={24} color="#a7a7a7" style={styles1.pickerIcon}  />
      		</View>
      		
      		
		      <View style={[styles.pickerContainer,{marginTop:20,borderColor : this.state.cityError ? 'red' : '#ddd' }]}>
			      <Picker style={{ height: 55, width: '100%',backgroundColor: "transparent",color:'#8c8c8c' }} mode="dialog" placeholder="Select City" 
			      onValueChange={(itemValue, itemIndex) =>{
			      	this.setState({city:itemValue},()=>{
		        					if(itemValue == ''){
		        						this.setState({
		        								cityError:'Please choose city.'
		        							});
		        					}else{
		        						this.setState({
		        								cityError:''
		        							});
		        					}
		        		});

			      } } 
			      selectedValue={this.state.city}>
			        <Picker.Item label="Select City" value="" />
			        {this.state.cities.length > 0 && this.state.cities.map((val, index) =>{
            	return ( <Picker.Item key={index} label={val.name} value={val.id} />)
            		})}
			      </Picker>
			      <AntDesign name="down" size={24} color="#a7a7a7" style={styles1.pickerIcon}  />
		      </View>
		      
		      
            <View style={[styles.pickerContainer,{marginTop:20,borderColor : this.state.errorVehicle ? 'red' : '#ddd' }]}>
		        <Picker style={{ height: 55, width: '100%',backgroundColor: "transparent",color:'#8c8c8c' }} mode="dialog" placeholder="Select Vehicle"
					selectedValue={this.state.vehicleMake} 
					onValueChange={(itemValue, itemIndex) => {
						this.setState({vehicleMake:itemValue},()=>{
							this.getModels(itemValue)
		        					if(itemValue == ''){
		        						this.setState({
		        								errorVehicle:'Please choose city.'
		        							});
		        					}else{
		        						this.setState({
		        								errorVehicle:''
		        							});
		        					}
		        		});
		        		
					 } }
					>
			        <Picker.Item label="Select Vehicle" value="" />
			        {this.state.vehicle.length > 0 && 
this.state.vehicle.map((val, index) =>{
            	return ( <Picker.Item key={index} label={val.name} value={val.id} />)
            })}
			      </Picker>
			      <AntDesign name="down" size={24} color="#a7a7a7" style={styles1.pickerIcon}  />
		      </View>
			  
			      
            <View style={[styles.pickerContainer,{marginTop:20,borderColor : this.state.errorVehicleModel ? 'red' : '#ddd' }]}>
		        <Picker style={{ height: 55, width: '100%',backgroundColor: "transparent",color:'#8c8c8c' }} mode="dialog" placeholder="Select Vehicle Model" selectedValue={this.state.vehicleModel} 
		        onValueChange={(itemValue, itemIndex) => {
		        	this.setState({vehicleModel:itemValue},()=>{
							
		        					/*if(itemValue == ''){
		        						this.setState({
		        								errorVehicle:'Please choose city.'
		        							});
		        					}else{
		        						this.setState({
		        								errorVehicle:''
		        							});
		        					}
		        					*/
		        		});
		        		
		        } }
		        >
			        <Picker.Item label="Select Vehicle Model" value="" />
			        {this.state.models.length > 0 && 
			        this.state.models.map((val, index)=> { 
			        return(<Picker.Item key={index} label={val.name} value={val.id} />)
			        })
			        }
			      </Picker>
			      <AntDesign name="down" size={24} color="#a7a7a7" style={styles1.pickerIcon}  />
		      </View>
		      
		      
     		 <Input placeholder='Car Number' inputStyle={[styles.inputStyle,{ marginTop:20, borderColor : this.state.errorCarNumber ? 'red' : '#ddd' }]} inputContainerStyle={styles.inputContainerStyle} value={this.state.carNumber} onChangeText={(value) =>{
     		 	this.setState({carNumber:value},()=>{
		        					if(value == ''){
		        						this.setState({
		        								errorCarNumber:'Please input car number.'
		        							});
		        					}else{
		        						this.setState({
		        								errorCarNumber:''
		        							});
		        					}
		        		});
		        		
     		 }} placeholderTextColor="#8c8c8c"  />
       </View>       
        </ScrollView>
        <View style={{paddingBottom:20,borderRadius:40,marginLeft:25,marginRight:25}}>
        	<TouchableHighlight             
              style={styles.contentBtn} onPress={() => {this.submit(); }}>
              <LinearGradient  
                  style={styles.priBtn}       
                  colors={['#2270b8', '#74c0ee']}
                  end={{ x: 1.2, y: 1 }}>          
                    <Text style={styles.priBtnTxt}>Submit</Text>          
              </LinearGradient>
            </TouchableHighlight>
        </View>
        
        </PaperProvider>)
	}
}

const styles1 = StyleSheet.create({ 
  pickerIcon: {   
    position: "absolute",
    bottom: 15,
    right: 10,
    fontSize: 20
 },
 });
 