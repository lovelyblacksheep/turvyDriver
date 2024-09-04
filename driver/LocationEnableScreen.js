import { StatusBar } from 'expo-status-bar';
import React from "react";
import { StyleSheet, Text, View, Image, TouchableHighlight} from 'react-native';
import { Provider as PaperProvider,Button } from 'react-native-paper';
//import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';
import { theme, DOMAIN} from './Constant';
import { Col, Row, Grid } from "react-native-easy-grid";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const imagemarker = require('../assets/map-pin.png');

export default class LocationEnableScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            step:1,
        };
        //console.log(this.props);
    }
   
    componentDidMount() {
    	
        this.intialLoad();
 	}

    async intialLoad() {
        /* const res = await Location.hasServicesEnabledAsync();
        console.log('hasServicesEnabledAsync', res)
        if(!res){
            //alert("No location");
        } else{
            //alert("IN ELSE ");
            //this.props.navigation.replace('MapViewOffline')
        } */
        await AsyncStorage.getItem('enableLocation').then(val => {
            let value = JSON.parse(val)
            //console.log("enableLocation==========", value);
            //this.setState({selectedNavigationOption:value})
            if(value === 1){
                this.props.navigation.replace('MapViewOffline')
            }
        })
    }
 	
 	async allowAccess() {
        await Location.enableNetworkProviderAsync() .then(() => {
            //setLocationStatus('accepted');
            //alert("accepted");
            AsyncStorage.setItem('enableLocation', '1');
            this.props.navigation.replace('MapViewOffline')

        })
        .catch(() => {
            //setLocationStatus('rejected');
            //alert("rejected");
            this.denyAccess()
        });
    }

    async denyAccess() {
        await AsyncStorage.removeItem('accesstoken');
        await AsyncStorage.removeItem('expires_at');
        await AsyncStorage.removeItem('email');
        await AsyncStorage.removeItem('name');
        await AsyncStorage.removeItem('avatar');
        await AsyncStorage.removeItem('device_token');
        await AsyncStorage.removeItem('countrycode');
        await AsyncStorage.removeItem('phone');
        await AsyncStorage.removeItem('driverId');
        await AsyncStorage.removeItem('enableLocation');
        this.props.navigation.replace('LoginOtp');
    }

    render() {
        return (
            <PaperProvider theme={theme}>
                <View style={{marginTop:50}}></View>
                <View style={{flex:4,justifyContent:'center',alignContent:'center',flexDirection:'row'}}>
                    <Grid style={{justifyContent:'center',alignContent:'center',width:'100%'}}>
                    	<Row style={{height:180}} >
                        	<Col style={{ alignItems: 'center' }} >
                        	   <Image
                                    source={imagemarker}
                                    style={styles.servicebocimage}
                                 />
                        	</Col>
                    	</Row>
                    	<Row style={{height:50}}>
                        	<Col style={{ alignItems: 'center' }}>
                        		<Text style={{alignItems:'center',fontSize:30,fontWeight:'bold'}}>Enable Location</Text>
                        	</Col>
                    	</Row>
                    	<Row>
                        	<Col>
                                <Text style={{alignItems:'center',fontSize:16,color:'gray',padding:15,lineHeight:25,paddingHorizontal:15}}>Turvy Driver collects location data to enable current location for trip request and airport queue even when the app is running in background.</Text>
                                
                                <Text style={{alignItems:'center',fontSize:16,color:'gray',lineHeight:25,paddingHorizontal:15}}>Turvy Driver collects background location when using a third party map like google or waze for navigation or app in background while the trip is running, then collects background location for updating driver location on rider's map even when the app is running in background.</Text>
                        	</Col>
                        </Row>
                    </Grid>
                </View>
                <View style={{flex:1}}>
                    <Grid>
                    	<Row>
                    		<Col>                    			
                                <View style={{marginLeft:15,marginRight:15}}>         
                                    <TouchableHighlight             
                                        style={styles.contentBtn} onPress={()=> this.allowAccess()}>
                                        <LinearGradient  
                                            style={styles.priBtn}       
                                            colors={['#2270b8', '#74c0ee']}
                                            end={{ x: 1.2, y: 1 }}>          
                                            <Text style={styles.priBtnTxt}>Allow</Text>
                                        </LinearGradient>
                                    </TouchableHighlight>
                                </View>
                                
                    		</Col>
                            <Col>                    			
                                <View style={{marginLeft:15,marginRight:15}}>         
                                    <TouchableHighlight             
                                        style={styles.contentBtn} onPress={()=> this.denyAccess()}>
                                        <LinearGradient  
                                            style={styles.priBtn}       
                                            colors={['#ccc', '#ccc']}
                                            end={{ x: 1.2, y: 1 }}>          
                                            <Text style={[styles.priBtnTxt,{color:'#000'}]}>Deny</Text>
                                        </LinearGradient>
                                    </TouchableHighlight>
                                </View>
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
    },
    contentBtn:{      
      backgroundColor:"#2270b8",
      justifyContent:'center',
    alignItems:'center',
    flexDirection:'row',    
    borderRadius:50
        
  },
  priBtn:{            
      flex:1,
      padding:13,      
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
