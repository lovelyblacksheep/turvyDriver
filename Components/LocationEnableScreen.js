import { StatusBar } from 'expo-status-bar';
import React from "react";
import { StyleSheet, Text, View ,Image,TouchableOpacity} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {  Provider as PaperProvider,Button } from 'react-native-paper';
//import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';
import { theme, DOMAIN} from '../Riders/Constant';
import { Col, Row, Grid } from "react-native-easy-grid";
const imagemarker = require('../assets/map-pin.png');
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class LocationEnableScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        	step:1,
    };
    //console.log(this.props);
   }
    componentDidMount(){
    	const {navigation} = this.props;
   	this.intialLoad();
  		this.unsubscribe =  navigation.addListener("focus",() => {
  			//this.intialLoad();
  		});			
    }
    
    async intialLoad() {
	    /* const res = await Location.hasServicesEnabledAsync();
   
       if(!res){
       	//alert("No location");
       } else{
       	//alert("IN ELSE ");
        this.props.navigation.replace('BookMain');
       } */

       await AsyncStorage.getItem('enableLocation').then(val => {
          let value = JSON.parse(val)
          //console.log("enableLocation==========", value);
          //this.setState({selectedNavigationOption:value})
          if(value === 1){
            this.props.navigation.replace('BookMain');
          }
      })
 	}
 	
 	UNSAFE_componentWillUnmount() {
      this.unsubscribe();
    
  }
 	
 	async allowAccess() {
      await Location.enableNetworkProviderAsync() .then(() => {
        //setLocationStatus('accepted');
        //alert("accepted");
        AsyncStorage.setItem('enableLocation', '1');
        this.props.navigation.replace('BookMain')
      })
      .catch(() => {
        //setLocationStatus('rejected');
        //alert("rejected");
        this.denyAccess()
      });
   }

   async denyAccess() {
    
    await AsyncStorage.removeItem('accesstoken');
    await AsyncStorage.removeItem('enableLocation');
    this.props.navigation.navigate('Login')
    }

  render() {
  	 return (
  	<PaperProvider theme={theme}>
  	  
	    <View style={{flex:3,justifyContent:'center',alignContent:'center',flexDirection:'row'}}>
	    	<Grid style={{justifyContent:'center',alignContent:'center',width:'100%'}}>
   			<Row style={{height:180}} >
   			<Col size={12} style={{ alignItems: 'center' }} >
   			<Image
			       source={imagemarker}
			        style={styles.servicebocimage}
			         />
   			</Col>
   			</Row>
   			<Row style={{height:60}}>
   			<Col style={{ alignItems: 'center', }}>
   				<Text style={{alignItems:'center',fontSize:30,fontWeight:'bold'}}>Enable Location</Text>
   			</Col>
   			</Row>
   			<Row style={{height:120,}}>
   			<Col style={{ alignItems: 'center' }}>
           <Text style={{alignItems:'center',fontSize:16,color:'gray',padding:10,lineHeight:25}}>Turvy Rider collects location data to enable current location, to search nearby Turvy drivers when the app is running on foreground.</Text>
           <Text style={{alignItems:'center',fontSize:16,color:'gray',padding:10,lineHeight:25}}>We do not collect any location data, if the app is closed or running in background.</Text>
   			</Col>
   			</Row>
   		</Grid>
	    </View>
	    <View style={{flex:1}}>
	    	<Grid>
	    		<Row>
	    			
	    			<Col size={6}  style={{marginLeft:10,marginRight:10}}>
        				<TouchableOpacity style={styles.contentBtn} onPress={()=> this.allowAccess()}>
			        	<LinearGradient  
			        		style={styles.priBtn}       
	        				colors={['#135aa8', '#46a5dd']}
	        				end={{ x: 1.2, y: 1 }}>				        
					        	<Text style={styles.priBtnTxt}>Allow</Text>
				        </LinearGradient>
			        </TouchableOpacity>    
	    			</Col>
            <Col size={6}  style={{marginLeft:10,marginRight:10}}>
        				<TouchableOpacity style={styles.contentBtn} onPress={()=> this.denyAccess()}>
			        	<LinearGradient  
			        		style={styles.priBtn}       
	        				colors={['#ccc', '#ccc']}
	        				end={{ x: 1.2, y: 1 }}>				        
					        	<Text style={[styles.priBtnTxt,{color:'#000'}]}>Deny</Text>
				        </LinearGradient>
			        </TouchableOpacity>    
	    			</Col>
	    		</Row>
	    	</Grid>
	    </View>
	    </PaperProvider>
	  );
   }
}

const styles = StyleSheet.create({
  servicebocimage: {
    justifyContent: 'center',
    alignItems: 'center',
    width:150,
    height:150
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
    	borderRadius:10,borderWidth: 1,
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
    },contentBtn:{  	
  	backgroundColor:"transparent",
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
