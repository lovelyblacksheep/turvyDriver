import debounce from 'lodash.debounce';
import React from "react";
import Qs from 'qs';
import {  Provider as PaperProvider,Text, Card, Title, Paragraph,TextInput } from 'react-native-paper';
import {View, ScrollView, TouchableHighlight, StyleSheet, TouchableOpacity, Dimensions,StatusBar, FlatList,Keyboard } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { Col, Row, Grid } from "react-native-easy-grid";
import Spinner from 'react-native-loading-spinner-overlay';
import { MaterialCommunityIcons, AntDesign, FontAwesome5,FontAwesome,Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FlashMessage , { showMessage, hideMessage }  from "react-native-flash-message";
import BottomSheet from 'reanimated-bottom-sheet';

import * as firebase from "firebase";
import "firebase/firestore";
import * as geofirestore from 'geofirestore';

import apiKeys from './config/keys';
const db = firebase.firestore();
const firestore = firebase.firestore();
const GeoFirestore = geofirestore.initializeApp(firestore);
const geocollection = GeoFirestore.collection('driver_destination');

import * as Location from 'expo-location';
import MapView , { Marker, Circle  }from 'react-native-maps';
// install using npm --legacy-peer-deps  install react-native-maps-directions
import MapViewDirections from 'react-native-maps-directions';

import {styles,theme, DOMAIN} from './Constant'

const { width, height } = Dimensions.get('window');
const SCREENHEIGHT = height*.50;
const StatusBarheight = StatusBar.currentHeight+10;

export default class SearchDest extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            accessTokan:'',
            driverId: null,
            destination:'',
            destination_lng:'',
            destination_lat:'',
            snaptoval:['45%', '30%', '0%'],
            results:{},
            driverDest:''
        }
		this.myRefbt = React.createRef();
    }

   debounceLog = debounce(text=> this._request(text),200);
   
   _request = (text) => {
        console.log("text",text);
        if (text ) {
            const request = new XMLHttpRequest();
            //_requests.push(request);
            request.timeout = 1000;
            //request.ontimeout = props.onTimeout;
            request.onreadystatechange = () => {
            //console.log(request);
                if (request.readyState !== 4) {
                  return;
                }
                console.log(request.status);
                if (request.status === 200) {
                    const responseJSON = JSON.parse(request.responseText);
                    if (typeof responseJSON.predictions !== 'undefined') {
        				const results = responseJSON.predictions;
        				this.setState({
        					results:results,
        				})
                    }
                    if (typeof responseJSON.error_message !== 'undefined') {
                    }
                } else {
                    // console.warn("google places autocomplete: request could not be completed or has been aborted");
                }
            };      
            let query =  {
    		    key: 'AIzaSyAr2ESV30J7hFsOJ5Qjaa96u9ADSRX6_Sk',
    		    language: 'en',
    		    types: ['geocode','locality'],
    		};
            const url ='https://maps.googleapis.com/maps/api';
            request.open(
                'GET',
                `${url}/place/autocomplete/json?&input=`+encodeURIComponent(text)+'&'+Qs.stringify(query),
            );
            request.withCredentials = true;
            request.send();
        };
    }

   
    async componentDidMount() {
        //console.log(this.props)
        this.myRefbt.current.snapTo(2);
        await AsyncStorage.getItem('driverId').then((value) => {           
            if(value != '' && value !== null){
                this.setState({
                    driverId:value
                },()=>{
                    const driverRef = db.collection('driver_destination')
                    .doc(this.state.driverId)
                    .get()
                    .then((docRef) => {
                        //console.log('driver_destination:',docRef.data().destnation) 
                        this.setState({
                            driverDest:docRef.data().destnation
                        })
                        
                    })
                })
            }
        })
    }
    
    renderContent = () => (
        <View
          style={{
            backgroundColor: 'aliceblue',
            padding: 16,
            height: '100%',
            borderRadius:5,

          }}
        >
          {this._getFlatList()}
        </View>
    );   
  
    _getFlatList = () => {
        const keyGenerator = () => Math.random().toString(36).substr(2, 10);
        if (this.state.destination !== '' ) {
            return (
            <FlatList
                nativeID='result-list-id'
                scrollEnabled={true}
                disableScrollViewPanResponder={true}
                data={this.state.results}
                keyExtractor={keyGenerator}
                renderItem={({ item, index }) => this._renderRow(item, index)}

            />
            );
        }
        return null;
    };
  
  
    _renderRow = (rowData = {}, index) => {
        //console.log("RENDER ROW",index);
        return (
            <ScrollView
                scrollEnabled={true}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps='handled'                
            >
                <TouchableHighlight
                    underlayColor={'#c8c7cc'}
                    style={{ width: '100%',}}
                    onPress={() => this._onPress(rowData)}
                >
                    <View
                        style={{
                        	flex:1,
                        	flexDirection:'row',                        	
                        	borderBottomWidth:1,
                        	borderBottomColor:'#ccc'
                        }}
                    >
                        <View style={{width:40,padding:10,}}> 
           	                <FontAwesome name="location-arrow" size={24} color="grey" />
           	            </View>
           	            <View style={{padding:10,}}> 
                            {this._renderRowData(rowData, index)}
                        </View>
                    </View>
                </TouchableHighlight>
            </ScrollView>
        );
    };
   
    _renderRowData = (rowData, index) => {
        return (
            <>
                {this._renderDescription(rowData)}
            </>
        );
    };
  
    _renderDescription = (rowData) => {
        //console.log(rowData);
        //return rowData.description || rowData.formatted_address || rowData.name;
        return (
            <>
                <View style={{flex:1,flexDirection:'row'}}>
                    <Text numberOfLines={2}>
                    {rowData.structured_formatting.main_text}
                    </Text>
                </View>
                <View style={{flex:1,flexDirection:'row'}}>
                    <Text
                        multiline={true}
                        numberOfLines={2}
                        style={{
                        	fontSize:12,
                        	width:280
                        }}
                    > 
                        {rowData.structured_formatting.secondary_text}
                    </Text>
                </View>
            </>
        )
    };  
  
    _onPress = (rowData) => {
   	    //console.log("ON PRESS");
        Keyboard.dismiss();

        // fetch details
        const request = new XMLHttpRequest();
        //_requests.push(request);
        request.timeout = 1000;
        //request.ontimeout = props.onTimeout;
        request.onreadystatechange = () => {
            if (request.readyState !== 4) return;

            if (request.status === 200) {
                const responseJSON = JSON.parse(request.responseText);
                if (responseJSON.status === 'OK') {
                    // if (_isMounted === true) {
                    const details = responseJSON.result;
                    //console.log(details);
                    const coordinates = {
        		      	latitude: details.geometry.location.lat, 
        		      	longitude: details.geometry.location.lng,
    		        };
                    //console.log("ROW DATA",rowData);
    			    this.setState({
    			    		destination:rowData.description
    			    },()=>{
                        //alert(this.state.driverId);
                        //	alert(details.geometry.location.lat);
                        //alert(details.geometry.location.lng);
                        geocollection
        		        .doc(this.state.driverId)
        		        .set({
        		            destnation:rowData.description,
            					coordinates:  new firebase.firestore.GeoPoint(details.geometry.location.lat, details.geometry.location.lng),
        		            driverId: Number(this.state.driverId),
        		        });
                        this.setState({
                            driverDest: rowData.description
                        })
                        //this.props.navigation.goBack();
                    })
                    this.myRefbt.current.snapTo(2);
                } else {
                    /*_disableRowLoaders();

                    if (props.autoFillOnNotFound) {
                      setStateText(_renderDescription(rowData));
                      delete rowData.isLoading;
                    }

                    if (!props.onNotFound) {
                      console.warn(
                        'google places autocomplete: ' + responseJSON.status,
                      );
                    } else {
                      props.onNotFound(responseJSON);
                    }
                    */
                }
            } else {
				console.warn(
                    'google places autocomplete: request could not be completed or has been aborted',
                );
             /* if (!props.onFail) {
                console.warn(
                  'google places autocomplete: request could not be completed or has been aborted',
                );
              } else {
                props.onFail('request could not be completed or has been aborted');
              }
              */
            }
        };      
        const query =  {
		    key: 'AIzaSyAr2ESV30J7hFsOJ5Qjaa96u9ADSRX6_Sk',
		    language: 'en',
		    types: ['geocode','locality'],
		};
		const url ='https://maps.googleapis.com/maps/api';
        request.open(
            'GET',
            `${url}/place/details/json?` +
              Qs.stringify({
                key: query.key,
                placeid: rowData.place_id,
                language: query.language,
              }),
        );

        request.withCredentials = true;
        request.send();
    };
  
  
    leftIconS = () =>(
        <TextInput.Icon 
            name="keyboard-backspace" 
            color={'#3f78ba'} 
            onPress={()=>{ this.props.navigation.goBack()}} 
            style={{justifyContent:'center',alignSelf:'center',alignContent:'center',marginTop:15}} 
        />
    );

    removeLocation = () => {
        db.collection("driver_destination")
        .doc(this.state.driverId)
        .delete()

        this.setState({
            driverDest:null
        })
    }
   
    render() {      
        return (
            <PaperProvider theme={theme}>                
                <View style={{marginTop:StatusBarheight,flex:1,backgroundColor:'#FFF',height:50}}>
                    <View style={{backgroundColor:'#fff',flexDirection:'row',height:60,elevation:2}}>
                        <Grid>
                	       <Row>
                                <Col size={12} style={{borderBottomWidth:1,borderBottomColor:'#E0E0E0'}}>
                                    <TextInput
                                        ref={(input) => { this.pickupTextInput = input; }}
                                        placeholder="Destination" 
                                        placeholderTextColor="grey"
                                        value={this.state.destination}
    				                    onChangeText={(val) =>{ 
                                            this.setState({destination:val},()=>{
    				        				    console.log("change text");
    				                        })
    				                        this.debounceLog(val);
    				                    }}
                                        onFocus={(e) =>{
                                        	 this.myRefbt.current.snapTo(0)
                                        }}
                                        underlineColor={'transparent'}
                                        outlineColor='transparent'
                                        selectionColor='#C0C0C0'
                                        theme={{roundness:0,colors:{primary:'#fff',underlineColor:'transparent'}}} 
                                        style={[styles.ubarFont,{backgroundColor:'transparent', 
                                        height: 45,
                                        borderRadius: 6,
                                        paddingVertical: 5,
                                        paddingHorizontal: 20,
                                        fontSize: 17,
                                        flex: 1,
                                        marginBottom: 5}]}
                                        left={this.leftIconS()}
                                    />
                                </Col>
                	       </Row>
                        </Grid>
                    </View>
                    {
                        this.state.driverDest
                        ?
                            <View style={{padding:10,margin:15,borderRadius:4,elevation:2}}>
                                <View style={{flexDirection:'row',alignItems:'center'}}>
                                    <View style={{padding:8}}>
                                        <FontAwesome name="location-arrow" size={24} color="grey" />
                                    </View>
                                    <View style={{flex:1}}>
                                        <Text>{this.state.driverDest}</Text>
                                    </View>
                                    <TouchableOpacity style={{padding:8}}
                                        onPress={() => {
                                            this.removeLocation()
                                        }}
                                    >
                                        <FontAwesome name="trash" size={24} color="grey" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        :
                        null 
                    }
                </View>
                
                <BottomSheet
               		keyboardAware
               		keyboardAwareExtraSnapHeight={true}
               		onChangeKeyboardAwareSnap={true}
                    ref={this.myRefbt}
                    snapPoints={this.state.snaptoval}
                    borderRadius={10}
                    renderContent={this.renderContent}
                    enabledContentTapInteraction={false}
                    enabledBottomClamp={true}
                    initialSnap={this.state.initialSnap}

                />	              
            </PaperProvider>
        )
    }        

}  


const stylesLocal = StyleSheet.create({    
    vehicelbox:{
        backgroundColor: '#155aa8',        
        margin:10,        
        elevation: 4,
        borderRadius:5,
        justifyContent:'center',
        alignContent:'center',
        paddingVertical:15,
        width:150,        
    },serachbox:{
		zIndex:101,
			position:'absolute',
			top:'8%',
			marginLeft:10,
		   borderWidth:0,
	       borderColor:'#135aa8',
		    width: 40,
		    height: 40,
	       alignItems:'center',
	       justifyContent:'center',
	       backgroundColor:'#fff',
	       borderRadius:25,
	        shadowColor: "#000",
			shadowOffset: {
				width: 0,
				height: 3,
			},
			shadowOpacity: 0.27,
			shadowRadius: 4.65,
			elevation: 6,
	},

});      