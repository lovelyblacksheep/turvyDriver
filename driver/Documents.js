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
import DatePicker from 'react-native-datepicker'
import * as ImagePicker from 'expo-image-picker';
import Spinner from 'react-native-loading-spinner-overlay';

const StatusBarheight = StatusBar.currentHeight+50;

export default class Documents extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            abnData:'',
            commentDataError:'',
            docImg:false,
            expireDate:'',
            date:new Date(),
            open:false,
            mode:'date',
            documentList:{},
            driverId:'',
            spinner:true,
        }

    }

    async componentDidMount() {

        await AsyncStorage.getItem('driverId').then((value) => {
            if(value != '' && value !== null){          
                this.setState({
                    driverId:value
                })
            }
        })

        await AsyncStorage.getItem('accesstoken').then((value) => {            
            fetch(DOMAIN+'api/driver/documents',{
                method: 'GET',
                headers : {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': 'Bearer '+value
                }
            }).then(function (response) {
                return response.json();
            }).then( (res)=> {
                //console.log('profile info:',res);
                this.setState({
                    documentList: res.data,
                    spinner:false,
                })
            });
            
        });

        //console.log('date',this.state.date) 
    }

    handledDateChange = (date, i, document_id) => {
        //alert(document_id)
        this.state.documentList[i].document_expire_date = date;
        this.setState({
            documentList: this.state.documentList,
        },() =>{
            //console.log('dateChange:',this.state.documentList)
            AsyncStorage.getItem('accesstoken').then((value) => {

                fetch(`${DOMAIN}api/driver/documents/${document_id}`,{
                    method: 'POST',
                    headers: new Headers({
                    'Authorization': 'Bearer '+value,
                    'Content-Type': 'application/json',
                    }),
                    body:JSON.stringify({
                        'document_expire_date':date,
                    })
                })
                .then((response) => {
                    return response.json()})
                .then((result) =>{
                    console.log('exp_date',result);
                    
                });
            });
        })
    }

    uploadDocument = async (i,document_id) => {
        //alert(document_id)
        this.setState({spinner:true})
        let _image = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            aspect: [1,1],
            quality: 1,
        });      
        //console.log(_image);
        if (_image.cancelled) {      
            this.setState({spinner:false})   
            return;
        }  
        if (!_image.cancelled) {
            this.state.documentList[i].document_url = _image.uri;
            this.setState({
                documentList: this.state.documentList,
            })
        }

        let localUri = _image.uri;
        let filename = localUri.split('/').pop();

        let match = /\.(\w+)$/.exec(filename);
        let type = match ? `image/${match[1]}` : `image`;

        let formData = new FormData();
        formData.append('document', { uri: localUri, name: filename, type });
        //console.log('formdate:',formData);
        return await AsyncStorage.getItem('accesstoken').then((value) => {
            fetch(`${DOMAIN}api/driver/documents/${document_id}/${this.state.driverId}/upload`,{
                method: 'POST',
                body: formData,
                header: {
                'content-type': 'multipart/form-data',
                'Authorization': 'Bearer '+value
                },
            }).then(function (response) {
                return response.json();                 
            }).then( (result)=> {
                this.setState({spinner:false})
                //console.log('document:',result.data);
            });
        })
    }

    
    //'First name is required'
    render() { 
        return (
            <PaperProvider theme={theme}>
                <Spinner
                    visible={this.state.spinner}
                    color='#FFF'
                    overlayColor='rgba(0, 0, 0, 0.5)'
                />
                <Appbar.Header style={{backgroundColor:'#fff'}}>
                    <Appbar.BackAction onPress={() =>this.props.navigation.goBack()} />
                    <Appbar.Content title="Documents" />
                </Appbar.Header>

                <ScrollView keyboardShouldPersistTaps='handled'>
                    <View style={{flex:1,marginTop:20}}>
                    {    
                        Object.keys(this.state.documentList).length > 0 
                        ?
                        this.state.documentList.map((item, index) => {
                        return (    
                        <Surface style={stylesinp.surface}>
                            <View><Text>{item.document_name}</Text></View>
                            <TouchableOpacity style={{marginVertical:10}}
                                onPress={()=>{
                                    this.uploadDocument(index,item.document_id)
                                }}
                            >
                                {
                                    item.document_url
                                    ?
                                    <Image 
                                        source={{uri: item.document_url}} 
                                        style={{alignItems:'center', width:300,height:300,borderRadius:5}}
                                        resizeMode='cover'
                                    />
                                    :     
                                    <Image 
                                        source={require('../assets/no-image.png')} 
                                        style={{alignItems:'center', width:224,height:244,borderRadius:5}}
                                    />
                                }
                            </TouchableOpacity>
                            <View style={{flexDirection:'row',alignItems:'center',justifyContent:'center'}}>
                                <Text style={{marginRight:10}}>Expire Date:</Text>
                                <DatePicker                                
                                date={item.document_expire_date}
                                mode="date"
                                placeholder="select date"
                                format="YYYY-MM-DD"
                                androidMode="spinner"
                                customStyles={{
                                  dateIcon: {
                                    position: 'absolute',
                                    left: 0,
                                    top: 4,
                                    marginLeft: 0
                                  },
                                  dateInput: {
                                    marginLeft: 0
                                  }        
                                }}
                                onDateChange={(date) => {
                                    this.handledDateChange(date,index,item.document_id)
                                }}
                              />
                            </View>
                        </Surface>
                        )})
                        :
                        null
                    }    
                    </View>
                    
                </ScrollView>
                <FlashMessage 
                    position="top" 
                    ref="commentMessage"  
                    style={{marginTop:StatusBarheight,borderRadius:2}} 
                />
            </PaperProvider>
        );
    }
}
const stylesinp = StyleSheet.create({
    textInput: {
        borderRadius: 5,
        borderWidth: 1,
        borderColor:'#ddd',
        fontSize: 16,
        paddingHorizontal: 20,
        marginHorizontal: 0,
        padding: 10,
        marginTop: 8,
        height: 150,
        width:250
    },
	surface: {
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,        
        borderRadius:5,
        marginHorizontal:20,
        marginVertical:10
    },
});