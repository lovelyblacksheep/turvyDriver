import * as React from 'react';
import { View, Text, ScrollView, StyleSheet, Image, FlatList, SafeAreaView, ActivityIndicator, TouchableOpacity} from 'react-native';
import {  Provider as PaperProvider, Button, Avatar, Caption, Surface, IconButton, Colors} from 'react-native-paper';
import { Col, Row, Grid } from "react-native-easy-grid";
import {styles, theme, DOMAIN,debug} from './Constant';
import { MaterialCommunityIcons,Ionicons } from '@expo/vector-icons';
import { Input, Divider } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Spinner from 'react-native-loading-spinner-overlay';

export default class MyEarning extends React.Component {

    constructor(props) {
        super(props);
        this.state = {          
            accessTokan:'',
            data:{},
            grantAmt:0,
            spinner:true,
            driver_points:0,
            page:1,
            loader:false
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

        //alert(this.state.accessTokan)
        this.fetchRecords(this.state.page)
    }

    componentWillUnmount = () => {
        console.log("Componenet Will Un Mount >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>. ")
    }

    fetchRecords = async (page) => {
        await fetch(`${DOMAIN}api/driver/earning/${page}`,{
            method: 'GET',
            headers : {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer '+this.state.accessTokan
            },            
        }).then(function (response) {
            return response.json();
        }).then( (result)=> {
            //console.log('earning12=============>',debug(result))
            this.setState({spinner:false})
            if(result.status === 1){
                if(page === 1){
                    this.setState({
                        data:result.data,
                        grantAmt:result.grantAmt,
                        driver_points: result.driver_points
                    })
                }else{
                    this.setState({                
                        data: [...this.state.data, ...result.data],
                        loader:false
                    })
                }
            }
            console.log('earning12=============>',page)
        })
    }

    handleLoadMore = () => {
         this.setState({
            page: this.state.page + 1,
            loader:true
         }, () => {
            this.fetchRecords(this.state.page);
         });
    }

    render() {
        //console.log(this.state.data)
        return (
            <>
                <Spinner
                    visible={this.state.spinner}
                    color='#FFF'
                    overlayColor='rgba(0, 0, 0, 0.5)'
                />

                <PaperProvider theme={theme}> 
                    <View style={{ flex: 1,backgroundColor: "aliceblue"}}> 
                        {
                        this.state.grantAmt
                        ?
                        <Surface style={[localStyle.surface,{marginHorizontal:0,height:65}]}>

                            <Grid style={{flexDirection:'row'}}>                            
                                <Row size={12} style={{height:50,marginHorizontal:15}}>
                                    <Col size={6}  style={{alignItems:'flex-start',justifyContent:'center'}}>
                                        <Text>Total Amount</Text>
                                        <Text style={{ fontSize:22}}>{this.state.grantAmt}</Text>
                                    </Col>
                                    <Col size={6} style={{alignItems:'flex-end',justifyContent:'center'}}>
                                        <Text style={{ fontSize:13}}>Total Rewards</Text>
                                        <View style={{flexDirection:'row',alignItems:'center'}}>
                                            <Text style={{}}>
                                                <MaterialCommunityIcons size={22} color='#fec557' name="cards-diamond" />
                                            </Text>
                                            <Text style={{ fontSize:22}}>{this.state.driver_points}</Text>
                                        </View>
                                    </Col>
                                </Row>
                            </Grid> 
                        </Surface>
                        :
                        null
                        }
                        {   
                            Object.keys(this.state.data).length > 0 
                            ?
                            <View style={{ backgroundColor: "aliceblue",marginBottom:20}}>
                                
                                {<FlatList
                                    data={this.state.data}
                                    renderItem={({item, index}) => {
                                        return (
                                            <TouchableOpacity 
                                                style={{paddingTop:15}}
                                                onPress={() => this.props.navigation.navigate('TripDetails',{bookId:item.book_id})}
                                            >
                                                <Row style={{flex: 1, flexDirection:'row', marginHorizontal:15 }} >
                                                    <Col size={8}>
                                                        <Caption style={{fontSize:16}} >{item.transactionDate}</Caption>
                                                    </Col>
                                                    <Col size={4} style={{alignItems:'flex-end'}}>
                                                        <Caption style={{fontSize:16,color:item.isPositive === 'Yes' ? '#000' : '#dc3545', width:'100%',textAlign:'right'}}>{item.amount}</Caption>
                                                    </Col>
                                                </Row>
                                                <Row style={{flex: 1, flexDirection:'row', marginHorizontal:15 }}>
                                                    <Col size={12}>
                                                        <Text style={{fontSize:16}}>{item.pay_type}</Text>
                                                    </Col>
                                                </Row>
                                                <Divider style={{paddingTop:15}} />
                                            </TouchableOpacity>
                                        )
                                    }}
                                    keyExtractor={item => item.id}
                                    onEndReached={() => {this.handleLoadMore()}}
                                    onEndReachedThreshold={0.1}
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
                    </View>
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