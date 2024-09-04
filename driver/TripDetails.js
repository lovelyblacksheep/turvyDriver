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
    Dimensions
} from 'react-native';

import {styles, theme, DOMAIN, debug} from './Constant';
import { Input } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Spinner from 'react-native-loading-spinner-overlay';
import MapView , { Marker , Polyline ,Callout }from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { MaterialCommunityIcons,Ionicons, Entypo, AntDesign } from '@expo/vector-icons';
import { Col, Row, Grid } from "react-native-easy-grid";

const StatusBarheight = StatusBar.currentHeight+50;

const stylesArray = [
  {
    "featureType": "road.highway",
    "stylers": [
      { "color": "#7E96BC" }
    ]
  },{
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [
      { "color": "#FEFEFE" }
    ]
  },
    {
    "featureType": "water",
    "stylers": [
      { "color": "#8ABFE5"  }
    ]
    },
    {
    "featureType": "landscape.natural",
    "stylers": [
      { "color": "#EBECEF"  }
    ]
    },
    {
    "featureType": "landscape.natural.landcover",
    "stylers": [
      { "color": "#C9E7D2"  }
    ]
    },
    {
    "featureType": "all",
      "elementType": "labels.icon",
    "stylers": [
      { "visibility": "off" }
    ]
    }
]

