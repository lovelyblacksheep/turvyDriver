import { StatusBar } from 'expo-status-bar';
import debounce from 'lodash.debounce';
import React from "react";
import Qs from 'qs';
import { StyleSheet, Text, View ,Image,TouchableOpacity,FlatList,ScrollView,TouchableHighlight,Keyboard} from 'react-native';
import {  Provider as PaperProvider,Button,Appbar,TextInput } from 'react-native-paper';
//import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';
import { FontAwesome ,FontAwesome5,Octicons ,Ionicons,Entypo,MaterialCommunityIcons} from '@expo/vector-icons'; 
import { styles,theme, DOMAIN} from '../Riders/Constant';
import { Col, Row, Grid } from "react-native-easy-grid";
import BottomSheet from 'reanimated-bottom-sheet';
const imagemarker = require('../assets/map-pin.png');
const imagestopwt = require('../assets/images/stopwatch.png');
import { format } from "date-fns";

export default class bookingSchedule extends React.Component {
  constructor(props) {
    super(props);
    
	      	
	      	
	      	
	      	
    this.state = {
        	step:1,
        	 textInput:[],
         inputData:[],
         pickup:'',
         snaptoval:['45%', '30%', '0%'],
         initialSnap:2,
         currinpindex:'',
         inputext0:'',
         inputext1:'',
         latitudeDelta:0.00176,
	      longitudeDelta:0.00176,
	      latitudecur:'',
	      longitudecur:'',
	      destinationto:'',
	      destination:{},
	      stateText:'',
	      stopmain:'',
	      latitudedest:'',
	      longitudedest:'',
	      stopmainlnglat:{},
	      origin:{},
	      curlocatdesc:'',
	      destlocatdesc:'',
	      pickup:'',
	      scheduledate:''
    };
  
   }
  
  async componentDidMount(){
  const {navigation,state} = this.props;
   	console.log(this.props.route.params);
         let pickup = this.props.route.params.pickup;
         let curlocatdesc='';
          if(Object.keys(this.props.route.params.origin).length > 0){
	      	//console.log("origin from");
	       	 origin = this.props.route.params.origin;
	       	 
			}   
			
			let destination = {};
			let longitudedest = '';
			let latitudedest= '';
			let destinationto ='';
			
			if(this.props.route.params.destination){
				destination = this.props.route.params.destination;
				longitudedest = destination.longitude;
				latitudedest = destination.latitude;
				
			}  
			if(Object.keys(this.props.route.params.bookingresponse).length > 0){
				curlocatdesc=this.props.route.params.bookingresponse.origin;
				destinationto = this.props.route.params.bookingresponse.destination;
			}
			//let scheduledatefrm ='';
			
			
   		this.setState({ 
   		    state:this.props.route.params,
             pickup:pickup,
             latitudecur:origin.latitude,
	      	longitudecur:origin.longitude,
	      	latitudeDelta:0.00176,
	      	longitudeDelta:0.00176,
	      	origin:origin,
	      	destination:destination,
	      	latitudedest:latitudedest,
	      	longitudedest:longitudedest,
	      	curlocatdesc:curlocatdesc,
	      	destlocatdesc:destinationto,
	      	scheduledate:this.props.route.params.scheduledate
             
         });
   }
   
   _onPressDone =() =>{
		this.props.navigation.replace('BookMain');   
   }
     
