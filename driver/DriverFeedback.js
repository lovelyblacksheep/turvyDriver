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
    Image,StatusBar,
    FlatList
} from 'react-native';

import {styles, theme, DOMAIN} from './Constant';
import { Divider } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';

import FlashMessage from "react-native-flash-message";
import { showMessage, hideMessage } from "react-native-flash-message";
import { useNavigation } from '@react-navigation/native';
import { Col, Row, Grid } from "react-native-easy-grid";
import { MaterialCommunityIcons,Ionicons } from '@expo/vector-icons';
import * as Progress from 'react-native-progress';
const StatusBarheight = StatusBar.currentHeight+50;

export default class DriverFeedback extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            trips:false,
            page:1,
            ratingStat:false
        }

    }

    async componentDidMount() {
        this.fetchRecords(this.state.page)
        this.getRatingStat()
    }

    getRatingStat = async () => {
        await AsyncStorage.getItem('accesstoken').then((value) => {
            fetch(`${DOMAIN}api/driver/driver-rating-stat`,{
                method: 'GET',
                headers : {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': 'Bearer '+value
                }
            }).then(function (response) {
                return response.json();
            }).then( (res)=> {
                console.log('rating info:',res);
                this.setState({
                    ratingStat:res.data
                })
                
            });
        }); 
    }

    fetchRecords = async (page) => {
        await AsyncStorage.getItem('accesstoken').then((value) => {
            fetch(`${DOMAIN}api/driver/driver-feedback/${page}`,{
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
                if(page === 1){
                    this.setState({
                        trips:res.data,  
                    })
                }else{
                    this.setState({                
                        trips: [...this.state.trips, ...res.data]                  
                    })
                }
                
            });
        }); 
    }

    onScrollHandler = () => {
         this.setState({
            page: this.state.page + 1
         }, () => {
            this.fetchRecords(this.state.page);
         });
    }

    createTable = (rating) => {
        //console.log(this.state.riderRating)

        let children = []
        //Inner loop to create children
        for (let j = 1; j <= 5; j++) {
            if(j <= rating){
                children.push(<Ionicons name="md-star" size={16} color="#fec557" />)
            }else{
                children.push(<Ionicons name="md-star" size={16} color="#ccc" />)
            }
        }
        return children
    }
    

    //'First name is required'
    render() { 
        return (
            <PaperProvider theme={theme}>
                <Appbar.Header style={{backgroundColor:'#fff'}}>
                    <Appbar.BackAction onPress={() =>this.props.navigation.goBack()} />
                    <Appbar.Content title="Rating" />
                </Appbar.Header>
                <ScrollView style={{ backgroundColor: "aliceblue"}}>
                {
                    this.state.ratingStat
                    ?
                <View style={{backgroundColor:'#eee',height:180,alignItems:'center',justifyContent:'center',paddingTop:10,elevation:2}}>
                    <View style={{alignItems:'center',flexDirection:'row',justifyContent:'center'}}>
                        <View><Text style={{fontSize:20}}>{this.state.ratingStat.rating}</Text></View>
                        <View style={{paddingLeft:3}}>
                            <Ionicons name="ios-star" size={18} color="#4a4948" />
                        </View>
                    </View> 
                    <Grid style={{width:'90%'}}>
                        <Row style={{height:25}}>
                            <Col style={{justifyContent:'center'}} size={1}>
                                <Text>5*</Text>
                            </Col>
                            <Col style={{justifyContent:'center'}} size={8}>
                                <Progress.Bar 
                                        progress={this.state.ratingStat.perFive} 
                                        width={null} 
                                        borderRadius={15}
                                        color={'#155aa8'}
                                        unfilledColor={'#ccc'}
                                        indeterminate={false}
                                        borderWidth={0}
                                        height={10}
                                        useNativeDriver={true}
                                    />
                            </Col>
                            <Col style={{justifyContent:'center',alignItems:'flex-end'}} size={2}>
                                <Text>{this.state.ratingStat.five}</Text>
                            </Col>
                        </Row>
                        <Row style={{height:25}}>
                            <Col style={{justifyContent:'center'}} size={1}>
                                <Text>4*</Text>
                            </Col>
                            <Col style={{justifyContent:'center'}} size={8}>
                                <Progress.Bar 
                                        progress={this.state.ratingStat.perFour} 
                                        width={null} 
                                        borderRadius={15}
                                        color={'#155aa8'}
                                        unfilledColor={'#ccc'}
                                        indeterminate={false}
                                        borderWidth={0}
                                        height={10}
                                        useNativeDriver={true}
                                    />
                            </Col>
                            <Col style={{justifyContent:'center',alignItems:'flex-end'}} size={2}>
                                <Text>{this.state.ratingStat.four}</Text>
                            </Col>
                        </Row>
                        <Row style={{height:25}}>
                            <Col style={{justifyContent:'center'}} size={1}>
                                <Text>3*</Text>
                            </Col>
                            <Col style={{justifyContent:'center'}} size={8}>
                                <Progress.Bar 
                                        progress={this.state.ratingStat.perThree} 
                                        width={null} 
                                        borderRadius={15}
                                        color={'#155aa8'}
                                        unfilledColor={'#ccc'}
                                        indeterminate={false}
                                        borderWidth={0}
                                        height={10}
                                        useNativeDriver={true}
                                    />
                            </Col>
                            <Col style={{justifyContent:'center',alignItems:'flex-end'}} size={2}>
                                <Text>{this.state.ratingStat.three}</Text>
                            </Col>
                        </Row>
                        <Row style={{height:25}}>
                            <Col style={{justifyContent:'center'}} size={1}>
                                <Text>2*</Text>
                            </Col>
                            <Col style={{justifyContent:'center'}} size={8}>
                                <Progress.Bar 
                                        progress={this.state.ratingStat.perTwo} 
                                        width={null} 
                                        borderRadius={15}
                                        color={'#155aa8'}
                                        unfilledColor={'#ccc'}
                                        indeterminate={false}
                                        borderWidth={0}
                                        height={10}
                                        useNativeDriver={true}
                                    />
                            </Col>
                            <Col style={{justifyContent:'center',alignItems:'flex-end'}} size={2}>
                                <Text>{this.state.ratingStat.two}</Text>
                            </Col>
                        </Row>
                        <Row style={{height:25}}>
                            <Col style={{justifyContent:'center'}} size={1}>
                                <Text>1*</Text>
                            </Col>
                            <Col style={{justifyContent:'center'}} size={8}>
                                <Progress.Bar 
                                        progress={this.state.ratingStat.perOne} 
                                        width={null} 
                                        borderRadius={15}
                                        color={'#155aa8'}
                                        unfilledColor={'#ccc'}
                                        indeterminate={false}
                                        borderWidth={0}
                                        height={10}
                                        useNativeDriver={true}
                                    />
                            </Col>
                            <Col style={{justifyContent:'center',alignItems:'flex-end'}} size={2}>
                                <Text>{this.state.ratingStat.one}</Text>
                            </Col>
                        </Row>
                    </Grid>                    
                </View>
                :null
                }
                {
                this.state.trips
                ?
                <View style={{ backgroundColor: "aliceblue",marginBottom:80}}>                
                {<FlatList
                    data={this.state.trips}
                    renderItem={({item, index}) => {
                    return (
                    <View> 
                        <View style={{flex: 1, paddingLeft:20, marginTop:10,marginBottom:5 }} >
                            <Caption style={{fontSize:14}} >{item.rateDate}</Caption>
                        </View>
                        <View style={{alignContent:'center',flex:1,flexDirection:'row',paddingLeft:20}}>
                            <Row style={{flex:1,alignItems:'center'}}>
                                <Col style={{width:60}}>
                                    
                                    {
                                        item.avatar
                                        ?
                                        <Image 
                                            source={{uri: DOMAIN+item.avatar}} 
                                            style={{alignItems:'center', width:50,height:50,borderRadius:5}}
                                        />
                                        :     
                                        <Image 
                                            source={require('../assets/images/user.jpeg')} 
                                            style={{alignItems:'center', width:50,height:50,borderRadius:5}}
                                        />
                                    }
                                    
                                </Col>
                                <Col style={{width:110}}>
                                    <Text style={{fontWeight:'bold'}}>{item.rider_name}</Text>
                                    <Text>{item.comment}</Text>
                                    <Text>{this.createTable(item.rating)} {item.rateStar}</Text>
                                </Col>                                            
                            </Row>
                        </View>
                        <View style={{height:10}}></View>
                        <Divider orientation="horizontal" />

                    </View>                    
                    )
                    }}
                    keyExtractor={item => item.id}                    
                    onEndReached={this.onScrollHandler}
                    onEndThreshold={0}
                />
                }
                </View>
                :
                (
                    <ScrollView style={{ backgroundColor: "aliceblue"}}>
                        <View style={{flex: 1, paddingLeft:20, marginTop:10,marginBottom:5 }} >
                            <Caption style={{fontSize:14}} >No data yet to display</Caption>
                        </View>
                    </ScrollView>
                )
                }
                </ScrollView>
            </PaperProvider>
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
        padding: 8,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        marginBottom:15,
        marginHorizontal:15,
        borderRadius:5
    }
});