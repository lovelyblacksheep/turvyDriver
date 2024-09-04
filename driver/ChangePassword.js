import React from 'react';
import {  Provider as PaperProvider,Text,Button } from 'react-native-paper';
import {View,ScrollView, TouchableHighlight} from 'react-native'
import {styles, theme, DOMAIN} from './Constant'
import { Input } from 'react-native-elements';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FlashMessage , { showMessage, hideMessage }  from "react-native-flash-message";
import { AntDesign } from '@expo/vector-icons';
export default class ChangePassword extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			accessTokan: '',
			password: '',
			confirmPassword: '',
			passwordError: '',
			ConfirmPasswordError: '',
			passMismatch: '',
			success:''
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
    }
	
	async submit(){		
		let uperror = true;
		let passError = '';
		let confirmpPssError = '';
		let passMismatch = '';

		if(this.state.password.trim() == '') {     		
    		 passError = 'The new password field is required.'
    		 uperror = false;
    	}
    	if(this.state.confirmPassword.trim() == '') { 
    		confirmpPssError = 'The confirm password field is required.';
    		uperror = false;
    	}

    	if(this.state.password.trim() != '' && this.state.confirmPassword.trim() != '' && this.state.password.trim() !== this.state.confirmPassword.trim()){
    		passMismatch = 'Your password and confirmation password do not match.';
    		uperror = false;
    	}
    	if(uperror){
			fetch(DOMAIN+'api/driver/changePassword',{
				method: 'POST',
				headers : {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
					'Authorization': 'Bearer '+this.state.accessTokan
				},
	 			body: JSON.stringify({		 				
	 				"new_password" : this.state.password,
	 				"confirm_password" : this.state.confirmPassword,
	 			})
		 	}).then(function (response) {
		 		return response.json();
		  	}).then( (result)=> {
		  		console.log(result)
		  		if(result.status === 1){
		  			this.setState({
		    			password:'',
		                confirmPassword :'',
		                success :result.message,                
		    		},()=>{
		    			showMessage({
							message: '',
							type: "success",
							renderCustomContent: ()=>{					
								return this.successMessages();
							},
						});
		    		});
		  		}
		  		if(result.status === 0){
		  			this.setState({
		    			passwordError:'',
		                ConfirmPasswordError :'',
		                passMismatch :result.message,                
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
			});
	  	}else{
	  		this.setState({
    			passwordError:passError,
                ConfirmPasswordError :confirmpPssError,
                passMismatch :passMismatch,                
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

	successMessages = () =>{
		return (
    		<View >
    			{this.state.success 
    				? 
    				(<Text style={{color:'#fff',padding:3,fontFamily: "Metropolis-Regular"}}>
    					<AntDesign name="checkcircle" size={15} color="white" /> {this.state.success}</Text>)
    				:
	    			(<></>)
      			}
      		</View>
      	)	
	}

	renderMessages = () =>{
    	return (
    		<View >
    			{this.state.passwordError 
    				? 
    				(<Text style={{color:'#fff',padding:3,fontFamily: "Metropolis-Regular"}}><AntDesign name="closecircle" size={15} color="white" /> {this.state.passwordError}</Text>)
    				:
	    			(<></>)
      			}
				{this.state.ConfirmPasswordError 
					? 
					( <Text style={{color:'#fff',padding:3,fontFamily: "Metropolis-Regular"}}><AntDesign name="closecircle" size={15} color="white" /> {this.state.ConfirmPasswordError}</Text>)
					:
					(<></>)
				}
				{this.state.passMismatch 
    				? 
    				(<Text style={{color:'#fff',padding:3,fontFamily: "Metropolis-Regular"}}><AntDesign name="closecircle" size={15} color="white" /> {this.state.passMismatch}</Text>)
    				:
	    			(<></>)
      			}				
    		</View>
    	);
    }
	
	render(){
	  	return (
	  		<PaperProvider theme={theme}>
	  			<FlashMessage position="top" style={{borderRadius:2,marginTop:-30}}  />
		        <View style={styles.content}>
				    <ScrollView 
				    	keyboardShouldPersistTaps='handled' 
				    	contentContainerStyle={styles.scrollViewStyle}
				    >
				    	
				    	<View style={{paddingTop:30}}>
				        <Input 
				        	placeholder='New Password' 
				        	inputStyle={styles.inputStyle} 
				        	inputContainerStyle={styles.inputContainerStyle} 
				        	errorStyle={styles.error} 
				        	value={this.state.password} 
				        	onChangeText={value => {				        		
				        		this.setState({
				        			password:value,
				        			PasswordError:''
				        		})
				        	}}  
				        	secureTextEntry={true}
				        />
						<Input 
							placeholder='Confirm Password' 
							inputStyle={styles.inputStyle} 
							inputContainerStyle={styles.inputContainerStyle} 
							errorStyle={styles.error} 
							value={this.state.confirmPassword} 
							onChangeText={value => {								
								this.setState({
				        			confirmPassword:value,
				        			ConfirmPasswordError:''
				        		})
							}}
							secureTextEntry={true}
						/>		
				 		<View style={{padding:5,borderRadius:40,marginLeft:10,marginRight:10}}>
	        				<TouchableHighlight             
	              				style={styles.contentBtn} onPress={()=>this.submit()}
	              			>
	              				<LinearGradient  
	                  				style={styles.priBtn}       
	                  				colors={['#2270b8', '#74c0ee']}
	                  				end={{ x: 1.2, y: 1 }}
	                  			>
	                    			<Text style={styles.priBtnTxt}>Reset Password</Text>          
	              				</LinearGradient>
	            			</TouchableHighlight>
	        			</View>
	        			</View>
				    </ScrollView>
				</View>
	  		</PaperProvider>
	  	);
	}
}