  render() {
  	 return (
  	<PaperProvider theme={theme}>
  	  <StatusBar backgroundColor="#fff" barStyle="light-content"/>
	  	  <View style={{marginTop:70,backgroundColor:'transparent',flex:1,flexDirection:'row'}}>
  			 <Grid>
  			 <Row style={{height:60,justifyContent:'center',alignContent:'center'}}>
				<Col size={4}>
					<TouchableOpacity
				   style={stylespg.menubox}
				     onPress={() => this.props.navigation.toggleDrawer()} >
				     <Entypo name="menu" size={40} color="#135aa8" />
		  			</TouchableOpacity>
				</Col>
				<Col size={4}>
					<View style={{alignItems:'center',}}>
                    <Button color="#FFF" mode="contained" labelStyle={stylespg.yellow} style={stylespg.btnSmall}>
                    <MaterialCommunityIcons size={14} name="cards-diamond" />22</Button>
                </View>
				</Col>
				<Col size={4} style={{alignItems:'flex-end', paddingRight:15}}>
				<TouchableOpacity
				   style={stylespg.serachbox}
				     onPress={() => console.log('serach')} >
				     <Ionicons name="ios-search-sharp" size={25} color="#135aa8" style={{fontWeight:'bold'}} />
		  			</TouchableOpacity>
				</Col>
			</Row>
		</Grid>
		
		</View>
		<View style={{backgroundColor:'transparent',flex:2,padding:20}}>
			<Grid >
				<Row style={{height:50,alignItems:'center',justifyContent:'center'}}>
					<Col>
						<Text style={{color:'#04b1fd',fontSize:20,textAlign:'center'}}>{this.state.curlocatdesc} </Text>
					</Col>
				</Row>
				<Row style={{height:40,alignItems:'center',justifyContent:'center'}}>
					<Col>
						<Text style={{color:'#04b1fd',textTransform:'uppercase',fontSize:22,textAlign:'center',fontWeight:'bold'}}>To</Text>
					</Col>
				</Row>
				<Row style={{height:60,alignItems:'center',justifyContent:'center'}}>
					<Col>
						<Text style={{color:'#04b1fd',fontSize:20,textAlign:'center'}}> {this.state.destlocatdesc}</Text>
					</Col>
				</Row>
				<Row style={{height:60,alignItems:'center',justifyContent:'center'}}>
					<Col>
						<Text style={{color:'#04b1fd',fontSize:20,textAlign:'center'}}> has been schedule for {this.state.scheduledate}</Text>
					</Col>
				</Row>
				<Row style={{height:60}}>
					<Col>
						<Button  mode="contained" color={'#135AA8'} onPress={() => this._onPressDone()}>
				    Done
				 	</Button>
					</Col>
				</Row>
			</Grid>
		</View>
	    </PaperProvider>
	  );
   }
}

const stylespg = StyleSheet.create({
  servicebocimage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelstyle:{    
    fontSize:16,    
    textAlign:'left',
    marginTop:10,
    fontFamily: 'WuerthBook'
  },
  inputstyle:{
    color:'black',
    borderBottomColor:'#D9D5DC',
    borderBottomWidth:1,
    paddingBottom: 11,
    fontSize:16,
    fontFamily: 'WuerthBook'
  },
  bgImage: {
        resizeMode: "cover",
        justifyContent: "center",
        height:170,
    },
    text: {    
        color: "white",
        fontSize: 25,    
        textAlign: "center",         
    },
    overlay: {    
        justifyContent: "center",
        backgroundColor:'rgba(0,0,0,0.6)',
        height:170,
    },
    scItem:{
      borderRadius:50,
      borderWidth:1,
      marginTop:10,
      marginBottom:10,
      marginLeft:5,
      marginRight:5,
      backgroundColor:'#FFF',      
      height:35
    },
    scText:{color:'#000',fontSize:14},
    active:{      
      backgroundColor:'#7a49a5',            
    },
    actText:{color:'#FFF'},
    boxstyle:{
    	flex:1,
    	backgroundColor:'#fff',  
    	borderRadius:10,
    	borderWidth: 1,
    	borderColor: '#fff',
    	padding:10,margin:20,
    	shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
    } , circle:{
  	 alignItems:'center',justifyContent:'center',
  	 width: 10,
    height: 10,
    borderRadius: 10/2,
    backgroundColor:'#135AA8'
  },
  square:{
  	 width: 10,
    height: 10,
    backgroundColor:'#135AA8'
  },searchSection:{
  	  paddingTop:60,
	 justifyContent:'center',
	 alignContent:'center',
	 backgroundColor:'#fff', 
	 shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 3,
		},
	shadowOpacity: 0.27,
	shadowRadius: 4.65,
	elevation: 7,
	}, menubox:{
	       borderWidth:1,
	       borderColor:'rgba(0,0,0,0.2)',
			position: 'absolute',
		    width: 45,
		    height: 45,
		    top: 0,
		    left: 10,
		    zIndex: 10,
	       alignItems:'center',
	       justifyContent:'center',
	       backgroundColor:'#fff',
	       shadowColor: "#000",
			shadowOffset: {
				width: 0,
				height: 3,
			},
			shadowOpacity: 0.27,
			shadowRadius: 4.65,
			
			elevation: 6,
	     },
	serachbox:{
		   borderWidth:0,
	       borderColor:'#135aa8',
		    width: 50,
		    height: 50,
	       alignItems:'center',
	       justifyContent:'center',
	       backgroundColor:'#fff',
	       borderRadius:25,
	        shadowColor: "#000",
			shadowOffset: {
				width: 0,
				height: 3,
			},
			shadowOpacity: 0.27,
			shadowRadius: 4.65,
			elevation: 6,
	},
yellow:{color:'#fec557'},
btnSmall:{
		backgroundColor:'#3f78ba',
		borderWidth:5,
		borderColor:'#FFF',
		fontSize:50,
		shadowColor: '#000',
	}
});
