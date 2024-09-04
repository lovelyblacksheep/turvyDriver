import React, {Component} from 'react'
import { View, StyleSheet, Text } from 'react-native'
import { moderateScale } from 'react-native-size-matters'
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from 'react-native-paper';
import Pusher from 'pusher-js/react-native';
import { DOMAIN, PUSHER_API} from './Constant';
import Modal from 'react-native-modal';
export default class TipReceived extends Component{
    constructor(props){
        super(props);
        this.state = {
            amount:0,
            driverName:'',
            tipModel:false,
            res:{},
            accessTokan:''
        }
    }

    async componentDidMount() {
        await AsyncStorage.getItem('name').then((value) => {
            if(value != '' && value !== null){
                this.setState({driverName: value})
            }
        })

        await AsyncStorage.getItem('accesstoken').then((value) => {
            if(value != '' && value !== null){
                this.setState({accessTokan: value})
            }
        })

        var pusher1 = new Pusher(PUSHER_API.APP_KEY, {
          cluster: PUSHER_API.APP_CLUSTER
        });

        var channel1 = pusher1.subscribe('turvy-channel');
        channel1.bind('book_tip_event', this.isRideTipToDriver);

        
    }

    isRideTipToDriver = async (data) => {
        //console.log('tip data',data)
        //console.log('tip booking id',this.state.book_id)


        await AsyncStorage.getItem('driverId').then((value) => {
            console.log('driverId',value)
            if(value != '' && value !== null && data.driver_id == value){
                this.setState({
                    tipModel:true,
                    amount: data.amount,
                    res:data,
                })
                setTimeout(()=>{
                    this.setState({
                        tipModel:false,
                    })
                }, 15000);
            }
        })

        
    }
    _pressTipThank = () => {
        this.setState({
            tipModel:false
        })

        fetch(DOMAIN+'api/driver/tip-thanks',{
            method: 'POST',
            headers : {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer '+this.state.accessTokan
            },
            body: JSON.stringify({
                "rider_id" : this.state.res.id,
                "driver_id" : this.state.res.driver_id,
                "book_id" : this.state.res.book_id,
                "driver_name" : this.state.driverName,
            })
        }).then(function (response) {
            return response.json();
        }).then( (result)=> {
            console.log('tip thanks response:',result)
        }) 
    }

    render(){
        return(
            <Modal 
                isVisible={this.state.tipModel}
                backdropOpacity={0.5}
                animationIn="zoomInDown"
                animationOut="zoomOutDown"
                animationInTiming={600}
                animationOutTiming={400}                    
            >
                <View style={tipstyles.container}>
                    <View style={tipstyles.subContainer}>
                        <View style={tipstyles.tickBox}>
                            <MaterialIcons name="check-circle" size={moderateScale(30)} color="white" />
                        </View>
                        <Text style={tipstyles.name}>Congratulations {this.state.driverName}</Text>
                        <Text style={tipstyles.amount}>A${this.state.amount}</Text>
                        <View style={{flex:1,alignItems: 'center',justifyContent:'center'}}>
                            <View><Text style={tipstyles.text}>You have received a tip!</Text></View>
                            <View style={{alignItems: 'center',justifyContent:'center',paddingVertical:10}}>
                                <Text style={{color:'#5ead97'}}>Tap to say</Text>
                                <Button mode="contained" color={'#5ead97'} style={{fontWeight:'normal'}} labelStyle={{fontSize:10,alignItems:'center',justifyContent:'center',color:'#FFF'}}
                                onPress={() => this._pressTipThank()}
                                >
                                        Thank you
                                </Button>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        )
    }
}

const tipstyles = StyleSheet.create({
    container:{
        position:'absolute',
        width:'100%',
        height:moderateScale(300),
        top:'5%',
        zIndex:100,
        backgroundColor:'transparent',
        padding:moderateScale(10)
    },
    subContainer:{
        width:'100%',
        height:'100%',
        borderRadius:moderateScale(5),
        backgroundColor:'#fff',
        elevation:8,
        alignItems:'center',
        justifyContent:'space-between',
        padding:moderateScale(10)
    },
    tickBox:{
        width:moderateScale(50),
        height:moderateScale(50),
        borderRadius:moderateScale(50),
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'#5ead97'
    },
    name:{
        fontSize:moderateScale(20),
        color:'#636363'
    },
    amount: {
        color:'#5ead97',
        fontSize:moderateScale(40),
        fontWeight:'700'
    },
    text:{
        fontSize:moderateScale(20),
        color:'#5ead97',
    }
})