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
import { Input, Divider } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';

import FlashMessage from "react-native-flash-message";
import { showMessage, hideMessage } from "react-native-flash-message";
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons,Ionicons } from '@expo/vector-icons';

const StatusBarheight = StatusBar.currentHeight+50;

export default class CancellationRate extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            rateData:{}
        }

    }

    async componentDidMount() {

        await AsyncStorage.getItem('accesstoken').then((value) => {         
            if(value != '' && value !== null){
                fetch(DOMAIN+'api/driver/acceptance-rate',{
                    method: 'GET',
                    headers : {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': 'Bearer '+value
                    }
                }).then(function (response) {
                    return response.json();
                }).then( (result)=> {
                    //console.log('acceptance-rate',result);
                    this.setState({
                        rateData:result.data
                    })
                })
            }
        })
    }

    //'First name is required'
    render() { 
        return (
            <PaperProvider theme={theme}>
                <Appbar.Header style={{backgroundColor:'#fff'}}>
                    <Appbar.BackAction onPress={() =>this.props.navigation.goBack()} />
                    <Appbar.Content title="Cancellation rate" />
                </Appbar.Header>
                <ScrollView>
                    <View style={{backgroundColor:'#eee',height:120,alignItems:'center',justifyContent:'center'}}>
                        <Text style={{fontSize:25,marginBottom:5}}>
                            {this.state.rateData.canceledPercent}%
                        </Text>
                        <Text style={{fontSize:16}}>
                            {this.state.rateData.fromDate} - {this.state.rateData.toDate}
                        </Text>
                    </View>
                    <View style={styles.content}>
                        <View style={{alignItems:'center',flexDirection:'row',justifyContent:'center'}}>
                            <View style={{flex:2,alignItems:'flex-start'}}>
                                <Text>Trips Accepted</Text>
                            </View>
                            <View style={{flex:1,alignItems:'flex-end'}}>
                                <Text>{this.state.rateData.tripAccept}</Text>
                            </View>    
                        </View>
                    </View>
                    <Divider orientation="horizontal" />
                    <View style={styles.content}>
                        <View style={{alignItems:'center',flexDirection:'row',justifyContent:'center'}}>
                            <View style={{width:25}}>
                                <Ionicons name="ios-checkmark-sharp" size={20} color="green" />
                            </View>
                            <View style={{flex:2,alignItems:'flex-start'}}>
                                <Text>
                                    Completed Trips
                                </Text>
                            </View>
                            <View style={{flex:1,alignItems:'flex-end'}}>
                                <Text>{this.state.rateData.completedTrip}</Text>
                            </View>    
                        </View>                        
                    </View>
                    <View style={styles.content}>
                        <View style={{alignItems:'center',flexDirection:'row',justifyContent:'center'}}>
                            <View style={{width:25}}>
                                <Ionicons name="close" size={20} color="red" />
                            </View>
                            <View style={{flex:2,alignItems:'flex-start'}}>
                                <Text>
                                    Canceled Trips
                                </Text>
                            </View>
                            <View style={{flex:1,alignItems:'flex-end'}}>
                                <Text>{this.state.rateData.canceledTrip}</Text>
                            </View>    
                        </View>                        
                    </View>                    
                </ScrollView>
                
            </PaperProvider>
        );
    }
}
const localStyle = StyleSheet.create({
    promoText:{
        fontSize:16
    }
});