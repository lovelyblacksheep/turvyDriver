import * as React from 'react';
import { View, Text, ScrollView, StyleSheet, Image, FlatList, SafeAreaView, ActivityIndicator, TouchableOpacity} from 'react-native';
import {  Provider as PaperProvider, Button, Avatar, Caption, Surface, IconButton, Colors, Appbar} from 'react-native-paper';
import { Col, Row, Grid } from "react-native-easy-grid";
import {styles, theme, DOMAIN,debug} from './Constant';
import { MaterialCommunityIcons,Ionicons } from '@expo/vector-icons';
import { Input, Divider } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Spinner from 'react-native-loading-spinner-overlay';
import { AntDesign } from '@expo/vector-icons';

export default class QueueList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {          
            accessTokan:'',
            data:{},
            grantAmt:0,
            spinner:true,
            driver_points:0,
            page:1,
            loader:false,
            driverId:0
        }
    }

    async componentDidMount() {

        await AsyncStorage.getItem('driverId').then((value) => {           
            if(value != '' && value !== null){
                this.setState({driverId:JSON.parse(value)})
            }
        })
        await AsyncStorage.getItem('accesstoken').then((value) => {            
            if(value != '' && value !== null){
                this.setState({
                    accessTokan:value
                });
            }
        })

        //alert(this.state.accessTokan)
        this.displayQueueCar(this.state.page)
    }

    

    onScrollHandler = () => {
         this.setState({
            page: this.state.page + 1,
            loader:true
         }, () => {
            this.displayQueueCar(this.state.page);
         });
    }

    displayQueueCar = (page) => {
        //console.log('airport Queue===========>',this.state.accessTokan);
        const {accessTokan} = this.state
        fetch(`${DOMAIN}api/driver/listAirportQueue/${page}`,{
            method: 'GET',
            headers : {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer '+accessTokan
            }
        }).then(function (response) {
            return response.json();
        }).then( (result)=> {
            console.log('airport coords===========>',debug(result));
            this.setState({spinner:false})
            if(result.status === 1){
                if(page === 1){
                    this.setState({
                        data:result.data,
                    })
                }else{
                    this.setState({                
                        data: [...this.state.data, ...result.data],
                        loader:false
                    })
                }
            }else{
                this.props.navigation.replace('MapViewFirst');
            }
            
        })
    }

    render() {
        //console.log(this.state.data)
        const {data, driverId} = this.state
        return (
            <>
                <Spinner
                    visible={this.state.spinner}
                    color='#FFF'
                    overlayColor='rgba(0, 0, 0, 0.5)'
                />
                <Appbar.Header style={{backgroundColor:'#FFF'}}>
                    <AntDesign 
                    	name="arrowleft" 
                    	size={24} 
                    	color="black" 
                    	style={{paddingLeft:10}} 
                    	onPress={()=>this.props.navigation.goBack(null)} 
                    />
                    <Appbar.Content 
                    	title="Airport Queue"
                    />
                    
                </Appbar.Header>

                <PaperProvider theme={theme}> 
                    <ScrollView style={{ flex: 1,backgroundColor: "aliceblue"}}> 
                       
                        {   
                            Object.keys(data).length > 0 
                            ?
                            <View style={{ backgroundColor: "aliceblue",marginBottom:20}}>
                                <Row style={{flex: 1, flexDirection:'row', marginHorizontal:20,alignItems:'center',marginTop:10,paddingVertical:10 }} >
                                    <Col size={6}>
                                        <Caption style={{fontSize:16, width:'100%'}}>Vehicle</Caption>
                                    </Col>
                                    <Col size={6} style={{alignItems:'flex-end'}}>
                                        <Caption style={{fontSize:16}} >Position</Caption>
                                    </Col>
                                    
                                </Row>
                                
                                <Divider />
                                {<FlatList
                                    data={data}
                                    renderItem={({item, index}) => {
                                        return (
                                            <>
                                                <Row style={{flex: 1, flexDirection:'row', paddingHorizontal:20,alignItems:'center',paddingVertical:10,backgroundColor: driverId == item.driver_id && '#3f78ba'}} >
                                                    <Col size={6}>
                                                        <Caption style={{fontSize:16, width:'100%',color:driverId == item.driver_id && '#FFF'}}>{item.name}</Caption>
                                                    </Col>
                                                    <Col size={6} style={{alignItems:'flex-end'}}>
                                                        <Caption style={{fontSize:16,color:driverId == item.driver_id && '#FFF'}} >{item.position}</Caption>
                                                    </Col>
                                                    
                                                </Row>
                                                
                                                <Divider/>
                                            </>
                                        )
                                    }}
                                    keyExtractor={item => item.id}
                                    onEndReached={this.onScrollHandler}
                                    onEndThreshold={0}                                    
                                />}
                            </View>
                            :
                            null
                        }
                    
                    {
                    this.state.loader
                    ?
                    <View style={{backgroundColor:'aliceblue'}}>
                        <ActivityIndicator size="large" color="#135AA8" animating={true} />
                    </View>
                    :null
                    }
                    </ScrollView>
                </PaperProvider>
            </>
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
    surface: {
        paddingVertical: 8,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        marginBottom:15,
        borderRadius:3,
        marginHorizontal:10,

    }
});