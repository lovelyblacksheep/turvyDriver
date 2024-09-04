import React, { useState } from 'react';
import { ActivityIndicator, View, Dimensions, Image, Text, Button } from 'react-native';
import { WebView } from 'react-native-webview';
//import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
const {width,height} = Dimensions.get('screen');
  
export default class PaypalPayment extends React.Component {
    //const route = useRoute();  
    constructor(props) {
	    super(props); 
	    this.state = {
	    	promoCode:'',
	    	checked:'',      
			isLoading:false,
			promocodeList:{},
			selectedPromo:{},
			bookingresponse:{},
			selectedvehicle:{},
			origin:{},
         destination:{},
         latitudecur:-33.8688,
        	longitudecur:151.2195,
         latitudedest:'',
        	longitudedest:'',
			selectedvehiclefare:0,
			selectedprcperunit:0,
         selectedminprc:0,
         waypointslnglat:[], 
         selectsurcharge:0,
	    };
	        this.stateChng = this.stateChng.bind(this);
	  }
	 
	 componentDidMount(){
   	const {navigation} = this.props;
   	
   	//console.log(this.props.route.params.selectedvehicle);
   	if(this.props.route.params.selectedvehicle){
      	this.setState({ 
             selectedvehicle:this.props.route.params.selectedvehicle,
             origin:this.props.route.params.origin,
             destination:this.props.route.params.destination,
             latitudedest:this.props.route.params.latitudedest,
             longitudedest:this.props.route.params.longitudedest,
             latitudecur:this.props.route.params.latitudecur, 
             longitudecur:this.props.route.params.longitudecur,
             selectedvehiclefare:this.props.route.params.selectedvehiclefare,
             bookingresponse:this.props.route.params.bookingresponse,
             selectedprcperunit:this.props.route.params.selectedprcperunit,
             selectedminprc:this.props.route.params.selectedminprc,
             waypointslnglat:this.props.route.params.waypointslnglat,
             selectsurcharge:this.props.route.params.selectsurcharge,
        });
      }
   }
   

    //console.log('amt',route.params.amt)

   async stateChng(navState){
        const { url, title } = navState ;

        console.log('url',url)
        console.log('title',title)

        if(title == "Sucess"){
        	console.log(this.state.bookingresponse.id);
        	if(this.state.bookingresponse.id > 0){
              	
         await AsyncStorage.getItem('accesstoken').then((value) => {
			console.log(value);
			//this.props.route.params
			fetch('https://www.turvy.net/api/rider/book/payment/'+this.state.bookingresponse.id,{
     	  	method: 'POST', 
		   headers: new Headers({
		     'Authorization': 'Bearer '+value, 
		     'Content-Type': 'application/json'
		   }), 
		   body:JSON.stringify({
	 				'payment_method_id' : 1,
	 				 'type' : 'Book',
	 				 'amount':this.state.selectedvehiclefare,
	 				 'surge_charge':this.state.selectsurcharge,
	 				 'selectSurInfo':this.props.route.params.selectSurInfo,
	 			}) 
		   })
      .then((response) => response.json())
      .then((json) =>{ 
      	console.log(json);
      	this.props.navigation.replace('BookProcess',this.state);
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
    }else{
    		this.props.navigation.navigate('PaymentMethods',this.state);
    } 
              
            //after payment done 
            //from here we can update our database.
            
        }else if(title == "Cancel"){
        	   this.props.navigation.navigate('PaymentMethods',this.state);
        }  
    }
    
     Loading = () => {
  return(
    <View style={{height:height,width:width,justifyContent:'center',alignItems:'center'}}>
        <Image 
        source={require('../assets/paypal.png')}
        style={{width:250,height:100,resizeMode:'contain'}}
        />
    </View>
  )
}

  	render(){
  			return (
      <View style={{flex: 1}}>            
        <WebView 
           startInLoadingState={true}
           onNavigationStateChange={this.stateChng}
           renderLoading={() => this.Loading}
           source={{ uri: 'https://www.turvy.net/payments/rider/paypal/index.php?amt='+this.state.selectedvehiclefare}} 
        />
      </View>
    );   
  	}
}

