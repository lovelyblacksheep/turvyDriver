import React, { useState, useEffect } from 'react';
import { Image, View, Platform, TouchableOpacity, Text, StyleSheet,Modal } from 'react-native';
import { AntDesign,Entypo } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Col, Row, Grid } from "react-native-easy-grid";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DOMAIN } from './Constant'
import Spinner from 'react-native-loading-spinner-overlay';
import * as ImageManipulator from 'expo-image-manipulator';

export default function UploadImage(props) {
    const [image, setImage] = useState(null);
    const [boxwidth, setBoxwidth] = useState(200);
    const [boxheight, setBoxheight] = useState(200);
    const [accessTokan, setAccessTokan] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [driverId, setDriverId] = useState('');
    const [spinner, setSpinner] = useState(false);

	useEffect(() => {	
		setImage(props.imageuri);
		getAccessToken();
		//setBoxheight(props.height);
		//setBoxwidth(props.width);
   });
   
 
    const addImage = async() =>{
        setSpinner(true)
        let _image = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1,1],
            quality: 1,
        });  	 
        //console.log(JSON.stringify(_image));
        if (_image.cancelled) {
            setModalVisible(false);
            setSpinner(false)
            return;
        }
  
        if (!_image.cancelled) {
            setImage(_image.uri);
        }

        let resizedImage = await ImageManipulator.manipulateAsync(_image.uri, 
            [{ resize: { width: 200 } }],
            { compress:1,
                format: ImageManipulator.SaveFormat.PNG , 
                base64: false 
            });
        //console.log("Resize Image",resizedImage);
    
        let localUri = resizedImage.uri;
        let filename = localUri.split('/').pop();

        let match = /\.(\w+)$/.exec(filename);
        let type = match ? `image/${match[1]}` : `image`;

        let formData = new FormData();
        formData.append('photo', { uri: localUri, name: filename, type });
        //console.log(driverId);
        return await fetch(DOMAIN+'api/driver/profile-image/'+driverId, {
            method: 'POST',
            body: formData,
            header: {
            'content-type': 'multipart/form-data',
            'Authorization': 'Bearer '+accessTokan
            },
        }).then(function (response) {
            return response.json();					
        }).then( (result)=> {
            console.log('avtar:',result.data.avatar);
            setModalVisible(false);
            props.onReload(localUri);
            AsyncStorage.setItem('avatar',result.data.avatar);
            //setImage(DOMAIN+result.data.avatar);
            setSpinner(false)
        });
    };
    
    async function getAccessToken(){
		await AsyncStorage.getItem('accesstoken').then((value) => {			
			if(value != '' && value !== null){
				setAccessTokan(value)
			}
		})

        await AsyncStorage.getItem('driverId').then((value) => {         
            if(value != '' && value !== null){
                setDriverId(value)
            }
        })
	}
  
    const addImageCam = async() =>{
        setSpinner(true)
        let _image = await ImagePicker.launchCameraAsync({
  		    mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1,1],
            quality: 1,
        });
        //console.log('camImg:',_image);
        if (_image.cancelled) {
            setModalVisible(false);
            setSpinner(false)
            return;
        }
        if (!_image.cancelled) {
            setImage(_image.uri);
        }

        let resizedImage = await ImageManipulator.manipulateAsync(_image.uri, 
            [{ resize: { width: 200 } }],
            { compress:1,
                format: ImageManipulator.SaveFormat.PNG , 
                base64: false 
            });
        //console.log("Resize Image Cam",resizedImage);
        let localUri = resizedImage.uri;
        //let localUri = _image.uri;
        let filename = localUri.split('/').pop();

        let match = /\.(\w+)$/.exec(filename);
        let type = match ? `image/${match[1]}` : `image`;

        let formData = new FormData();
        formData.append('photo', { uri: localUri, name: filename, type });
        //console.log("BEFORE PHOTO");
        return await fetch(DOMAIN+'api/driver/profile-image/'+driverId, {
            method: 'POST',
            body: formData,
            header: {
            'content-type': 'multipart/form-data',
            },
        }).then(function (response) {
            return response.json();			
        }).then( (result)=> {
            //console.log('avtar:',result.data.avatar);
            setModalVisible(false);
            props.onReload(localUri);
            AsyncStorage.setItem('avatar',result.data.avatar);
            //setImage(DOMAIN+result.data.avatar);
            setSpinner(false)
        });
    };
 
    return (
        <>
            <Spinner
          visible={spinner}
          color='#FFF'
          overlayColor='rgba(0, 0, 0, 0.5)'
        />
            <View style={[imageUploaderStyles.container,{width: props.width ? props.width : 200, height: props.height ? props.height : 200}]}>
                <TouchableOpacity 
                    onPress={()=>{setModalVisible(true)}} 
                >
                {
                    image  && <Image source={{ uri: image }} style={{  width: props.width ? props.width : 200, height: props.height ? props.height : 200 }} />
                }
                </TouchableOpacity>
            </View>
            <Modal
                backdropColor={'green'}
                backdropOpacity= {1}
                animationType="slide"
                visible={modalVisible}
                onRequestClose={() => { setModalVisible(false); } }
            >
                <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)',flex:1}}>
                    <Grid >
                        <Row style={{paddingTop:20,backgroundColor:'#fff',height:100}}>
                            <Col size={6}>
                                <TouchableOpacity onPress={addImage} style={imageUploaderStyles.uploadBtn} >
                                    <Entypo name="folder-images" size={24} color="#3f78ba" />
                                    <Text>Gallery</Text>
                                </TouchableOpacity>
                            </Col>
        			        <Col size={1}>
                                <View style={{borderWidth:1,borderColor:'#3f78ba',width:1,height:50}}>
                                </View>
                            </Col>
        			        <Col size={5}>
                                <TouchableOpacity onPress={addImageCam} style={imageUploaderStyles.uploadBtn} >
                                    <AntDesign name="camera" size={24} color="#3f78ba" />
                                    <Text>Camera</Text>
                                </TouchableOpacity>
                            </Col>
                        </Row>
                    </Grid>
                </View>
            </Modal>
		</>
    );
}

const imageUploaderStyles=StyleSheet.create({
    container:{
        elevation:2,
        height:200,
        width:200, 
        backgroundColor:'#efefef',
        position:'relative',
        borderRadius:10,
        overflow:'hidden',
    },
    uploadBtnContainer:{
        position:'absolute',
        right:0,
        bottom:0,
        width:'100%',
        height:'20%',

    },
    uploadBtn:{
        display:'flex',
        alignItems:"center",
        justifyContent:'center'
    }
})