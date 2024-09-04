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

import {styles, theme, DOMAIN} from './Constant';
import { Input } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Spinner from 'react-native-loading-spinner-overlay';
import MapView , { Marker , Polyline ,Callout }from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { MaterialCommunityIcons,Ionicons, Entypo } from '@expo/vector-icons';
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

export default class LastTrip extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            spinner:true,
            selectedTrip:{},
            distance:0,
            durtaion:0,
            multidest:{}
        }

    }

    async componentDidMount() {

        await AsyncStorage.getItem('accesstoken').then((value) => {
            fetch(DOMAIN+'api/driver/last-trip',{
                method: 'GET',
                headers : {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': 'Bearer '+value
                }
            }).then(function (response) {
                return response.json();
            }).then( (res)=> {
                console.log('LastTrip:',res);
                //this.setState({abnData:res.data.abn})
                this.setState({
                    spinner:false,
                    selectedTrip:res.data
                });

                if(res.data.multdest){
                    this.setState({
                        multidest: res.data.multdest   
                    })
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
        return (
            <PaperProvider theme={theme}>
                <Spinner
                    visible={this.state.spinner}
                    color='#FFF'
                    overlayColor='rgba(0, 0, 0, 0.5)'
                />
                <Appbar.Header style={{backgroundColor:'#fff'}}>
                    <Appbar.BackAction onPress={() =>this.props.navigation.goBack()} />
                    <Appbar.Content title="My Last Trip" />
                </Appbar.Header>
                {
                this.state.selectedTrip
                ? 
                <ScrollView style={{backgroundColor: "aliceblue"}}>
                    <View style={localStyle.paddHorizontal}>
                        <Text style={{paddingTop:20,paddingBottom:10, fontSize:16}}>Your {this.state.selectedTrip.serviceType} trip with {this.state.selectedTrip.rider_name}.</Text>
                        <Text>{this.state.selectedTrip.start_date}</Text>
                    </View>
                    <View style={localStyle.paddHorizontal}>
                        <Text style={{paddingTop:20,paddingBottom:10, fontSize:16}}>
                            Rating: {this.createTable(this.state.selectedTrip.rating)} {this.state.selectedTrip.rating}
                        </Text>
                        {
                        this.state.selectedTrip.feedback
                        ?    
                        <Text>
                            <Text style={{fontWeight:'bold'}}>Feedback: </Text>
                            {this.state.selectedTrip.feedback}
                        </Text>
                        :
                        null
                        }
                    </View>
                    <View style={{height:20}}></View>
                    <View style={{height:220}}>
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
                                <Entypo name="location-pin" size={40} color="#135AA8" />
                            </MapView.Marker>
                            <MapView.Marker
                                key={'destination'}
                                coordinate={{latitude: this.state.selectedTrip.destination_lat, longitude: this.state.selectedTrip.destination_lng}} 
                                
                            >
                            <Entypo name="location-pin" size={40} color="#910101" />
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
                    <Grid>
                        <Row style={{paddingVertical:10,backgroundColor:'#fff',elevation: 1,marginBottom:5}}>                            
                            <Col style={localStyle.stipStat}>
                                <Text style={localStyle.textColor}>Distance</Text>
                                <Text>{this.state.distance} Km</Text>
                            </Col>
                            <Col style={localStyle.stipStat}>
                                <Text style={localStyle.textColor}>Duration</Text>
                                <Text>{this.state.duration}</Text>
                            </Col>
                            <Col style={localStyle.stipStat}>
                                <Text style={localStyle.textColor}>Total Cost</Text>
                                <Text>A${this.state.selectedTrip.payment}</Text>
                            </Col>
                        </Row>
                    </Grid>
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
                </ScrollView>
                :
                <View style={{paddingTop:20,alignItems:'center'}}><Text>No records found.</Text></View>
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
    }
    
});