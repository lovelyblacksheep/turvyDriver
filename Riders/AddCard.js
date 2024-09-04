import React, { Component } from "react";
import { StyleSheet, View, Text, ScrollView, TouchableHighlight, Image ,ActivityIndicator,TouchableOpacity} from "react-native";
import { CreditCardInput, LiteCreditCardInput } from "react-native-credit-card-input"; // 0.4.1
import {Provider as PaperProvider, Checkbox ,Appbar} from 'react-native-paper';
import { Col, Row, Grid } from "react-native-easy-grid";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {styles, debug} from './Constant';
import GradientButton from './GradientButton';
import FlashMessage , { showMessage, hideMessage }  from "react-native-flash-message";

const s = StyleSheet.create({  
	container: {
		backgroundColor: "#fff",    
		marginTop:30, 
		paddingVertical:10   
	},
	label: {
		color: "black",
		fontSize: 12,
	},
	input: {
		fontSize: 16,
		color: "black",
	},
		radio:{  	
		paddingRight:1,  	
	},
});
const API_URL = "https://www.turvy.net/payments/rider";

const imagespayment = {
	 amex: require('../assets/icons/stp_card_amex.png'),
	 cvc: require('../assets/icons/stp_card_cvc.png'),
	 cvc_amex: require('../assets/icons/stp_card_cvc_amex.png'),
	 diners: require('../assets/icons/stp_card_diners.png'),
	 discover: require('../assets/icons/stp_card_discover.png'),
	 jcb: require('../assets/icons/stp_card_jcb.png'),
	 mastercard: require('../assets/icons/stp_card_mastercard.png'),
	 unknown: require('../assets/icons/stp_card_unknown.png'),
	 visa: require('../assets/icons/stp_card_visa.png'),
	 americanexpress: require('../assets/icons/stp_card_amex.png'),
};


export default class AddCard extends Component {
	state = {
		cardInfo:{},
		checked:'',
		checkedPay_method:'',     
		checkcard_customer:'', 
	};

 constructor(props) {
		super(props);
		this.state = {
			processrunning:false,
			cardInfo:{},
			cardnumber:'',
			cardsinfoList:[],
			saveCard:true
			
		}
	}
 componentDidMount(){
			const {navigation} = this.props;
			this.getTokenlist();
	}
	
	_onChange = (formData) => {
		console.log(formData)
		this.setState({
				cardInfo:formData ,
				cardnumber:formData.values.number, 
		},()=>{
			console.log(this.state.cardnumber)});
}


	_onFocus = (field) => console.log("focusing", field);
	

	fetchPaymentIntentClientSecret = async (customer_id,payment_method) => {
		console.log("payment METHOD",payment_method);
		//console.log(_data);
		const response = await fetch(`${API_URL}/create-payment-intent.php`, {
			method: "POST",      
			headers: {
				"Content-Type": "application/json",
			},
			 body:JSON.stringify({
			 	customer_id:customer_id,
			 	amount:this.props.route.params.selectedvehiclefare,
			 }),
		});
		
		//const { amount, email } = await response.json();
		const {id,error} = await response.json();
		console.log("id PAYMENT INTENT",id);
		console.log("ERR "+error);
		if(error){
			this.refs.fmLocalIntstance.showMessage({
	           message: error,
	           type: "danger",
	           style:{
	           		margin:20,
	           		borderRadius:10,
	           		alignItems:'center',
	           		justifyContent:'center'
	           },
	           duration:5000,
        	 });
      		this.setState({
		    	processrunning:false,
		    });
			return;
		}else{
			const { status , error } = await this.fetchPaymentIntentComplete(id,payment_method);
		}
		 console.log(status);
		console.log("ERR "+error);

		return { status, error };
	 
	};
	
