import React from 'react';
import {View,ScrollView, Alert, Image, StyleSheet,Text, TouchableHighlight, Picker} from 'react-native'
import {  Provider as PaperProvider, Appbar} from 'react-native-paper';
import {styles, theme, DOMAIN} from './Constant';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Spinner from 'react-native-loading-spinner-overlay';
import { Input } from 'react-native-elements';
import { LinearGradient } from 'expo-linear-gradient';
import FlashMessage , { showMessage, hideMessage }  from "react-native-flash-message";
import { AntDesign } from '@expo/vector-icons';

export default class EditProfile extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			accessTokan:'',
			spinner:true,
			cities:{},
    		states:{},
    		country:{},
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
    		mobile:'',
    		mobileError:'',
    		email:'',
    		emailError:'',
    		isProfileUpdate:false,
    		updateMsg:'',
    		countryId:'',
    		phoneCode:'',
    		isDataFetch:false,
    		countryPick:'',
    		partners:{},
    		partner_id:'',
    		password:'',
    		confpassword:''
		}


	}
	async componentDidMount() {

		await AsyncStorage.getItem('accesstoken').then((value) => {           
            if(value != '' && value !== null){
                this.setState({
                    accessTokan:value,                    
                });
            }
        })
        await fetch(DOMAIN+'api/rider/profile',{
            method: 'GET',
            headers : {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer '+this.state.accessTokan
            }
        }).then(function (response) {
            return response.json();
        }).then( (result)=> {
        	console.log(result);
        	const data = result.data;
        	this.setState({
                firstName:data.first_name,
                lastName:data.last_name,
                email:data.email,
                spinner:false,
                partner_id:data.partner_id,
            });
            this.getPartners();
	        
	        
        })
	}

	
	async getPartners (){
		fetch(DOMAIN+'api/partners',{
			method: 'GET',
 		}).then(function (response) {
 			return response.json();
  		}).then( (result)=> {
  			console.log(result.data);
  			this.setState({
  				partners:result.data
  			});
		});
   }

    

	async submit (){
    	let firstNameError = '';
    	let lastNameError = '';
    	let mobileError = '';
    	let emailError = '';
    	let passError ='';
    	let uperror = true;
    	
    	if(this.state.firstName.trim() == '') {     		
    		 firstNameError = 'Please input your first name.'
    		 uperror = false;
    	}
    	if(this.state.lastName.trim() == '') { 
    		lastNameError = 'Please input your last name.';
    		uperror = false;
    	}
    	if(this.state.partner_id == '' && this.state.partner_id <= 0) { 
    		mobileError = 'Please choose your Partner.';
    		uperror = false;
    	}
    	if(this.state.email.trim() == '') { 
    		emailError = 'Please input your email.';
    		uperror = false;
    	}
    	
    	if(this.state.password.trim() !== '') {
    		if(this.state.confpassword.trim() == ''){
    			passError = 'Please input confirm password.';
    			uperror = false;
    		}else if(this.state.confpassword !== this.state.password){
    			passError = 'Password and confirm Password mismatch.';
    			uperror = false;
    		} 
    	}


    	if(uperror){
    		console.log(this.state.phoneCode)

    		this.setState({spinner:true})
    		await fetch(DOMAIN+'api/rider/profile',{
	            method: 'POST',
	            headers : {
	                'Content-Type': 'application/json',
	                'Accept': 'application/json',
	                'Authorization': 'Bearer '+this.state.accessTokan
	            },
	            body: JSON.stringify({
	 				"first_name" : this.state.firstName,
	 				"last_name" : this.state.lastName,
	 				"email" : this.state.email,	 				
	 				"partner_id" : this.state.partner_id,
	 				'password':this.state.password,
	 			})
	 			
	        }).then(function (response) {
	            return response.json();
	        }).then( (result)=> {
	        	this.setState({spinner:false});
	        	console.log("RESULT",result);
	        	//const data = result.data;
	        	if(result.status === 1){
		        	this.setState({
		    			isProfileUpdate:true,
		    			updateMsg:result.message
		    		},()=>{
		    			showMessage({
							message: '',
							type: "success",
							renderCustomContent: ()=>{					
								return this.successMessage();
							},
						});
		    		});
		        }
		        if(result.status === 0){
		        	this.setState({
		    			isProfileUpdate:false,
		    			updateMsg:result.message.email
		    		},()=>{
		    			showMessage({
							message: '',
							type: "danger",
							renderCustomContent: ()=>{					
								return this.successMessage();
							},
						});
		    		});
		        }
	        	
	        })

    	}else{
    		console.log('error')
    		this.setState({
    			firstNameError:firstNameError,
                lastNameError :lastNameError,
                mobileError :mobileError,
                emailError :emailError,
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

    successMessage = () =>{
    	return (
    		<View >    			
    			<Text style={{color:'#fff',padding:3,fontFamily: "Metropolis-Regular"}}><AntDesign name="closecircle" size={15} color="white" /> {this.state.updateMsg}</Text>
    			
      		</View>	
      	);	
    }

    renderMessages = () =>{
    	return (
    		<View >
    			{this.state.firstNameError 
    				? 
    				(<Text style={{color:'#fff',padding:3,fontFamily: "Metropolis-Regular"}}><AntDesign name="closecircle" size={15} color="white" /> {this.state.firstNameError}</Text>)
    				:
	    			(<></>)
      			}
				{this.state.lastNameError 
					? 
					( <Text style={{color:'#fff',padding:3,fontFamily: "Metropolis-Regular"}}><AntDesign name="closecircle" size={15} color="white" /> {this.state.lastNameError}</Text>)
					:
					(<></>)
				}
				{this.state.mobileError 
    				? 
    				(<Text style={{color:'#fff',padding:3,fontFamily: "Metropolis-Regular"}}><AntDesign name="closecircle" size={15} color="white" /> {this.state.mobileError}</Text>)
    				:
	    			(<></>)
      			}
				{this.state.emailError 
					? 
					( <Text style={{color:'#fff',padding:3,fontFamily: "Metropolis-Regular"}}><AntDesign name="closecircle" size={15} color="white" /> {this.state.emailError}</Text>)
					:
					(<></>)
				}
    		</View>
    	);
    }	

	render(){		
  		return (
  			<>
  			<Appbar.Header style={{backgroundColor:'#FFF'}}>
               <Appbar.BackAction onPress={() => this.props.navigation.goBack()} />
                 <Appbar.Content title="Edit Profile"  />
            </Appbar.Header>
  				<Spinner
					visible={this.state.spinner}
					color='#FFF'
					overlayColor='rgba(0, 0, 0, 0.5)'
				/>
  				<StatusBar style="auto" />
  			
  				<PaperProvider theme={theme}>
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
					        			placeholderTextColor="#8c8c8c" 
					        		/>
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
					           			placeholderTextColor="#8c8c8c" 
					           		/>
					        	</View>
        					</View>
        					<View style={{flexDirection:'row',}}>
        		<View style={{width:'100%'}}>
		           <Input placeholder='Password' 
		           	inputStyle={[styles.inputStyle,{ borderColor : this.state.statepassword ? 'red' : '#ddd' }]} 
		           	inputContainerStyle={styles.inputContainerStyle} 
		           	
		           	value={this.state.password} 
		           	 secureTextEntry={true}
		           	onChangeText={(value) => {
		           		this.setState({password:value},()=>{
		        					if(value == ''){
		        						this.setState({
		        								statepassword:'Please input the password.'
		        							});
		        					}else if(value.length < 8){
		        						this.setState({
		        								statepassword:'Password should be 8 digits.'
		        							});
		        					}else{
		        						this.setState({
		        								statepassword:''
		        							});
		        					}
		        				});
		        		}} />
		        </View>
		       </View>
		       <View style={{flexDirection:'row',}}>
        		<View style={{width:'100%'}}>
		           <Input placeholder='Confirm Password'
		            inputStyle={[styles.inputStyle,{ borderColor : this.state.errorConfPassword ? 'red' : '#ddd' }]} 
		            inputContainerStyle={styles.inputContainerStyle} 
		            
		             secureTextEntry={true}
		            value={this.state.confpassword} 
		            onChangeText={(value) => {
		            	this.setState({confpassword:value},()=>{
		        					if(value == ''){
		        						this.setState({
		        								errorConfPassword:'Please input the confirm password.'
		        							});
		        					}else{
		        						this.setState({
		        								errorConfPassword:''
		        						});
		        					}
		        				});
		        				
		            }} />
		        </View>
		       </View>
        					<View style={{flex:1}}>
				        		<Input placeholder='Email' inputStyle={[styles.inputStyle,{ borderColor : this.state.emailError ? 'red' : '#ddd' }]} inputContainerStyle={styles.inputContainerStyle}  value={this.state.email} onChangeText={(value) =>{
					        			this.setState({email:value},()=>{
				        					if(value == ''){
				        						this.setState({
			        								emailError:'Please input email.'
			        							});
				        					}else{
				        						this.setState({
			        								emailError:''
			        							});
				        					}
					        			});
					        		}}
				        			placeholderTextColor="#8c8c8c" 
				        			keyboardType='email-address'
				        		/>
				          	</View>
				          	
				          	<View style={[styles.pickerContainer,{borderColor : this.state.stateError ? 'red' : '#ddd' }]}>
					        	<Picker style={{ height: 55, width: '100%', backgroundColor: "transparent", color:'#8c8c8c' }} mode="dialog" placeholder="Default"
					        		onValueChange={(itemValue, itemIndex) =>{
						        		this.setState({partner_id:itemValue},()=>{
				        					if(itemValue == ''){
				        						this.setState({
				        								stateError:'Please choose Partner.'
				        							});	
				        					}else{
				        						this.setState({
				        								stateError:''
				        							});
				        					}
						        		});
					        		} 
					        	}
					        	selectedValue={this.state.partner_id} >
					        	<Picker.Item label="Select Partner" value="" />
					        		{this.state.partners.length > 0 && this.state.partners.map((val, index) =>{
			            			return ( <Picker.Item key={index} label={val.organization} value={val.id}  />)
				            		})}
						      	</Picker>
					      		<AntDesign name="down" size={24} color="#a7a7a7" style={styles1.pickerIcon}  />
			      			</View>
			      		
  						</View>
  					</ScrollView>
  					<View style={{paddingBottom:20,borderRadius:40,marginLeft:25,marginRight:25}}>
		        	<TouchableHighlight             
						style={styles.contentBtn} onPress={() => {this.submit(); }}>
							<LinearGradient  
								style={styles.priBtn}       
								colors={['#2270b8', '#74c0ee']}
								end={{ x: 1.2, y: 1 }}>          
								<Text style={styles.priBtnTxt}>Update Profile</Text>
							</LinearGradient>
		            </TouchableHighlight>
		        </View>
  				</PaperProvider>
  			</>
  		);
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