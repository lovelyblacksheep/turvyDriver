import React, {useEffect, useState} from 'react';
import { StatusBar } from 'expo-status-bar';
import {  Provider as PaperProvider, Button, Avatar, Caption, Surface, IconButton, Colors,Appbar} from 'react-native-paper';
import {View, ScrollView, Picker, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import {styles, theme, DOMAIN} from '../Riders/Constant';
import { Input } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Divider } from 'react-native-elements';
import { Col, Row, Grid } from "react-native-easy-grid";
import Spinner from 'react-native-loading-spinner-overlay';

export default function MyCompRides() {
const navigation = useNavigation();
const [trips, setMyTrips] = useState([]);
const [spinneron, setSpinneron] = useState(true);


     
useEffect(()=>{
getMyRider();

//console.log(trips);

},[]);




const getMyRider = async() => {


{/*  use this instead of get cities page https://turvy.net/api/rider/myrides/3 */}

	await AsyncStorage.getItem('accesstoken').then((value) => {
			console.log(value);

  fetch('https://turvy.net/api/rider/myrides/3',{
	headers : {
	 'Authorization': 'Bearer '+value, 
	 'Content-Type': 'application/json'
	
	},}).then(function (response) {
  return response.json();
  }).then( (result)=> {
  	console.log(result);
  setMyTrips(result.data);
  setSpinneron(false); {/* to stop the loading img */}
});
});
    }

    //'First name is required'
return (<PaperProvider theme={theme}>
           	 
              
          <ScrollView style={{ backgroundColor: "aliceblue"}}>
			<View>
			
        <Spinner
          visible={spinneron}
          color='#FFF'
          overlayColor='rgba(0, 0, 0, 0.2)'
        />
			

  

      { trips && Object.keys(trips).length > 0 && trips.map((item,index) => (

<> 
<View style={{flex: 1, paddingLeft:20, marginTop:10 }} >
      <Caption style={{fontSize:14}} > {item.booking_date} {item.booking_time}    </Caption>
      </View>

		<Surface style={stylesBg.surface}>



		<Grid style={{flex:1, flexDirection:'row'}}>
		<Col size={2}><Button icon="circle"></Button></Col>
		<Row size={12} style={{height:30}}>
		<Col size={7}  ><Text style={{ paddingTop:8}} numberOfLines={1}>{item.origin}</Text></Col>
		<Col size={3} ><Text style={{ fontSize:13, color:'grey', paddingTop:10, paddingLeft:10}}>{item.start_time}</Text></Col>
		</Row>
		</Grid>

		<Grid style={{flex:1, flexDirection:'row'}}>
		<Col size={2} ><Button icon="square" style={{color:'black'}}></Button></Col>
		<Row  size={12}>
		<Col size={7} ><Text style={{ paddingTop:8}} numberOfLines={1}>{item.destination}</Text></Col>
		<Col size={3} ><Text style={{ fontSize:13, color:'grey', paddingTop:10, paddingLeft:10}} >{item.end_time}</Text></Col>
		</Row>
</Grid>
<View style={{ padding:12}}></View>
<Divider orientation="vertical"  />
<View style={{ padding:3}}></View>
   <Grid >
    <Col style={{ width: 60, padding:5 }}>
        <Image source={require('../assets/images/user.png')} style={{alignItems:'center', width:30}}/>
    </Col>



    <Col style={{ width: 120, borderWidth:0, bordercolor:'pink' }}>
       
        <Row style={{paddingTop:5, alignContent:'center', alignItems:'center'  }}>
            <Text>{item.first_name} {item.last_name}</Text>
        </Row>

        <Row style={{ paddingTop:10 }}>
            <Image source={require('../assets/images/star.png')} style={{alignItems:'center'}}/>
            <Text> {item.rating}</Text>
        </Row>
    </Col>

     <Col style={{ paddingTop:15, textAlign:'bottom', width:60, borderWidth:0, bordercolor:'red' }}>
        <Row >
            <Text style={{ fontSize:13, color:'grey'}}>Final cost</Text>
        </Row>
        <Row >
            <Text>US${item.total}</Text>
        </Row>
    </Col>


 <Col style={{ paddingTop:15, width:65 }}>
        <Row>
            <Text style={{ fontSize:13, color:'grey'}}>Arrival Time</Text>
        </Row>
        <Row >
            <Text>{item.arrival_time}</Text>
            
        </Row>
    </Col>

</Grid>
  </Surface>

  </> 
  ))}
</View>
 
    </ScrollView>
    
    </PaperProvider>)
}



const localStyle = StyleSheet.create({
 
  MainTablabel: {
  color: 'silver',
  fontWeight:'bold',
    textAlign: "center",
    marginBottom: 10,
    fontSize: 18,
  }


});


const stylesBg = StyleSheet.create({
  surface: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    margin:15,
    borderRadius:10

  },
});