	 fetchPaymentIntentComplete = async (pitoken,payment_method) => {	
		
		//console.log(_data);
		const response = await fetch(`${API_URL}/create-payment-intent-confrim.php`, {
			method: "POST",      
			headers: {
				"Content-Type": "application/json",
			},
			 body:JSON.stringify({
			 	pitoken:pitoken,
			 	payment_method:payment_method,
			 }),
		});
		
		//const { amount, email } = await response.json();
		const { charges, error } = await response.json();
		console.log("CHARGES 111 - 11",charges.data[0].status);
		 console.log("CHARGES 111",charges.data);
		//console.log(charges.data);
		 //console.log(charges.data.[0].status);
		//console.log("ERR "+error);
		let  status = '';
		if(charges && charges.data){
			status = charges.data[0].status;
		}
	    
		if(status == 'succeeded'){
				 	console.log(this.props.route.params.bookingresponse.id);
					if(this.props.route.params.bookingresponse.id > 0){
								
				 await AsyncStorage.getItem('accesstoken').then((value) => {
			console.log(value);
			//this.props.route.params
			fetch('https://www.turvy.net/api/rider/book/payment/'+this.props.route.params.bookingresponse.id,{
		 			method: 'POST', 
			 headers: new Headers({
				 'Authorization': 'Bearer '+value, 
				 'Content-Type': 'application/json'
			 }), 
			 body:JSON.stringify({
	 				'payment_method_id' : 2,
	 				 'type' : 'Book',
	 				 'amount':this.props.route.params.selectedvehiclefare,
	 				 'surge_charge':this.props.route.params.selectsurcharge,
	 				 'selectSurInfo':this.props.route.params.selectSurInfo,
	 				 'gstcalcultated':this.props.route.params.gstcalcultated,
					 'distance':this.props.route.params.distance,
	 			}) 
			 })
			.then((response) => response.json())
			.then((json) =>{ 
				console.log(json);
				//console.log("Payment successful ", paymentIntent);
					setTimeout(()=>{ 
	 		//hideMessage()
	 			if(this.props.route.params.is_schedule == 1){
		 			this.props.navigation.replace('bookingSchedule',this.props.route.params);
		 		}else{
		 			this.props.navigation.replace('BookProcess',this.props.route.params);
		 		}
	 			//this.props.navigation.replace('BookProcess',this.props.route.params);
	 		}, 2000)
				/*if(json.status == 1){
					 this.setState({                                        
					 	isLoading:false,
						vehborder:'red',
						bookingresponse:json.data
					 });
					this.props.navigation.navigate('PromoCode',this.state)
				}
				*/
		 	 }
			)
			.catch((error) => console.error(error));
			})
		 }
		 
		}else{
				//alert("No sucessed");
				this.props.navigation.replace('PaymentMethods',this.props.route.params);
		}
		//return { status, error };
	};	
	
	getTokenlist = async() =>{
		await AsyncStorage.getItem('accesstoken').then((value) => {
			//alert(value);
			fetch('https://www.turvy.net/api/rider/getPaymentToken',{
				method: 'GET',
				headers: new Headers({
					 'Authorization': 'Bearer '+value, 
					 'Content-Type': 'application/json'
				 })
	 	}).then(function (response) {
	 			return response.json();
				}).then( (result)=> {
					let cardsinfoList = [];
					console.log("Paymnet Token List==============",debug(result));
					if(result.data){
						if(Object.keys(result.data).length){
							result.data.map((item, key) => {
								
								if(item.response !== ''){
										let newarr = JSON.parse(item.response);
									//newarr['cardimage'] = 
									cardsinfoList.push(newarr);
								}
									
							});
						
							this.setState({
								cardsinfoList:cardsinfoList
							},()=>{
								console.log("CARD STATE 1",this.state.cardsinfoList);
							});
						//.push(item.coordinates);
						}
							 
					}
						//setContry(result.data);
			});
		});
		
	}
	
