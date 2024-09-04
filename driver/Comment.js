import React, {useEffect, useState, useRef} from 'react';

import {  
    Provider as PaperProvider, 
    Avatar, 
    Caption, 
    Surface, 
    IconButton, 
    Colors , 
    Appbar
} from 'react-native-paper';

import {
    View, 
    ScrollView, 
    Picker, 
    Text, 
    Button, 
    StyleSheet,
    TextInput, 
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

export default class Comment extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            commentData:'',
            commentDataError:'',
        }

    }

    submit = async () =>{        
        if(this.state.commentData.trim() == '') {
            this.refs.commentMessage.showMessage({
                message: "Please enter comments!",
                type: "danger",
                color: "#ffffff", // text color
                hideOnPress:true,
                animated:true,
                duration:5000,
                icon:'danger'
            });
            return;
        }

        await AsyncStorage.getItem('accesstoken').then((value) => {

            fetch(`${DOMAIN}api/driver/driver-Comments`,{
                method: 'POST',
                headers: new Headers({
                'Authorization': 'Bearer '+value,
                'Content-Type': 'application/json',
                }),
                body:JSON.stringify({
                'commentData':this.state.commentData,
                })
            })
            .then((response) => {
                return response.json()})
            .then((result) =>{
                console.log(result);
                if(result.status  == 1){
                    this.setState({
                        commentData:'',
                    }) 
                    this.displayMessage();
                }
            });
        });
    }
   
    displayMessage = () => {
        this.refs.commentMessage.showMessage({
            message: "Your comment successfully submited!",
            type: "default",
            backgroundColor: "mediumseagreen", // background color
            color: "#ffffff", // text color
            hideOnPress:true,
            animated:true,
            duration:5000,
            icon:'success'
        });
    };

    //'First name is required'
    render() { 
        return (
            <PaperProvider theme={theme}>
                <Appbar.Header style={{backgroundColor:'#fff'}}>
                    <Appbar.BackAction onPress={() =>this.props.navigation.goBack()} />
                    <Appbar.Content title="Comment" />
                </Appbar.Header>
                <ScrollView 
                    style={{ backgroundColor: "aliceblue"}} 
                    keyboardShouldPersistTaps='handled'>
                    <View>
                        <Surface style={stylesinp.surface}>
                            <View style={{ flex: 1 }}>
                                <TextInput
                                    placeholder="Your Comment"
                                    blurOnSubmit={false}
                                    onChangeText={(value) => {this.setState({commentData:value});}}
                                    returnKeyType={"go"}
                                    style={stylesinp.textInput}
                                    multiline={true}
                                    scrollEnabled={true}
                                    numberOfLines={50}
                                    underlineColorAndroid={"transparent"}
                                    autoCapitalize={"none"}
                                    value={this.state.commentData}
                                    autoCorrect={false}
                                    textAlignVertical = "top"
                                />
                                <View style={{ padding:12}}></View>
                                <Button title="Submit"  color={'#135AA8'} onPress={()=>this.submit() } />
                            </View>
                        </Surface>
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