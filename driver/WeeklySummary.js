import React, {useEffect, useState} from 'react';
import {
StyleSheet,
View,
Text,
Dimensions,
Image,
TouchableOpacity,
FlatList, SafeAreaView
} from 'react-native';

import {  Provider as PaperProvider, Button, Avatar, Caption, Surface, IconButton, Colors, Divider} from 'react-native-paper';
import ViewSlider from 'react-native-view-slider'
import Modal from 'react-native-modal';
import { MaterialCommunityIcons, AntDesign, FontAwesome,Octicons } from '@expo/vector-icons';
import { Col, Row, Grid } from "react-native-easy-grid";
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {theme, DOMAIN} from './Constant';
import Spinner from 'react-native-loading-spinner-overlay';
const { width, height } = Dimensions.get('window');

class WeeklySummary extends React.Component {

    /*useEffect (()=>{        
        getTripDetails()        
    },[1])*/

    constructor(props) {
        super(props);
        this.state = {
            tripInfo:false,
            grantTotal:0,
            dateRange:'',
            spinner:true,
        }
    }
    async componentDidMount() {
        this.getTripDetails()
    }

    getTripDetails = () => {
        AsyncStorage.getItem('accesstoken').then((value) => {           
            if(value != '' && value !== null){
                //alert(value)
                fetch(DOMAIN+'api/driver/weekly-summary',{
                    method: 'GET',
                    headers : {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': 'Bearer '+value
                    }
                }).then(function (response) {
                    return response.json();
                }).then( (res)=> {
                    console.log('driver_stat',res)
                    this.setState({
                        tripInfo:res.data,
                        dateRange:res.dateRange,
                        grantTotal:res.grantAmt,
                        spinner:false,
                    },()=>{
                        //console.log('book_state',this.state.tripInfo)
                    })
                    
                    
                })
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
            <PaperProvider theme={theme}> 
                <SafeAreaView style={{ flex: 1,backgroundColor: "aliceblue"}}>                    
                    <View style={{backgroundColor:'#eee',height:120,alignItems:'center',justifyContent:'center',elevation:3}}>
                        <Text style={{fontSize:25,marginBottom:5}}>
                            ${this.state.grantTotal}
                        </Text>
                        <Text style={{fontSize:16}}>
                            {this.state.dateRange}
                        </Text>
                    </View>                    
                    <View style={{height:20}}></View>
                    <View style={{paddingLeft:10,paddingRight:10,}}>
                    {   
                        this.state.tripInfo
                        ?
                        <Grid>
                            <Row>
                                <Col size={2} style={{alignItems:'flex-start',justifyContent:'center'}}><Text>Date</Text></Col>
                                <Col size={3} style={{alignItems:'flex-end',justifyContent:'center'}}><Text>Trip Amt</Text></Col>
                                <Col size={3} style={{alignItems:'flex-end',justifyContent:'center'}}><Text>Tip</Text></Col>
                                <Col size={4} style={{alignItems:'flex-end',justifyContent:'center'}}><Text>Trips</Text></Col>
                            </Row>
                        </Grid>
                        :
                        null
                    }
                    <View style={{height:20}}></View>
                    {   
                        this.state.tripInfo
                        ?
                        <View>
                            {<FlatList
                                data={this.state.tripInfo}
                                renderItem={({item, index}) => {
                                    return (
                                        <View>
                                        <Grid style={{flexDirection:'row'}}>
                                            <Row>
                                                <Col size={2}><Text>{item.created_at}</Text></Col>
                                                <Col size={3} style={{alignItems:'flex-end',justifyContent:'center'}}><Text>${item.payment_total}</Text></Col>
                                                <Col size={3} style={{alignItems:'flex-end',justifyContent:'center'}}><Text>${item.payment_tip}</Text></Col>
                                                <Col size={4} style={{alignItems:'flex-end',justifyContent:'center'}}><Text>{item.total_trips}</Text></Col>
                                            </Row>
                                        </Grid>
                                        <View style={{paddingVertical:15}}><Divider /></View>
                                        </View>
                                    )
                                }}
                                onEndThreshold={0}
                            />} 
                        </View>
                        :
                        <View style={{alignItems:'center',justifyContent:'center'}}><Text>No records found for this week.</Text></View>
                    }
                    </View>
                </SafeAreaView>   
            </PaperProvider>    
        </>
        );
    }
}

const localStyle = StyleSheet.create({ 
    MainTablabel: {
        color: 'silver',
        fontWeight:'bold',
        textAlign: "center",
        marginBottom: 10,
        fontSize: 18,
    },
    surface: {
        paddingVertical: 8,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        marginBottom:15,
        borderRadius:3,
        marginHorizontal:10,

    }
});

export default WeeklySummary;