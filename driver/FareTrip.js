import React from 'react';
import { 
    StyleSheet, 
    View,
    Text

} from 'react-native';
import { PUSHER_API} from './Constant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Pusher from 'pusher-js/react-native';
export default class FareTrip extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showAlert:false,
            bookId: 0,
            driverId:0,
            distance:0,
            totalAmount:0
        }

    }

    componentDidMount = async () => {

        await AsyncStorage.getItem('running_book_id').then((value) => {
            
            if(value != '' && value !== null){
                this.setState({bookId: JSON.parse(value)})
            }
        })

        await AsyncStorage.getItem('driverId').then((value) => {
            
            if(value != '' && value !== null){
                this.setState({driverId: JSON.parse(value)})
            }
        })

        var pusher = new Pusher(PUSHER_API.APP_KEY, {
            cluster: PUSHER_API.APP_CLUSTER
        });
  
        var channel = pusher.subscribe('turvy-channel');
        channel.bind('end_trip_event', this._showTripFare);
        channel.bind('violent_end_trip_event', this._showTripFare);
    }

    _showTripFare = async (data) => {
        /* console.log('trip fare date', data)
        console.log('trip fare bookId', this.state.bookId)
        console.log('trip fare driverId', this.state.driverId) */
        await AsyncStorage.getItem('driverId').then((value) => {
            let driverId = JSON.parse(value)
            if(data.driver_id == driverId){
                this.setState({
                    distance:data.tripDistance,
                    totalAmount:data.totalAmount,
                    showAlert:true
                },() => {
                    setTimeout(()=>{
                        this.setState({
                            showAlert:false
                        })
                    }, 15000);
                })
            }
        })
    }

    render() {
        const {distance, totalAmount} = this.state;
            return (
                <>
                    {
                    this.state.showAlert
                    ?
                    <View style={{position:'absolute', zIndex: 100, top:'5%',left:0, right: 0, width: '100%', alignItems:'center', height: 'auto', backgroundColor: 'transparent' }}>
                        <View style={{backgroundColor:'#62CD32',borderRadius:5,alignItems:'center', paddingVertical:10,paddingHorizontal:20,borderWidth:3,borderColor:'#FFF',elevation:10}}>
                            <Text style={pageStyles.fontStyle}>Distance: {distance} KM </Text>
                            <Text style={pageStyles.fontStyle}>You Receive</Text>
                            <Text style={pageStyles.fontStyle}>A${totalAmount}</Text>
                        </View>
                        
                    </View>
                    :
                    null
                    }
                </>
            )
    }
}

const pageStyles = StyleSheet.create({
    fontStyle:{
        color:'#FFF',fontSize:18
    }
})