	 async submit (){
		//alert('here')
		let accesstoken = await AsyncStorage.getItem('accesstoken');

		if(Object.keys(this.state.cardInfo).length <= 0 ){
				this.refs.fmLocalIntstance.showMessage({
					 message: 'Please input card details',
					 type: "danger",
					 style:{
					 		margin:20,
					 		borderRadius:10,
					 		alignItems:'center',
					 		justifyContent:'center'
					 },
					 });
			return;
		}
		if(this.state.cardInfo.status.number == 'incomplete'){
			this.refs.fmLocalIntstance.showMessage({
				message: 'Card number is invalid.',
				type: "danger",
				style:{
						margin:20,
						borderRadius:10,
						alignItems:'center',
						justifyContent:'center'
				},
				});
			return;
		}
		
		if( this.state.cardInfo.status.cvc == 'incomplete' || this.state.cardInfo.status.expiry == 'incomplete' || this.state.cardInfo.status.name == 'incomplete'){
			this.refs.fmLocalIntstance.showMessage({
					 message: 'Please input card details',
					 type: "danger",
					 style:{
					 		margin:20,
					 		borderRadius:10,
					 		alignItems:'center',
					 		justifyContent:'center'
					 },
					 });
			return;
		}
		this.setState({
			processrunning:true
		});
		console.log('card Data:',this.state.cardInfo);
				fetch('https://www.turvy.net/payments/rider/create-payment-token.php',{
		 			method: 'POST', 
		 			headers: {
			"Content-Type": "application/json",
			 Accept: "application/json",
			},
			 body:JSON.stringify(
			 		this.state.cardInfo.values,
	 			) 
			 })
			.then((response) =>{
					console.log(response);
					return response.json();
			} )
			.then((json) =>{ 
				console.log("RESPONSE SERVER CARD CREATE ",json);
				if(json.id){
					//alert("token"+json.id);	
					
					//console.log("",);

					if(this.state.saveCard){
						fetch('https://www.turvy.net/api/rider/addPaytoken',{
							method: 'POST', 
							headers: {
								'Authorization': 'Bearer '+accesstoken, 
								"Content-Type": "application/json",
								Accept: "application/json",
							},
							body:JSON.stringify({
								'token' : json.id,
								'cardtoken' :json.card.id,
								'fingerprint':json.card.fingerprint,
								'brand':json.card.brand,
								'response':json,
								'payment_method':json.payment_method,
								'customer_id':json.customer_id,
							}) 
						})
						.then((response) =>{
							//console.log(response);
							return response.json();
						} )
						.then((json) =>{ 

						})
					}

					const { status, error } = this.fetchPaymentIntentClientSecret(json.customer_id,json.payment_method);
					
				}else if(json.error){
		      		this.refs.fmLocalIntstance.showMessage({
		           message: json.error,
		           type: "danger",
		           style:{
		           		margin:20,
		           		borderRadius:10,
		           		alignItems:'center',
		           		justifyContent:'center',
		           		duration:5000,
		           },
		        	 });
		      		this.setState({
				    	processrunning:false,
				    });
	    			return;
		      	}
		 	 }
			)
			.catch((error) =>{
				console.error(error);
			 });
			 
		//https://jokojo.com/turvy/rider/create-payment-token.php
	}

