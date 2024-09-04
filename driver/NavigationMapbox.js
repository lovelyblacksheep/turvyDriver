import * as React from "react";
import { StyleSheet, View, Text, Linking, AppState } from "react-native";
import MapboxNavigation from "@homee/react-native-mapbox-navigation";
import {theme, DOMAIN} from './Constant';
import {  
	Provider as PaperProvider,
	Appbar,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as firebase from "firebase";
import firestore from '@react-native-firebase/firestore';
import * as geofirestore from 'geofirestore';
import apiKeys from './config/keys';
import Geolocation from 'react-native-geolocation-service';

if (!firebase.apps.length) {
    firebase.initializeApp(apiKeys.firebaseConfig);
}

const db = firestore();
const GeoFirestore = geofirestore.initializeApp(db);
const geocollection = GeoFirestore.collection('driver_locations');

export default class NavigationMapbox extends React.Component {
	constructor(props) {
        super(props);
		console.log('params',this.props)

		
			//this.props.handleMapBoxState()
		

		this.state = {
			origin:this.props.origin,
			destination:this.props.dest ? this.props.dest : null,
			bookId:this.props.book_id,
			heading:0,
			isDeparted: this.props.isDeparted,
			distKM:0,
			multStep:0,
			firstWaypoint:[],
			secondWaypoint:[],
			reinit:true,
			speedLimit:0,
			prevTime:0,
			prevDist:0,
			speed:0,
			callOnce:false
		}

		this.naveBottomSheetRef = React.createRef();
	}

	componentDidMount = () => {
		if((Object.keys(this.props.dest).length <= 0)){
			this.props.handleMapBoxState()
		}

		if(this.props.navCallFor == 'destination'){
			if(Object.keys(this.props.waypoints).length > 0){
				this.setState({
					firstWaypoint:[this.props.waypoints[0].stop_lng,this.props.waypoints[0].stop_lat]
				})
			}
			if(Object.keys(this.props.waypoints).length > 1){
				this.setState({
					secondWaypoint:[this.props.waypoints[1].stop_lng,this.props.waypoints[1].stop_lat]
				})
			}
			
		}
		
	}

	locationChange = (event) => {
		const { latitude, longitude, bearing, speedLimit } = event.nativeEvent;
		
		let sp = speedLimit.split(',')[0]
		sp = sp.split('=')[1]
		//console.log('speedLimit==============', speedLimit, sp)
		//console.log('bearing==============', bearing)
		if(sp > 0){
			this.setState({
				speedLimit:sp
			})
		}
		
		//this.getMapHeading(event.nativeEvent, this.state.destination)
		AsyncStorage.getItem('driverId').then((value) => {
			geocollection
			.doc(value)
			.update({
				coordinates: new firestore.GeoPoint(latitude, longitude),
				updated_at: firestore.FieldValue.serverTimestamp(),
				heading:bearing,
			})
		})
		if(this.state.isDeparted == true){
            
			db.collection("trip_path")
			.doc(JSON.stringify(this.state.bookId))
			.update({
				location: firestore.FieldValue.arrayUnion(new firestore.GeoPoint(latitude, longitude)),
			})
			.then(() => {
				//console.log('locationChange Loc updated DEparted!');
			});
        }
		
	}
	
	_routeProgressChange = (event) => {
		const {prevTime, prevDist} = this.state
		const {
			distanceTraveled,
			durationRemaining,
			fractionTraveled,
			distanceRemaining,
		} = event.nativeEvent;
		//console.log('durationRemaining================',durationRemaining)

		//drive use waze or google navigation
		//then replace other navigation screen before 1 min remaining
		//if(AppState.currentState == 'active'){
		if(durationRemaining < 70 && this.props.isOtherNevigation && AppState.currentState != 'active'){
			
			//console.log('AppState.currentState==============', AppState.currentState)
			
			Linking.openURL('com.turvy.turvydriver://')
		}

		if(prevTime <= 0){
			this.setState({
				prevTime: durationRemaining
			})
		}
		if(prevDist <= 0){
			this.setState({
				prevDist: distanceRemaining
			})
		}
		let distKM = 0;
		if(distanceTraveled){
			distKM = distanceTraveled / 1000
			this.setState({
				distKM: distKM
			})
		}
		//distanceTraveled
		if(this.state.isDeparted == true){
			db.collection("trip_path")
			.doc(JSON.stringify(this.state.bookId))
			.update({
				distance: distKM,
			})
			.then(() => {
				//console.log('_routeProgressChange Loc updated DEparted!', distKM);
			});
        }

		
		this._calculateSpeed(durationRemaining,distanceRemaining)
		
		this.props.handleDuration(durationRemaining, distanceRemaining, distanceTraveled)

		//console.log('distanceRemaining===============================>', distanceRemaining)
		//console.log('distanceTraveled===============================>', distanceTraveled)

		/* if(distanceRemaining <= 100 && this.state.multStep == 1){
			console.log('this.state.multStep===============================>', this.state.multStep)
			
			this.setState({
				destination: this.state.destination,
				multStep:2
			})
		} */
	}

	_calculateSpeed = (nexrTime,nextDist) => {
		let currTime,currDist
		const {prevTime, prevDist} = this.state

		currTime = (prevTime - nexrTime)
		currDist = (prevDist - nextDist)
		let speed = currDist / currTime //speed in m/s

		speed = (speed*60*60)/1000 //convert KM/h

		//console.log('speed================:',Math.round(speed))

		this.setState({
			prevTime:nexrTime,
			prevDist:nextDist,
			speed: Math.round(speed)
		})

		
	}

	render() { 
		const {origin, destination, bookId,speedLimit,speed} = this.state
		//console.log('destination===============================>', this.state.firstWaypoint)
		let firstWaypoint = []
		let secondWaypoint = []
		if(this.props.navCallFor == 'destination'){
			if(Object.keys(this.props.waypoints).length > 0){
				firstWaypoint = [this.props.waypoints[0].stop_lng,this.props.waypoints[0].stop_lat]
			}
			if(Object.keys(this.props.waypoints).length > 1){
				secondWaypoint = [this.props.waypoints[1].stop_lng,this.props.waypoints[1].stop_lat]
			}
		}
		/* 
		origin={[-97.760288, 30.273566]}
        destination={[-97.918842, 30.494466]}
		origin={[origin.longitude, origin.latitude]}
        					destination={[destination.longitude, destination.latitude]}
		*/
		
		return (
			<PaperProvider theme={theme}>
				<View style={{height:30}}></View>
				{
				this.state.reinit &&
				<View style={styles.container}>
					{
						(Object.keys(destination).length) > 0 && (Object.keys(origin).length) > 0
						?
						<>
						<MapboxNavigation
							
							origin={[origin.longitude, origin.latitude]}
        					destination={[destination.longitude, destination.latitude]}
							firstWaypoint={firstWaypoint.length > 0 ? firstWaypoint: null}
							secondWaypoint={secondWaypoint.length > 0 ? secondWaypoint: null}
							shouldSimulateRoute={false}
							showsEndOfRouteFeedback={false}
							onLocationChange={(event) => this.locationChange(event)}
							onRouteProgressChange={(event) => this._routeProgressChange(event)}
							onError={(event) => {
								const { message } = event.nativeEvent;
								console.error('mapbox navigation error================>', message)
							}}
							onCancelNavigation={() => {
								this.props.handleMapBoxState()
								this.props.handleTravlDist(this.state.distKM)
							}}
							onArrive={() => {
								//console.log('on arrive================>')
								setTimeout(()=>{
									this.props.handleMapBoxState()
									this.props.handleTravlDist(this.state.distKM)

								}, 10000)
								
							}}
							isMapDark={this.props.isMapDark}
							mute={this.props.mute}
						/>
						{/*
							speed > speedLimit && speedLimit > 0
							&&
						<View
							style={{position:'absolute',left:20,bottom:180,backgroundColor: '#E8202A',padding:5,alignItems:'center',justifyContent:'center',borderRadius:5,elevation:5,flexDirection:'column',height:50,width:55}}
						>
							<Text style={{fontSize:24,fontWeight:'bold',marginTop:-6,color:'#FFF'}}>{speed}</Text>
							<Text style={{fontSize:14,marginTop:-5,color:'#FFF'}}>Speed</Text>
						</View>
						*/}
						{
							speedLimit > 0 
							&&
						<View
							style={{position:'absolute',left:20,bottom:150,backgroundColor:'#FFF',padding:5,alignItems:'center',justifyContent:'center',borderRadius:5,elevation:5,flexDirection:'column',height:50,width:55}}
						>
							<Text style={{fontSize:24,fontWeight:'bold',marginTop:-6,}}>{speedLimit}</Text>
							<Text style={{fontSize:17,marginTop:-5,}}>Limit</Text>
						</View>
						}
						</>
						
						:
						null
					}
				</View>
				}
				{/* <View style={{flex:1}}>
				</View> */}
				
			</PaperProvider>
		);
	}
};

const styles = StyleSheet.create({
	container: {
		flex: 1,	
	},
});
