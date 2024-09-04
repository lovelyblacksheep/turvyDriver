import React from 'react';
import {  Provider as PaperProvider, Button, Avatar, Caption, Surface, IconButton, Colors} from 'react-native-paper';
import {View, ScrollView, Picker, Text, StyleSheet, TouchableOpacity, Image,FlatList,SafeAreaView,ActivityIndicator} from 'react-native';
import {styles, theme, DOMAIN} from './Constant';
import { Input, Divider } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Col, Row, Grid } from "react-native-easy-grid";
import { MaterialCommunityIcons,Ionicons } from '@expo/vector-icons';
import Spinner from 'react-native-loading-spinner-overlay';

export default class MyCompletedTrip extends React.Component{    

    constructor(props) {
        super(props);
        this.state = {
            trips:{},
            accessTokan:'',
            tripTime:{
                arrivalTime:'',
                pickupTime:'',
            },
            page:1,
            spinner:false,
            loader:false,
            loadingText: 'Please be patient, We are fetching records for you',
        }
    }

    async componentDidMount() {
        //console.log('navigation',this.props)
        await AsyncStorage.getItem('accesstoken').then((value) => {  
            if(value != '' && value !== null){
                this.setState({
                    accessTokan:value
                },() => {
                    this.getMyRider(this.state.page)
                })
            }
        })
    }

    getMyRider = (page) => {
        if(page === 1){
            this.setState({                
                spinner:true,
            })
        }
        fetch(`${DOMAIN}api/driver/completed-trip/${page}`,{
            method: 'GET', 
            headers: new Headers({
                'Authorization': 'Bearer '+this.state.accessTokan, 
                'Content-Type': 'application/json'
            })
        }).then(function (response) {
            return response.json();
        }).then( (result)=> {
            //console.log('result:',result)
            //setMyTrips(result);
            if(result.status === 1){
                if(page === 1){
                    this.setState({
                        trips:result.data,
                        spinner:false,
                        loadingText:'',
                    })
                }else{
                    this.setState({                
                        trips: [...this.state.trips, ...result.data],
                        loader:false

                    })
                }
            }else{
                this.setState({
                    spinner:false,
                    loadingText: 'You have no completed trips.'
                }); 
            }

        });
    }
    onScrollHandler = () => {
         this.setState({            
            page: this.state.page + 1,
            loader:true
         }, () => {
            this.getMyRider(this.state.page);
         });
    }
    formatAMPM(date) {
        
        var t = date.split(/[- :]/);
        var d = new Date(t[0], t[1] - 1, t[2], t[3], t[4], t[5]);
        var actiondate = new Date(d);
        var hours = actiondate.getHours();
        var minutes = actiondate.getMinutes();
        var ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        var time = hours + ':' + minutes + ' ' + ampm;
        return time;
    }   
    render(){
    //'First name is required'
        const { navigationProp } = this.props;
        //console.log('navigation',navigationProp)
        return (
            <PaperProvider theme={theme}>
                
                <SafeAreaView style={{ flex: 1,backgroundColor: "aliceblue"}}> 
                
                {   

                    Object.keys(this.state.trips).length > 0 
                    ?
                    
                    <View style={{ backgroundColor: "aliceblue"}}>
                        {<FlatList
                            data={this.state.trips}
                            renderItem={({item, index}) => {
                                return (
                                <TouchableOpacity
                                    onPress={() => navigationProp.navigate('TripDetails',{bookId:item.id})}
                                >                                    
                                    <View style={{flex: 1, paddingLeft:20, marginTop:10,marginBottom:5 }} >
                                        <Caption style={{fontSize:14}} >{item.bookingDate}</Caption>
                                    </View>
                                    <Surface style={localStyle.surface}>
                                        <Grid style={{flex:1, flexDirection:'row'}}>
                                            <Col size={2} style={{height:65,justifyContent:'center',alignContent:'center',alignItems:'center',marginTop:10}}>
                                                <View  style={{alignSelf:'center',backgroundColor:'#135AA8',width:15,height:15,borderRadius:30,}}></View>
                                                <View style={{flex:1,width:1,borderRadius:1, borderColor:'black',borderLeftWidth:1}}></View>
                                            </Col>
                                            <Row size={12} style={{height:65}}>
                                                <Col size={8}  >
                                                    <Text style={{ paddingTop:8}}>{item.origin}</Text>
                                                </Col>
                                                <Col size={2} >
                                                    <Text style={{ fontSize:13, color:'grey', paddingTop:10}}>{item.pickupTime}</Text>
                                                </Col>
                                            </Row>
                                        </Grid> 
                                        <Grid style={{flex:1, flexDirection:'row',marginTop:-15}}>
                                            <Col size={2} >
                                                <Button icon="square" color='black' style={{marginLeft:-1.5}}></Button>
                                            </Col>
                                            <Row  size={12}>
                                                <Col size={8}>
                                                    <Text style={{ paddingTop:8}}>{item.destination}</Text>
                                                </Col>
                                                <Col size={2} >
                                                    <Text style={{ fontSize:13, color:'grey', paddingTop:10}} >{item.arrivalTime}</Text>
                                                </Col>
                                            </Row>
                                        </Grid>
                                        <View style={{ padding:5}}></View>
                                        <Divider orientation="vertical"  />
                                        <View style={{ padding:3}}></View>
                                        <Row style={{height:60}}>
                                            <Col size={12}>
                                                <View style={{alignContent:'center',justifyContent:'center',flex:1,flexDirection:'row'}}>
                                                    <Row style={{flex:1,alignItems:'center',justifyContent:'center'}}>
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
                                                            <Text>{item.rider_name}</Text>
                                                            <View style={{flexDirection:'row'}}>
                                                                {
                                                                item.rating
                                                                ?
                                                                <Ionicons name="ios-star" size={16} color="#FFAA01" />
                                                                :
                                                                <Ionicons name="ios-star" size={16} color="#ccc" />
                                                                }
                                                                <Text> {item.rating}</Text>
                                                            </View>
                                                        </Col>
                                                        <Col>
                                                            <Text style={{fontSize:12,color:'gray'}}>Final cost</Text>
                                                            <Text style={{fontSize:14}}>A${item.payment_total1}</Text>
                                                        </Col>
                                                        <Col style={{alignItems:'flex-end'}}>
                                                            <Text style={{fontSize:12,color:'gray'}}>Arrival Time</Text>
                                                            <Text style={{fontSize:14}}>{item.arrivalTime}</Text>
                                                        </Col>
                                                    </Row>
                                                </View>
                                            </Col>
                                        </Row>
                                    </Surface>
                                </TouchableOpacity>

                                )
                            }}
                            keyExtractor={item => item.id}
                            onEndReached={this.onScrollHandler}
                            onEndThreshold={0}
                        />}
                    </View>

                    :
                    (
                    <View style={{flex: 1, paddingLeft:20, marginTop:10,marginBottom:5 }} >
                        <Caption style={{fontSize:14}} >{this.state.loadingText}</Caption>
                    </View>
                    )
                }
                </SafeAreaView>
                {
                    this.state.loader
                    ?
                    <View style={{backgroundColor:'aliceblue'}}>
                        <ActivityIndicator size="large" color="#135AA8" animating={true} />
                    </View>
                    :null
                }
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

