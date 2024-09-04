import React from 'react';
import { StatusBar } from 'expo-status-bar';
import {  Provider as PaperProvider,Text, Appbar, Divider } from 'react-native-paper';
import {View, ScrollView,  StyleSheet, SafeAreaView, FlatList,TouchableOpacity } from 'react-native'
import {styles, theme,DOMAIN} from '../Riders/Constant'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Spinner from 'react-native-loading-spinner-overlay';
import { AntDesign, Ionicons,Entypo } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SendMessage from './SendMessage';
//import FastImage from 'react-native-fast-image';
import Image from 'react-native-image-progress';
import * as Progress from 'react-native-progress';

export default class MyMessages extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			accessTokan:'',			
			riderId: '',			
			spinner:true,
			notifications:{},
			page:1,
			receiver_id:'',
			receiver_name:'',
		}
	}
  
	async componentDidMount() {
		
		await AsyncStorage.getItem('accesstoken').then((value) => {        		
            if(value != '' && value !== null){
                this.setState({
                    accessTokan:value
                },()=>{
                	this._getNotifications(this.state.page);
                });
                
                
                fetch('https://www.turvy.net/api/rider/readmessages',{
				     	  	method: 'POST', 
						   headers: new Headers({
						     'Authorization': 'Bearer '+value, 
						     'Content-Type': 'application/json'
						   }), 
						   })
				      .then((response) => {
				      	return response.json();
				      	console.log(response);
				      	})
				      .then((json) =>{ 
				      	console.log("IN MESSAGE UPDATE ");
				      	console.log(json);
				      	AsyncStorage.setItem('messagecount', '0');
				     	 })
				      .catch((error) => console.error(error));
				      
                
            }
        })
        await AsyncStorage.getItem('rider_id').then((value) => {    
          //alert(value);       
            if(value != '' && value !== null){
                this.setState({riderId:value})
            }
        })
        
	}

	_getNotifications = async (page) => {
		//alert(this.state.accessTokan);
		await fetch(DOMAIN+'api/rider/mymessages/'+page,{
            method: 'GET',
            headers : {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer '+this.state.accessTokan
            }
        }).then(function (response) {
            return response.json();
        }).then( (result)=> {
            console.log('inbox',result)            
            if(page === 1){
                this.setState({
                    notifications:result.data,
                    spinner:false,
                })
            }else{
                this.setState({                
                    notifications: [...this.state.notifications, ...result.data],                    
                })
            }
        })

	}
	onScrollHandler = () => {
         this.setState({            
            page: this.state.page + 1,            
         }, () => {
            this._getNotifications(this.state.page);
         });
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
				<Appbar.Content title="My Messages" titleStyle={{textAlign:'center',alignContent:'center'}} />
				<FontAwesome 
					name='search' 
					style={{color:'#fff',fontSize:25,paddingLeft:15,width:50,textAlign:'left'}} 
					color="#111" 
				/>
            </Appbar.Header>
  			<PaperProvider theme={theme}>
				<SafeAreaView style={{ flex: 1,backgroundColor: "aliceblue"}}>
          			{
          				
          				Object.keys(this.state.notifications).length > 0 
          				?
          				<View style={{paddingTop:20}}>
          				{<FlatList
                                data={this.state.notifications}
                                renderItem={({item, index}) => {
                                    return (
                                        <View> 
                                        	<View style={{marginHorizontal:10,flexDirection:'row',justifyContent:'flex-start',alignItems:'flex-start'}}>
                                        		<View style={{width:50}}>
                                        			<View style={{width:50}}>
																	{
																	item.senderImg
																	?
																	<Image
																		source={{uri:item.senderImg}}
																		indicator={Progress.Circle}
																		  indicatorProps={{
																		    size: 40,
																		    borderWidth: 0,
																		    color: '#238BAF',
																		    unfilledColor: 'rgba(200, 200, 200, 0.2)'
																		  }}
																		style={{width:35,height:35,borderRadius:5}}
																		
																		onLoadStart={() => {  }} 
																	/>
																	:
				                                        <Ionicons name="notifications" size={35} color="#797979" />
																	}
                                        		</View>
                                        		</View>
                                        		<View style={{flex:1,flexShrink: 1}}>
                                        		   { item.heading != '' ?
                                        		   (<Text style={{fontSize:17}}>{item.heading}</Text>)
                                        		   :
                                        		   null
                                        		   }
                                        			<Text style={{fontSize:15,color:'#797979',paddingVertical:3,}}>{item.content}</Text>
                                        			<View style={{flexDirection:'row',flex:1,paddingTop:10}}>
																
																<View style={{flex:1,alignItems:'flex-end',justifyContent:'center'}}>
																	<Text style={{fontSize:13,color:'#797979',}}>{item.notifyDate}</Text>
																</View>
																</View>
                                        		
                                        		</View>
                                        	</View>                                       
                                        	<View style={{paddingVertical:15}}><Divider /></View>
                                        </View>
                                    )
                                }}
                                onEndThreshold={0}
                                onEndReached={this.onScrollHandler}
                            />} 
                         </View>   
          				:
          				<View style={{paddingTop:20,alignItems:'center'}}><Text>No Messages yet.</Text></View>
          			}		
				</SafeAreaView>
				
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
	},
	promoBox:{
			backgroundColor:'#FFF',
			padding:10,
			borderColor:'#ddd',
			borderWidth:1,
			borderRadius:5
	}
})