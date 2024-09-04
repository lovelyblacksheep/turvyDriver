import React, {Component} from 'react'
import { View, StyleSheet, Text } from 'react-native'
import { moderateScale } from 'react-native-size-matters'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextInput, Button } from 'react-native-paper';
import { Col, Row, Grid } from "react-native-easy-grid";
import { DOMAIN,debug } from './Constant';
import Modal from 'react-native-modal';
export default class SendMessage extends Component{
    constructor(props){
        super(props);
        this.state = {
            messageModel:true,
            accessTokan:'',
            driverId:0,
            messageText:'',
            messageError:'',
            messageSuccess:'',
            chatMessage:this.props.reciveMessage
        }
    }

    async componentDidMount() {
        //console.log('driver_id=============', this.props)
        
        //this.riderMessages()

        await AsyncStorage.getItem('accesstoken').then((value) => {
            if(value != '' && value !== null){
                this.setState({accessTokan: value})
            }
        })

    }//end componentDidMount

    /* componentDidUpdate() {
        this.riderMessages()
    } */

    riderMessages = (reciveMessage) => {
        const {chatMessage} = this.state
        console.log('New message arrived in child!=============>',debug(chatMessage))
            /* console.log('New message length=============>',Object.keys(this.state.chatMessage).length)
            
            if(Object.keys(this.state.chatMessage).length <= 0){
                let opt = []
                opt[0] = reciveMessage
                this.setState({
                    chatMessage:opt
                },()=>{
                    console.log('New message arrived!=============>',debug(this.state.chatMessage))
                })
            }else{
                
                this.setState({
                    chatMessage:[...this.state.chatMessage, ...[reciveMessage]]
                },()=>{
                    console.log('New message arrived!=============>',debug(this.state.chatMessage))
                })
            } */
            //console.log('New message arrived!=============>',debug(remoteMessage.data))
    }

    async _sendMessageToRider(){
        let messageText = this.state.messageText.trim();
        if(messageText == '') {
            this.setState({
                messageError:'Please type your message.'
            })
            return false;
        }

        fetch(DOMAIN+'api/driver/mesaageToRider',{
            method: 'POST',
            headers : {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer '+this.state.accessTokan
            },
            body: JSON.stringify({
                "messageText" : this.state.messageText,
                "receiver_id" : this.props.receiver.rider_id,
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
                    setTimeout(()=>{
                        this.setState({
                            messageModel:false
                        })
                        let opt = {
                            title:'',
                            body:messageText,
                            showBadge:1
                        }

                        this.props.handlerCallMessage(opt);
                    }, 3000);
                })
            }else{
                this.setState({cancelError:result.message})
            }
        })
    }

    render(){
        return(
            <Modal 
                isVisible={this.state.messageModel}
                backdropOpacity={0.5}
                animationIn="zoomInDown"
                animationOut="zoomOutDown"
                animationInTiming={600}
                animationOutTiming={400}                    
            >
                <View style={tipstyles.container}>
                {
                    this.props.messageType === 'reply'
                    ?
                    <Text style={{backgroundColor:'#5ead97',color:'#FFF',paddingVertical:10,textAlign:'center',fontSize:19}}>
                    Reply to {this.props.receiver.rider_name}
                </Text>
                    :
                <Text style={{backgroundColor:'#5ead97',color:'#FFF',paddingVertical:10,textAlign:'center',fontSize:19}}>
                    Send Message to {this.props.receiver.rider_name}
                </Text>
                }
                    <View style={tipstyles.subContainer}>
                        <Row style={{height:moderateScale(180)}}>
                            <Col style={{alignItems:'flex-start',margin:moderateScale(10)}}>
                                <TextInput
                                    label="Type Message:"
                                    multiline={true}
                                    numberOfLines={10}
                                    mode='outlined'
                                    style={{width:'100%'}}
                                    value={this.state.messageText}
                                    onChangeText={value => this.setState({messageText:value},()=>{
                                        if(value !== ''){
                                            this.setState({
                                                messageError:''
                                            });
                                        }
                                    })}
                                />
                            </Col>
                        </Row>
                        <Row style={{height:moderateScale(40),marginHorizontal:moderateScale(10)}}>
                            <Col size={4}>
                                <Button mode="contained" color={'#5ead97'} labelStyle={{color:'#FFF'}} onPress={() => this._sendMessageToRider()}>
                                    {this.props.buttonText}
                                </Button>
                            </Col>
                            <Col size={8} style={{alignItems:'flex-end',justifyContent:'center'}}>
                                <Button mode="text" color={'#5ead97'} onPress = {() => this.props.handlerCallMessage()}>
                                    Cancel
                                </Button>
                            </Col>
                        </Row>
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
                    </View>
                </View>
            </Modal>
        )
    }
}

const tipstyles = StyleSheet.create({
    container:{
        position:'absolute',
        width:'100%',
        top:'5%',
        zIndex:100,
        backgroundColor:'transparent',
        backgroundColor:'#fff',
        elevation:8,
        borderRadius:5,
        overflow:'hidden'
    },
    subContainer:{
        width:'100%',
        height:'100%',
        borderRadius:moderateScale(5),
        padding:moderateScale(10),
    },
    tickBox:{
        width:moderateScale(50),
        height:moderateScale(50),
        borderRadius:moderateScale(50),
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'#5ead97'
    },
    name:{
        fontSize:moderateScale(20),
        color:'#636363'
    },
    amount: {
        color:'#5ead97',
        fontSize:moderateScale(40),
        fontWeight:'700'
    },
    text:{
        fontSize:moderateScale(20),
        color:'#5ead97',
    }
})