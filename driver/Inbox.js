import React from 'react';
import { StatusBar } from 'expo-status-bar';
import {  Provider as PaperProvider,Text, Appbar } from 'react-native-paper';
import {View, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, RefreshControl } from 'react-native'
import {theme,DOMAIN} from './Constant'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Spinner from 'react-native-loading-spinner-overlay';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Entypo } from '@expo/vector-icons';
import messaging from '@react-native-firebase/messaging';
import Image from 'react-native-image-progress';
import * as Progress from 'react-native-progress';

export default class Inbox extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			accessTokan:'',			
			driverId: '',			
			spinner:true,
			notifications:false,
			page:1,
			refreshing:false,
			loadingImage: false,
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
            }
        })
        await AsyncStorage.getItem('driverId').then((value) => {           
            if(value != '' && value !== null){
                this.setState({driverId:value})
            }
        })
		//console.log('routename',this.props.route.name)
		
		messaging().onMessage(async remoteMessage => {
            //console.log('new message sidebar',remoteMessage)
			//this.props.navigation.state.routeName
			if(remoteMessage.data && this.props.route.name === 'Inbox'){
                this._getNotifications(1);
            }
        });
	}

	_getNotifications = async (page) => {
		this.setState({
			refreshing:true
		})
		await fetch(DOMAIN+'api/driver/inbox',{
            method: 'GET',
            headers : {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer '+this.state.accessTokan
            }
        }).then(function (response) {
            return response.json();
        }).then( (result)=> {
            //console.log('inbox=================',result)            
            if(page === 1){
                this.setState({
                    notifications:result.data,
                    spinner:false,
					refreshing:false
                })
            }else{
                this.setState({                
                    notifications: [...this.state.notifications, ...result.data],                    
                })
            }
            AsyncStorage.setItem('msgCount', '');
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
				<Appbar.Content title="Inbox" titleStyle={{textAlign:'center',alignContent:'center'}} />
				<FontAwesome 
					name='search' 
					style={{color:'#fff',fontSize:25,paddingLeft:15,width:50,textAlign:'left'}} 
					color="#111" 
				/>
            </Appbar.Header>
  			<PaperProvider theme={theme}>
				<SafeAreaView style={{ flex: 1,backgroundColor: "aliceblue"}}>
          			{
          				
          				this.state.notifications
          				?
          				<View style={{paddingTop:20}}>
          				{<FlatList
                                data={this.state.notifications}
                                renderItem={({item, index}) => {
                                    return (
										<>
                                        <View style={{borderBottomWidth:1,borderColor:'#ccc',paddingVertical:15}}> 
                                        	<View style={{marginHorizontal:10,flexDirection:'row',justifyContent:'flex-start',alignItems:'flex-start'}}>
                                        		<View style={{width:50}}>
													{
													item.sender_id
													?
														
														item.senderImg
														?
														<Image
															source={{uri:item.senderImg}}
															indicator={Progress.Circle}
															indicatorProps={{	
																color: 'rgba(150, 150, 150, 1)',
																unfilledColor: 'rgba(200, 200, 200, 0.2)'
															}}
															style={{width:35,height:35}}
															imageStyle={{borderRadius:5}}
														/>
														:
														<Image
															source={require('../assets/images/user.jpeg')}
															imageStyle={{width:35,height:35,borderRadius:5}}
														/>
													:
                                        			<Ionicons name="notifications" size={35} color="#797979" />
													
					  								}
                                        		</View>
                                        		<View style={{flex:1,flexShrink: 1}}>
                                        			{
														item.senderName?
														<Text style={{fontSize:17}}>{item.senderName}</Text>
														:
														<Text style={{fontSize:17}}>{item.heading}</Text>
													}
                                        			<Text style={{fontSize:15,color:'#797979',paddingVertical:3,}}>{item.content}</Text>
													<View style={{flexDirection:'row',flex:1,paddingTop:10}}>
													
													<View style={{flex:1,alignItems:'flex-end',justifyContent:'center'}}>
														<Text style={{fontSize:13,color:'#797979',}}>{item.notifyDate}</Text></View>
													</View>
                                        			
                                        		</View>
                                        	</View>
                                        </View>
										
										</>
                                    )
                                }}
                                onEndThreshold={0}
								refreshControl={
									<RefreshControl
									  refreshing={this.state.refreshing}
									  onRefresh={() => this._getNotifications(1)}
									/>
								}
                            />} 
                         </View>   
          				:
          				<View style={{paddingTop:20,alignItems:'center'}}><Text>Inbox is empty.</Text></View>
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
	promoBox:{backgroundColor:'#FFF',padding:10,borderColor:'#ddd',borderWidth:1,borderRadius:5}

})