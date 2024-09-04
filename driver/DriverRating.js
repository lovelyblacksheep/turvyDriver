import React from "react";
import { StyleSheet, Text, View,Dimensions,Image,ScrollView ,TouchableOpacity,ActivityIndicator,BackHandler,StatusBar,Platform,Linking,TextInput,TouchableHighlight} from 'react-native';
//import * as Permissions from 'expo-permissions';
import MapView , { Marker , Polyline ,Callout }from 'react-native-maps';
import * as Location from 'expo-location';
import Animated from 'react-native-reanimated';
import BottomSheet from 'reanimated-bottom-sheet';
import { Button,Divider } from 'react-native-paper';
import { Col, Row, Grid } from "react-native-easy-grid";
import { Rating, AirbnbRating } from 'react-native-ratings';
import { EvilIcons,Ionicons,MaterialCommunityIcons,FontAwesome5,Feather,AntDesign } from '@expo/vector-icons'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Input } from 'react-native-elements';
//custom files
import GradientButton from './GradientButton';
import {DOMAIN} from './Constant'

const { width, height } = Dimensions.get('window');

export default class DriverRating extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			inprocessing:0,
			riderAgrRating:0,
			tipVal:0,
			accessTokan:'',
            driverId: '',
            showBottomSheet:1,
            screenHeight: height*.85,
            rateError:'',
            rateSuccess:'',
            feedbackText:'',
            showCustom:0,
            bookingresponse:{},
            tripTime:{
        		arrivalTime:'',
        		pickupTime:'',
        	},
        	riderRating:5,
        	rideravtar:'',
			active:1
		}
	}

	async componentDidMount() {
		await AsyncStorage.getItem('accesstoken').then((value) => {           
            if(value != '' && value !== null){
                this.setState({
                    accessTokan:value
                });
            }
        })
        //console.log('bookparam:',this.props.route.params.bookId)
       	let bookId = this.props.route.params.bookId

        await fetch(DOMAIN+'api/driver/running-book/'+bookId,{
            method: 'GET',
            headers : {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer '+this.state.accessTokan
            }            
        }).then(function (response) {
            return response.json();
        }).then( (result)=> {            
            this.setState({
            	rideravtar:result.data.avatar, 	
            	bookingresponse : result.data,
            },() =>{
            	//console.log('earning1212:',this.state.bookingresponse,)
            	let riderId = this.state.bookingresponse.rider_id
        
		        fetch(DOMAIN+'api/driver/riderRating/'+riderId,{
		            method: 'GET',
		            headers : {
		                'Content-Type': 'application/json',
		                'Accept': 'application/json',
		                'Authorization': 'Bearer '+this.state.accessTokan
		            }            
		        }).then(function (response) {
		            return response.json();
		        }).then( (result)=> {
		            //console.log('earning12:',result)
		            this.setState({riderAgrRating:result.data})
		        })
            })
            
        })

	   	 /*this.setState({
	   	 	bookingresponse : this.props.route.params.bookrequest,
	   	 });*/

        
        this.setState({rateError:''})

        this.setState({
        	rateError:'',
        	tripTime:{
        		arrivalTime:this.formatAMPM(this.state.bookingresponse.end_time),
        		pickupTime:this.formatAMPM(this.state.bookingresponse.start_time),
        	}
        })


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


	ratingCompleted =(rating) =>{
  		console.log(rating);
		if(rating > 4){  
			this.setState({
				riderRating:rating
			})
		}else{
			this.setState({
				riderRating:rating,
			})
		}
  	};

	rateRider = () => {
		this.setState({
			inprocessing:1,
			screenHeight: height*.57,
		})
	}

  	async submit(){
  		
  		if(this.state.riderRating <= 0){
  			this.setState({rateError:'Please provide rating.'})
  			return false;
  		}

  		//(Number) = book_id
  		await fetch(DOMAIN+'api/driver/book/feedback/'+this.state.bookingresponse.id,{
            method: 'POST',
            headers : {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer '+this.state.accessTokan
            },
            body: JSON.stringify({
                "rate" : this.state.riderRating,
                "comment": this.state.feedbackText,
				"option":this.state.active
            })
        }).then(function (response) {
            return response.json();
        }).then( (result)=> {
            console.log('feedback',result)
            if(result.status === 1){

	            this.setState({screenHeight:height/3})
	            this.setState({rateSuccess:result.message});	            
	            setTimeout(() => {
					this.setState({showBottomSheet:0});
					this.props.navigation.replace('MapViewFirst');
				}, 5000)

	        }
        })
        
  	}

	optionPress = (active) => {
		this.setState({
			active:active
		})
	}

  	renderSuccess = () => (
	    <>
		    <View
		      style={{
		        backgroundColor: 'white',
		        padding: 15,
		        height: '100%',
		        margin:10,
		        shadowColor: "#000",
				  shadowOffset: {
						width: 0,
						height: 2,
					},
					shadowOpacity: 0.23,
					shadowRadius: 2.62,
					elevation: 4,
					borderRadius:10,
		      }}
		    >
		    <Grid>
			   	<Row style={{height:200,alignItems:'center',justifyContent:'center'}}>
			   		<Text style={{fontSize:19,color:'green'}}>
			   			{this.state.rateSuccess}
			   		</Text>
			   	</Row>
			</Grid>   	
		    </View>
	    </>
	)

	renderContent = () => (
    <>

    <View
      style={{
        backgroundColor: 'white',
        padding: 15,
        height: '100%',
        margin:10,
        shadowColor: "#000",
		  shadowOffset: {
				width: 0,
				height: 2,
			},
			shadowOpacity: 0.23,
			shadowRadius: 2.62,
			elevation: 4,
			borderRadius:10,
      }}
    >
  
    {this.state.inprocessing == 0 ? 
   	( 
   	<Grid>
	   	<Row style={{height:30}}>
	   		
	   		<Col>
	   			<Ionicons 
	   				name="arrow-back" 
	   				size={24} 
	   				color="transparent" 
	   			/>
	   		</Col>
	   		<Col><Text style={{fontSize:19,textAlign:'center'}}>You Arrived</Text></Col>
	   		<Col style={{alignItems:'flex-end'}}>
	   			<Ionicons 
	   				name="close" 
	   				size={24} 
	   				color="black" 
	   				onPress={() => this.props.navigation.replace('MapViewFirst')}
	   			/>
	   		</Col>
	   	</Row>
   		<Divider style={{marginBottom:5,marginTop:10}} />
   		<Row style={{height:60}}>
   			<Col size={6}>
   				<View style={{alignContent:'center',justifyContent:'center',flex:1,flexDirection:'row'}}>
   					<Row style={{flex:1,alignItems:'center',justifyContent:'center'}}>
						<Col style={{width:60}}>
                            {
                                this.state.rideravtar
                                ?
                                <Image 
                                    source={{uri: DOMAIN+this.state.rideravtar}} 
                                    style={{alignItems:'center', width:50,height:50,borderRadius:5}}
                                />
                                :     
                                <Image 
                                    source={require('../assets/driver.jpg')} 
                                    style={{alignItems:'center', width:50,height:50,borderRadius:5}}
                                />
                            }
						</Col>
						<Col style={{width:150}}>
							<Text>{this.state.bookingresponse.rider_name}</Text>
							<View style={{flexDirection:'row'}}>
								{
								this.state.riderAgrRating
								?
								<Ionicons name="ios-star" size={16} color="#FFAA01" />
								:
								<Ionicons name="ios-star" size={16} color="#ccc" />
								}
                                <Text> {this.state.riderAgrRating}</Text>
							</View>
						</Col>
						<Col style={{alignItems:'flex-end'}}>
							<Text style={{fontSize:12,color:'gray'}}>Arrival Time</Text>
							<Text style={{fontSize:12,fontWeight:'bold'}}>{this.state.tripTime.arrivalTime}</Text>
						</Col>
					</Row>
				</View>
			</Col>
   		</Row>
   		<Divider style={{marginBottom:5,marginTop:5}} />
		<Row style={{height:40}}>
			<Col size={12} style={{padding:6}}>
			<Text>TRIP</Text>
			</Col>
		</Row>
   		<Row style={{height:55}}>
			<Col size={2} style={{justifyContent:'center',alignContent:'center',alignItems:'center'}}>
				<View  style={{alignSelf:'center',backgroundColor:'#135AA8',width:15,height:15,borderRadius:30,marginTop:3}}></View>
				<View style={{flex:1,width:1,height:'30%', borderStyle: 'solid',borderRadius:1, borderColor:'black',borderLeftWidth:1}}></View>
			</Col>
			<Row size={12}>
				<Col size={8}><Text >{this.state.bookingresponse.origin}</Text></Col>
				<Col size={2}><Text style={{ fontSize:13, color:'grey'}}>{this.state.tripTime.pickupTime}</Text></Col>
			</Row>
		</Row>
		<Row style={{height:40,marginLeft:-2,marginTop:-15}}>
			<Col size={2} >
				<Button icon="square" color={'#000000'}></Button>				
			</Col>
			<Row  size={12}>
				<Col size={8} ><Text style={{ paddingTop:8}}>{this.state.bookingresponse.destination}</Text></Col>
				<Col size={2} >
					<Text style={{ fontSize:13, color:'grey', paddingTop:10}} >{this.state.tripTime.arrivalTime}</Text>
				</Col>
			</Row>
		</Row>
		<Divider style={{marginBottom:5,marginTop:25}} />
		<Row style={{height:280}}>
			<Col style={{flex:1,alignContent:'center',justifyContent:'center',alignItems:'center'}}>
				{/* <Row style={{height:70}}>
   					<Col size={12} style={{padding:6}}>
   						<Text style={{textAlign:'center',fontWeight:'bold',paddingBottom:10,fontSize:16}}>HOW IS YOUR TRIP?</Text>
   						<Text style={{textAlign:'center',color:'gray',fontSize:14}}>Your feedback will help us improve driving experience better.</Text>
   					</Col>
   				</Row> */}
   				<Row style={{height:250}}>
   					<Col>
				   		
   					 	<AirbnbRating
							count={5}
							reviews={[ "Terrible","Bad", "Good","Very Good", "Amazing"]}
							defaultRating={this.state.riderRating}
							size={35}
							onFinishRating={this.ratingCompleted}
							showRating={false}
							
						/>
						{
							this.state.riderRating === 5
							?
							<View style={{justifyContent:'center',alignItems:'center',marginTop:10}}>
								<Text style={{fontSize:20}}>Was your rider wearing a mask?</Text>
								<View style={{flexDirection:'row'}}>
									<TouchableOpacity onPress={() => this.optionPress(1)} style={[styles.radioBtn,{backgroundColor:this.state.active == 1 ? '#000' : '#ccc'}]}>
										<Text style={{color:'#FFF'}}>Yes</Text>
									</TouchableOpacity>
									<TouchableOpacity 
										 onPress={() => this.optionPress(2)}
										style={[styles.radioBtn,{backgroundColor:this.state.active == 2 ? '#000' : '#ccc'}]}>
										<Text style={{color:'#FFF'}}>No</Text>
									</TouchableOpacity>
								</View>
							</View>
							:
							this.state.riderRating < 5
							?
							<View style={{justifyContent:'center',marginTop:10,alignItems:'center'}}>
								<Text style={{fontSize:20}}>What went wrong?</Text>
								<View style={{flexDirection:'row',flexWrap:'wrap',justifyContent:'center',alignItems:'center'}}>
									<TouchableOpacity 
										 onPress={() => this.optionPress(1)}
									style={[styles.radioBtn,{backgroundColor:this.state.active == 1 ? '#000' : '#ccc'}]}>
										<Text style={{color:this.state.active == 1 ? '#FFF' : '#000'}}>No face cover or mask</Text>
									</TouchableOpacity>
									<TouchableOpacity 
										 onPress={() => this.optionPress(2)}
										style={[styles.radioBtn,{backgroundColor:this.state.active == 2 ? '#000' : '#ccc'}]}>
										<Text style={{color:this.state.active == 2 ? '#FFF' : '#000'}}>Late for pickup</Text>
									</TouchableOpacity>
									<TouchableOpacity 
										 onPress={() => this.optionPress(3)}
										style={[styles.radioBtn,{backgroundColor:this.state.active == 3 ? '#000' : '#ccc'}]}>
										<Text style={{color:this.state.active == 3 ? '#FFF' : '#000'}}>Disrespectful</Text>
									</TouchableOpacity>
									<TouchableOpacity 
										 onPress={() => this.optionPress(4)}
									style={[styles.radioBtn,{backgroundColor:this.state.active == 4 ? '#000' : '#ccc'}]}>
										<Text style={{color:this.state.active == 4 ? '#FFF' : '#000'}}>Conversation</Text>
									</TouchableOpacity>
									<TouchableOpacity 
										 onPress={() => this.optionPress(5)}
									style={[styles.radioBtn,{backgroundColor:this.state.active == 5 ? '#000' : '#ccc'}]}>
										<Text style={{color:this.state.active == 5 ? '#FFF' : '#000'}}>Other</Text>
									</TouchableOpacity>
								</View>
							</View>
							:
							null
						}
						
   					</Col>
   				</Row>
				<Row>
					<Col>
						<TouchableOpacity
							onPress={() => this.rateRider()} 
							style={{backgroundColor:'#000',alignItems:'center',paddingVertical:10}}
						>
							<Text style={{color:'#FFF',fontSize:18}}>Rate Rider</Text>
						</TouchableOpacity>
					</Col>
				</Row>
			</Col>
		</Row>
				
   	</Grid>
    ):(       	
       	<Grid>
		   	<Row style={{height:50}}>
		   		<Col>
		   			<Ionicons 
		   				name="arrow-back" 
		   				size={24} 
		   				color="black" 
		   				onPress={() => this.setState({
		   					inprocessing:0,
		   					screenHeight: height*.77,
		   				})}
		   			/>
		   		</Col>
		   		<Col><Text style={{fontSize:19,textAlign:'center'}}>Awesome!</Text></Col>
		   		<Col style={{alignItems:'flex-end'}}>
		   			<Ionicons 
		   				name="close" 
		   				size={24} 
		   				color="black" 
		   				onPress={() => this.props.navigation.replace('MapViewFirst')}
		   			/>
		   		</Col>
		   	</Row>
		   	<Row style={{height:40}}>
		   		<Col>
		   			{(this.state.riderRating === 1)
		   			?
		   			<Text style={{fontSize:15,textAlign:'center'}}>You rated {this.state.bookingresponse.rider_name} {this.state.riderRating} star</Text>
		   			:	
		   			<Text style={{fontSize:15,textAlign:'center'}}>You rated {this.state.bookingresponse.rider_name} {this.state.riderRating} stars</Text>
		   		}
		   		</Col>
		   	</Row>   			
	   		<Row style={{height:60}}>
				<Col size={12}>
					<AirbnbRating
						count={5}
						defaultRating={this.state.riderRating}
						size={35}
						isDisabled={true}
						showRating={false}
						selectedColor={'#FFAA01'}
					/>
				</Col>
			</Row>   			 
	   		<Row style={{height:110}}>
	   			<Col size={12}>
					<TextInput
						placeholder="Say something about trip?"
						blurOnSubmit={false}
						returnKeyType={"go"}
						style={styles.textInput}
						multiline={true}
						scrollEnabled={true}
						numberOfLines={50}
						underlineColorAndroid={"transparent"}
						autoCapitalize={"none"}
						autoCorrect={false}
						textAlignVertical = "top"
						onChangeText={value => {this.setState({feedbackText:value,rateError:''})}}
					/>
					<View style={{alignItems:'center'}}>
						<Text style={{color:'red'}}>{this.state.rateError}</Text>
					</View>
	   			</Col>
	   		</Row>
	   		<Col>	   		
			   	<View style={{paddingBottom:20,borderRadius:40,paddingTop:20}}>
					<TouchableOpacity             
					    style={styles.contentBtn} onPress={() => {this.submit(); }}>
					    <GradientButton title='Submit' />    
					</TouchableOpacity>
				</View>
			</Col>
   		</Grid>
   		
       )       
      } 
		
    </View>
   </>
  );

	render() {
		return (
			
				(this.state.showBottomSheet)
				?
				<>
				<BottomSheet
			        snapPoints={[this.state.screenHeight]}
			        borderRadius={20}
			        renderContent={(this.state.rateSuccess !== '') ? this.renderSuccess : this.renderContent}
			        overdragResistanceFactor={0}
			        enabledManualSnapping={false}
			        enabledContentTapInteraction={false}
			        enabledContentGestureInteraction={false}
			    />
			    </>
			    :
			    <></>
			
			
		);
	}
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: Dimensions.get('window').width,
    height: '100%',
  },
  tinyLogo:{
  	alignContent:'center',
  	height:50,
  	flex:1,
  	flexDirection:'row'
  },
  servicesbox:{
  	flexDirection:'column',
 	flex:1,
 	width:150,
 	height:150,
 	backgroundColor:'#e5e5e5',
 	borderWidth:1,
 	borderColor:'#e5e5e5',
 	padding:10,
 	margin:10,
 	alignItems:'center',
 	borderRadius:10,
 	justifyContent:'center'
  },
  servicebocimage:{
    width: '100%',
    aspectRatio: 1 * 1.4,
	 resizeMode: 'contain'
	},
	textInput: {
        borderRadius: 10,
        borderWidth: 1,
        borderColor:'#ddd',
        fontSize: 16,        
        marginHorizontal: 0,
        padding: 10,        
        height: 80,
    },
    tipBox:{
    	fontWeight:'bold',justifyContent:'center',alignContent:'center',height:50,borderWidth:1,borderRadius:5,marginHorizontal:10
    },
    contentBtn:{      
      backgroundColor:"#2270b8",
      justifyContent:'center',
	    alignItems:'center',
	    flexDirection:'row',    
	    borderRadius:50
	    
	 },
	 custInput: {
        borderRadius: 5,
        borderWidth: 1,
        borderColor:'gray',
        fontSize: 16,        
        marginHorizontal: 10,
        padding: 5, 
        width:120,
        textAlign:'center'
    },
	radioBtn:{
		paddingHorizontal:20,
		paddingVertical:10,
		backgroundColor:'#CCC',
		marginHorizontal:10,
		marginVertical:5,
		borderRadius:50,
	}
});