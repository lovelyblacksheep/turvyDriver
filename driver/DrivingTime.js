import React from 'react';

import {  
    Provider as PaperProvider,
    Appbar,
} from 'react-native-paper';

import {
    View, 
    ScrollView,     
    Text,
    StyleSheet,
    DeviceEventEmitter
} from 'react-native';

import {styles, theme, DOMAIN} from './Constant';
import { Divider } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Entypo,MaterialCommunityIcons } from '@expo/vector-icons';
import * as Progress from 'react-native-progress';
export default class DrivingTime extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            timeData:{},
            drivingTime:0.00,
            offlineTime:0.00,
            accessTokan:'',
        }

    }

    async componentDidMount() {

        this.startDrivingTime();

        /* this.offtime = setInterval(() => {                
            this.startDrivingTime();
        }, 60000); */

        /*setInterval(() => {                
            this.setState({
                prTime: this.state.prTime-0.01,
                prTime1: this.state.prTime1+0.01,
            })  
        }, 1000); */

        DeviceEventEmitter.addListener('timer', this.clearTimer.bind(this));
    }

    componentWillUnmount = () => {
        this.clearTimer()
        //NativeEventEmitter.addListener('timer', this.clearTimer.bind(this));
    }

    clearTimer = () => {
        // Handle an undefined timer rather than null
        this.timeoutDriver !== undefined ? clearTimeout(this.timeoutDriver) : null;
    }
    
    startDrivingTime = async () => {

        await AsyncStorage.getItem('accesstoken').then((value) => {
            fetch(DOMAIN+'api/driver/driving-time',{
                method: 'GET',
                headers : {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': 'Bearer '+value
                }
            }).then(function (response) {
                return response.json();
            }).then( (res)=> {
                console.log('profile info:',res);
                this.setState({
                    timeData:res.data,
                    drivingTime:res.data.driving_per,
                    offlineTime:res.data.offline_per,
                    accessTokan:value,
                },()=>{
                    this.timeoutDriver = setTimeout(()=>{
                        this.startDrivingTime();
                    }, 60000);
                    
                })
            });
        });
    }

    startOfflineTime = async () => {
        
        fetch(`${DOMAIN}api/driver/start-offline-time`,{
            method: 'GET',
            headers : {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer '+this.state.accessTokan
            }
        }).then(function (response) {
            return response.json();
        }).then( (resp)=> {
            //console.log('offline time:',resp)
            this.setState({
                timeData:resp.data,               
                offlineTime:resp.data.offline_per,
            })
        }) 

    }

    //'First name is required'
    render() { 
        return (
            <PaperProvider theme={theme}>
                <Appbar.Header style={{backgroundColor:'#fff'}}>
                    <Appbar.BackAction onPress={() =>this.props.navigation.goBack()} />
                    <Appbar.Content title="Driving Time" />
                </Appbar.Header>
                <ScrollView>
                    <View style={styles.content}>
                        <View style={{elevation:2,borderRadius:5,marginTop:10}}>
                            <View style={{flex:1,flexDirection:'row',padding:15}}>
                                <View style={{alignItems:'center',justifyContent:'center'}}>
                                    <View style={{padding:7,borderRadius:50,backgroundColor:'#155aa8'}}>
                                    <Entypo name="back-in-time" size={20} color="white" />
                                    </View>
                                </View>
                                <View style={{width:20}}></View>
                                <View style={{flex:1}}>
                                    <Text style={localStyle.timeTxt}>{this.state.timeData.offline_time_text}</Text>
                                    <Text style={localStyle.lableTxt}>Offline time remaining</Text>
                                    <View style={{height:10}}></View>
                                    <Progress.Bar 
                                        progress={this.state.offlineTime} 
                                        width={null} 
                                        borderRadius={0}
                                        color={'#155aa8'}
                                        unfilledColor={'#ccc'}
                                        indeterminate={false}
                                        borderWidth={0}
                                        height={3}
                                        useNativeDriver={true}
                                    />
                                </View>
                            </View>                                
                            <Divider orientation="vertical" />                                
                            <View style={{flex:1,flexDirection:'row',padding:15}}>
                                <View style={{alignItems:'center',justifyContent:'center'}}>
                                    <View style={{padding:7,borderRadius:50,backgroundColor:'#155aa8'}}>
                                        <MaterialCommunityIcons name="steering" size={20} color="white" />
                                    </View>
                                </View>
                                <View style={{width:20}}></View>
                                <View style={{flex:1}}>
                                    <Text style={localStyle.timeTxt}>{this.state.timeData.driving_time_text}</Text>
                                    <Text style={localStyle.lableTxt}>Driving time available</Text>
                                    <View style={{height:10}}></View>
                                    <Progress.Bar 
                                        progress={this.state.drivingTime} 
                                        width={null} 
                                        borderRadius={0}
                                        color={'#155aa8'}
                                        unfilledColor={'#ccc'}
                                        indeterminate={false}
                                        borderWidth={0}
                                        height={3}
                                        useNativeDriver={true}
                                    />
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </PaperProvider>
        );
    }
}

const localStyle = StyleSheet.create({
    timeTxt:{
        fontSize:22
    },
    lableTxt:{
      fontSize:18,
      color:'gray'  
    }
})