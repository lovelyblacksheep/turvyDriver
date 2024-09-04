import React from 'react';
import { StatusBar } from 'expo-status-bar';
import {  Provider as PaperProvider,Text, Button, Appbar, Card, Title, Paragraph,TouchableRipple } from 'react-native-paper';
import {View, ScrollView, TouchableWithoutFeedback,Image,TouchableHighlight, StyleSheet,TouchableOpacity } from 'react-native'
import {styles, theme,DOMAIN} from './Constant'
import Fontisto from 'react-native-vector-icons/Fontisto'
import EvilIcons from 'react-native-vector-icons/EvilIcons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { useNavigation } from '@react-navigation/native';
import { Badge } from 'react-native-elements'
import { Col, Row, Grid } from "react-native-easy-grid";
import { LinearGradient } from 'expo-linear-gradient';
import Spinner from 'react-native-loading-spinner-overlay';
import { MaterialCommunityIcons, AntDesign, Entypo } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Progress from 'react-native-progress';



export default class CurrentQuest extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			accessTokan:'',
			bookrequest:{},
			fetchnewrequest:true,
			driverId: '',
			destination:{},
			origin:{},
			spinner:false,
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
        AsyncStorage.getItem('driverId').then((value) => {           
            if(value != '' && value !== null){
                this.setState({driverId:value})
            }
        })
	}
	
	render(){		
  		return (
  			<>
  			<Spinner
	          visible={this.state.spinner}
	          color='#FFF'
	          overlayColor='rgba(0, 0, 0, 0.5)'
	        />
  			<StatusBar style="auto" />
  			<Appbar.Header style={{backgroundColor:'#FFF'}}>
	            <AntDesign 
                    	name="arrowleft" 
                    	size={24} 
                    	color="black" 
                    	style={{paddingLeft:10}} 
                    	onPress={()=> this.props.navigation.goBack(null)} 
                    />      
				<Appbar.Content title="Quest Details" titleStyle={{textAlign:'center',alignContent:'center'}} />
				<FontAwesome 
					name='search' 
					style={{color:'#fff',fontSize:25,paddingLeft:15,width:50,textAlign:'left'}} 
					color="#111" 
				/>
            </Appbar.Header>
  			<PaperProvider theme={theme}>
				<ScrollView style={{backgroundColor: "aliceblue"}}>
					<View style={{backgroundColor: "#5c79de", height:170,alignItems:'center',justifyContent:'center',paddingBottom:40}}>
						<View style={{padding:7,borderRadius:50,backgroundColor:'#3354c3',elevation:2,marginBottom:5}}>
							<Entypo name="flag" size={24} color="#FFF" />
						</View>
						<View style={{marginBottom:5}}><Text style={{fontSize:20,color:'#FFF'}}>Current Quest</Text></View>
						<View><Text style={{fontSize:14,color:'#FFF'}}>Jan 1, 4 AM to Jan 4, 4 AM</Text></View>
					</View>				
          			<View style={[styles.content,{marginTop:-55}]}>
			        	<View style={{backgroundColor:'#FFF',padding:10,borderColor:'#ddd',borderWidth:1,borderRadius:5}}>
			        		<View style={{flexDirection:'row',alignItems:'center'}}>
			        			<Text>$35 extra by completing 20 trips</Text>
			        		</View>
			        		<View style={{marginVertical:8}}>
			        			<Progress.Bar 
                                        progress={0.2} 
                                        width={null} 
                                        borderRadius={15}
                                        color={'#3aa28b'}
                                        unfilledColor={'#ccc'}
                                        indeterminate={false}
                                        borderWidth={0}
                                        height={6}
                                        useNativeDriver={true}
                                    />
			        		</View>
			        		<View>
			        			<Text>1/20 trips completed</Text>
			        		</View>
			        	</View>
			        	<View style={{height:20}}></View>
			        	<View style={{backgroundColor:'#FFF',padding:10,borderColor:'#ddd',borderWidth:1,borderRadius:5}}>
			        		<View style={{flexDirection:'row',alignItems:'center'}}>
			        			<Text>$40 extra by completing 30 trips</Text>
			        		</View>
			        		<View  style={{marginVertical:8}}>
			        			<Progress.Bar 
                                        progress={0.1} 
                                        width={null} 
                                        borderRadius={15}
                                        color={'#3aa28b'}
                                        unfilledColor={'#ccc'}
                                        indeterminate={false}
                                        borderWidth={0}
                                        height={6}
                                        useNativeDriver={true}
                                    />
			        		</View>
			        		<View>
			        			<Text>1/30 trips completed</Text>
			        		</View>
			        	</View>
			        	<View style={{height:20}}></View>
					</View>
				</ScrollView>
			</PaperProvider>

  			</>
  		);
	}
}

const pageStyles = StyleSheet.create({
	tripTab:{		
		flexDirection:'row'
	},
	tripTabChild:{
		flex:1,		
		justifyContent:'center'
	},
	offIcon:{
		borderWidth:1,
		borderColor:'#CCC',
		padding:5,
		borderRadius:50,
		backgroundColor:'#FFF',
		color:'#FFF',
		elevation: 8,
		width:62,
        height:62,
        alignSelf:'center'
	},
	offlineBtn:{      
		backgroundColor:"#ccc",
		justifyContent:'center',
		alignItems:'center',
		flexDirection:'row',    
		borderRadius:50,
	}

})