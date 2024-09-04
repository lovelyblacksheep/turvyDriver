import React, {useEffect, useState} from 'react';
import {  Provider as PaperProvider, Button,  Appbar } from 'react-native-paper';
import {View, ScrollView, Picker, Text , StatusBar} from 'react-native'
import {styles, theme, DOMAIN} from './Constant'
import { Input } from 'react-native-elements';
import { AntDesign } from '@expo/vector-icons'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import FlashMessage , { showMessage, hideMessage }  from "react-native-flash-message";
const StatusBarheight = StatusBar.currentHeight+30;
//console.log("height"+StatusBarheight);
export default class Createaccount extends React.Component  {
	
	 constructor(props) {
    super(props);
    this.state = {
        	firstName:'',
        	lastName:'',
        	password:'',
        	confpassword:'',
        	email:'',  	
        	firstNameError:'',
        	lastNameError:'',
        	statepassword:'',
        	errorConfPassword:'',
        	errorEmail:'',
        	errorPartner:'',
        	partners:{},
        	iserror:0,
        	errorrvaild:'',
        	planner:'',
  		  };
    this.input = React.createRef();
   }

	componentDidMount(){
   	const {navigation} = this.props;
   	this.getState();
   	//this.intialLoad();
   	this.input.current.focus();
  		this.unsubscribe =  navigation.addListener("focus",() => {
  	   this.getState();
  			//this.intialLoad();
  		});		
  } // end of function
  
    
   async getState(){
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
     {this.state.statepassword ? 
    	(<Text style={{color:'#fff',padding:3,fontFamily: "Metropolis-Regular"}}><AntDesign name="closecircle" size={15} color="white" /> {this.state.statepassword}</Text>)
    	:
      (<></>)
    }	
    {this.state.errorConfPassword ? 
    	(<Text style={{color:'#fff',padding:3,fontFamily: "Metropolis-Regular"}}><AntDesign name="closecircle" size={15} color="white" /> {this.state.errorConfPassword}</Text>)
    	:
    	(<></>)
    }
    {this.state.errorEmail ? 
    	(<Text style={{color:'#fff',padding:3,fontFamily: "Metropolis-Regular"}}><AntDesign name="closecircle" size={15} color="white" /> {this.state.errorEmail}</Text>)
    	:
    	(<></>)
    }
    {this.state.errorPartner ? 
    	(<Text style={{color:'#fff',padding:3,fontFamily: "Metropolis-Regular"}}><AntDesign name="closecircle" size={15} color="white" /> {this.state.errorPartner}</Text>)
    	:
    	(<></>)
    }
    {this.state.errorrvaild ? 
    	(<Text style={{color:'#fff',padding:3,fontFamily: "Metropolis-Regular"}}><AntDesign name="closecircle" size={15} color="white" /> {this.state.errorrvaild}</Text>)
    	:
    	(<></>)
    }																																																																																								
    	</View>);
    }

    
    async submit (){
    
      let iserror = 0;      
    	if(this.state.firstName.trim() == '') { 
    	this.setState({
    		firstNameError:'Please input your first name.'
    	});
	    	iserror =1;  
    	}
    	if(this.state.lastName.trim() == '') { 
    		this.setState({
    		lastNameError:'Please input your last name.'
    	});
    		iserror =1;  
    	}
    	if(this.state.password.length < 8) { 
    		//setPasswordError('Password should be 8 digits.');
    	this.setState({
    		statepassword:'Password should be 8 digits.'
    	});
    	
    	iserror =1; }
    	if(this.state.password.trim() == '') { 
    	//	setPasswordError('Please input the password.')
    			this.setState({
    		    statepassword:'Please input the password.'
    	     });
    		iserror =1;  
   	}
   	
    	if(this.state.confpassword.trim() == '') { 
    		//setConfirmPasswordError('Please input the confirm password.')
    		this.setState({
    		    errorConfPassword:'Please input the confirm password.'
    	     });
    		iserror =1; 
    	 }
    	if(this.state.password.trim() != this.state.confpassword.trim()) { 
    		//setConfirmPasswordError('Password Match failed.')
    		this.setState({
    		    errorConfPassword:'Password Match failed.'
    	     });
    	     
    		iserror = 1;  }
    	if(this.state.email.trim() == '') { 
    	//setEmailErro('Please input the email.')
    		iserror =1; 
    		this.setState({
    		    errorEmail:'Please input the email.'
    	     });
    	}else{
    	  const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if(!this.state.email || reg.test(this.state.email) === false){
            this.setState({errorEmail:"Email address is Invalid"});
            //return false;
        }
    	}
   
    	if(this.state.planner == '') {
    		this.setState({
    		    errorPartner:'Please choose your partner.'
    	     }); 
    	 //setPartnerError('Please choose your partner.')
    	 iserror =1;  
    	}
    	

    	if(this.state.firstName.trim() != '' && this.state.lastName.trim() != '' &&  this.state.password.trim() != '' &&  iserror == 0){
    			const phone = await AsyncStorage.getItem('phone');
    		const countrycode = await AsyncStorage.getItem('countrycode');
    		const deviceToken = await AsyncStorage.getItem('deviceToken');
    		
    	//await AsyncStorage.getItem('accesstoken').then((value) => {
    	
    		console.log(deviceToken);
    		//console.log(countrycode);
    		//console.log(value);
    	fetch('https://www.turvy.net/api/rider/register',{
     	  	method: 'POST', 
		   headers: new Headers({
		     'Content-Type': 'application/json',
		   }), 
		   body:JSON.stringify({
	 				'device_token' :deviceToken,
	 				 'device_type' : 'A',
	 				 'partner_id':this.state.planner,
	 				 'password':this.state.password,
	 				 'email':this.state.email,
	 				 'phone':"+"+countrycode+phone,
	 				 'last_name':this.state.firstName,
	 				 'first_name':this.state.lastName,
	 			}) 
		   })
      .then((response) => response.json())
      .then((json) =>{ 
      	console.log("CREATE ACCOUNT RESPONSE ",json);
      	if(json.status == 1){
      		
      		fetch(DOMAIN+'api/rider/login',{
				method: 'POST',
				headers : {
					'Content-Type': 'application/json',
					'Accept': 'application/json'
				},
	 			body: JSON.stringify({
	 				"phone" : '+'+countrycode+''+phone,
	 				"password":this.state.password,
	 			})
	 		}).then(function (response) {	
	 			return response.json();
	  		}).then( (result)=> {
	  				console.log(result);
	  				//return;
	  				if(result.access_token  != ''){
	  					AsyncStorage.setItem('accesstoken', result.access_token);
	  						AsyncStorage.setItem('expires_at', result.expires_at);
	  						AsyncStorage.setItem('countrycode', countrycode);
	  						AsyncStorage.setItem('phone', phone).then(res => { 
        						this.props.navigation.navigate('Thankyou');	
   					   });
	  				}
			});

      	}else{
      			//alert("IN ERROR"+json.message);
      			this.setState({
    					iserror:0,
    					errorrvaild:json.message,
    				},()=>{
    					this.refs.fmLocalIntstancecr.showMessage({
			           message: '',
			           type: "danger",
			           renderCustomContent: ()=>{
			           	 //(errordisplay == 1)
			           	return this.renderMessages();
			           },
			        	 });
			    	});
      	}
     	 })
     	 
      
	  //	})
    		//return navigation.navigate('Signupasdriver',{"first_name" : firstName, "last_name" : lastName, "city_id" : city, "make_id" : vehicleMake, "model_id" : vehicleModel,"plate" : carNumber,"state":state});
    	}else{
    		if(iserror == 1){
    			this.setState({
    					iserror:0
    				},()=>{
    					this.refs.fmLocalIntstancecr.showMessage({
           message: '',
           type: "danger",
           renderCustomContent: ()=>{
           	 //(errordisplay == 1)
           	return this.renderMessages();
           },
        	 });
    	});
    		
		}
    	}// end of if 
    	
   // }
   }
    
    render(){ 
    return (<PaperProvider theme={theme}>
	<Appbar.Header>
      <Appbar.BackAction onPress={() => this.props.navigation.goBack()} />
      <Appbar.Content title="Create Account"  />
    </Appbar.Header>
    <FlashMessage  ref="fmLocalIntstancecr" position="top" style={{marginTop:StatusBarheight,borderRadius:2}}  />
          <ScrollView  keyboardShouldPersistTaps='handled'>
          <View style={styles.content}>
				<View style={{flexDirection:'row',}}>	
					<View style={{width:'100%'}}>
		        		<Input placeholder='First Name'
		        			  ref={this.input} 
		        			inputStyle={[styles.inputStyle,{ borderColor : this.state.firstNameError ? 'red' : '#ddd' }]} 
		        			inputContainerStyle={styles.inputContainerStyle} 
		        			value={this.firstName} 
		        			onChangeText={(value) =>{
		        				this.setState({firstName:value},()=>{
		        					if(value == ''){
		        						this.setState({
		        								firstNameError:'Please input your first name.'
		        							});
		        					}else{
		        						this.setState({
		        								firstNameError:''
		        							});
		        					}
		        				});
		        			}} />
		          </View>
					
        		</View>
        		<View style={{flexDirection:'row',}}>
        		<View style={{width:'100%'}}>
		           <Input placeholder='Last Name' 
		           	inputStyle={[styles.inputStyle,{ borderColor : this.state.lastNameError ? 'red' : '#ddd' }]} 
		           	inputContainerStyle={styles.inputContainerStyle} 
		           	value={this.lastName} 
		           	onChangeText={(value) =>{
		           		this.setState({lastName:value},()=>{
		        					if(value == ''){
		        						this.setState({
		        								lastNameError:'Please input your last name.'
		        							});
		        					}else{
		        						this.setState({
		        								lastNameError:''
		        							});
		        					}
		        				});
		           	}} />
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
		            value={this.confpassword} 
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
		       <View style={{flexDirection:'row',}}>
        		<View style={{width:'100%'}}>
		           <Input placeholder='Email Address' 
		           inputStyle={[styles.inputStyle,{ borderColor : this.state.errorEmail ? 'red' : '#ddd' }]} 
		           inputContainerStyle={styles.inputContainerStyle} 
		          
		           value={this.email} 
		           keyboardType="email-address"
		           onChangeText={(value) => {
		           	
		           	this.setState({email:value},()=>{
		        					if(value == ''){
		        						this.setState({
		        								errorEmail:'Please input the email.'
		        							});
		        					}else{
		        						this.setState({
		        								errorEmail:''
		        							});
		        					}
		        		});
		        				
		           }} />
		        </View>
		       </View>
        		<View style={[styles.pickerContainer,{borderColor : this.state.errorPartner ? 'red' : '#ddd'}]}>
		        	<Picker style={{ height: 55, width: '100%' }} mode="dialog" placeholder="Default"
		        	onValueChange={(itemValue, itemIndex) => {
		        		this.setState({planner:itemValue},()=>{
		        					if(itemValue == ''){
		        						this.setState({
		        								errorPartner:'Please choose your partner.'
		        							});
		        					}else{
		        						this.setState({
		        								errorPartner:''
		        							});
		        					}
		        		});
		        	}}
		        		
		        	selectedValue={this.state.planner}>
		        		<Picker.Item label="Select Partner" value="" />
		        		 {this.state.partners.length > 0 && this.state.partners.map((val, index) =>{
            	return ( <Picker.Item key={index} label={val.organization} value={val.id} />)
            		})}
		      	</Picker>
      		</View>
     		    </View>
        </ScrollView>
        <View style={{padding:20,alignItems:'center'}}>
        	<Button mode="contained" style={styles.btn} onPress={()=>this.submit()}>Submit</Button>
        </View>
        </PaperProvider>)
    }
    //'First name is required'
	
}