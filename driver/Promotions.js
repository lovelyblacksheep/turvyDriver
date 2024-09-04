import React, {useEffect, useState, useRef} from 'react';

import {  
    Provider as PaperProvider, 
    Avatar, 
    Caption, 
    Surface, 
    IconButton, 
    Colors , 
    Appbar,
    TextInput,
    Button, 
} from 'react-native-paper';

import {
    View, 
    ScrollView, 
    Picker, 
    Text,
    StyleSheet,    
    TouchableOpacity, 
    Image,StatusBar
} from 'react-native';

import {styles, theme, DOMAIN} from './Constant';
import { Input } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';

import FlashMessage from "react-native-flash-message";
import { showMessage, hideMessage } from "react-native-flash-message";
import { useNavigation } from '@react-navigation/native';

const StatusBarheight = StatusBar.currentHeight+50;

export default class Promotions extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            abnData:'',
            commentDataError:'',
        }

    }

    async componentDidMount() {

        
    }

    
    

    //'First name is required'
    render() { 
        return (
            <PaperProvider theme={theme}>
                <Appbar.Header style={{backgroundColor:'#fff'}}>
                    <Appbar.BackAction onPress={() =>this.props.navigation.goBack()} />
                    <Appbar.Content title="Promotions" />
                </Appbar.Header>
                <ScrollView>
                    <View style={styles.content}>
                        <View style={{elevation:2,borderRadius:5,marginTop:10,padding:10}}>
                            <Text style={localStyle.promoText}>
                                Earn 987 more points to keep Gold
                            </Text>
                        </View>
                        <View style={{elevation:2,borderRadius:5,marginTop:20,padding:10}}>
                            <Text style={localStyle.promoText}>
                                Drive 70 more trips to makes $70 extra
                            </Text>
                        </View>
                    </View>            
                </ScrollView>
                
            </PaperProvider>
        );
    }
}
const localStyle = StyleSheet.create({
    promoText:{
        fontSize:16
    }
});