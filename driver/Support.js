import React, {useEffect, useState} from 'react';
import {  Provider as PaperProvider, Avatar, Caption, Surface, IconButton, Colors,Appbar} from 'react-native-paper';
import {View, ScrollView, Picker, Text, Button, StyleSheet,TextInput, TouchableOpacity, Image,StatusBar} from 'react-native';
import {styles, theme, DOMAIN} from './Constant';
import { Input } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FlashMessage from "react-native-flash-message";
import { showMessage, hideMessage } from "react-native-flash-message";
import Spinner from 'react-native-loading-spinner-overlay';

export default class Support extends React.Component {
    constructor(props) {
        super(props);
        this.state = {            
            yourName:'',
            yourEmail:'',
            yourPhone:'',
            query:'',
            spinner:false

        }

    }

    async componentDidMount(){
        await AsyncStorage.getItem('accesstoken').then((value) => {         
            if(value != '' && value !== null){
                fetch(DOMAIN+'api/driver/profile',{
                    method: 'GET',
                    headers : {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': 'Bearer '+value
                    }
                }).then(function (response) {
                    return response.json();
                }).then( (result)=> {
                    //console.log("PROFILE DETAILS",result);
                    const data = result.data                   
                    this.setState({
                        yourName:data.name,
                        yourPhone:data.mobile,
                        yourEmail:data.email
                    })
                })
            }
        })

        
    }

    submitFeedback = async() => {
        if(this.state.query == ""){
            this.refs.fmLocalIntstance.showMessage({
                message: "Please input your query!",
                type: "danger",
                color: "#ffffff", // text color
                hideOnPress:true,
                animated:true,
                duration:2000,
                icon:'danger'
            });
            return;
        }
        this.setState({
            spinner:true,
        })
        await AsyncStorage.getItem('accesstoken').then((value) => {           
            if(value != '' && value !== null){
                fetch(`${DOMAIN}api/driver/support`,{
                    method: 'POST',
                    headers: new Headers({
                        'Authorization': 'Bearer '+value,
                        'Content-Type': 'application/json',
                    }),
                    body:JSON.stringify({
                        'query':this.state.query,
                    })
                })
                .then((response) => {
                    return response.json()})
                .then((result) =>{
                    //console.log("RESPONSE ",result);
                    this.setState({
                            query:'',                            
                            spinner:false,
                        }) 
                    if(result.status  == 1){
                        
                        this.refs.fmLocalIntstance.showMessage({
                            message: "Your query successfully submited!",
                            type: "default",
                            backgroundColor: "mediumseagreen", // background color
                            color: "#ffffff", // text color
                            hideOnPress:true,
                            animated:true,
                            duration:5000,
                            icon:'success'
                        });
                    }
                });
            }
        });
    }

    render() {
        //'First name is required'
        return (
            <PaperProvider theme={theme}>                
                <Spinner
                  visible={this.state.spinner}
                  color='#FFF'
                  overlayColor='rgba(0, 0, 0, 0.5)'
                />
                <Appbar.Header style={{backgroundColor:'#fff'}}>
                    <Appbar.BackAction onPress={() => this.props.navigation.goBack()} />
                    <Appbar.Content title="Support" />
                </Appbar.Header>
                <ScrollView style={{ backgroundColor: "aliceblue"}} keyboardShouldPersistTaps='handled'>
                    <View>
                        <Surface style={stylesBg.surface}>
                            <View style={{ flex: 1, borderRadius:10 }}>
                                <View style={{ flexDirection:'row'}} >
                                    <Input 
                                        placeholder='Your Name' 
                                        value={this.state.yourName}  
                                        inputStyle={stylesinp.textBox} 
                                        inputContainerStyle={styles.inputContainerStyle}  
                                        onChangeText={value => 
                                            this.setState({yourName:value})
                                        } 
                                    />
                                </View>
                                <View>
                                    <Input 
                                        placeholder='Your Email' 
                                        value={this.state.yourEmail}  
                                        inputStyle={stylesinp.textBox} 
                                        inputContainerStyle={styles.inputContainerStyle}  
                                        onChangeText={value => 
                                            this.setState({yourEmail:value})
                                        } 
                                    />
                                </View>
                                <View>
                                    <Input 
                                        placeholder='Phone' 
                                        value={this.state.yourPhone}  
                                        inputStyle={stylesinp.textBox} 
                                        inputContainerStyle={styles.inputContainerStyle}  
                                        onChangeText={value => 
                                            this.setState({yourPhone:value})
                                        } 
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <TextInput
                                        placeholder="Your Comment"
                                        blurOnSubmit={false}
                                        returnKeyType={"go"}
                                        style={stylesinp.textInput}
                                        multiline={true}
                                        scrollEnabled={true}
                                        numberOfLines={10}
                                        underlineColorAndroid={"transparent"}
                                        autoCapitalize={"none"}
                                        autoCorrect={false}
                                        textAlignVertical = "top"
                                        onChangeText={(value) =>{ this.setState({query:value}) }}
                                        value={this.state.query}
                                    />
                                </View>
                                <View style={{ padding:10,marginTop:10}}>
                                <Button 
                                    title="Submit"  
                                    color={'#135AA8'} 
                                    onPress={()=> this.submitFeedback()}
                                />
                                </View>
                           </View>
                        </Surface>
                    </View>
                </ScrollView>
                <FlashMessage ref="fmLocalIntstance" position={{top:80}} />
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
        padding: 20,
        marginTop: 8,
        height: 150,
        width:280,
        paddingLeft:20,
        marginLeft:10,
        marginRight:10
    },
    textBox: {
        borderRadius: 5,
        borderWidth: 1,
        borderColor:'#ddd',
        fontSize: 16,
        paddingHorizontal: 20,
        marginHorizontal: 0,
        padding: 10,
        marginTop: 8,
        height: 10
    },
});
const stylesBg = StyleSheet.create({
    surface: {
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        margin:15,
        borderRadius:5
    },
});