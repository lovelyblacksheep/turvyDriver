import React from 'react';
import { StatusBar } from 'expo-status-bar';
import {  Provider as PaperProvider,Text, Button, Card, Title, Paragraph } from 'react-native-paper';
import { Col, Row, Grid } from "react-native-easy-grid";
import {View, ScrollView,TouchableOpacity  } from 'react-native'
import {styles, theme} from '../Riders/Constant'
import Fontisto from 'react-native-vector-icons/Fontisto'
import { Ionicons } from '@expo/vector-icons'; 
import { useNavigation } from '@react-navigation/native';
import { CheckBox } from 'react-native-elements'
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { format } from "date-fns";

 
 
export default class PickUpTIme extends React.Component {
	
	constructor(props) {
    super(props);
    const todaydate = new Date();
	 const formattedDate = format(todaydate, "EEEE , MMM d");
	 const formattedTime =format(todaydate, "hh:mm");
	 let selctedDatedb = format(todaydate,'yyyy-MM-dd')+' '+formattedTime;
    this.state = {
    	date:new Date(),
    	isDatePickerVisible:false,
    	istimepickerVisible:false,
    	selectedDate:formattedDate,
    	selectedTime:formattedTime,
    	selctedDatedb:selctedDatedb,
    }
  }

componentDidMount(){
	console.log(this.props);
}
	onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    alert(currentDate);
    setDate(currentDate);
  };

   showDatePicker = () => {
    this.setState({
    	isDatePickerVisible:true
    });
  };
   showTimePicker = () => {
    this.setState({
    	istimepickerVisible:true
    });
  };

   hideDatePicker = () => {
     this.setState({
    	isDatePickerVisible:false
    });
  };

   handleConfirm = (date) => {
    console.warn("A date has been picked: ", date);
    const formattedDate = format(date, "EEEE , MMM d");
    let selctedDatedb = format(date,'yyyy-MM-dd');
    selctedDatedb = format(date,'yyyy-MM-dd')+' '+this.state.selectedTime;
    this.setState({
    	selectedDate:formattedDate,
    	selctedDatedb:selctedDatedb})
    this.hideDatePicker();
  };
  
  hideDatePickerTime = () => {
     this.setState({
    	istimepickerVisible:false
    });
  };
  
   handleConfirmTime = (time) => {
    console.log("A date has been picked: ", time);
    const selectedTime = format(time, "hh:mm");
    this.setState({
    	selectedTime:selectedTime})
    this.hideDatePickerTime();
  };
  
	render(){	
  return (<><StatusBar  backgroundColor="#fff" barStyle="light-content"/>
     <PaperProvider theme={theme}>
     <View
      style={{
        backgroundColor: 'white',
        padding: 16,
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
    <View style={{padding:20}}>
    <Grid>
    	<Row>
    		<Col size={11}><Title style={{marginBottom:20}}>Pick-up Time </Title></Col>
    		<Col size={1}><Ionicons 
			   				name="close" 
			   				size={24} 
			   				color="#135aa8"
			   				onPress={() =>{this.props.closePop()}} 
			   			/></Col>
    	</Row>
    </Grid>
  <Card style={{borderWidth:2,borderRadius:10,marginTop:10,borderColor:'#04b1fd',height:120}}>
    <Card.Content>
    <Grid>
    	<Row>
    		<Col size={10}>
    			<Title style={{color:'#04b1fd',textTransform:'uppercase'}}>Schedule ride</Title>
	      	<Paragraph style={{color:'#04b1fd',fontSize:12,fontWeight:'bold'}}>schedule your ride from 60 minute in advance</Paragraph>
    		</Col>
    		<Col size={2}>
    		<CheckBox checked={true} />
    		</Col>
    	</Row>
    </Grid>
    </Card.Content>
  </Card>
  	 <Grid >
   	<Row style={{height:50,borderBottomColor:'#ccc',borderBottomWidth:1}}>
   		<Col size={12} style={{alignItems:'center',justifyContent:'center'}}>
   		<TouchableOpacity
				   style={{paddingTop:15,paddingBottom:15}}
				     onPress={() =>{this.showDatePicker()}} >
				     <Text style={{fontSize:20}}>{this.state.selectedDate} </Text>
		   </TouchableOpacity>
		  </Col>
   	</Row>
   	<Row style={{height:50}}>
   	<Col size={12} style={{alignItems:'center',justifyContent:'center'}}>
   		<TouchableOpacity
				   style={{paddingTop:15,paddingBottom:15 }}
				     onPress={() => this.showTimePicker() } >
				     <Text style={{fontSize:20}}>{this.state.selectedTime} </Text>
		   </TouchableOpacity>
		  </Col>
   	</Row>
   	<Row style={{height:40}}>
   		<Col size={12}>
		   <Button  mode="contained" color={'#135AA8'} onPress={() => this.props.setSChedule(this.state.selctedDatedb)}>
				Set Pick Up Time
		  </Button>
		  </Col>  
   	</Row>
   </Grid> 
   <DateTimePickerModal
        isVisible={this.state.isDatePickerVisible}
        mode="date"
        onConfirm={this.handleConfirm}
        onCancel={this.hideDatePicker}
      />
      <DateTimePickerModal
        isVisible={this.state.istimepickerVisible}
        mode="time"
        onConfirm={this.handleConfirmTime}
        onCancel={this.hideDatePickerTime}
      />
   </View>
    
   
    </View>
</PaperProvider>
  </>);
  }	
}