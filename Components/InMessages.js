import React from 'react';
import { StatusBar } from 'expo-status-bar';
import {  Provider as PaperProvider,Text, Appbar, Divider,TextInput,Button } from 'react-native-paper';
import {View, ScrollView,  StyleSheet, SafeAreaView, FlatList,TouchableOpacity,KeyboardAvoidingView } from 'react-native'
import {styles, theme,DOMAIN} from '../Riders/Constant'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Spinner from 'react-native-loading-spinner-overlay';
import { AntDesign, Ionicons,Entypo } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { moderateScale } from 'react-native-size-matters'
import SendMessage from './SendMessage';
//import FastImage from 'react-native-fast-image';
import Image from 'react-native-image-progress';
import * as Progress from 'react-native-progress';
import Svg ,{Path} from 'react-native-svg';
import { Col, Row, Grid } from "react-native-easy-grid";

export default class InMessages extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			accessTokan:'',			
			riderId: '',			
			spinner:false,
			notifications:{},
			page:1,
			receiver_id:'',
			receiver_name:'',
			messageText:'',
            messageError:'',
            messageSuccess:'',
		}
	}
  
	async componentDidMount() {
		//alert("IN MESSAGE");
		console.log("PARAMS IN MESSAGE ",this.props.route.params);
		await AsyncStorage.getItem('accesstoken').then((value) => {        		
            if(value != '' && value !== null){
                this.setState({
                    accessTokan:value
                },()=>{
                	//
                });  
             }
        })
        
        if(Object.keys(this.props.chatMessage.chatMessage).length <= 0){
        	await AsyncStorage.getItem('chatMessage').then((value) => {    
          //alert(value);  
	          if(value != '' && value !== null){  
	          console.log("Chat Message asyn NEw assign",value);
	             
	          this._getNotifications(this.state.page);
	       }
            
        })
        }
        
        await AsyncStorage.getItem('rider_id').then((value) => {    
          //alert(value);       
            if(value != '' && value !== null){
                this.setState({riderId:value})
            }
        })
        
	}

	_getNotifications = async (page) => {
		//alert(this.state.accessTokan);
		//alert(this.props.route.params.bookingresponse.id);
		console.log("Now send ",this.props.route.params.bookingresponse);
		console.log("Now send driver",this.props.route.params.bookingresponse);
		await fetch(DOMAIN+'api/rider/getBookingRiderMessage',{
            method: 'POST',
            headers : {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer '+this.state.accessTokan
            }, body: JSON.stringify({
			                "bookId" : this.props.route.params.bookingresponse.id,
			                
			            })
        }).then(function (response) {
            return response.json();
        }).then( (result)=> {
            console.log('inbox DTATA',result.data.messages) ;
            this.props.strAsynChatMessage(JSON.stringify(result.data.messages));           
            if(page === 1){
                this.setState({
                    notifications:result.data.messages,
                    spinner:false,
                })
            }else{
                this.setState({                
                    notifications: [...this.state.notifications, ...result.data.messages],                    
                })
            }
        })

	}
	onScrollHandler = () => {
         this.setState({            
            page: this.state.page + 1,            
         }, () => {
            this._getNotifications(this.state.page);
         });
    }
    
    _onPressclose = () => {
    	this.props.closeAddastop();

    }
    
     async _sendMessageToRider(){
        let messageText = this.state.messageText.trim();
        if(messageText == '') {
            this.setState({
                messageError:'Please type your message.'
            })
            return false;
        }
			this.props.addChatMessage(messageText);
        fetch(DOMAIN+'api/rider/sendMessageToRider',{
            method: 'POST',
            headers : {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer '+this.state.accessTokan
            },
            body: JSON.stringify({
                "messageText" : this.state.messageText,
                "receiver_id" : this.props.route.params.bookingdriver.id,
                "book_id" : this.props.route.params.bookingresponse.id,
                
            })
        }).then(function (response) {
            return response.json();
        }).then( (result)=> {
            console.log('message result',result)
            
            if(result.status === 1){
                this.setState({
                    messageSuccess:result.message,
                    messageText:''
                },()=>{
                	//alert(messageText);
                	
                	//this._getNotifications(this.state.page);
                    /*setTimeout(()=>{
                        this.setState({
                            messageModel:false
                        })
                       // this.props.handlerCallMessage();
                    }, 3000);
                    */
                })
            }else{
                this.setState({cancelError:result.message})
            }
        })
    }


	render(){		
  		return (
  			<>
  			<Spinner
	          visible={this.state.spinner}
	          color='#FFF'
	          overlayColor='rgba(0, 0, 0, 0.5)'
	        />
  			<StatusBar style="auto" />
  			<Appbar.Header style={{backgroundColor:'#FFF'}}>
	            <AntDesign 
                    	name="closecircle" 
                    	size={24} 
                    	color="black" 
                    	style={{paddingLeft:10}} 
                    	 onPress={() => this._onPressclose()}
                    />      
				<Appbar.Content title="Messages Received" titleStyle={{textAlign:'center',alignContent:'center'}} />
				<FontAwesome 
					name='search' 
					style={{color:'#fff',fontSize:25,paddingLeft:15,width:50,textAlign:'left'}} 
					color="#111" 
				/>
            </Appbar.Header>
  			<PaperProvider theme={theme}>
				<View style={{ flex: 3, flexDirection:'row',}}>
					

          			{
						Object.keys(this.props.chatMessage.chatMessage).length > 0 
          				?
          				<View style={{paddingTop:20,width:'100%',paddingLeft:10,paddingRight:10}}>
          				{<FlatList
          				
          							  inverted
                                data={[...this.props.chatMessage.chatMessage].reverse()}
                                renderItem={({item, index}) => {
                                    return (
                                        <>
                                        {item.from == 'driver' ?
                                         (<View style={{
                                                            marginTop: 10,
                                                            width:'100%',
                                                        }}>
                                                        <View style={{
                                                            backgroundColor: "#dedede",
                                                            paddingHorizontal:10,
                                                            paddingVertical:5,
                                                            borderRadius: 20,
                                                            alignSelf:'flex-start'
                                                        }}>
                                                        <Text style={{ fontSize: 16, color: "#000", }} > {item.body}</Text>
                                    
                                                        
                                                        </View>
                                                        
                                                    </View>)
                                         :
                                         (<View style={{
                                                            marginTop: 10,
                                                            width:'100%',
                                                        }}>
                                                        <View style={{
                                                            backgroundColor: "#135AA8",
                                                            paddingHorizontal:10,
                                                            paddingVertical:5,
                                                            borderRadius: 20,
                                                            alignSelf:'flex-end',
                                                            
                                                        }}>
                                                        <Text style={{ fontSize: 16, color: "#fff", }} > {item.body}</Text>
                                    
                                                        
                                                        </View>
                                                        
                                                    </View>)
                                         }
                                        </>
                                    )
                                }}
                               
                                
                            />} 
                         </View>   
          				:
          				(<></>)
          			}		
				</View>
				<View style={pageStyles.inputcontainer}>
				 <KeyboardAvoidingView 
				   style={{position: 'absolute', left: 10, right: 10, bottom: 10}}
				   behavior="position"
				 >
				  <TextInput
				  placeholder="Message"
				 
				    style={pageStyles.input}
				    right={<TextInput.Icon icon="send" onPress={() => this._sendMessageToRider()}/>}
				    onChangeText={text => this.setState({ message: text })}
				    // value={this.state.email}
				    underlineColor="transparent"
				     theme={{colors: {text: 'black', primary: 'transparent'}}}
				    underlineColorAndroid='transparent'
				     value={this.state.messageText}
                  onChangeText={value => this.setState({messageText:value},()=>{
                      if(value !== ''){
                          this.setState({
                              messageError:''
                          });
                      }
                  })}
				  />
				
                                {
                            this.state.messageError !== ''?
                            <Row style={{marginHorizontal:moderateScale(10)}}>
                                <Col style={{alignItems:'flex-start',justifyContent:'flex-start'}}>
                                    <Text style={{fontSize:moderateScale(14),color:'red'}}>{this.state.messageError}</Text>
                                </Col>
                            </Row>
                            :
                            null
                        }
                        {
                            this.state.messageSuccess !== ''?
                            <Row style={{marginHorizontal:moderateScale(10)}}>
                                <Col style={{alignItems:'flex-start',justifyContent:'flex-start'}}>
                                    <Text style={{fontSize:moderateScale(14),color:'green'}}>{this.state.messageSuccess}</Text>
                                </Col>
                            </Row>
                            :
                            null
                        }
				 </KeyboardAvoidingView>
				</View>
				
			</PaperProvider>
				
  			</>
  		);
	}
}

