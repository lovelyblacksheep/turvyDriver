import { StatusBar } from 'expo-status-bar';
import debounce from 'lodash.debounce';
import React from "react";
import Qs from 'qs';
import { StyleSheet, Text, View ,Image,TouchableOpacity,FlatList,ScrollView,TouchableHighlight,Keyboard} from 'react-native';
import {  Provider as PaperProvider,Button,Appbar,TextInput } from 'react-native-paper';
//import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';
import { FontAwesome ,FontAwesome5,Octicons ,Ionicons} from '@expo/vector-icons'; 
import { styles,theme, DOMAIN} from '../Riders/Constant';
import { Col, Row, Grid } from "react-native-easy-grid";
import BottomSheet from 'reanimated-bottom-sheet';
const imagemarker = require('../assets/map-pin.png');
const imagestopwt = require('../assets/images/stopwatch.png');
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class AddaStop extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        	step:1,
        	 textInput:[],
         inputData:[],
         pickup:'',
         snaptoval:['45%', '30%', '0%'],
         initialSnap:2,
         currinpindex:'',
         inputext0:'',
         inputext1:'',
         input: {
	        inputext0: null,
	        inputext1: null,
	      },
	      destinationto:'',
	      destination:{},
	      stateText:'',
	      stopmain:'',
	      stopmainlnglat:{},
	      origin:{},
    };
    this.myRefbt = React.createRef();
    this.refinput0 = React.createRef();
    this.refinput1 = React.createRef();
   this._onPress = this._onPress.bind(this);
   }
  
  async componentDidMount(){
  const {navigation,state} = this.props;
   	console.log("ADD A STOP ",this.props.route.params);
         let pickup = this.props.route.params.bookingresponse.origin;
          if(Object.keys(this.props.route.params.origin).length > 0){
	      	//console.log("origin from");
	       	 origin = this.props.route.params.origin;
	       	 curlocatdesc=this.props.route.params.curlocatdesc;
			}   
			let destination = {};
			let longitudedest = '';
			let latitudedest= '';
			let destinationto ='';
			
			if(this.props.route.params.destination){
				destination = this.props.route.params.destination;
				longitudedest = destination.longitude;
				latitudedest = destination.latitude;
				destinationto = this.props.route.params.destinationto;
			}  
   		this.setState({ 
   		    state:this.props.route.params,
             pickup:pickup,
             latitudecur:origin.latitude,
	      	longitudecur:origin.longitude,
	      	latitudeDelta:0.00176,
	      	longitudeDelta:0.00176,
	      	origin:origin,
	      	destination:destination,
	      	latitudedest:latitudedest,
	      	longitudedest:longitudedest,
	      	curlocatdesc:curlocatdesc,
	      	destlocatdesc:destinationto,
         });
         
         this.unsubscribe =  navigation.addListener("focus",() => {
  			this.setState({ 
             state:this.props.route.params,
             textInput:[],
             inputData:[],  
             stopmain:'',
	      	 stopmainlnglat:{}, 
	      	 currinpindex:'',	
	      	 deltedmain:'',
	      	 input: {
		        inputext0: null,
		        inputext1: null,
		      },
         });
  			
  		});
   }
   
    UNSAFE_componentWillUnmount() {
      this.unsubscribe();
   }
   
     addValues = (val, index) => {
     	//this.state.inputData[index].text=val;
     	const newAnswer = [...this.state.inputData];
     	//console.log("TYPE INPTU "+index+" "+val);
            		    //newAnswer[index] = newValue    		  
		newAnswer[index] = {
			text:val,
			index:index,
		}
		this.setState({
      inputData: newAnswer,	
       currinpindex:index
    },()=>{
    	//console.log(this.state.inputData[index]);
    	//console.log(" IN PRINT "+this.state.inputData[index].text);
    });
    
   
    
     	/*
    let dataArray = this.state.inputData;
    let checkBool = false;
    if (dataArray.length !== 0){
      dataArray.forEach(element => {
        if (element.index === index ){
          element.text = text;
          checkBool = true;
        }
      });
    }
    if (checkBool){
    this.setState({
      inputData: dataArray,
       currinpindex:index
    });
  }
  else {

    dataArray.push({'text':text,'index':index});
    this.setState({
      inputData: dataArray,
      currinpindex:index
    });
  }
   console.log(this.state.inputData);
   */
  }
  
   UNSAFE_componentWillUnmount() {
   }
   
   displayValue = () =>{
   	//alert(index);
   	//console.log("ABC "+this.state.input.inputext0);
   	return this.state.input.inputext0;
   }
  
   //function to remove TextInput dynamically
  removeTextInput = (index) => {
    let textInput = this.state.textInput;
    let inputData = this.state.inputData;
   // let inputtext = this.state.input;
    //inputtext[index] = ''; 
   // alert("ON REMOVE"+index);
    //console.log(textInput[0]);
     //var indexnew = array.indexOf(e.target.value)
    //textInput.pop();
    //inputData.pop();
     textInput.splice(index, 1);
     inputData.splice(index, 1);
      console.log("INPUT DAATA",inputData);
    this.setState({ textInput,inputData	 });
  }
  
    addTextInput = (index) => {
    let textInput = this.state.textInput;
    let removebox ='';
     /*let  newAnswer = [];
     if(this.state.inputData.length > 0){
     	 newAnswer = [...this.state.inputData];
     }
    
            		    //newAnswer[index] = newValue
            		  
		newAnswer[index] = {
			text:'',
			index:index,
		}
		this.setState({
			inputData:newAnswer,
		},()=>{
		*/	
		if(index == 0){
			 textInput.push(<Row><Col size={1}><Row style={{height:20,justifyContent:'center',alignContent:'center'}}>
      				<View style={{width:1,height:22,backgroundColor:'#000'}}/>
      			</Row>
      			<Row style={{height:10,justifyContent:'center',alignContent:'center'}}>
      				<View style={stylespg.square}/>
      		   </Row>
      		   <Row style={{height:20,justifyContent:'center',alignContent:'center'}}>
      				<View style={{width:1,height:20,backgroundColor:'#000'}}/>
      			</Row>
      		   </Col><Col size={9} style={{borderTopWidth:1,borderTopColor:'#E0E0E0'}}>
      		   <TextInput  
      		       ref={this.refinput0}
                   placeholder="Add a stop" 
				       placeholderTextColor="grey"
				       underlineColor={'transparent'}
				      outlineColor='transparent'
				      selectionColor='#C0C0C0'
				      theme={{roundness:0,colors:{primary:'#fff',underlineColor:'transparent'}}} 
				      style={{backgroundColor:'transparent', 
				      height: 38,
					    borderRadius: 0,
					    paddingVertical: 5,
					    paddingHorizontal: 10,
					    fontSize: 15,
					    flex: 1,
					    marginBottom: 5,}}
				     onFocus={(e) =>{
				      this.myRefbt.current.snapTo(1)
				  }}
		 
      onChangeText={(val) =>{ 
         this.myRefbt.current.snapTo(1);
        // console.log("N text chnage",val);
       this.handleText('inputext0', val);
      //console.log(this.state.input['inputext0']);
      this.addValues(val, index); 
      this.debounceLog(val); 
      }}
    
        /></Col><Col size={2} style={{alignItems:'center',justifyContent:'center'}}><TouchableOpacity
				     onPress={() => this.removeTextInput(index) } style={{flex:1,width:'80%',alignItems:'center',justifyContent:'center'}} ><Text><FontAwesome name="remove" size={20} color="black" /></Text></TouchableOpacity></Col></Row>);
       //console.log(this.state.inputData);
       this.setState({ textInput });	
		
		}else if(index == 1){
		  textInput.push(<Row><Col size={1}><Row style={{height:20,justifyContent:'center',alignContent:'center'}}>
      				<View style={{width:1,height:22,backgroundColor:'#000'}}/>
      			</Row>
      			<Row style={{height:10,justifyContent:'center',alignContent:'center'}}>
      				<View style={stylespg.square}/>
      		   </Row>
      		   <Row style={{height:20,justifyContent:'center',alignContent:'center'}}>
      				<View style={{width:1,height:20,backgroundColor:'#000'}}/>
      			</Row>
      		   </Col><Col size={9} style={{borderTopWidth:1,borderTopColor:'#E0E0E0'}}>
      		   <TextInput  
      		       key={index}
      		       ref={this.refinput1}
                   placeholder="Add a stop" 
				       placeholderTextColor="grey"
				       underlineColor={'transparent'}
				      outlineColor='transparent'
				      selectionColor='#C0C0C0'
				      theme={{roundness:0,colors:{primary:'#fff',underlineColor:'transparent'}}} 
				      style={{backgroundColor:'transparent', 
				      height: 38,
					    borderRadius: 0,
					    paddingVertical: 5,
					    paddingHorizontal: 10,
					    fontSize: 15,
					    flex: 1,
					    marginBottom: 5,}}
				     onFocus={(e) =>{
				    this.myRefbt.current.snapTo(1)
				  }}
		 
      onChangeText={(val) =>{ 
          this.myRefbt.current.snapTo(1);
          console.log("text input LAST "+val);
         this.handleText('inputext1', val);
         //console.log(this.state.inputData[index].text);
	      this.addValues(val, index); 
	      this.debounceLog(val); 
      }}
      value={this.state.input.inputext1}
        /></Col><Col size={2} style={{alignItems:'center',justifyContent:'center'}}><TouchableOpacity style={{flex:1,width:'80%',alignItems:'center',justifyContent:'center'}}
				     onPress={() => this.removeTextInput(index) } ><Text><FontAwesome name="remove" size={20} color="black" /></Text></TouchableOpacity></Col></Row>);
       console.log(this.state.inputData);
       this.setState({ textInput });	
		
		}
    //	 });  
		
    
  }
  
  debounceLog = debounce(text=> this._request(text),200);
 _request = (text) => {
     
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

        if (request.status === 200) {
          const responseJSON = JSON.parse(request.responseText);
          if (typeof responseJSON.predictions !== 'undefined') {
          	
          	
            // if (_isMounted === true) {
            /*const results =
              props.nearbyPlacesAPI === 'GoogleReverseGeocoding'
                ? _filterResultsByTypes(
                    responseJSON.predictions,
                    props.filterReverseGeocodingByTypes,
                  )
                : responseJSON.predictions;
					*/
				//console.log(responseJSON);
				const results = responseJSON.predictions;
				this.setState({
					results:results,
				})
            //_results = results;
            //setDataSource(buildRowsFromResults(results));
            // }
          }
          if (typeof responseJSON.error_message !== 'undefined') {
            /*if (!props.onFail)
              console.warn(
                'google places autocomplete: ' + responseJSON.error_message,
              );
            else {
              props.onFail(responseJSON.error_message);
            }
            */
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
        `${url}/place/autocomplete/json?&input=` +
          encodeURIComponent(text) +
          '&'+Qs.stringify(query),
      );
// Qs.stringify(props.query),
      request.withCredentials = true;
      request.send();
  };
}


 _renderRow = (rowData = {}, index) => {
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
          style={
             { width: '100%',} 
          }
           onPress={() => this._onPress(rowData)}
        >
          <View
           	style={{
           		flex:1,
           		flexDirection:'row',
           		backgroundColor:'#fff',
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
      <Text
        numberOfLines={2}
      > {rowData.structured_formatting.main_text}
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
      > {rowData.structured_formatting.secondary_text}
      </Text>
     </View>
       </>
     )
  };

 _onPressDone = () =>{
 	//console.log(Object.keys(this.state.destination).length);
 	/*console.log("SELCTED DESTINATION ",this.state.inputData);
 	if(Object.keys(this.state.stopmainlnglat).length > 0 && Object.keys(this.state.origin).length > 0 ){
 		this.props.navigation.navigate('BookConfirm',this.state);	
 	}
 	*/
 	let waypoints = [];
		 console.log("WAY POINT");
     console.log(this.state.stopmainlnglat);
     
		if(this.state.stopmainlnglat){
			waypoints.push(this.state.stopmainlnglat);
		}
		if(this.state.inputData){
			console.log("IN INPUT data"+Object.keys(this.state.inputData).length);
			let totrec = Object.keys(this.state.inputData).length;
			totrec = totrec-2;
			console.log("TOTAL REC"+totrec);
			if(Object.keys(this.state.inputData).length > 0){
				this.state.inputData.map((item, key) => {
					if(key <= totrec ){
						item.coordinates['stopname'] = item.text;
						waypoints.push(item.coordinates);
					}
						console.log("KEY "+key);	
						console.log("WAY POINT INFO 2 NEW 1",waypoints);				
				});	
			}
	}
 	console.log("Stops WAYPOINTS ",waypoints);
 	this.addamultidest(waypoints);
 	this.props.closeAddastop();
 }  
 
  addamultidest = async(waypoints) =>{
   //  alert(this.props.route.params.bookingresponse.id);
     await AsyncStorage.getItem('accesstoken').then((value) => {
							console.log("ACCESS TOKEN STOP",value);
							//console.log(this.state.scheduledate);
							//this.props.route.params
							fetch('https://www.turvy.net/api/rider/addAStop',{
				     	  	method: 'POST', 
						   headers: new Headers({
						     'Authorization': 'Bearer '+value, 
						     'Content-Type': 'application/json'
						   }), 
						   body:JSON.stringify({
					 				'waypointslnglat' : waypoints,
					 				 'book_id' : this.props.route.params.bookingresponse.id,
					 			}) 
						   })
				      .then((response) =>{
				      	console.log("RESPONES FROM CONTROLLER",response.json());
				      	return response.json();
				      }).then((json) =>{ 
				      	console.log("RESPONSE FROM SERVER",json);
				      	if(json.status == 1){
				      		
				      	}
				     	 }
				      )
				      .catch((error) => console.error(error));
				      	
						})
  } 	
   
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
            
            if(this.state.forsourdest == 'dest'){
            	console.log("BEFORE INDEX MAP STOP"+this.state.currinpindex);
            	let currIND = this.state.currinpindex;
            	if(currIND !== '' && currIND >= 0 && this.state.deletedmain !== ''){
            		  let newAnswer = [];
            		  if(this.state.inputData.length > 0){
            		  	 newAnswer = [...this.state.inputData];
            		  }
            		  
            		    //newAnswer[index] = newValue
            		    //alert("current ID "+currIND);
            		    const coordinates = {
					      	latitude: details.geometry.location.lat, 
					      	longitude: details.geometry.location.lng,
					        };
            			newAnswer[currIND] = {
            				text:rowData.description,
            				index:currIND,
            				coordinates:coordinates
            			}
            		
            		 //const thisinputData[this.state.currinpindex]
            		 console.log("IN INDEX"+currIND);
            		 console.log(this.state.inputData);
            		 //console.log(this.state.inputData[currIND].text);
            		 
            		 let inputext = 'inputext'+currIND; 
            		 //alert("INPUT "+inputext);
            		 /*this.setState({
	            	 	inputData:newAnswer,
	            	 	inputext:rowData.description,
	               },()=>{
	               		console.log(this.state.inputData);	
	               		console.log(inputext);
	               });
	               */
	               //input.inputext0
	               //let  input = { ...this.state.input };
                  if(currIND == 0){
                  	
                  	if(this.refinput0.current){
                  		this.handleText('inputext0',rowData.description);
                  		this.refinput0.current.setNativeProps({text:rowData.description});
                  	}
                  	//input['inputext0'] = rowData.description;
                  }else if(currIND == 1){
                  	//alert(currIND);
                  	if(this.refinput1.current){
                  		this.handleText('inputext1',rowData.description);
                  		this.refinput1.current.setNativeProps({text:rowData.description});
                  	}
                  	
                  	//input['inputext1'] = rowData.description;
                  }
					    
					    //console.log('INPUT', input);
					    console.log('ROW data',rowData.description);
				     //this.setState({ input });
	               const destination = {
			      	latitude: details.geometry.location.lat, 
			      	longitude: details.geometry.location.lng,
			      	};
            	 this.setState({
            	 	destinationto:rowData.description,
            	 	destination:destination,
            	 	inputData:newAnswer,
               },()=>{
               	 console.log('INPUT', this.state.input);
               	if(this.state.textInput.length < 2){
               		this.addTextInput(this.state.textInput.length);
               	}
            	});
	               
            	}else{
            		const destination = {
			      	latitude: details.geometry.location.lat, 
			      	longitude: details.geometry.location.lng,
			      	};
			      	const destinationmore = {
			      	latitude: details.geometry.location.lat, 
			      	longitude: details.geometry.location.lng,
			      	stopname: rowData.description,
			      	};
			        console.log("IN  INPUT DATA : ",this.state.inputData);
			        if(Object.keys(this.state.inputData).length > 0){
			        	this.setState({
	            	 	destinationto:this.state.destinationto,
	            	 	destination:this.state.destination,
	            	 	stopmain:rowData.description,
	            	 	stopmainlnglat:destinationmore,
	            	 	
	               },()=>{
	               	//console.log("IN MAIN TEXT INPUT DATA : ",this.state.stopmainlnglat);
	               	if(this.state.textInput.length < 2){
	               		this.addTextInput(this.state.textInput.length);
	               	}
	            	});
			        	
			        }else{
			        	this.setState({
		            	 	destinationto:rowData.description,
		            	 	destination:destination,
		            	 	stopmain:rowData.description,
		            	 	stopmainlnglat:destinationmore,
		            	 	
		               },()=>{
		               	//console.log("IN MAIN TEXT INPUT DATA : ",this.state.stopmainlnglat);
		               	if(this.state.textInput.length < 2){
		               		this.addTextInput(this.state.textInput.length);
		               	}
		            	});
			        
			        }
            	 
            	
            	 
               	//console.log("IN MAIN TEXT INPUT");
               	
              }	
              this.myRefbt.current.snapTo(2);
                  //this.props.navigation.navigate('BookConfirm',this.state)
              //});   
         
            }else{
            	const origin = {
			      	latitude: details.geometry.location.lat, 
			      	longitude: details.geometry.location.lng,
			      } 
            	 this.setState({
            	 	curlocatdesc:rowData.description,
            	 	pickup:rowData.description,
            	 	origin:origin,
            	 	latitudecur:details.geometry.location.lat,
         			longitudecur: details.geometry.location.lng,
               },()=>{
               	//this.dropoffTextInput.focus();
               	this.myRefbt.current.snapTo(2);
               	
               	this.setState({
               		forsourdest:'dest'
               	});
  						
						             	
               	
                 // this.props.navigation.navigate('BookConfirm',this.state)
              });  
            }
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
  
 _getFlatList = () => {
    const keyGenerator = () => Math.random().toString(36).substr(2, 10);

    if (this.state.stateText !== '' ) {
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
 
   renderContent = () => (
    <View
      style={{
        backgroundColor: 'white',
        padding: 16,
        height: '100%',
      }}
    >
      {this._getFlatList()}
    </View>
  );   

 handleText = (key, text) => {
    var input = { ...this.state.input };
   // alert(key);
    input[key] =  {...input[key], key: text};
   // console.log("TEST ABC ",input[key]);
   // console.log('INPUT HANDLER ', input);
    this.setState({ input,deletedmain:'notfirst' });
  };
  
  render() {
  	 return (
  	<PaperProvider theme={theme}>
  	  <StatusBar backgroundColor="#fff" barStyle="light-content"/>
  	  <View style={stylespg.serachbox}>
  	  <TouchableOpacity onPress={() => this.props.closeAddastop() }>
	  		<Ionicons name="arrow-back" size={24} color="black" />
	  </TouchableOpacity>
	  </View>
  	  		<View style={{position:'absolute',width:'100%',top:'3%',
  				left:'0%',zIndex:100,backgroundColor:'#fff',flex:1,flexDirection:'row'}}>
  			 <Grid>
      	<Row style={[stylespg.searchSection,styles.ubarFont]}>
      		<Col size={12}>
      		<Row>
	  			 	<Col size={2}>
	  			 		
	  			 	</Col>
	  			 	<Col>
	  			 	</Col>
	  			 </Row>
      		  <Row>
      		   <Col size={1}>
      			<Row style={{height:20,justifyContent:'center',alignContent:'flex-end',flex:1,flexWrap:'wrap'}}>
      			<View style={stylespg.circle}/>
      		  </Row>
      		  <Row style={{height:20,justifyContent:'center',alignContent:'center'}}>
      			<View style={{width:1,height:28,backgroundColor:'#000'}}/>
      		  </Row>
      		</Col>
      		<Col size={9} style={{borderBottomWidth:1,borderBottomColor:'#E0E0E0'}}>
      			 <TextInput
      			  ref={(input) => { this.pickupTextInput = input; }}
				      placeholder="Pick Up" 
				      placeholderTextColor="grey"
				      value={this.state.pickup}
				      onFocus={(e) =>{
				      	 this.myRefbt.current.snapTo(0)
				      }}
				      underlineColor={'transparent'}
				      outlineColor='transparent'
				      selectionColor='#C0C0C0'
				      theme={{roundness:0,colors:{primary:'#fff',underlineColor:'transparent'}}} 
				      style={[styles.ubarFont,{backgroundColor:'transparent', 
				      height: 38,
				    borderRadius: 0,
				    paddingVertical: 5,
				    paddingHorizontal: 10,
				    fontSize: 15,
				    flex: 1,
				    marginBottom: 5,}]}
				    
      				/>
      		</Col>
      		<Col size={2}>
      		</Col>
      		</Row>
      		<Row style={{height:40,justifyContent:'center'}}>
      		<Col size={1}>
      			<Row style={{height:20,justifyContent:'center',alignContent:'center'}}>
      				<View style={{width:1,height:20,backgroundColor:'#000'}}/>
      			</Row>
      			<Row style={{height:20,justifyContent:'center',alignContent:'center'}}>
      				<View style={stylespg.square}/>
      		   </Row>
      		</Col>
      		<Col size={9} >
      		  <TextInput
      		  ref={(input) => { this.dropoffTextInput = input; }}
      placeholder="Add a stop" 
      placeholderTextColor="grey"
       underlineColor={'transparent'}
		 outlineColor='transparent'
       selectionColor='#C0C0C0'
      value={this.state.stopmain}
      theme={{roundness:0,colors:{primary:'#fff',underlineColor:'transparent'}}}      
        onChangeText={(val) => {
        	       this.myRefbt.current.snapTo(0);
        	       console.log("MAIN STOP",val);
        			this.setState({stopmain:val,stateText:val,forsourdest:'dest'},(val)=>{
                 //debounce(()=>this._request(val),100);
              })
              this.debounceLog(val);
              }}
              onFocus={(e) =>{
				    this.myRefbt.current.snapTo(0)
				  }}
          style={[styles.ubarFont,{backgroundColor:'transparent', height: 38,
			    borderRadius: 0,
			    paddingVertical: 5,
			    paddingHorizontal: 10,
			    fontSize: 15,
			    flex: 1,
			    marginBottom: 5,
			 }]}
			
       />
      		</Col>
      		<Col size={2} style={{alignItems:'center',justifyContent:'center'}}>
      		<TouchableOpacity
      		  onPress={() => this.setState({stopmain:'',stopmainlnglat:{},deletedmain:''})}
      		  style={{flex:1,width:'80%',alignItems:'center',justifyContent:'center'}}
				     >
					<FontAwesome name="remove" size={20} color="black" />
				</TouchableOpacity> 
      		</Col>
      	</Row>
      	 {this.state.textInput.map((value) => {
          return value
        })}
      	</Col>
      	</Row>	
      </Grid>
      
	</View>
	<View style={{position:'absolute',top:'40%',flex:1,justifyContent:'center',alignItems:'center',flexDirection:'row',padding:20,width:'98%'}}>
		<Grid>
			<Row>
				<Col>
					  <Image
			        style={{width:64,height:64}}
			        source={imagestopwt} />
				</Col>
			</Row>
			<Row>
				<Col>
					<Text style={{fontSize:25,}}>Please keep stop to 3 minutes or less</Text>
				</Col>
			</Row>
			<Row>
				<Col>
					<Text style={{letterSpacing:2,lineHeight:20}}>As a courtesy for your driver's time, please limit each stop minutes or less, otherwise your fare may change. </Text>
				</Col>
			</Row>
			<Row style={{paddingTop:10}}>
			<Col>
				<Button  mode="contained" color={'#cccccc'} onPress={() => this._onPressDone()} style={{padding:10}}>
			    Done
			  </Button>
			</Col>
			</Row>
		</Grid>
	
  
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
	  );
   }
}

const stylespg = StyleSheet.create({
  servicebocimage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelstyle:{    
    fontSize:16,    
    textAlign:'left',
    marginTop:10,
    fontFamily: 'WuerthBook'
  },
  inputstyle:{
    color:'black',
    borderBottomColor:'#D9D5DC',
    borderBottomWidth:1,
    paddingBottom: 11,
    fontSize:16,
    fontFamily: 'WuerthBook'
  },
  bgImage: {
        resizeMode: "cover",
        justifyContent: "center",
        height:170,
    },
    text: {    
        color: "white",
        fontSize: 25,    
        textAlign: "center",         
    },
    overlay: {    
        justifyContent: "center",
        backgroundColor:'rgba(0,0,0,0.6)',
        height:170,
    },
    scItem:{
      borderRadius:50,
      borderWidth:1,
      marginTop:10,
      marginBottom:10,
      marginLeft:5,
      marginRight:5,
      backgroundColor:'#FFF',      
      height:35
    },
    scText:{color:'#000',fontSize:14},
    active:{      
      backgroundColor:'#7a49a5',            
    },
    actText:{color:'#FFF'},
    boxstyle:{
    	flex:1,
    	backgroundColor:'#fff',  
    	borderRadius:10,
    	borderWidth: 1,
    	borderColor: '#fff',
    	padding:10,margin:20,
    	shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
    } , circle:{
  	 alignItems:'center',justifyContent:'center',
  	 width: 10,
    height: 10,
    borderRadius: 10/2,
    backgroundColor:'#135AA8'
  },
  square:{
  	 width: 10,
    height: 10,
    backgroundColor:'#135AA8'
  },searchSection:{
  	  paddingTop:60,
	 justifyContent:'center',
	 alignContent:'center',
	 backgroundColor:'#fff', 
	 shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 3,
		},
	shadowOpacity: 0.27,
	shadowRadius: 4.65,
	elevation: 7,
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
