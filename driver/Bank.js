import React, {useEffect, useState, useRef} from 'react';

import {  
    Provider as PaperProvider, 
    Avatar, 
    Caption, 
    Surface, 
    IconButton, 
    Colors , 
    Appbar,
    TextInput,
    Button, 
} from 'react-native-paper';

import {
    View, 
    ScrollView, 
    Picker, 
    Text,
    StyleSheet,    
    TouchableOpacity, 
    Image,StatusBar
} from 'react-native';

import {styles, theme, DOMAIN} from './Constant';
import { Input } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';

import FlashMessage from "react-native-flash-message";
import { showMessage, hideMessage } from "react-native-flash-message";
import { useNavigation } from '@react-navigation/native';
import Spinner from 'react-native-loading-spinner-overlay';

const StatusBarheight = StatusBar.currentHeight+50;

export default class Bank extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            bsb_number:'',
            bank_name:'',
            bank_account_number:'',
            bank_account_title:'',
            bank_address:'',
            bank_city:'',
            bank_postal_code:'',
            dob:'',
            error_bsb_number:false,
            error_bank_name:false,
            error_bsb_number:false,
            error_bank_name:false,
            error_bank_account_number:false,
            error_bank_account_title:false,
            error_bank_address:false,
            error_bank_city:false,
            error_bank_postal_code:false,
            error_dob:false,
            spinner:true
            
        }

    }

    async componentDidMount() {

        await AsyncStorage.getItem('accesstoken').then((value) => {
            //console.log('accesstoken',value)
            fetch(DOMAIN+'api/driver/bank',{
                method: 'GET',
                headers : {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': 'Bearer '+value
                }
            }).then(function (response) {
                return response.json();
            }).then( (res)=> {
                //console.log('Bank info:',res);
                this.setState({spinner:false})

                if(res.status === 1){
                    let bank = res.data;
                    this.setState({
                        bsb_number:bank.bsb_number,
                        bank_name:bank.bank_name,
                        bank_account_number:bank.bank_account_number,
                        bank_account_title:bank.bank_account_title,
                        bank_address:bank.bank_address,
                        bank_city:bank.bank_city,
                        bank_postal_code:bank.bank_postal_code,
                        dob:bank.dob,
                    })
                }
                
            });
        }); 
    }

    submit = async () =>{
        let flag = true;

        if(this.state.bsb_number.trim() === '') {            
            this.setState({
                error_bsb_number:true
            });
            flag = false;
        }

        
        if(this.state.bank_name.trim() === '') {            
            this.setState({
                error_bank_name:true
            });
            flag = false;
        }
        
        if(this.state.bank_account_number.trim() === '') {            
            this.setState({
                error_bank_account_number:true
            });
            flag = false;
        }
        if(this.state.bank_account_title.trim() === '') {            
            this.setState({
                error_bank_account_title:true
            });
            flag = false;
        }
        if(this.state.bank_address.trim() === '') {            
            this.setState({
                error_bank_address:true
            });
            flag = false;
        }
        if(this.state.bank_city.trim() === '') {            
            this.setState({
                error_bank_city:true
            });
            flag = false;
        }
        if(this.state.bank_postal_code.trim() === '') {            
            this.setState({
                error_bank_postal_code:true
            });
            flag = false;
        }
        if(this.state.dob.trim() === '') {            
            this.setState({
                error_dob:true
            });
            flag = false;
        }

        if(!flag){
            return
        }

        await AsyncStorage.getItem('accesstoken').then((value) => {
            //console.log('accesstoken',value)
            fetch(`${DOMAIN}api/driver/bank`,{
                method: 'POST',
                headers: new Headers({
                'Authorization': 'Bearer '+value,
                'Content-Type': 'application/json',
                }),
                body:JSON.stringify({
                    'bsb_number': this.state.bsb_number,
                    'bank_name': this.state.bank_name,
                    'bank_account_number': this.state.bank_account_number,
                    'bank_account_title': this.state.bank_account_title,
                    'bank_address': this.state.bank_address,
                    'bank_city': this.state.bank_city,
                    'bank_postal_code': this.state.bank_postal_code,
                    'dob': this.state.dob,
                })
            })
            .then((response) => {
                return response.json()})
            .then((result) =>{
                console.log('bank details:',result);
                if(result.status  == 1){                    
                    this.displayMessage();
                }
            })
            .catch((e)=>{
                console.log('error',e)
            });
        });
    }
   
    displayMessage = () => {
        this.refs.commentMessage.showMessage({
            message: "Store your bank details into our system.",
            type: "default",
            backgroundColor: "mediumseagreen", // background color
            color: "#ffffff", // text color
            hideOnPress:true,
            animated:true,
            duration:2000,
            icon:'success'
        });
    };

    //'First name is required'
    render() { 
        return (
            <PaperProvider theme={theme}>
                <Spinner
                  visible={this.state.spinner}
                  color='#FFF'
                  overlayColor='rgba(0, 0, 0, 0.5)'
                />
                <Appbar.Header style={{backgroundColor:'#fff'}}>
                    <Appbar.BackAction onPress={() =>this.props.navigation.goBack()} />
                    <Appbar.Content title="Bank Details" />
                </Appbar.Header>
                <ScrollView keyboardShouldPersistTaps='handled'>
                    <View style={{ flex: 1,padding:20, marginTop:10}}>
                        <TextInput
                            label="BSB Number"
                            mode='outlined'
                            style={stylesinp.textInput}
                            value={this.state.bsb_number}
                            onChangeText={(value) => {
                                this.setState({
                                    bsb_number:value,
                                    error_bsb_number:false
                                });
                            }}
                            keyboardType="default"
                            error={this.state.error_bsb_number}
                        />
                        <TextInput
                            label="Bank Name"
                            mode='outlined'
                            style={stylesinp.textInput}
                            value={this.state.bank_name}
                            keyboardType="default"
                            onChangeText={(value) => {
                                this.setState({
                                    bank_name:value,
                                    error_bank_name:false
                                });
                            }}
                            error={this.state.error_bank_name}
                        />
                        <TextInput
                            label="Bank Account Number"
                            mode='outlined'
                            style={stylesinp.textInput}
                            value={this.state.bank_account_number}                            
                            keyboardType="default"
                            onChangeText={(value) => {
                                this.setState({
                                    bank_account_number:value,
                                    error_bank_account_number:false
                                });
                            }}
                            error={this.state.error_bank_account_number}
                        />
                        <TextInput
                            label="Account Holder Name"
                            mode='outlined'
                            style={[stylesinp.textInput,{marginBottom:0}]}
                            value={this.state.bank_account_title}                            
                            keyboardType="default"
                            onChangeText={(value) => {
                                this.setState({
                                    bank_account_title:value,
                                    error_bank_account_title:false
                                });
                            }}
                            error={this.state.error_bank_account_title}
                        />
                        <Text style={stylesinp.inpText}>Exactly as it looks on your bank statement</Text>
                        <TextInput
                            label="Address"
                            mode='outlined'
                            style={stylesinp.textInput}
                            value={this.state.bank_address}                            
                            keyboardType="default"
                            onChangeText={(value) => {
                                this.setState({
                                    bank_address:value,
                                    error_bank_address:false
                                });
                            }}
                            error={this.state.error_bank_address}
                        />
                        <TextInput
                            label="City"
                            mode='outlined'
                            style={stylesinp.textInput}
                            value={this.state.bank_city}                            
                            keyboardType="default"
                            onChangeText={(value) => {
                                this.setState({
                                    bank_city:value,
                                    error_bank_city:false
                                });
                            }}
                            error={this.state.error_bank_city}
                        />
                        <TextInput
                            label="Post Code"
                            mode='outlined'
                            style={stylesinp.textInput}
                            value={this.state.bank_postal_code}                            
                            keyboardType="default"
                            onChangeText={(value) => {
                                this.setState({
                                    bank_postal_code:value,
                                    error_bank_postal_code:false
                                });
                            }}
                            error={this.state.error_bank_postal_code}
                        />
                        <TextInput
                            label="Date Of Birth"
                            mode='outlined'
                            style={stylesinp.textInput}
                            value={this.state.dob}                            
                            keyboardType="default"
                            onChangeText={(value) => {
                                this.setState({
                                    dob:value,
                                    error_dob:false
                                });
                            }}
                            error={this.state.error_dob}
                        />
                        <View style={{ padding:5}}></View>
                        <Button                                 
                            mode="contained" 
                            onPress={()=>this.submit() }
                            color={'#135AA8'}
                            style={{padding:5}}
                        >
                            Submit
                        </Button>
                    </View>
                </ScrollView>
                <FlashMessage 
                    position="top" 
                    ref="commentMessage"  
                    style={{marginTop:StatusBarheight,borderRadius:2}} 
                />
            </PaperProvider>
        );
    }
}
const stylesinp = StyleSheet.create({
    textInput: {        
        height: 40,
        width:'100%',
        marginBottom:20
    },	
    inpText:{
        marginBottom:20,
        fontSize:12,
        fontStyle: 'italic',
        color:'gray'
    }
});