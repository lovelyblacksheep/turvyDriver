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
    		countryPick:''
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
        await fetch(DOMAIN+'api/driver/profile',{
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
                mobile:data.mobile,
                email:data.email,
                spinner:false,
                stateval:data.state_id,
                city:data.city_id,
                countryId:data.country_id,
            });
            this.getState();
	        this.getCity();
	        this.getCountry();
	        this.setState({
	        	isDataFetch:true	
	        })
	        
        })
	}

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
		await fetch(DOMAIN+'api/states/13',{
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

    async getCountry () {
  		await fetch(DOMAIN+'api/countries',{
			method: 'GET',
 		}).then(function (response) {
 			return response.json();
  		}).then( (result)=> {  			
  			//console.log(this.state.countryId);
  			this.setState({
  						country:result.data
  					})
  			
  			for (let item of result.data) {

  				if(item.id === this.state.countryId){
  					console.log(item);
  					let str = this.state.mobile;
  					str = str.replace('+'+item.phonecode, "");
  					
  					this.setState({
  						mobile:str,
  						phoneCode:item.phonecode
  					})


  				}
  			}
		});
	}

	async submit (){
    	let firstNameError = '';
    	let lastNameError = '';
    	let mobileError = '';
    	let emailError = '';
    	let uperror = true;
    	if(this.state.firstName.trim() == '') {     		
    		 firstNameError = 'Please input your first name.'
    		 uperror = false;
    	}
    	if(this.state.lastName.trim() == '') { 
    		lastNameError = 'Please input your last name.';
    		uperror = false;
    	}
    	if(this.state.mobile.trim() == '') { 
    		mobileError = 'Please input your phone number.';
    		uperror = false;
    	}
    	if(this.state.email.trim() == '') { 
    		emailError = 'Please input your email.';
    		uperror = false;
    	}
    	

    	if(uperror){
    		console.log(this.state.phoneCode)

    		this.setState({spinner:true})
    		await fetch(DOMAIN+'api/driver/profile',{
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
	 				"mobile" : '+'+this.state.phoneCode+this.state.mobile,
	 				"state_id" : this.state.stateval,
	 				"city_id" : this.state.city,
	 				"country_id" : this.state.countryId
	 			})
	 			
	        }).then(function (response) {
	            return response.json();
	        }).then( (result)=> {
	        	this.setState({spinner:false})
	        	//console.log(result);
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
  				<Spinner
					visible={this.state.spinner}
					color='#FFF'
					overlayColor='rgba(0, 0, 0, 0.5)'
				/>
  				<StatusBar style="auto" />
  				{(this.state.isDataFetch)
  				?	
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
        					<View style={{flex:1}}>				        		
				        		<Input keyboardType="number-pad" leftIcon={<View style={{flexDirection:'row'}}><Text style={{fontSize:16,marginRight:7,marginTop:2,color:'#8c8c8c'}}>+{this.state.phoneCode}</Text><Text style={{fontSize:20,borderRightWidth: 1,borderColor:'#8c8c8c'}}></Text></View>}
									leftIconContainerStyle={{position:'absolute',left:15,zIndex:1000}} value={this.state.mobile} max={10} 
									onChangeText={(value) => { let num = value.replace(".", '');
								    num = value = value.replace(/^0+/, '');
								     if(isNaN(num)) { }else{
										this.setState({
					  						mobile:value,
					  					})
								     }
								     if(value == ''){
		        						this.setState({
		        							mobileError:'Please input phone number.'
		        						});
		        					}else{
		        						this.setState({
		        							mobileError:''
		        						});
		        					}
								    }
								    }
								  placeholder='Enter Mobile Number' inputStyle={[styles.inputStyle,{paddingLeft:65,fontSize:16,borderColor : this.state.mobileError ? 'red' : '#ddd'}]}
								  inputContainerStyle={[styles.inputContainerStyle]}
								  placeholderTextColor="#8c8c8c"
								  disabled />
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
				        			disabled
				        		/>
				          	</View>
				          	<View style={[styles.pickerContainer,{height: 50,marginBottom:20}]}>
						        	
							        <Picker style={{ height: 48, width: '100%', backgroundColor: "transparent", color:'#8c8c8c'}} selectedValue={this.state.phoneCode+'-'+this.state.countryId} onValueChange={(itemValue, itemIndex) => {
								       var cnt = 	itemValue.split('-');
								       this.setState({
								       	phoneCode:cnt[0],
								       	countryId:cnt[1]
								       })
							        	
							        }} mode="dialog">
							{this.state.country.length > 0 && 
							this.state.country.map((val, index) =>{
							            	return ( <Picker.Item key={index} label={val.nicename} value={val.phonecode+'-'+val.id} />)
							            }) }
							      	</Picker>
							      	<AntDesign name="down" size={24} color="#a7a7a7" style={styles.pickerIcon}  />
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
  				:
  				<></>
  				}
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