const pageStyles = StyleSheet.create({
	tripTab:{		
		flexDirection:'row'
	},
	tripTabChild:{
		flex:1,		
		justifyContent:'center'
	},
	offIcon:{
		borderWidth:1,
		borderColor:'#CCC',
		padding:5,
		borderRadius:50,
		backgroundColor:'#FFF',
		color:'#FFF',
		elevation: 8,
		width:62,
        height:62,
        alignSelf:'center'
	},
	offlineBtn:{      
		backgroundColor:"#ccc",
		justifyContent:'center',
		alignItems:'center',
		flexDirection:'row',    
		borderRadius:50,
	},
	promoBox:{
			backgroundColor:'#FFF',
			padding:10,
			borderColor:'#ddd',
			borderWidth:1,
			borderRadius:5
	},
	rightArrow: {
  position: "absolute",
  backgroundColor: "#0078fe",
  //backgroundColor:"red",
  width: 20,
  height: 25,
  bottom: 0,
  borderBottomLeftRadius: 25,
  right: -10
},

rightArrowOverlap: {
  position: "absolute",
  backgroundColor: "#eeeeee",
  //backgroundColor:"green",
  width: 20,
  height: 35,
  bottom: -6,
  borderBottomLeftRadius: 18,
  right: -20

},

/*Arrow head for recevied messages*/
leftArrow: {
    position: "absolute",
    backgroundColor: "#dedede",
    //backgroundColor:"red",
    width: 20,
    height: 25,
    bottom: 0,
    borderBottomRightRadius: 25,
    left: -10
},

leftArrowOverlap: {
    position: "absolute",
    backgroundColor: "#eeeeee",
    //backgroundColor:"green",
    width: 20,
    height: 35,
    bottom: -6,
    borderBottomRightRadius: 18,
    left: -20

},
input: {
    borderColor: "gray",
    width: "100%",
    borderWidth: 1,
    borderRadius: 50,
    padding: 0,
    height:50,
  	 borderTopLeftRadius:50,
    borderTopRightRadius:50,
  },
  inputcontainer:{
  	 padding: 20,
  	 flex:1,
  	 flexDirection:'row',

  }
})