	render() {
		return (
			<>
				<Appbar.Header style={{backgroundColor:'#fff'}}>
					<Appbar.BackAction onPress={() => this.props.navigation.goBack()} />
					<Appbar.Content title="Card Payment" />
				</Appbar.Header>
				<FlashMessage ref="fmLocalIntstance" position={{top:'70%'}}   />
				<ScrollView keyboardShouldPersistTaps='handled'>
					<View>
					{ 
						Object.keys(this.state.cardsinfoList).length > 0 &&
						<Text style={{fontSize:20,padding:10}}>Choose Card</Text>
					}
					{ Object.keys(this.state.cardsinfoList).length > 0  && this.state.cardsinfoList.map((item,index) =>{ 
			
						return(
						<View style={{'backgroundColor':'#fff',padding:10,borderRadius:1,borderBottomWidth:1,borderBottomColor:'grey'}}>
							<TouchableOpacity onPress={() => { this.setState({checked:item.id,checkedPay_method:item.payment_method,checkcard_customer:item.customer_id}) }} >
							<View>
								<Grid>
								<Row style={{padding:6}}>
									<Col size={2}>
										<Image 
											style={{height:35,width:50,resizeMode:'contain'}}
											source={imagespayment[item.card.brand.toLowerCase()]}
										/>
													
									</Col>
									<Col size={7}>
										<Text style={{fontWeight:'bold',}}>XXXXXXXXXXXX{item.card.last4}</Text>
											<Text style={{fontWeight:'bold',}}><Text style={{fontWeight:'bold',}}>Expire: </Text>{item.card.exp_month}/{item.card.exp_year} </Text>
									</Col>
									<Col size={2} style={{alignItems:'flex-end'}}>
									{(this.state.checked === item.id)
										&&
										<Checkbox 
											style={s.radio} 
											value={item.id} 
											status={ this.state.checked === item.id ? 'checked' : 'unchecked' }
											color='#598cc3'
											uncheckedColor='#598cc3'
											onPress={() => { this.setState({checked:item.id,checkedPay_method:item.payment_method,checkcard_customer:item.customer_id	}) }}
										/>
									}
									</Col>
								</Row>
								</Grid>
							</View>
							</TouchableOpacity>
						</View> 
						)
			
					})
					}	
					{ Object.keys(this.state.cardsinfoList).length > 0 ?
					( <TouchableHighlight             
							style={[{marginTop:10,marginLeft:5,marginRight:5},styles.contentBtn]} onPress={() => { if(this.state.checked != '') { 
							this.setState({processrunning:true});
							this.fetchPaymentIntentClientSecret(this.state.checkcard_customer,this.state.checkedPay_method) } }}>
							<GradientButton title='Pay' />    
						</TouchableHighlight>)
					:
					null
					}
				
					</View>
					
					<View style={{flexDirection:'column'}}>
						<View style={s.container}>        
							<CreditCardInput                          
								requiresName
								requiresCVC
								cardScale={1.0}
								labelStyle={s.label}
								inputStyle={s.input}
								validColor={"black"}
								invalidColor={"red"}
								placeholderColor={"darkgray"}
								onFocus={this._onFocus}
								onChange={this._onChange} 
								number={this.state.cardnumber}
							/>        
						</View>  
						<View style={{flexDirection:'row',alignItems:'center'}}>
							<Checkbox 
								style={s.radio} 
								status={this.state.saveCard ? 'checked' : 'unchecked'}
								color='#598cc3'
								uncheckedColor='#598cc3'
								onPress={() => {
									this.setState({
										saveCard: !this.state.saveCard
									})
								}}
							/>
							<TouchableOpacity 
								onPress={() => {
									this.setState({
										saveCard: !this.state.saveCard
									})
								}}
							>
								<Text style={{fontSize:18}}>Save card for future</Text>
							</TouchableOpacity>
							
						</View>              
						<View style={{justifyContent:'center',alignItems:'flex-start',marginLeft:20,marginRight:20,height:100,marginTop:80}}>
								<Text>Debit card are accepted at some locations</Text>
								<Image 
								style={{height:35,width:200}}
								source={require('../assets/cards.png')}
								resizeMode="cover" />
						</View>
					</View>
					
				</ScrollView>
				<View style={{paddingBottom:20,borderRadius:40,marginLeft:25,marginRight:25}}>
					{this.state.processrunning ?
						( <ActivityIndicator size="large" color="#04b1fd" />)
						:
						(<></>)
					}
					<TouchableHighlight             
							style={styles.contentBtn} onPress={() => {this.submit(); }}>
							<GradientButton title='Pay (Credit/Debit)' />    
					</TouchableHighlight>
				</View>
			</>
		);
	}
}