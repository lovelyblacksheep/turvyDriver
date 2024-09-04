import React, {useEffect, useState} from 'react';
import {  Provider as PaperProvider, Avatar, Caption, Surface, IconButton, Colors,Appbar} from 'react-native-paper';
import {View, ScrollView, Picker, Text, Button, StyleSheet,TextInput, TouchableOpacity, Image,StatusBar} from 'react-native';
import {styles, theme, DOMAIN} from '../Riders/Constant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Col, Row, Grid } from "react-native-easy-grid";
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';


export default function RateCard() {
		const navigation = useNavigation();
const [service, setService] = useState([]);
  const [states, setStates] = useState([]);
  const [rateCard, setRareCard] = useState([]);
  const [stateId, setStateId] = useState([]);
  const [serviceId, setServiceId] = useState([]);
  
   useEffect(()=>{getMyState();
    console.log(states);
  },

    []);


const getMyState = () => {

      fetch(DOMAIN+'api/states/13',{
method: 'GET',
 }).then(function (response) {
  return response.json();
  }).then( (result)=> {
         
         {/* console.log(result); */}

  setStates(result.data);
          setRareCard({});
      });
     
    }
 

  const getService = (itemValue) => {

    setStateId(itemValue);

    if (itemValue == 2){

      fetch(DOMAIN+'api/servicetypes',{
       method: 'GET',
      }).then(function (response) {
      return response.json();
      }).then( (result)=> {
        console.log(result);
          setService(result.data);
      });


      } else {

        setRareCard({});
      }

    }




   
  const getRateCard = (itemValue) => {

      {/* get data only if state ID is 2 */}

    setServiceId(itemValue);
   
    fetch(DOMAIN+'api/farecard/2/'+itemValue,{
       method: 'GET',
      }).then(function (response) {
      return response.json();
      }).then( (result)=> {
        console.log(result);
          setRareCard(result.data);

    });
    }
 



const getRateCardDataBlock = () => {

return(
  <View>
  
<View style={{padding:10}}>
  <Grid style={{flex:1, borderWidth:1,borderColor:'#ddd' }} >  
    <Row size={100} style={{flex:1, flexDirection:'row',backgroundColor:'#CCE6F3', padding:10, }}>
      <Col size={15}>
         <Image source={require('../assets/images/pump.png')} />
        </Col>
        <Col size={80}>
         <Text style={{fontWeight:'bold'}}> Ride distance Charges:</Text>
         </Col>
    </Row>


    <Row  size={100} style={{flex:1, flexDirection:'row',backgroundColor:'#F2F2F2', padding:10}}>
      <Col size={80}>
        <Text>Base Fare </Text>
      </Col>
     
      <Col size={20}>
        <Text>$ {!!(rateCard.base_ride_distance_charge)?rateCard.base_ride_distance_charge:""} </Text>
      </Col>
    </Row>


  <Row  size={100} style={{flex:1, flexDirection:'row',backgroundColor:'#FFFFFF', padding:10}}>
    <Col size={80}>
  <Text>Per KM</Text>
    </Col>
    <Col size={20}>
  <Text>$ {!!(rateCard.price_per_unit)?rateCard.price_per_unit:""}  </Text>
    </Col>
  </Row>

  </Grid>
 
  </View>  





<View style={{padding:10}}>
  <Grid style={{flex:1, borderWidth:1,borderColor:'#ddd' }} >  
    <Row size={100} style={{flex:1, flexDirection:'row',backgroundColor:'#CCE6F3', padding:10, }}>
      <Col size={15}>
         <Image source={require('../assets/images/pump.png')} />
        </Col>
        <Col size={80}>
         <Text style={{fontWeight:'bold'}}> Waiting Time Charges:</Text>
         </Col>
    </Row>


    <Row  size={100} style={{flex:1, flexDirection:'row',backgroundColor:'#F2F2F2', padding:10}}>
      <Col size={80}>
        <Text>Free Waiting Time</Text>
      </Col>
     
      <Col size={20}>
        <Text>$ {!!(rateCard.fee_waiting_time)?rateCard.fee_waiting_time:""}</Text>
      </Col>
    </Row>


  <Row  size={100} style={{flex:1, flexDirection:'row',backgroundColor:'#FFFFFF', padding:10}}>
    <Col size={80}>
  <Text>Waiting Price Per Minute</Text>
    </Col>
    <Col size={20}>
  <Text>$ {!!(rateCard.waiting_price_per_minute)?rateCard.waiting_price_per_minute:""} </Text>
    </Col>
  </Row>

  </Grid>
 
  </View>



{!!(rateCard.baby_seat_charge) ?
<View style={{padding:10}}>
  <Grid style={{flex:1, borderWidth:1,borderColor:'#ddd' }} >  
    <Row size={100} style={{flex:1, flexDirection:'row',backgroundColor:'#CCE6F3', padding:10, }}>
      <Col size={15}>
         <Image source={require('../assets/images/pump.png')} />
        </Col>
        <Col size={80}>
         <Text style={{fontWeight:'bold'}}> GST Charges :</Text>
         </Col>
    </Row>


    <Row  size={100} style={{flex:1, flexDirection:'row',backgroundColor:'#F2F2F2', padding:10}}>
      <Col size={80}>
        <Text>Baby Seat: </Text>
      </Col>
     
      <Col size={20}>
        <Text>$ {rateCard.baby_seat_charge}% </Text>
      </Col>
    </Row>
  </Grid>
 
  </View>


: <></> }




<View style={{padding:10}}>
  <Grid style={{flex:1, borderWidth:1,borderColor:'#ddd' }} >  
    <Row size={100} style={{flex:1, flexDirection:'row',backgroundColor:'#CCE6F3', padding:10, }}>
      <Col size={15}>
         <Image source={require('../assets/images/pump.png')} />
        </Col>
        <Col size={80}>
         <Text style={{fontWeight:'bold'}}>GST Charges</Text>
         </Col>
    </Row>


    <Row  size={100} style={{flex:1, flexDirection:'row',backgroundColor:'#F2F2F2', padding:10}}>
      <Col size={80}>
        <Text>GST charge</Text>
      </Col>
     
      <Col size={20}>
        <Text>{!!(rateCard.gst_charge)?rateCard.gst_charge:""}% </Text>
      </Col>
    </Row>


  </Grid>
 
  </View>






<View style={{padding:10}}>
  <Grid style={{flex:1, borderWidth:1,borderColor:'#ddd' }} >  
    <Row size={100} style={{flex:1, flexDirection:'row',backgroundColor:'#CCE6F3', padding:10, }}>
      <Col size={15}>
         <Image source={require('../assets/images/pump.png')} />
        </Col>
        <Col size={80}>
         <Text style={{fontWeight:'bold'}}> Government charges :</Text>
         </Col>
    </Row>


    <Row  size={100} style={{flex:1, flexDirection:'row',backgroundColor:'#F2F2F2', padding:10}}>
      <Col size={80}>
        <Text>NSW CTP Charge Per KM</Text>
      </Col>
     
      <Col size={20}>
        <Text>$ {!!(rateCard.nsw_ctp_charge)?rateCard.nsw_ctp_charge:""} </Text>
      </Col>
    </Row>


  <Row  size={100} style={{flex:1, flexDirection:'row',backgroundColor:'#FFFFFF', padding:10}}>
    <Col size={80} >
  <Text>NSW Government Transport Levy Charge</Text>
    </Col>
    <Col size={20} >
  <Text>$ {!!(rateCard.nsw_gtl_charge)?rateCard.nsw_gtl_charge:""} </Text>
    </Col>
  </Row>

  </Grid>
 
  </View>



<View style={{padding:10}}>
  <Grid style={{flex:1, borderWidth:1,borderColor:'#ddd' }} >  
    <Row size={100} style={{flex:1, flexDirection:'row',backgroundColor:'#CCE6F3', padding:10, }}>
      <Col size={15}>
         <Image source={require('../assets/images/pump.png')} />
        </Col>
        <Col size={80}>
         <Text style={{fontWeight:'bold'}}>Other Charges :</Text>
         </Col>
    </Row>


    <Row  size={100} style={{flex:1, flexDirection:'row',backgroundColor:'#F2F2F2', padding:10}}>
      <Col size={80}>
        <Text>Fuel Surge Charge Per KM</Text>
      </Col>
     
      <Col size={20}>
        <Text>${!!(rateCard.fuel_surge_charge)?rateCard.fuel_surge_charge:""} </Text>
      </Col>
    </Row>


  </Grid>
 
  </View>





<View style={{padding:10}}>
  <Grid style={{flex:1, borderWidth:1,borderColor:'#ddd' }} >  
    <Row size={100} style={{flex:1, flexDirection:'row',backgroundColor:'#CCE6F3', padding:10, }}>
      <Col size={15}>
         <Image source={require('../assets/images/pump.png')} />
        </Col>
        <Col size={80}>
         <Text style={{fontWeight:'bold'}}>Booking Charges :</Text>
         </Col>
    </Row>


    <Row  size={100} style={{flex:1, flexDirection:'row',backgroundColor:'#F2F2F2', padding:10}}>
      <Col size={80}>
        <Text>Booking Charges</Text>
      </Col>
     
      <Col size={20}>
        <Text>$ {!!(rateCard.booking_charge)?rateCard.booking_charge:""} </Text>
      </Col>
    </Row>

  </Grid>
 
  </View>






<View style={{padding:10}}>
  <Grid style={{flex:1, borderWidth:1,borderColor:'#ddd' }} >  
    <Row size={100} style={{flex:1, flexDirection:'row',backgroundColor:'#CCE6F3', padding:10, }}>
      <Col size={15}>
         <Image source={require('../assets/images/pump.png')} />
        </Col>
        <Col size={80}>
         <Text style={{fontWeight:'bold'}}>Cancellation Charges :</Text>
         </Col>
    </Row>


    <Row  size={100} style={{flex:1, flexDirection:'row',backgroundColor:'#F2F2F2', padding:10}}>
      <Col size={80}>
        <Text>Cancellation Charges</Text>
      </Col>
     
      <Col size={20}>
        <Text>${!!(rateCard.cancel_charge)?rateCard.cancel_charge:""} </Text>
      </Col>
    </Row>

  </Grid>
 
  </View>






<View style={{padding:10}}>
  <Grid style={{flex:1, borderWidth:1,borderColor:'#ddd' }} >  
    <Row size={100} style={{flex:1, flexDirection:'row',backgroundColor:'#CCE6F3', padding:10, }}>
      <Col size={15}>
         <Image source={require('../assets/images/pump.png')} />
        </Col>
        <Col size={80}>
         <Text style={{fontWeight:'bold'}}>Ride Time Charges :</Text>
         </Col>
    </Row>


    <Row  size={100} style={{flex:1, flexDirection:'row',backgroundColor:'#F2F2F2', padding:10}}>
      <Col size={80}>
        <Text>Price Per Ride Minute</Text>
      </Col>
     
      <Col size={20}>
        <Text>${!!(rateCard.price_per_ride_minute)?rateCard.price_per_ride_minute:""} </Text>
      </Col>
    </Row>

  </Grid>
 
  </View>
  </View>

)




}
   
    //'First name is required'
return (<PaperProvider theme={theme}>
 <StatusBar backgroundColor="#fff" barStyle="light-content"/>
   <Appbar.Header style={{backgroundColor:'#fff'}}>
   <Appbar.BackAction onPress={() => navigation.goBack()} />
   <Appbar.Content title="Rate Card" />
  </Appbar.Header>
          <ScrollView style={{ backgroundColor: "aliceblue"}}>



<View style={stylesBg.surface} style={{flex:1, }} >

  <Grid style={{flex:1, flexDirection:'row', borderWidth:0, borderColor:'red'}}>
    <Row   style={{ padding:10}}>
   
      <Col size={100}  style={{borderWidth:2,borderColor:'#ddd', borderRadius:10, padding:3}}>    
        <Picker mode="dialog" selectedValue={stateId} onValueChange={(itemValue, itemIndex) => {getService(itemValue);}} >
          <Picker.Item label="Select State" value="" />
              {states.length > 0 && states.map((val, index) =>{
              return ( <Picker.Item key={index} label={val.fullname} value={val.id}  />)
                })}
          </Picker>
      </Col>
<Col size={5}></Col>

      <Col size={100} style={{borderWidth:2,borderColor:'#ddd', borderRadius:10, padding:3}}>
        <Picker mode="dialog" selectedValue={serviceId} onValueChange={(itemValue, itemIndex) => {getRateCard(itemValue);}} >
            { stateId == 2 ? <Picker.Item label="Select service type" value="" /> : <Picker.Item label="Default" value="" />  }
            {stateId == 2 && service.length > 0 && service.map((val, index) =>{
              return ( <Picker.Item key={index} label={val.name} value={val.id} />)
                })}


        </Picker>
      </Col>
   
    </Row>
  </Grid>



 
  { Object.keys(rateCard).length ? getRateCardDataBlock() : <></> }

</View>

    </ScrollView>
    </PaperProvider>)
}


const displayMessage = () => {

showMessage({
  message: "Your comment successfully submited!",
  type: "default",
  backgroundColor: "mediumseagreen", // background color
  color: "#ffffff", // text color
  hideOnPress:true,
  animated:true,
  duration:5000,
  icon:'success'
});






}


const stylesBg = StyleSheet.create({
  surface: {
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    margin:15,
    borderRadius:5


  },





});