export default class TripDetails extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            spinner:true,
            selectedTrip:{},
            payData:{},
            distance:0,
            durtaion:0,
            multidest:{},
            book_Id:this.props.route.params.bookId,
            loadingText: 'Please be patient, We are fetching records for you',
        }

    }

    async componentDidMount() {
        
        await AsyncStorage.getItem('accesstoken').then((value) => {
            fetch(DOMAIN+'api/driver/trip-detail/'+this.state.book_Id,{
                method: 'GET',
                headers : {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': 'Bearer '+value
                }
            }).then(function (response) {
                return response.json();
            }).then( (res)=> {
                console.log('LastTrip===================>:',debug(res));
                //this.setState({abnData:res.data.abn})
                
                if(res.status){
                    this.setState({
                        spinner:false,
                        selectedTrip:res.data,
                        payData:res.payData
                    });

                    if(res.data.multdest){
                        this.setState({
                            multidest: res.data.multdest   
                        })
                    }
                }else{
                    this.setState({
                        spinner:false,
                        loadingText: 'No records found.'
                    });                    
                }
                
            });
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
        const {payData} = this.state
        return (
            <PaperProvider theme={theme}>
                <Spinner
                    visible={this.state.spinner}
                    color='#FFF'
                    overlayColor='rgba(0, 0, 0, 0.5)'
                />
                <Appbar.Header style={{backgroundColor:'#fff'}}>
                    <Appbar.BackAction onPress={() =>this.props.navigation.goBack()} />
                    <Appbar.Content title="Trip Details" />
                </Appbar.Header>
                {
                
                Object.keys(this.state.selectedTrip).length > 0 
                ? 
                <ScrollView style={{backgroundColor: "aliceblue"}}>
                    <View style={{
                        backgroundColor: this.state.selectedTrip.tripStatus === 'self_cancel' ? '#dc3545' : "#5c79de", 
                        height:110,alignItems:'center',justifyContent:'center',elevation: 5}}>                        
                        <View style={{marginBottom:5}}>                            
                            {
                                this.state.selectedTrip.tripStatus === 'self_cancel'
                                ?
                                <Text style={{fontSize:14,color:'#FFF'}}>Deduction</Text>
                                :
                                <Text style={{fontSize:14,color:'#FFF'}}>Your Earning</Text>
                            }                            
                        </View>
                        <View><Text style={{fontSize:24,color:'#FFF'}}>{this.state.selectedTrip.payment}</Text></View>
                    </View> 

                    <Grid style={{flex:1, flexDirection:'row',paddingTop:10}}>
                        <Col size={2} style={{height:65,justifyContent:'center',alignContent:'center',alignItems:'center',marginTop:10}}>
                            <View  style={{alignSelf:'center',backgroundColor:'#135AA8',width:15,height:15,borderRadius:30,}}></View>
                            <View style={{flex:1,width:1,borderRadius:1, borderColor:'black',borderLeftWidth:1}}></View>
                        </Col>
                        <Row size={12} style={{height:65}}>
                            <Col size={8}  >
                                <Text style={{ paddingTop:8}}>{this.state.selectedTrip.origin}</Text>
                                <Text style={localStyle.textColor}>{this.state.selectedTrip.start_time}</Text>
                            </Col>
                        </Row>
                    </Grid> 
                    <Grid style={{flex:1, flexDirection:'row',marginTop:-15}}>
                        <Col size={2} >
                            <Button icon="square" color='#910101' style={{marginLeft:1.5}}></Button>
                        </Col>
                        <Row  size={12}>
                            <Col size={8}>
                                <Text style={{ paddingTop:8}}>{this.state.selectedTrip.destination}</Text>
                                <Text style={localStyle.textColor}>{this.state.selectedTrip.end_time}</Text>
                            </Col>                                    
                        </Row>
                    </Grid>                    
                    <View style={{height:20}}></View>
                    <View style={{height:150}}>
                        {this.state.selectedTrip.origin_lat && this.state.selectedTrip.origin_lng 
                        ?
                        (<MapView style={localStyle.map}
                            ref={c => this.mapView = c}                            
                            liteMode={true}
                            initialRegion={{latitude: this.state.selectedTrip.origin_lat,
                            longitude: this.state.selectedTrip.origin_lng,
                            latitudeDelta: 0,
                            longitudeDelta: 0,}}
                            onRegionChangeComplete ={ (e) => {
                            }}
                            customMapStyle={stylesArray}
                        >
                            <MapView.Marker
                                key={'source'}
                                  coordinate={{latitude: this.state.selectedTrip.origin_lat, longitude: this.state.selectedTrip.origin_lng}}
                            >                                
                                <View style={{width:30,height:30,borderRadius:50,backgroundColor:'#135AA8',alignItems:'center',justifyContent:'center'}}>
                                <Ionicons name="car-sport" size={16} color="#FFF" />
                                </View>
                            </MapView.Marker>
                            <MapView.Marker
                                key={'destination'}
                                coordinate={{latitude: this.state.selectedTrip.destination_lat, longitude: this.state.selectedTrip.destination_lng}} 
                                
                            >
                            <View style={{width:30,height:30,borderRadius:50,backgroundColor:'#910101',alignItems:'center',justifyContent:'center'}}>
                                <Ionicons name="car-sport" size={16} color="#FFF" />
                            </View>
                            </MapView.Marker>

                            { 
                                Object.keys(this.state.multidest).length > 0 

                            ?    

                                this.state.multidest.map((item, index) => {
                                    return (
                                    <Marker
                                    tracksViewChanges={false}
                                    key={'destinationkey-'+index}
                                    coordinate={{latitude:item.latitude, longitude:item.longitude}}       
                                    style={{ alignItems: "center"}} 
                                >    
                                    
                                    <Entypo name="location-pin" size={30} color="green" />

                                </Marker>)
                                })
                             
                             :
                             null

                            }   

                            { this.state.selectedTrip.origin_lat && this.state.selectedTrip.origin_lng && this.state.selectedTrip.destination_lng && this.state.selectedTrip.destination_lat  ?
                            (
                            <>
                                <MapViewDirections
                                    region={'AU'}
                                    origin={{latitude: this.state.selectedTrip.origin_lat, longitude: this.state.selectedTrip.origin_lng}}
                                    destination={{latitude: this.state.selectedTrip.destination_lat, longitude: this.state.selectedTrip.destination_lng}}
                                    waypoints={ (Object.keys(this.state.multidest).length > 0 ) ? this.state.multidest : undefined}
                                    strokeWidth={5}
                                    lineDashPattern={[1]}
                                    strokeColor="#135AA8"
                                    apikey="AIzaSyAr2ESV30J7hFsOJ5Qjaa96u9ADSRX6_Sk"
                                    lineCap={'butt'}
                                    lineJoin={'miter'}                                    
                                    onReady={result => {
                                        //console.log('cords:',result)
                                        let duration = result.duration;
                                        let timeTxt = ' min'
                                        if(duration > 60){
                                            duration = duration / 60
                                            timeTxt = ' hrs'
                                        }
                                        duration = duration.toFixed(0);
                                        let distance = result.distance.toFixed(2);
                                        this.setState({
                                            distance:distance,
                                            duration:duration+timeTxt,
                                        });
                                        this.mapView.fitToCoordinates(result.coordinates, {
                                            edgePadding: {
                                                right: 50,
                                                left:  50,
                                                top: 100,
                                                bottom: 70,
                                            },
                                            animated: true,
                                        });

                                        
                                    }}
                                />
                            </>
                            )
                            :
                            (
                            <>
                            </>
                            )
                        }
                        </MapView>)
                        :
                        null
                        }
                    </View>
                    {
                        this.state.selectedTrip.tripStatus !== 'self_cancel' && this.state.selectedTrip.tripStatus !== 'rider_cancel'
                        ?
                    <Grid>
                        <Row style={{paddingVertical:10,backgroundColor:'#fff',elevation: 1,marginBottom:1}}>
                            <Col style={localStyle.stipStat}>
                                <Text style={localStyle.textColor}>Distance</Text>
                                <Text>{this.state.distance} Km</Text>
                            </Col>
                            <Col style={localStyle.stipStat}>
                                <Text style={localStyle.textColor}>Duration</Text>
                                <Text>{this.state.duration}</Text>
                            </Col>                            
                        </Row>
                    </Grid>
                    :
                    null
                    }
                    <Grid>
                        <Row style={localStyle.statOuter}>
                            <Col style={localStyle.stipStat}>
                                <Text style={localStyle.textStatL}>Vehicle Type</Text>
                            </Col>
                            <Col style={localStyle.stipStat}>
                                <Text style={localStyle.textStatR}>{this.state.selectedTrip.serviceType}</Text>
                            </Col>                            
                        </Row>
                    </Grid>
                    <Grid>
                        <Row style={localStyle.statOuter}>
                            <Col style={localStyle.stipStat}>
                                <Text style={localStyle.textStatL}>Time Requested</Text>
                            </Col>
                            <Col style={localStyle.stipStat}>
                                <Text style={localStyle.textStatR}>{this.state.selectedTrip.start_time}</Text>
                            </Col>                            
                        </Row>
                    </Grid>
                    <Grid>
                        <Row style={localStyle.statOuter}>
                            <Col style={localStyle.stipStat}>
                                <Text style={localStyle.textStatL}>Date Requested</Text>
                            </Col>
                            <Col style={localStyle.stipStat}>
                                <Text style={localStyle.textStatR}>{this.state.selectedTrip.start_date}</Text>
                            </Col>                            
                        </Row>
                    </Grid>
                    {
                        this.state.selectedTrip.tripStatus === 'self_cancel'
                        ?
                        <Grid>
                            <Row style={localStyle.statOuter}>
                                <Col style={localStyle.stipStat}>
                                    <Text style={localStyle.textStatL}>Cancel fee</Text>
                                </Col>
                                <Col style={localStyle.stipStat}>
                                    <Text style={localStyle.textStatR}>{this.state.selectedTrip.payment}</Text>
                                </Col>                            
                            </Row>
                            <Row style={localStyle.statOuter}>
                                <Col style={localStyle.stipStat}>
                                    <Text style={localStyle.textStatL}>Status</Text>
                                </Col>
                                <Col style={localStyle.stipStat}>
                                    <Text style={localStyle.textStatR}>{this.state.selectedTrip.statusText}</Text>
                                </Col>                            
                            </Row>
                            <Row style={localStyle.statOuter}>
                                <Col style={localStyle.stipStat}>
                                    <Text style={localStyle.textStatL}>Cancel reason</Text>
                                </Col>
                                <Col style={localStyle.stipStat}>
                                    <Text style={localStyle.textStatR}>{this.state.selectedTrip.cancel_reason}</Text>
                                </Col>                            
                            </Row>
                        </Grid>

                        :
                        this.state.selectedTrip.tripStatus === 'rider_cancel'
                        ?                        
                        <Grid>
                            <Row style={localStyle.statOuter}>
                                <Col style={localStyle.stipStat}>
                                    <Text style={localStyle.textStatL}>Rider paid to you</Text>
                                </Col>
                                <Col style={localStyle.stipStat}>
                                    <Text style={localStyle.textStatR}>{this.state.selectedTrip.payment}</Text>
                                </Col>                            
                            </Row>                            
                            <Row style={localStyle.statOuter}>
                                <Col style={localStyle.stipStat}>
                                    <Text style={localStyle.textStatL}>Status</Text>
                                </Col>
                                <Col style={localStyle.stipStat}>
                                    <Text style={localStyle.textStatR}>{this.state.selectedTrip.statusText}</Text>
                                </Col>                            
                            </Row>                            
                        </Grid>
                        :
                    <Grid>
                        <Row style={localStyle.statOuter}>
                            <Col style={localStyle.stipStat}>
                                <Text style={localStyle.textStatL}>Points Earned <MaterialCommunityIcons size={15} color='#fec557' name="cards-diamond" /></Text>
                            </Col>
                            <Col style={localStyle.stipStat}>
                                <Text style={localStyle.textStatR}>1 Point</Text>
                            </Col>                            
                        </Row>
                        <Row style={localStyle.statOuter}>
                            <Col style={localStyle.stipStat}>
                                <Text style={localStyle.textStatL}>Fuel charge included <AntDesign name="checkcircle" size={16} color="green" /></Text>
                            </Col>
                            <Col style={localStyle.stipStat}>
                                <Text style={localStyle.textStatR}>A${payData.fuel_surge_charge}</Text>
                            </Col>                            
                        </Row>
                        {
                            this.state.selectedTrip.payment_tip > 0
                            &&
                        <Row style={localStyle.statOuter}>
                            <Col style={localStyle.stipStat}>
                                <Text style={localStyle.textStatL}>Tip included <AntDesign name="checkcircle" size={16} color="green" /></Text>
                            </Col>
                            <Col style={localStyle.stipStat}>
                                <Text style={localStyle.textStatR}>A${this.state.selectedTrip.payment_tip}</Text>
                            </Col>                            
                        </Row>
                        }
                    
                        {/* <Row style={localStyle.statOuter}>
                            <Col style={localStyle.stipStat}>
                                <Text style={localStyle.textStatL}>Trip Cost</Text>
                            </Col>
                            <Col style={localStyle.stipStat}>
                                <Text style={localStyle.textStatR}>{this.state.selectedTrip.payment}</Text>
                            </Col>                            
                        </Row>
                    
                        
                    
                        <Row style={localStyle.statOuter}>
                            <Col style={localStyle.stipStat}>
                                <Text style={localStyle.textStatL}>Rating</Text>
                            </Col>
                            <Col style={localStyle.stipStat}>
                                <Text style={localStyle.textStatR}>{this.createTable(this.state.selectedTrip.rating)} {this.state.selectedTrip.rating}</Text>
                            </Col>                            
                        </Row>
                        {
                        this.state.selectedTrip.feedback
                        ?
                        <Row style={localStyle.statOuter}>
                            <Col>
                                <Text>
                                    <Text style={{fontWeight:'bold'}}>Feedback: </Text>
                                    {this.state.selectedTrip.feedback}
                                </Text>
                            </Col>                            
                        </Row>
                        :
                        null
                        } */}

                        <Row style={localStyle.statOuter}>
                            <Col>
                                <Text style={{fontSize:22}}>Paid to you</Text>
                                <Row style={[localStyle.innerRow,localStyle.bottomBorder]}>
                                    <Col style={localStyle.stipStat}>
                                        <Text style={localStyle.textStatL}>Fare</Text>
                                    </Col>
                                    <Col style={localStyle.stipStat}>
                                        <Text style={localStyle.textStatR}>A${payData.totalAmount}</Text>
                                    </Col>                            
                                </Row>
                                <Row style={[localStyle.innerRow,localStyle.bottomBorder]}>
                                    <Col style={localStyle.stipStat}>
                                        <Text style={localStyle.textStatL}>Service Fee</Text>
                                        <Text style={[localStyle.textStatL,{color:'gray',fontSize:12}]}>Fare x 20%</Text>
                                    </Col>
                                    <Col style={localStyle.stipStat}>
                                        <Text style={localStyle.textStatR}>-A${payData.serviceFee}</Text>
                                    </Col>                            
                                </Row>
                                <Row style={[localStyle.innerRow2]}>
                                    <Col style={localStyle.stipStat}>
                                        <Text style={localStyle.textStatL}>Fuel Charge</Text>
                                    </Col>
                                    <Col style={localStyle.stipStat}>
                                        <Text style={localStyle.textStatR}>A${payData.fuel_surge_charge}</Text>
                                    </Col>                            
                                </Row>
                                {
                                this.state.selectedTrip.payment_tip > 0
                                &&
                                <Row style={[localStyle.innerRow2]}>
                                    <Col style={localStyle.stipStat}>
                                        <Text style={localStyle.textStatL}>Tip</Text>
                                    </Col>
                                    <Col style={localStyle.stipStat}>
                                        <Text style={localStyle.textStatR}>A${this.state.selectedTrip.payment_tip}</Text>
                                    </Col>                            
                                </Row>
                                }
                                {
                                payData.violant_end > 0
                                &&
                                <Row style={[localStyle.innerRow2]}>
                                    <Col style={localStyle.stipStat}>
                                        <Text style={localStyle.textStatL}>Violation</Text>
                                    </Col>
                                    <Col style={localStyle.stipStat}>
                                        <Text style={localStyle.textStatR}>A${payData.violant_end}.00</Text>
                                    </Col>                            
                                </Row>
                                }
                                <Row style={[localStyle.innerRow2, localStyle.darkBottomBorder,{paddingBottom:15}]}>
                                    <Col style={localStyle.stipStat}>
                                        <Text style={localStyle.textStatL}>Toll Charge</Text>
                                    </Col>
                                    <Col style={localStyle.stipStat}>
                                        <Text style={localStyle.textStatR}></Text>
                                    </Col>                            
                                </Row>
                                <Row style={[localStyle.innerRow2,localStyle.darkBottomBorder,{paddingBottom:15}]}>
                                    <Col style={localStyle.stipStat}>
                                        <Text style={[localStyle.textStatL,localStyle.heading]}>Your Earning</Text>
                                    </Col>
                                    <Col style={localStyle.stipStat}>
                                        <Text style={[localStyle.textStatR,localStyle.heading]}>{this.state.selectedTrip.payment}</Text>
                                    </Col>                            
                                </Row>
                                <Row style={[localStyle.innerRow2,localStyle.darkBottomBorder,,{paddingBottom:15}]}>
                                    <Col style={localStyle.stipStat} size={8}>
                                        <Text style={[localStyle.textStatL,localStyle.pageText]}>This show your trip balance. Which is the trip fare minus service fee and including any reimbursements for toll or airport charges you may have paid. Trip balance will update to include any tips received by a rider after a trip.</Text>
                                    </Col>
                                    <Col size={4}></Col>                      
                                </Row>
                                <Row style={[localStyle.innerRow2]}>
                                    <Col style={localStyle.stipStat}>
                                        <Text style={[localStyle.textStatL,localStyle.heading]}>Other Earning</Text>
                                    </Col>
                                    <Col style={localStyle.stipStat}>
                                        <Text style={[localStyle.textStatR,localStyle.heading]}>A$0.00</Text>
                                    </Col>                            
                                </Row>
                                <Row style={[localStyle.innerRow2]}>
                                    <Col style={[localStyle.stipStat,{paddingLeft:20}]}>
                                        <Text style={[localStyle.textStatL]}>Booking fee (payment)</Text>
                                    </Col>
                                    <Col style={localStyle.stipStat}>
                                        <Text style={[localStyle.textStatR]}>A${payData.booking_charge}</Text>
                                    </Col>                            
                                </Row>
                                <Row style={[localStyle.innerRow,localStyle.darkBottomBorder]}>
                                    <Col style={[localStyle.stipStat,{paddingLeft:20}]}>
                                        <Text style={[localStyle.textStatL]}>Booking fee (deduction)</Text>
                                    </Col>
                                    <Col style={localStyle.stipStat}>
                                        <Text style={[localStyle.textStatR]}>-A${payData.booking_charge}</Text>
                                    </Col>                            
                                </Row>
                                <Text style={{fontSize:22,paddingTop:10}}>Paid to third parties</Text>
                                <Row style={[localStyle.innerRow,localStyle.bottomBorder]}>
                                    <Col style={localStyle.stipStat}>
                                        <Text style={localStyle.textStatL}>NSW Government Transport Levy</Text>
                                    </Col>
                                    <Col style={localStyle.stipStat}>
                                        <Text style={localStyle.textStatR}>A${payData.nsw_gtl_charge}</Text>
                                    </Col>                            
                                </Row>
                                <Row style={[localStyle.innerRow,localStyle.darkBottomBorder]}>
                                    <Col style={localStyle.stipStat}>
                                        <Text style={localStyle.textStatL}>NSW CTP Charge</Text>
                                    </Col>
                                    <Col style={localStyle.stipStat}>
                                        <Text style={localStyle.textStatR}>A${payData.nsw_ctp_charge}</Text>
                                    </Col>                            
                                </Row>
                                <Row style={[localStyle.innerRow2]}>
                                    <Col style={localStyle.stipStat}>
                                        <Text style={[localStyle.textStatL,localStyle.heading]}>Total</Text>
                                    </Col>
                                    <Col style={localStyle.stipStat}>
                                        <Text style={[localStyle.textStatR,localStyle.heading]}>A${payData.tpTotal}</Text>
                                    </Col>                            
                                </Row>
                                <Row style={[localStyle.innerRow2,{paddingBottom:15}]}>
                                    <Col style={localStyle.stipStat} size={8}>
                                        <Text style={[localStyle.textStatL,localStyle.pageText]}>These charges related to obligations imposed by governmental entities or other third parties.</Text>
                                    </Col>
                                    <Col size={4}></Col>                      
                                </Row>
                            </Col>
                        </Row>
                        
                    </Grid>                    
                    
                    }
                    
                </ScrollView>
                :
                <View style={{paddingTop:20,alignItems:'center'}}><Text>{this.state.loadingText}</Text></View>
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
   map: {
    width: Dimensions.get('window').width,
    height: 220,
    flex: 1,
  },
    paddHorizontal:{
        paddingHorizontal:20
    },
    stipStat:{
        alignItems:'center',justifyContent:'center'
    },
    textColor:{
        color:'gray'
    },

    tripStatL:{
        flex:1,alignItems:'flex-start',justifyContent:'center',borderWidth:1  
    },
    tripStatR:{
        flex:1,alignItems:'flex-end',justifyContent:'center',borderWidth:1    
    },
    textStatL:{
        alignSelf:'flex-start'
    },
    textStatR:{
        alignSelf:'flex-end'
    },
    statOuter:{
        paddingVertical:15,backgroundColor:'#fff',elevation: 1,marginBottom:1,paddingHorizontal:20,
    },
    innerRow:{
        paddingVertical:10,marginBottom:1,
    },
    bottomBorder:{
        borderBottomWidth:1,borderBottomColor:'#ddd'
    },
    innerRow2:{
        paddingVertical:5,marginBottom:1,
    },

    darkBottomBorder:{
        borderBottomWidth:1,borderBottomColor:'#A4A4A4'
    },
    heading:{fontSize:22},
    pageText:{
        color:'gray',
        fontSize:12
    }

    
});