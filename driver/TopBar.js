import React, {useEffect, useState} from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  View, 
  TouchableOpacity,
  StyleSheet,
  Text
} from 'react-native';
import { Entypo, Ionicons, Octicons} from '@expo/vector-icons';
import { Col, Row, Grid } from "react-native-easy-grid";
import { Button,Badge } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Modal from 'react-native-modal';
import RewardInfoSlider from './RewardInfoSlider'
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';

const TopBar = ({props}) => {
    const navigation = useNavigation();    
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [msgCount, setMsgCount] = useState(0);
    const [badgeVisible, setBadgeVisible] = useState(false);

    //console.log('topbar props',navigation)

    useEffect (()=>{
        setInterval(() => {
            AsyncStorage.getItem('msgCount').then((value) => {           
                if(value != '' && value !== null){
                    setMsgCount(value);
                    setBadgeVisible(true)
                }else{
                    setMsgCount(0);
                    setBadgeVisible(false)
                }
            })
        }, 2000);

        if(msgCount <= 0){
            setBadgeVisible(false)
        }

        
    },[]);

    

    const toggleModal = async () =>{        
        setIsModalVisible(!isModalVisible)
    };

    return (
        <>
            <View style={{position:'absolute',width:'100%',
            top:'4%',left:'0%',zIndex:100,backgroundColor:'transparent'}}>
                <Grid>
                    <Row style={{height:50,marginHorizontal:10}}>
                        <Col size={4} style={{alignItems:'flex-start',justifyContent:'center'}}>
                            <TouchableOpacity
                            style={styles.menubox}
                            onPress={() => navigation.toggleDrawer()} >
                                <Badge visible={badgeVisible} style={{position:'absolute',top:-8,right:-8,backgroundColor:'#17a7f0',color:'#FFF'}}>{msgCount}</Badge>                             
                                <Octicons name="three-bars" size={35} color="#135aa8" />

                            </TouchableOpacity>
                            
                        </Col>
                        <Col size={4} style={{alignItems:'center',justifyContent:'center'}}>
                            <TouchableOpacity
                            style={[styles.serachbox,{backgroundColor:'#135aa8'}]}
                            onPress={() => toggleModal()} >
                                <Ionicons name="ios-eye-off" size={25} color="#FFF" />                                
                            </TouchableOpacity>
                        </Col>
                        <Col size={4} style={{alignItems:'flex-end',justifyContent:'center'}}>
                            <TouchableOpacity
                            style={styles.serachbox}
                            onPress={() => navigation.navigate('SearchDest')} >
                                <Ionicons name="ios-search-sharp" size={25} color="#135aa8" style={{fontWeight:'bold'}} />
                            </TouchableOpacity>
                        </Col>
                    </Row>
                    <Row style={{height:30}}>
                        <Col style={{alignItems:'center'}}>
                            <Text style={styles.modeText}>Privacy Mode</Text>
                        </Col>
                    </Row>
                </Grid>
            </View>
            <Modal 
                    isVisible={isModalVisible}
                    backdropOpacity={0.5}
                    animationIn="zoomInDown"
                    animationOut="zoomOutDown"
                    animationInTiming={600}
                    animationOutTiming={400}
                    onBackdropPress={()=>toggleModal()}
                >
                    <View style={{position:'absolute',top:-10}}>
                    <RewardInfoSlider  {...navigation} /> 
                    </View>
                </Modal>
        </>
    )
}
const styles = StyleSheet.create({
    menubox:{
        borderRadius:5,
        width: 40,
        height: 40,
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'#fff',
        elevation: 6,
    },
    serachbox:{
        borderWidth:0,
        borderColor:'#135aa8',
        width: 40,
        height: 40,
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'#fff',
        borderRadius:25,        
        elevation: 6,
    }, 
    modeText:{
        fontSize:14,
        textTransform:'uppercase',
        color:'#135aa8',
        fontWeight:'bold'
    },
    badgeCount:{
        borderWidth:1,

    }
    
})


export default TopBar