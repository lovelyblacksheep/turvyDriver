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
  },
  label: {
    color: "black",
    fontSize: 12,
  },
  input: {
    fontSize: 16,
    color: "black",
  },
});


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


const API_URL = "https://www.turvy.net/payments/rider";

export default class AddCardWallet extends Component {
  state = {
    cardInfo:{}
  };

 constructor(props) {
    super(props);
    this.state = {
    	processrunning:false,
    	cardInfo:{},
    	cardnumber:'',
    	cardsinfoList:[]
    	
    }
  }
 componentDidMount(){
    	const {navigation} = this.props;
    	this.getTokenlist();
  }
  
  _onChange = (formData) => {
    console.log('formData================',formData)
    this.setState({
        cardInfo:formData ,
        cardnumber:formData.values.number, 
    },()=>{
    	console.log(this.state.cardnumber)});
}


  _onFocus = (field) => console.log("focusing", field);
  

  fetchPaymentIntentClientSecret = async (cardtokenid) => {
    
    //console.log(_data);
    const response = await fetch(`${API_URL}/create-payment-intent.php`, {
      method: "POST",      
      headers: {
        "Content-Type": "application/json",
      },
       body:JSON.stringify({
       	tokenId:cardtokenid,
       }),
    });
    
    //const { amount, email } = await response.json();
    const {id,error} = await response.json();
   // console.log(response1);
    //console.log(clientSecret);
    console.log("ERR "+error);
    if(error){
    	  
    }else{
    	const { status , error } = await this.fetchPaymentIntentComplete(id);
    }
     //console.log(status);
    //console.log("ERR "+error);

    return { status, error };
   
  };
  
   fetchPaymentIntentComplete = async (pitoken) => {
    
    //console.log(_data);
    const response = await fetch(`${API_URL}/create-payment-intent-confrim.php`, {
      method: "POST",      
      headers: {
        "Content-Type": "application/json",
      },
       body:JSON.stringify({
       	pitoken:pitoken,
       }),
    });
    
    //const { amount, email } = await response.json();
    const { charges, error } = await response.json();
    console.log(charges);
    // console.log(charges.data);
     console.log('charges=================',charges.data.[0].status);
    //console.log("ERR "+error);
    const status = charges.data.[0].status;
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
  		
	  	fetch('http://www.turvy.net/api/rider/getPaymentToken',{
				method: 'GET',
				headers: new Headers({
			     'Authorization': 'Bearer '+value, 
			     'Content-Type': 'application/json'
			   })
	 	}).then(function (response) {
	 			return response.json();
	  		}).then( (result)=> {
	  			let cardsinfoList = [];
	  			//console.log("Paymnet Token List ",result.data);
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
              			console.log("CARD STATE 1",debug(this.state.cardsinfoList));
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
    })
    .then((json) =>{ 
      	console.log("CArd token===========",debug(json));
		
      	if(json.id){
				//alert(accesstoken);
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
					}) 
				   })
		      .then((response) =>{
		      		console.log(response);
		      		return response.json();
		      } )
		      .then((json) =>{ 
		      	console.log("Add CArd token ",json);
		      	this.setState({
					    	processrunning:false
					    });
		      	if(json.status == 1){
		      		this.props.navigation.navigate('AddPayment');
		      	}else{
		      	  this.refs.fmLocalIntstance.showMessage({
			           message: 'Card already exist',
			           type: "danger",
			           style:{
			           		margin:20,
			           		borderRadius:10,
			           		alignItems:'center',
			           		justifyContent:'center'
			           },
			        	 });
						 //this.props.navigation.navigate('AddPayment');
		      	}
		      	
		     	 }
		      )
		      .catch((error) =>{
		      	console.error(error);
		       });
       
      		//alert("token"+json.id);																								
      		//const { status, error } = this.fetchPaymentIntentClientSecret(json.id);
      		
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
        			<Appbar.Content title="Add Card" />
             </Appbar.Header>
	  		     <FlashMessage ref="fmLocalIntstance" position={{top:'70%'}}   />
	  		      
                <ScrollView keyboardShouldPersistTaps='handled'>
                <View>
                	 { Object.keys(this.state.cardsinfoList).length > 0  && this.state.cardsinfoList.map((item,index) =>{ 
			     
			     	return(
			    	<View style={{'backgroundColor':'#fff',padding:10,borderRadius:10,borderBottomWidth:1,borderBottomColor:'grey'}}>
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
									</Col>
								</Row>
								</Grid>
			    	 	</View>
			    	</View> 
			      )
			      
			      })}	
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
                        <GradientButton title='Save' />    
                    </TouchableHighlight>
                </View>
                
            </>
        );
    }
}