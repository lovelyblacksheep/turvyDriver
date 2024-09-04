import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, TextInput } from 'react-native';
import { StripeProvider } from '@stripe/stripe-react-native';
import StripePayment from './StripePayment';

export default class  StripScreen extends React.Component {

 constructor(props) {
	    super(props); 
	    this.state = {
	    	promoCode:'',
	    	checked:'',      
			isLoading:false,
			promocodeList:{},
			selectedPromo:{},
			bookingresponse:{},
			selectedvehiclefare:0,
	    };
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
        });
      }
   }
   
   
	  
render(){
		return (
        <>
            <StripeProvider publishableKey="pk_test_s5qgjaD4IZOC12dB98h0Hh86007pmEiXyz">
              <StripePayment route={this.props.route} {...this.props} />
            </StripeProvider>        
        </>
    );
	}	    
    
}