import React, {useEffect, useState} from 'react';
import {
StyleSheet,
View,
Text,
Dimensions,
Image,
TouchableOpacity
} from 'react-native';
import {Button, Divider} from 'react-native-paper';
import ViewSlider from 'react-native-view-slider'
import Modal from 'react-native-modal';
import { MaterialCommunityIcons, AntDesign, FontAwesome,Octicons } from '@expo/vector-icons';
import { Col, Row, Grid } from "react-native-easy-grid";
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {theme, DOMAIN} from './Constant';
const { width, height } = Dimensions.get('window');

class RewardInfoSlider extends React.Component {

    /*useEffect (()=>{        
        getTripDetails()        
    },[1])*/

    constructor(props) {
        super(props);
        this.state = {
            tripInfo:{}
        }
    }
    async componentDidMount() {
        //console.log('props',this.props)
        this.getTripDetails()
    }

    getTripDetails = () => {
        AsyncStorage.getItem('accesstoken').then((value) => {           
            if(value != '' && value !== null){
                //alert(value)
                fetch(DOMAIN+'api/driver/today-trips-stat',{
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
                        tripInfo:res.data
                    },()=>{
                        console.log('book_state',this.state.tripInfo)
                    })
                    
                    
                })
            }
        })
    }
    render(){
        return (
        <>
            <ViewSlider 
                renderSlides = {
                    <>
                        <View style={stylesLocal.viewBox}>
                            <View style={{height:15}}></View>              
                            <Grid style={{marginTop:-15}}>
                                <Row style={{height:80}}>
                                    <Col>
                                        <View 
                                            style={{                                            
                                                flex:1,                                  
                                                alignSelf:'flex-start',
                                                justifyContent:'center',
                                                marginLeft:20
                                            }}
                                        >                                        
                                            <FontAwesome name="eye" size={24} color="black" />
                                        </View>
                                    </Col>

                                    <Col>
                                        <View 
                                            style={{                                            
                                                flex:1,                                  
                                                alignSelf:'center',
                                                justifyContent:'center',                        
                                            }}
                                        >                                        
                                            <Button 
                                                color="#FFF" 
                                                labelStyle={stylesLocal.yellow} 
                                                style={stylesLocal.btnSmall}
                                            >
                                            <MaterialCommunityIcons size={19} name="cards-diamond" />
                                                {this.state.tripInfo.driver_points ? this.state.tripInfo.driver_points : 0}
                                            </Button>
                                        </View>
                                    </Col>

                                    <Col>
                                        <Col>
                                        <View 
                                            style={{
                                                
                                                flex:1,                                  
                                                alignSelf:'flex-end',
                                                justifyContent:'center',
                                                marginRight:20
                                            }}
                                        >                                        
                                            <Octicons name="info" size={24} color="black" />
                                        </View>
                                    </Col>
                                    </Col>
                                </Row>
                                <View style={{justifyContent:'center',alignSelf: 'center'}}>
                                    <Text style={{fontSize:18}}>User Pro</Text>
                                </View>
                                <View style={{paddingVertical:15}}><Divider /></View>
                                <View style={{justifyContent:'center',alignSelf: 'center',paddingBottom:10,marginHorizontal:30,paddingHorizontal:20}}>
                                    <Text style={{fontSize:16,textAlign: 'center'}}>Earn 987 more points to keep Gold</Text>                 
                                </View>
                                <View style={{justifyContent:'center',alignSelf: 'center',paddingBottom:10}}>
                                    
                                </View>
                                <View style={{justifyContent:'center',alignSelf: 'center'}}>
                                    <TouchableOpacity>
                                        <Text style={{fontSize:16,color:'#3f78ba'}}>See Progress</Text>
                                    </TouchableOpacity>
                                </View>
                            </Grid>
                        </View>
                        <View style={stylesLocal.viewBox}>
                            <View style={{height:15}}></View>              
                            <Grid style={{marginTop:-15}}>
                                <Row style={{height:80}}>
                                    <Col>
                                        <View 
                                            style={{                                            
                                                flex:1,                                  
                                                alignSelf:'flex-start',
                                                justifyContent:'center',
                                                marginLeft:20
                                            }}
                                        >                                        
                                            <FontAwesome name="eye" size={24} color="black" />
                                        </View>
                                    </Col>

                                    <Col>
                                        <View 
                                            style={{                                            
                                                flex:1,                                  
                                                alignSelf:'center',
                                                justifyContent:'center',
                                            }}
                                        >                                        
                                            <Button 
                                                color="#FFF" 
                                                labelStyle={stylesLocal.yellow} 
                                                style={stylesLocal.btnSmall}
                                            >
                                                0 <Text style={{color:'#FFF'}}>|</Text> 70
                                            </Button>
                                        </View>
                                    </Col>

                                    <Col>
                                        <Col>
                                        <View 
                                            style={{
                                                
                                                flex:1,                                  
                                                alignSelf:'flex-end',
                                                justifyContent:'center',
                                                marginRight:20
                                            }}
                                        >                                        
                                            
                                        </View>
                                    </Col>
                                    </Col>
                                </Row>
                                <View style={{justifyContent:'center',alignSelf: 'center'}}>
                                    <Text style={{fontSize:18}}>Quest</Text>
                                </View>
                                <View style={{paddingVertical:15}}><Divider /></View>
                                <View style={{justifyContent:'center',alignSelf: 'center',paddingBottom:10,marginHorizontal:30,paddingHorizontal:20}}>
                                    <Text style={{fontSize:16,textAlign: 'center'}}>Drive 70 more trips to makes $70 extra</Text>                 
                                </View>
                                <View style={{justifyContent:'center',alignSelf: 'center',paddingBottom:10}}>
                                    
                                </View>
                                <View style={{justifyContent:'center',alignSelf: 'center'}}>
                                    <TouchableOpacity
                                         onPress={()=>this.props.navigate('CurrentQuest')}
                                    >
                                        <Text style={{fontSize:16,color:'#3f78ba'}}>See Details</Text>
                                    </TouchableOpacity>
                                </View>
                            </Grid>
                        </View>
                        <View style={stylesLocal.viewBox}>
                            <View style={{height:15}}></View>              
                            <Grid style={{marginTop:-15}}>
                                <Row style={{height:80}}>
                                    <Col>
                                        <View 
                                            style={{                                            
                                                flex:1,                                  
                                                alignSelf:'flex-start',
                                                justifyContent:'center',
                                                marginLeft:20
                                            }}
                                        >                                        
                                            <FontAwesome name="eye" size={24} color="black" />
                                        </View>
                                    </Col>

                                    <Col>
                                        <View 
                                            style={{                                            
                                                flex:1,                                  
                                                alignSelf:'center',
                                                justifyContent:'center',

                                            }}
                                        >                                        
                                            <Button 
                                                color="#FFF" 
                                                labelStyle={stylesLocal.yellow} 
                                                style={stylesLocal.btnSmall}
                                            >
                                                ${this.state.tripInfo.today_amt ? this.state.tripInfo.today_amt : 0.00}
                                            </Button>
                                        </View>
                                    </Col>

                                    <Col>
                                        <Col>
                                        <View 
                                            style={{
                                                
                                                flex:1,                                  
                                                alignSelf:'flex-end',
                                                justifyContent:'center',
                                                marginRight:20
                                            }}
                                        >                                        
                                            
                                        </View>
                                    </Col>
                                    </Col>
                                </Row>
                                <View style={{justifyContent:'center',alignSelf: 'center'}}>
                                    <Text style={{fontSize:18}}>Today</Text>
                                </View>
                                <View style={{paddingVertical:15}}><Divider /></View>
                                <View style={{justifyContent:'center',alignSelf: 'center',paddingBottom:10}}>
                                    <Text style={{fontSize:16}}>
                                        {this.state.tripInfo.today_trips ? this.state.tripInfo.today_trips : 0} 
                                        {
                                            this.state.tripInfo.today_trips > 1
                                            ?
                                            <Text> Trips completed</Text>
                                            :
                                            <Text> Trip completed</Text>
                                        }
                                    </Text>
                                </View>
                                <View style={{justifyContent:'center',alignSelf: 'center',paddingBottom:10}}>
                                    <Text style={{fontSize:16}}><MaterialCommunityIcons color='#fec557' size={18} name="cards-diamond" /> 
                                        {this.state.tripInfo.today_trips ? this.state.tripInfo.today_trips : 0} 
                                        {
                                            this.state.tripInfo.today_trips > 1
                                            ?
                                            <Text> Points</Text>
                                            :
                                            <Text> Point</Text>
                                        }
                                        
                                    </Text>
                                </View>
                                <View style={{justifyContent:'center',alignSelf: 'center'}}>
                                    <TouchableOpacity onPress={()=>this.props.navigate('WeeklySummary')} >
                                        <Text style={{fontSize:16,color:'#3f78ba'}}>See Weekly Summary</Text>
                                    </TouchableOpacity>
                                </View>
                            </Grid>
                        </View>                    
                        <View style={stylesLocal.viewBox}>
                            <View style={{height:15}}></View>              
                            <Grid style={{marginTop:-15}}>
                                <Row style={{height:80}}>
                                    <Col>
                                        <View 
                                            style={{                                            
                                                flex:1,                                  
                                                alignSelf:'flex-start',
                                                justifyContent:'center',
                                                marginLeft:20
                                            }}
                                        >                                        
                                            <FontAwesome name="eye" size={24} color="black" />
                                        </View>
                                    </Col>

                                    <Col>
                                        <View 
                                            style={{                                            
                                                flex:1,                                  
                                                alignSelf:'center',
                                                justifyContent:'center',
                                            }}
                                        >                                        
                                            <Button 
                                                color="#FFF" 
                                                labelStyle={stylesLocal.yellow} 
                                                style={stylesLocal.btnSmall}
                                            >
                                                ${this.state.tripInfo.last_amt ? this.state.tripInfo.last_amt : 0.00}
                                            </Button>
                                        </View>
                                    </Col>

                                    <Col>
                                        <Col>
                                        <View 
                                            style={{
                                                
                                                flex:1,                                  
                                                alignSelf:'flex-end',
                                                justifyContent:'center',
                                                marginRight:20
                                            }}
                                        >                                        
                                            <Octicons name="info" size={24} color="black" />
                                        </View>
                                    </Col>
                                    </Col>
                                </Row>
                                <View style={{justifyContent:'center',alignSelf: 'center'}}>
                                    <Text style={{fontSize:18}}>Last Trip</Text>
                                </View>
                                <View style={{paddingVertical:15}}><Divider /></View>

                                <View style={{justifyContent:'center',alignSelf: 'center',paddingBottom:10}}>
                                    {
                                        this.state.tripInfo.last_time
                                        ?
                                    <Text style={{fontSize:16}}>{this.state.tripInfo.last_time}</Text>
                                        :
                                        null
                                    }
                                </View>

                                <View style={{justifyContent:'center',alignSelf: 'center',paddingBottom:10}}>
                                    {
                                    this.state.tripInfo.last_rider
                                    ?
                                        <Text style={{fontSize:16}}>{this.state.tripInfo.last_rider} 
                                        <MaterialCommunityIcons color='#fec557' size={18} name="cards-diamond" /> 1 Points</Text>
                                    :
                                    null
                                    }
                                </View>
                                <View style={{justifyContent:'center',alignSelf: 'center'}}>
                                    <TouchableOpacity onPress={()=>this.props.navigate('MyEarning')}>
                                        <Text style={{fontSize:16,color:'#3f78ba'}}>See Earnings Activity</Text>
                                    </TouchableOpacity>
                                </View>
                            </Grid>
                        </View>
                    </>
                }
                style={stylesLocal.slider}     //Main slider container style
                height = {250}    //Height of your slider
                slideCount = {4}    //How many views you are adding to slide
                dots = {true}     // Pagination dots visibility true for visibile 
                dotActiveColor = '#3f78ba'     //Pagination dot active color
                dotInactiveColor = 'gray'    // Pagination do inactive color
                dotsContainerStyle={stylesLocal.dotContainer}     // Container style of the pagination dots
                autoSlide = {false}    //The views will slide automatically
                slideInterval = {2000}    //In Miliseconds
            />
        </>
        );
    }
}

const stylesLocal = StyleSheet.create({    
    yellow:{color:'#fec557',fontSize:20,marginVertical:4},

    btnSmall:{
        backgroundColor:'#3f78ba',
        borderWidth:3,
        borderColor:'#FFF',        
        elevation: 5,        
        borderRadius:5,
    },        
    viewBox: {            
        width:340,      
    },
    slider: {      
        backgroundColor: '#FFF',
        width:340,
        borderRadius:10,
        marginLeft:-8
    },
    dotContainer: {
        backgroundColor: '#FFF',
        position: 'absolute',
        bottom: -50,
        padding:5,
        borderRadius:5,
        alignSelf: 'center',
    }
});

export default RewardInfoSlider;