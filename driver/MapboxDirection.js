import * as React from "react";
import { StyleSheet, View, Text } from "react-native";
import {theme, DOMAIN, MapboxStyleURL, debug} from './Constant';
import {  
	Provider as PaperProvider,
	Appbar,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

import  MapboxGL, { MapView, Camera, UserLocation, PointAnnotation } from '@react-native-mapbox-gl/maps';
import { lineString as makeLineString } from '@turf/helpers';
import { point } from '@turf/helpers';
import { EvilIcons,Ionicons,MaterialCommunityIcons,FontAwesome5,Feather,AntDesign,Entypo } from '@expo/vector-icons'; 
import Geolocation from 'react-native-geolocation-service';
import { moderateScale } from "react-native-size-matters";
export default class MapboxDirection extends React.Component {
	constructor(props) {
        super(props);
		//console.log('params',this.props)
        this.startPoint = [151.2195, -33.8688];
        this.finishedPoint = [151.2195, -33.8688];

		this.state = {
			origin:this.props.origin,
			destination:this.props.dest,
            destName:this.props.destName,
            sourceName:this.props.sourceName,
            driverLocation:{},
			heading:0,
			isDeparted: this.props.isDeparted,
			distKM:0,
            coordinates: [151.01108000, -34.07465730],
            routecorrdinates:[
                this.startPoint, //point A "current" ~ From
                this.finishedPoint, //Point B ~ to
            ],
            routedirect: {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'LineString',
                        coordinates: [
                            this.startPoint, //point A "current" ~ From
                            this.finishedPoint, //Point B ~ to
                        ],
                    },
                    style: {
                        fill: 'red',
                        strokeWidth: '10',
                        fillOpacity: 0.6,
                        lineWidth:6,
                        lineColor:'#fff'
                    },
                    paint: {
                        'fill-color': '#088',
                        'fill-opacity': 0.8,
                    },
                },
                ],
            },
            routediver: {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'LineString',
                        coordinates: [
                            this.startPoint, //point A "current" ~ From
                            this.finishedPoint, //Point B ~ to
                        ],
                    },
                    style: {
                        fill: 'red',
                        strokeWidth: '10',
                        fillOpacity: 0.6,
                        lineWidth:6,
                        lineColor:'#fff'
                    },
                    paint: {
                        'fill-color': '#088',
                        'fill-opacity': 0.8,
                    },
                },
                ],
            },
		}
	}

    componentDidMount = () => {
        Geolocation.getCurrentPosition(
            (currntPos) => {
                
                let driverLocation ={};
                driverLocation ={
                    latitude : currntPos.coords.latitude,
                    longitude :currntPos.coords.longitude
                }
                this.setState({
                    driverLocation:driverLocation,
                    coordinates: [currntPos.coords.longitude, currntPos.coords.latitude],
                    
                })
            },
            (error) => {
                console.log(error.code, error.message);
            },
            { forceRequestLocation: true, distanceFilter:0, enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        )

        Geolocation.watchPosition((curCoords) => {
            let driverLocation ={};
                driverLocation ={
                    latitude : curCoords.coords.latitude,
                    longitude :curCoords.coords.longitude
                }
                this.setState({
                    driverLocation:driverLocation,
                    coordinates: [curCoords.coords.longitude, curCoords.coords.latitude],
                    heading:curCoords.coords.heading
                },() => {
                    //this.getLnglatdriver2source(this.state.driverLocation)
                })

                
                /* if(this.camera){
                    this.camera.flyTo([curCoords.coords.longitude, curCoords.coords.latitude], 12000)
                    //this.camera.zoomTo(16, 100)
                } */
                
        },
        (error) => {
            console.log(error.code, error.message);
        },
        { accuracy:Platform.OS == 'android'?'high':'best', distanceFilter:2, interval:2000, fastestInterval:1000, enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
    }

    onDidFinishLoadingMap = (index) => {
        //console.log('onDidFinishLoadingMap',this.state.origin)
        let srcdestCords = []
        let srcdest = [this.state.origin.longitude, this.state.origin.latitude];
        srcdestCords.push(srcdest);

        srcdest = [this.state.destination.longitude, this.state.destination.latitude];
        srcdestCords.push(srcdest);

        //console.log('onDidFinishLoadingMap==========================>',srcdestCords)

        let locationcordsapistr = srcdestCords.join(";");

        //console.log('locationcordsapistr==========================>',locationcordsapistr)
        fetch('https://api.mapbox.com/directions/v5/mapbox/driving/'+locationcordsapistr+'?geometries=geojson&access_token=pk.eyJ1IjoibWFsLXdvb2QiLCJhIjoiY2oyZ2t2em50MDAyMzJ3cnltMDFhb2NzdiJ9.X-D4Wvo5E5QxeP7K_I3O8w',{
				method: 'GET',
	 		}).then(function (response) {
	 			return response.json();
	  		}).then( (result)=> {

	  			//console.log("Data from api geomery ===============>",debug(result.routes[0].geometry));


                  this.setState({
                    routecorrdinates: Object.values(result),
                    routemap:makeLineString(result.routes[0].geometry.coordinates),
                    routedirect: {
                        type: 'FeatureCollection',
                        features: [{
                            type: 'Feature',
                            properties: {},
                            geometry: {
                                type: 'LineString',
                                coordinates: Object.values(result.routes[0].geometry.coordinates),
                            },
                            style: {
                                fill: 'red',
                                strokeWidth: '20',
                                fillOpacity: 0.6,
                            },
                            paint: {
                                'fill-color': '#088',
                                'fill-opacity': 0.8,
                            },
                            },
                        ],
                    },
                    },() =>{
                        this.camera.fitBounds([this.state.origin.longitude, this.state.origin.latitude], [this.state.destination.longitude,this.state.destination.latitude],[150,40,250,20],1000);
                        this.getLnglatdriver2source(this.state.driverLocation)
                    })
                  

            })
    }

    async getLnglatdriver2source(dLocation){

        console.log("dLocation ================>",this.state.driverLocation)

    	let loctstring = dLocation.longitude+','+dLocation.latitude+';'+this.state.origin.longitude+','+this.state.origin.latitude;

        console.log("loctstring ================>",loctstring)
    	
    	fetch('https://api.mapbox.com/directions/v5/mapbox/driving/'+loctstring+'?geometries=geojson&access_token=pk.eyJ1IjoibWFsLXdvb2QiLCJhIjoiY2oyZ2t2em50MDAyMzJ3cnltMDFhb2NzdiJ9.X-D4Wvo5E5QxeP7K_I3O8w',{
				method: 'GET',
	 		}).then(function (response) {
	 			return response.json();
	  		}).then( (result)=> {
	  			console.log("Data from api geomery ================>",result);

                this.setState({
	  			
                    routediver: {
                        type: 'FeatureCollection',
                        features: [{
                            type: 'Feature',
                            properties: {},
                            geometry: {
                                type: 'LineString',
                                coordinates: Object.values(result.routes[0].geometry.coordinates),
                            },
                            style: {
                                fill: 'red',
                                strokeWidth: '20',
                                fillOpacity: 0.6,
                            },
                            paint: {
                                'fill-color': '#088',
                                'fill-opacity': 0.8,
                            },
                        },
                        ],
                    },
             
                },() => {
                    /* this.camera.fitBounds([this.state.origin.longitude, this.state.origin.latitude], [this.state.driverLocation.longitude,this.state.driverLocation.latitude],[150,40,250,20],1000); */
                });
            });
  
    } 
    
    pressOnMap = () => {
        this.props.handleMapBoxDirection()
    }

	render() { 
		const {origin, destination, bookId} = this.state
		//console.log('jkjkjkjj=================', this.state.origin.longitude)

		return (
			<>
                <MapView
					ref={(c) => (this._map = c)}
					onDidFinishLoadingMap={(index) => {this.onDidFinishLoadingMap(index)}}
					style={{flex:1}}
					styleURL={MapboxStyleURL}
                    onPress={() => {this.pressOnMap()}}
                    compassEnabled={true}
                    
				>
					<Camera 
                        zoomLevel={16} 
                        pitch={50} 
                        centerCoordinate={this.state.coordinates}
                        ref={(c) => (this.camera = c)}
                        animationMode={'flyTo'}
                        animationDuration={12000}
                        minZoomLevel={1}
                        
                    />

					<UserLocation renderMode={'native'} androidRenderMode={'gps'} visible={true} showsUserHeadingIndicator={true} />

                    <MapboxGL.ShapeSource  id="mapbox-directions-source" shape={this.state.routedirect}>
                        <MapboxGL.LineLayer
                            id="mapbox-directions-line"
                            style={{lineColor:'#135AA8',lineWidth:5}}
                            />
                    </MapboxGL.ShapeSource> 
                    <MapboxGL.ShapeSource 
                        id="mapbox-directions-driver" shape={this.state.routediver}>
			            <MapboxGL.LineLayer
                            id="mapbox-directions-driver-line"
                            style={{lineColor:'#000',lineWidth:5}}
                            />
                    </MapboxGL.ShapeSource> 

                    {/* {this.state.origin.latitude && this.state.origin.longitude 
                    ?
                    <>
                        <MapboxGL.PointAnnotation 
                        id={'markerorigin'}
                            anchor={{ y: 1, x: 0.5 }}
                        coordinate={[this.state.origin.longitude, this.state.origin.latitude]}>
                            <FontAwesome5 name="map-marker-alt" size={30} color={"#135AA8"} />
                        </MapboxGL.PointAnnotation>

                        <MapboxGL.PointAnnotation 
                        id={'originName'}
                            anchor={{ y: 1, x: 0 }}
                        coordinate={[+this.state.origin.longitude, +this.state.origin.latitude]}>
                            <View style={{
                                        borderColor:'#135AA8',
                                        borderWidth:moderateScale(1),
                                        width:moderateScale(200),
                                        backgroundColor:'#fff',
                                        height: moderateScale(50),
                                        alignContent:'flex-start',
                                        flex:1,
                                        flexDirection:'row',
                                        borderRadius:moderateScale(3),
                                        padding:5,
                                        position:'absolute',
                                        left:100,
                                        }}>
                                <Text>{this.state.sourceName}</Text>
                            </View>
                        </MapboxGL.PointAnnotation>
                    </>
                    
                    :null
                    }
                    
                    {this.state.destination.latitude && this.state.destination 
                    ?
                    <>
                    <MapboxGL.PointAnnotation 
			           id={'markerdestination'}
			            anchor={{ y: 1, x: 0.5 }}
			           coordinate={[+this.state.destination.longitude, +this.state.destination.latitude]}>
                        <FontAwesome5 name="map-marker-alt" size={30} color={"#910101"} />
                                
	                </MapboxGL.PointAnnotation>
                    <MapboxGL.PointAnnotation 
			           id={'destinationText'}
			            anchor={{ y: 1, x: 1 }}
			           coordinate={[+this.state.destination.longitude, +this.state.destination.latitude]}>
                        <View style={{
                            borderColor:'#135AA8',
                            borderWidth:moderateScale(1),
                            width:moderateScale(200),
                            backgroundColor:'#fff',
                            height: moderateScale(50),
                            alignContent:'flex-start',
                            flex:1,
                            flexDirection:'row',
                            borderRadius:moderateScale(3),
                            padding:5,
                            position:'absolute',
                            left:100,
                            }}>
			             <Text>{this.state.destName}</Text>
			           </View>
                                
	                </MapboxGL.PointAnnotation>
                    </>
                    :null
                    } */}
				</MapView>
            </>
		);
	}
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		zIndex:200
	},
});
