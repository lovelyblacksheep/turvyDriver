import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {DOMAIN} from './Constant';
import { 
    StyleSheet, 
    View,
    Text

} from 'react-native';
import { Audio } from 'expo-av';

export default class CheckDrivingTime extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            timeData:false,
            drivingTime:0.00,
            offlineTime:0.00,
            accessTokan:'',
            showAlert:false,
            alertTime: 30*60,
            alertTone:true,
        }

    }

    componentDidMount = () => {
        this._checkDrivingTime()

        this.drivingInterval = setInterval(() => {                
            this._checkDrivingTime();
            //console.log('screen name:',this.props.route.name);
        }, 60000);
    }

    _checkDrivingTime = async () => {

        await AsyncStorage.getItem('accesstoken').then((value) => {
            fetch(DOMAIN+'api/driver/checkDrivingTime',{
                method: 'GET',
                headers : {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': 'Bearer '+value
                }
            }).then(function (response) {
                return response.json();
            }).then( (res)=> {
                console.log('_checkDrivingTime loop global:',res);
                if(res.status == 1){
                    this.setState({
                        timeData:res.data,
                    })
                    if(res.data.driving_time <= this.state.alertTime){
                        this.setState({
                            showAlert:true
                        },() => {
                            if(this.state.alertTone){
                                this.alertTone() 
                            }
                        })
                    }

                    if(res.data.driving_time <= 0){
                        this.setState({
                            showAlert:false
                        }) 
                    }
                }
            });
        });

    }

    alertTone = async () => {
        const { sound: playbackObject} =  await Audio.Sound.createAsync(
            require('../assets/cancel_notice.mp3'),
            {}
        );

        this.setState({
            toneObject:playbackObject,
            alertTone:false            
        })

        await playbackObject.playAsync();
        playbackObject.setIsLoopingAsync(true);
        setTimeout(()=>{
            playbackObject.stopAsync(false);
        }, 5000);
    }

    render() {
        if(this.state.timeData){ 
            let avlstr = this.state.timeData.driving_time_text;
            if(avlstr){
                avlstr = avlstr.replace('0 hr ', '');
            }
            return (
                <>
                    {
                    this.state.showAlert
                    ?
                    <View style={{position:'absolute', zIndex: 100, top:'10%',  alignItems:'center', height: 'auto', backgroundColor: 'transparent',alignSelf:'center',width:280}}>
                        <View style={{backgroundColor:'red',borderRadius:5,paddingVertical:5,paddingHorizontal:10,borderColor:'#FFF',borderWidth:3,elevation:5,alignItems:'center',marginVertical:5}}>
                            <Text style={{color:'#FFF',fontSize:18}}>Driving time available {avlstr}</Text>
                        </View>
                        
                    </View>
                    :
                    null
                    }
                </>
            )
        }else{
            return null
        }
    }
}