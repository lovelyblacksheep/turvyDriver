import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, Button, Alert, TouchableOpacity } from "react-native";
import { CardField, useConfirmPayment, useStripe } from "@stripe/stripe-react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CardViewStripe from "./CardViewStripe";

/*
Dependencies
1) @stripe/stripe-react-native
*/

//ADD localhost address of your server
const API_URL = "https://jokojo.com/turvy/rider";

const StripePayment = props => {
	const navigation = useNavigation();
  const [email, setEmail] = useState();
  const [amount, setAmount] = useState();
  const [cardDetails, setCardDetails] = useState();
  const { confirmPayment, loading } = useConfirmPayment();  
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [stripError, setStripError] = useState('');
  const [stripSuccess, setStripSuccess] = useState('');

  const fetchPaymentIntentClientSecret = async () => {
    
    //console.log(_data);
    const response = await fetch(`${API_URL}/create-payment-intent.php`, {
      method: "POST",      
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    //const { amount, email } = await response.json();
    const { clientSecret, error } = await response.json();
    return { clientSecret, error };
  };

  const handlePayPress = async () => {
    //1.Gather the customer's billing information (e.g., email)
    //console.log(loading)
    if (!cardDetails?.complete) {
      setStripError("Please enter Complete card details.");
      return;
    }
    
    //2.Fetch the intent client secret from the backend
    try {

      const { clientSecret, error } = await fetchPaymentIntentClientSecret();
      //2. confirm the payment
      if (error) {
        setStripError("Unable to process payment");
      } else {
        const { paymentIntent, error } = await confirmPayment(clientSecret, {
          type: "Card"
        });
        if (error) {
          setStripError(`Payment Confirmation Error: ${error.message}`);
        } else if (paymentIntent) {
          setStripSuccess("Payment Successful");

        	console.log(props.route.params.bookingresponse.id);
        	if(props.route.params.bookingresponse.id > 0){
              	
         await AsyncStorage.getItem('accesstoken').then((value) => {
			console.log(value);
			console.log("Surcharge INFO",this.props.route.params.selectSurInfo);
			//this.props.route.params
			fetch('https://www.turvy.net/api/rider/book/payment/'+props.route.params.bookingresponse.id,{
     	  	method: 'POST', 
		   headers: new Headers({
		     'Authorization': 'Bearer '+value, 
		     'Content-Type': 'application/json'
		   }), 
		   body:JSON.stringify({
	 				'payment_method_id' : 1,
	 				 'type' : 'Book',
	 				 'amount':props.route.params.selectedvehiclefare,
	 				 'surge_charge':this.props.route.params.selectsurcharge,
					 'selectSurInfo':this.props.route.params.selectSurInfo,
	 			}) 
		   })
      .then((response) => response.json())
      .then((json) =>{ 
      	console.log(json);
      	console.log("Payment successful ", paymentIntent);
          setTimeout(()=>{ 
   		//hideMessage()
   		props.navigation.navigate('BookDetails',props.route.params);
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
    
          
          /*
          after Payment successful we can update database from here
          */
        }
      }
    } catch (e) {
      console.log(e);
    }
    //3.Confirm the payment with the card details
  };

  return (
  
    <View style={styles.container}>
      {
        stripError 
        ?
        <Text style={{color:'red'}}>{stripError}</Text> 
        :
        <></>
      }
      {
        stripSuccess 
        ?
        <Text style={{color:'green'}}>{stripSuccess}</Text> 
        :
        <></>
      }  
      <CreditCard focused={focused}
          brand={type}
          scale={cardScale}
          fontFamily={cardFontFamily}
          imageFront={cardImageFront}
          imageBack={cardImageBack}
          customIcons={cardBrandIcons}
          name={requiresName ? name : " "}
          number={number}
          expiry={expiry}
          cvc={cvc} />
      <CardField
        postalCodeEnabled={true}
        placeholder={{
          number: "4242 4242 4242 4242",
        }}
        cardStyle={styles.card}
        style={styles.cardContainer}
        onCardChange={cardDetails => {
          setCardDetails(cardDetails);
          setStripError('')
        }}
      />     
      <View style={{height:20}}></View>
      {loading
        ?
          <View style={styles.btnBox}>
              <TouchableOpacity style={styles.contentBtn}>
                <LinearGradient  
                  style={styles.priBtn}       
                  colors={['#ccc', '#ddd']}
                  end={{ x: 1.2, y: 1 }}>               
                    <Text style={styles.priBtnTxt}>processing...</Text>
                </LinearGradient>
              </TouchableOpacity>
          </View> 
          :
          <View style={styles.btnBox}>
              <TouchableOpacity style={styles.contentBtn} onPress={handlePayPress}>
                <LinearGradient  
                  style={styles.priBtn}       
                  colors={['#2270b8', '#74c0ee']}
                  end={{ x: 1.2, y: 1 }}>               
                    <Text style={styles.priBtnTxt}>Pay</Text>
                </LinearGradient>
              </TouchableOpacity>
          </View> 
         } 

    </View>
  );
};
export default StripePayment;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    margin: 20,
  },
  input: {
    backgroundColor: "#efefefef",

    borderRadius: 8,
    fontSize: 20,
    height: 50,
    padding: 10,
    marginVertical: 10,
  },
  card: {
    backgroundColor: "#efefefef",
  },
  cardContainer: {
    height: 50,
    marginVertical: 10,
  },
  btnBox:{    
    backgroundColor:'#FFF',
    
  },
  contentBtn:{    
    backgroundColor:"#FFF",
    justifyContent:'center',
    alignItems:'center',
    flexDirection:'row',
      
  },
  priBtn:{        
    flex:1,
    padding:15,   
    justifyContent:'center',
    alignItems:'center',
    borderRadius:45,    
  },
  priBtnTxt:{
    color:'#FFF',
    fontSize:16,
    textTransform: 'uppercase',
    letterSpacing: 2
  },
});