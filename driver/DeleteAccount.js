import React from 'react';
import { StatusBar } from 'expo-status-bar';
import {  
	Provider as PaperProvider,
	Text, 
	Button, 
	Appbar, 
	Card, 
	Title, 
	Paragraph,
	TouchableRipple,
	Divider 
} from 'react-native-paper';
import {
	View, 
	ScrollView, 
	TouchableWithoutFeedback,
	Image,
	TouchableHighlight, 
	StyleSheet, 
	TouchableOpacity, 
	Dimensions 
} from 'react-native'

import {styles, theme, DOMAIN} from './Constant';
import Spinner from 'react-native-loading-spinner-overlay';
import { AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { moderateScale } from "react-native-size-matters";
import { Col, Row, Grid } from "react-native-easy-grid";
import { LinearGradient } from 'expo-linear-gradient';
import Modal from 'react-native-modal';
import * as firebase from "firebase";
import apiKeys from './config/keys';
if (!firebase.apps.length) {
    firebase.initializeApp(apiKeys.firebaseConfig);
}

const db = firebase.firestore();

export default class DeleteAccount extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        	driverId:null,
        	spinner:false,
        	accessTokan:'',
        	deleteverify:false,
        }
    }

    async componentDidMount() {
        //console.log(this.props)
        await AsyncStorage.getItem('driverId').then((value) => {           
            if(value != '' && value !== null){
                this.setState({
                    driverId:value
                })
            }
        })

        await AsyncStorage.getItem('accesstoken').then((value) => {			
			if(value != '' && value !== null){
				this.setState({
                    accessTokan:value
                })
			}
		})

        
    }


    componentWillUnmount = () => {
        this.waitTimer !== undefined ? clearTimeout(this.waitTimer) : null;
    }

    
     deleteAccount = () => {

         fetch(DOMAIN+'api/driver/delete-account',{
            method: 'POST',
            headers : {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer '+this.state.accessTokan
            }
        }).then(function (response) {
            return response.json();
        }).then( (result)=> {
            console.log(result);
            if(result.status == 1){
                //
                this.setState({
                    deleteverify:true,
                })
                 this.waitTimer = setTimeout(()=>{
                   this.logout();
                }, 2000);
            } // end of if 
        })

    }

    async logout(){
        this.setState({
                    deleteverify:false,
                });
        await AsyncStorage.getItem('driverId').then((value) => {
                if(value != '' && value !== null){
                    db.collection("driver_locations")
                    .doc(value)
                    .delete()
                    }
                })
                await fetch(DOMAIN+'api/driver/offline',{
                    method: 'GET',
                    headers : {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': 'Bearer '+this.state.accessTokan
                    }
                }).then(function (response) {
                    return response.json();
                }).then( (result)=> {
                    AsyncStorage.setItem('isOnline', 'false');
                })
                await AsyncStorage.removeItem('accesstoken');
                await AsyncStorage.removeItem('expires_at');
                await AsyncStorage.removeItem('email');
                await AsyncStorage.removeItem('name');
                await AsyncStorage.removeItem('avatar');
                await AsyncStorage.removeItem('device_token');
                await AsyncStorage.removeItem('countrycode');
                await AsyncStorage.removeItem('phone');
                await AsyncStorage.removeItem('driverId');
                this.props.navigation.navigate('LoginOtp'); 
    }


    render() {
       
        return (
            <>
                <Spinner
                    visible={this.state.spinner}
                    color='#FFF'
                    overlayColor='rgba(0, 0, 0, 0.5)'
                />
                <Appbar.Header style={{backgroundColor:'#FFF'}}>
                    <AntDesign 
                    	name="arrowleft" 
                    	size={24} 
                    	color="black" 
                    	style={{paddingLeft:10}} 
                    	onPress={()=>this.props.navigation.goBack(null)} 
                    />
                    <Appbar.Content 
                    	title="Delete Account" 
                    	titleStyle={{textAlign:'center',alignContent:'center'}} 
                    />
                   
                </Appbar.Header>  
              
                <PaperProvider theme={theme}> 
                    <ScrollView keyboardShouldPersistTaps='handled' style={{ backgroundColor: "#FFF"}}>                     	
                    	 { /* <View style={{padding:20,alignItems:'center'}}>
                    		<Text style={{fontSize:16,paddingBottom:10}}>Front photo of vehicle</Text>
                    		
			        	</View> */ }
			        	<Divider orientation="horizontal" />

            
			        	 <>
                              
                                {/* <Row style={{height:moderateScale(40),marginHorizontal:moderateScale(10)}}>
                                    <Col size={12}>
                                        <Button mode="contained" color={'#135AA8'} onPress={() => deleteAccount()}>
                                            Request to Delete Account
                                        </Button>
                                    </Col>
                                </Row> 
                                <Col size={8} style={{alignItems:'flex-end',justifyContent:'center'}}>
                                        <Button mode="text" color={'#135AA8'} onPress={()=>this.props.navigation.goBack(null)}>
                                            Don't Delete
                                        </Button>
                                    </Col>
                                */}
                                      <View style={{flex:1}}>
                                        <Grid>
                                            <Row>
                                                <Col style={{alignItems:'center',margin:moderateScale(10)}}>
                                                   <Text style={{fontSize:20,textAlign:'center'}}>Are you sure to delete your Account?</Text>
                                                    <Text style={{alignItems:'center',fontSize:16,color:'gray',padding:15,lineHeight:25,paddingHorizontal:15}}>Once you confirm, support team will check your account details, if all is good. We will delete your account. It will take 24 to 48 hours.</Text>
                                                    <Text style={{fontSize:20,textAlign:'center'}}>It will delete your account permanently.</Text>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col>                               
                                                    <View style={{marginLeft:15,marginRight:15,marginBottom:10,marginTop:20}}>         
                                                        <TouchableHighlight             
                                                            style={styles.contentBtn} onPress={()=> this.deleteAccount()}>
                                                            <LinearGradient  
                                                                style={styles.priBtn}       
                                                                colors={['#2270b8', '#74c0ee']}
                                                                end={{ x: 1.2, y: 1 }}>          
                                                                <Text style={styles.priBtnTxt}>Request to Delete Account</Text>
                                                            </LinearGradient>
                                                        </TouchableHighlight>
                                                    </View>
                                                </Col>
                                            </Row>
                                            <Row>
                                                  <Col>                               
                                                <View style={{marginLeft:15,marginRight:15}}>         
                                                    <TouchableHighlight             
                                                        style={styles.contentBtn} onPress={()=>this.props.navigation.goBack(null)}>
                                                        <LinearGradient  
                                                            style={styles.priBtn}       
                                                            colors={['#ccc', '#ccc']}
                                                            end={{ x: 1.2, y: 1 }}>          
                                                            <Text style={[styles.priBtnTxt,{color:'#000'}]}>Don't Delete</Text>
                                                        </LinearGradient>
                                                    </TouchableHighlight>
                                                </View>
                                            </Col>
                                            </Row>
                                        </Grid>
                                    </View>
                                
                            </>
                      
                    </ScrollView>
                    <Modal 
                    isVisible={this.state.deleteverify}
                    backdropOpacity={0.5}
                    animationIn="zoomInDown"
                    animationOut="zoomOutDown"
                    animationInTiming={600}
                    animationOutTiming={400}                    
                >
                    <View style={{backgroundColor:'#FFF',height:moderateScale(220),borderRadius:moderateScale(5)}}>
                        <Row style={{height:moderateScale(50)}}>
                            <Col style={{alignItems:'center',justifyContent:'center'}}>
                                <Text style={{fontSize:moderateScale(20)}}>Confirm</Text>
                            </Col>
                        </Row>
                        <Divider orientation="vertical"  />
                            <>
                                <Row style={{height:moderateScale(100)}}>
                                    <Col style={{alignItems:'center',margin:moderateScale(10)}}>
                                       <Text style={{fontSize:20,textAlign:'center'}}>Request Send Successfully</Text>
                                    </Col>
                                </Row>
                            </>
                      
                    </View>
                </Modal>
                </PaperProvider>
                
            </>
        );
    }            

}

const pageStyles = StyleSheet.create({
	infoOuter:{
		marginBottom:20
	},
	lable:{
		fontSize:20,
		color:'#a4a4ac',
		marginBottom:5
	},
	val:{
		fontSize:20,
		color:'#000'
	}

})