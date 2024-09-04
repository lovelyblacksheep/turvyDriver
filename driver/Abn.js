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

const StatusBarheight = StatusBar.currentHeight+50;

export default class Abn extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            abnData:'',
            commentDataError:'',
        }

    }

    async componentDidMount() {

        await AsyncStorage.getItem('accesstoken').then((value) => {
            fetch(DOMAIN+'api/driver/profile',{
                method: 'GET',
                headers : {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': 'Bearer '+value
                }
            }).then(function (response) {
                return response.json();
            }).then( (res)=> {
                //console.log('profile info:',res);
                this.setState({abnData:res.data.abn})
                
            });
        }); 
    }

    submit = async () =>{        
        if(this.state.abnData.trim() == '') {
            this.refs.commentMessage.showMessage({
                message: "Please enter ABN!",
                type: "danger",
                color: "#ffffff", // text color
                hideOnPress:true,
                animated:true,
                duration:2000,
                icon:'danger'
            });
            return;
        }

        await AsyncStorage.getItem('accesstoken').then((value) => {

            fetch(`${DOMAIN}api/driver/abn`,{
                method: 'POST',
                headers: new Headers({
                'Authorization': 'Bearer '+value,
                'Content-Type': 'application/json',
                }),
                body:JSON.stringify({
                'abn':this.state.abnData,
                })
            })
            .then((response) => {
                return response.json()})
            .then((result) =>{
                console.log(result);
                if(result.status  == 1){                    
                    this.displayMessage();
                }
            });
        });
    }
   
    displayMessage = () => {
        this.refs.commentMessage.showMessage({
            message: "Your ABN successfully submited!",
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
                <Appbar.Header style={{backgroundColor:'#fff'}}>
                    <Appbar.BackAction onPress={() =>this.props.navigation.goBack()} />
                    <Appbar.Content title="ABN" />
                </Appbar.Header>
                <ScrollView 
                    
                    keyboardShouldPersistTaps='handled'>
                        <View style={{ flex: 1,padding:20, marginTop:10}}>
                            <TextInput
                                label="Your ABN"
                                mode='outlined'
                                style={{width:'100%',height:45}}
                                value={this.state.abnData}
                                onChangeText={(value) => {this.setState({abnData:value});}}
                                keyboardType="visible-password"
                            />
                            <View style={{ padding:10}}></View>                            
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
        borderRadius: 5,
        borderWidth: 1,
        borderColor:'#ddd',
        fontSize: 16,
        paddingHorizontal: 20,
        marginHorizontal: 0,
        padding: 10,
        marginTop: 8,
        height: 150,
        width:250
    },
	surface: {
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        margin:15,
        borderRadius:5
    },
});