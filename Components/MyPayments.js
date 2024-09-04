import React, {useEffect, useState} from 'react';
import {  Provider as PaperProvider, Button, Avatar, Caption, Surface, IconButton, Colors,Appbar} from 'react-native-paper';
import {View, ScrollView, Picker, Text, StyleSheet, TouchableOpacity, Image,StatusBar,ActivityIndicator,FlatList} from 'react-native';
import {styles, theme, DOMAIN} from '../Riders/Constant';
import { Input } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Divider } from 'react-native-elements';
import { Col, Row, Grid } from "react-native-easy-grid";
import Spinner from 'react-native-loading-spinner-overlay';


export default class MyPayments extends React.PureComponent {
  constructor(props) {
    super(props);
    
    this.state = {
        	step:1,
        	myPayments:'today',
        	paymentlist:{},
        	spinner:false,
        	page_no:1,
    }
  }
  
 componentDidMount(){
	const {navigation,state} = this.props;
		this.setState({
	 		spinner:true,
	 	});
	this.getMyPayments();
 }
 
  getMyPayments = async() => {

      //setMyPayments(itemValue);
	await AsyncStorage.getItem('accesstoken').then((value) => {
	  fetch('https://www.turvy.net/api/rider/mypayments/'+this.state.page_no,{
		method: 'GET',
		headers : {
			 'Authorization': 'Bearer '+value, 
			 'Content-Type': 'application/json'
			}
		  }).then(function (response) {
		  return response.json();
		  }).then( (result)=> {
		  //console.log("PAYMENT RESPONSE 1 ",result);
		
		  	if(this.state.paymentlist && this.state.paymentlist.length > 0){
			  			this.setState({
				  		paymentlist: [ ...this.state.paymentlist, ...result.data ],
				  		spinner:false,
				  	})
		  	}else{
		  	  this.setState({
		  		paymentlist: result.data,
		  		spinner:false,
			  	})
		  	}
		        //setMyPaymentsData(result.data);
		});
	});
 };
 
 handlerArr = () =>{
		//alert("Scroll end reach");
		    this.setState({
		    	pageno:this.state.pageno+1
		    },()=>{
		    	this.getMyPayments();
		    });
    }
    
    
 renderItem = (item) =>{
		console.log("ITEMS",item.item);
		return(<> 
		<View style={{flex: 1, paddingLeft:20, marginTop:10 }} >
      <Caption style={{fontSize:14}} > {item.item.booking_date} {item.item.booking_time}    </Caption>
      </View>
      <Surface style={stylesBg.surface}>
		<Grid style={{flex:1, flexDirection:'row'}}>
		<Col size={2}><Button icon="circle"></Button></Col>
		<Row size={12} style={{height:30}}>
		<Col size={7}  ><Text style={{ paddingTop:8}} numberOfLines={1}>{item.item.origin}</Text></Col>
		<Col size={3} ><Text style={{ fontSize:13, color:'grey', paddingTop:10, paddingLeft:10}}>{item.item.start_time}</Text></Col>
		</Row>
		</Grid>
		<Grid style={{flex:1, flexDirection:'row'}}>
		<Col size={2} ><Button icon="square" style={{color:'black'}}></Button></Col>
		<Row size={12}>
		<Col size={7} ><Text style={{ paddingTop:8}} numberOfLines={1}>{item.item.destination}</Text></Col>
		<Col size={3} ><Text style={{ fontSize:13, color:'grey', paddingTop:10, paddingLeft:10}} >{item.item.end_time}</Text></Col>
		</Row>
</Grid>
<View style={{ padding:12}}></View>
<Divider orientation="vertical"  />
<View style={{ padding:3}}></View>
   <Grid style={{width:'100%'}}>
   <Row size={10}>
    <Col size={4}>
        <Text >Paid By</Text>
    </Col>
    <Col size={4}>
       <Text>Paid Date</Text>
    </Col>
 	 <Col size={4}>
 	 <Text>Amount</Text>
    </Col>
    </Row>
     <Row size={10}>
    <Col size={4}>
        <Text style={{fontSize:13,fontWeight:'bold'}}>{item.item.paymethod}</Text>
    </Col>
    <Col size={4}>
       <Text style={{fontSize:13,fontWeight:'bold'}}>{item.item.paiddate}</Text>
    </Col>
 	 <Col size={4}>
 	 <Text style={{fontSize:13,fontWeight:'bold'}}>A${item.item.total}</Text>
    </Col>
    </Row>
</Grid>
  </Surface>
      </>);
	}
   
   renderFooter = () =>{
			return(
			<View><ActivityIndicator size="large" color="#04b1fd"  /></View>
			)    	
    } 
  
  	render(){
  		return(<PaperProvider theme={theme}>
			<StatusBar backgroundColor="#fff" barStyle="light-content"/>
		   <Appbar.Header style={{backgroundColor:'#fff'}}>
		   <Appbar.BackAction onPress={() => this.props.navigation.goBack()} />
		   <Appbar.Content title="My Payments" />
		  </Appbar.Header>
          <Spinner
					visible={this.state.spinner}
					color='#FFF'
					overlayColor='rgba(0, 0, 0, 0.5)'
				/>
     	{ this.state.paymentlist && Object.keys(this.state.paymentlist).length > 0 ?
        (
      <FlatList
        ref={this.onRefListView}
        data={this.state.paymentlist}
        keyboardShouldPersistTaps={true}
        renderItem={this.renderItem}
         keyExtractor={item => item.id}
		  onEndReachedThreshold={0.5}
        onEndReached={this.handlerArr}
        ListFooterComponent={this.renderFooter}
      />)
      :
      null
   }
  </PaperProvider>);
  	}
}

 
   
const localStyle = StyleSheet.create({
 
  MainTablabel: {
  color: 'silver',
  fontWeight:'bold',
    textAlign: "center",
    marginBottom: 10,
    fontSize: 18,
  },

surface: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    margin:15,
    borderRadius:10

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