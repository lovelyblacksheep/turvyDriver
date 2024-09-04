import React, { useState, useEffect } from 'react';
import { Image, View, Platform, TouchableOpacity, Text, StyleSheet,Modal,ActivityIndicator } from 'react-native';
import { AntDesign,Entypo } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Col, Row, Grid } from "react-native-easy-grid";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImageManipulator from 'expo-image-manipulator';
import {styles,theme, DOMAIN} from '../Riders/Constant';


export default function UploadImage(props) {
  const [image, setImage] = useState(null);
  const [boxwidth, setBoxwidth] = useState(200);
  const [boxheight, setBoxheight] = useState(200);
  const [accessTokan, setAccessTokan] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [showindicator,setShowindicator] = useState(false);
  const [showloadimg,setShowloadimg] = useState(false);
	useEffect(() => {
			//console.log("image props",props);
				//alert("here");
			setImage(props.imageuri);
			getAccessToken();
			//setBoxheight(props.height);
			//setBoxwidth(props.width);
   });
   
 
  const addImage = async() =>{
  	let _image = await ImagePicker.launchImageLibraryAsync({
  		 mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1,1],
      quality: 0.5,
      maxWidth:200,
      maxHeight:200,
  	});
  	// alert("here upload ");
  	 console.log(JSON.stringify(_image));
	 if (_image.cancelled) {
	    return;
	  }
  
    if (!_image.cancelled) {
      setImage(_image.uri);
      
      let resizedImage = await ImageManipulator.manipulateAsync(_image.uri, [{ resize: { width: 200 } }],
                { compress:1,format: ImageManipulator.SaveFormat.PNG , base64: false });
               console.log("Resize Image",resizedImage);
       let localUri = resizedImage.uri;
	  let filename = localUri.split('/').pop();
	
	  let match = /\.(\w+)$/.exec(filename);
	  let type = match ? `image/${match[1]}` : `image`;
	
	  let formData = new FormData();
	//  alert("here on reload"+localUri);
	     console.log("BEFORE PHOTO 2");
	  formData.append('photo', { uri: localUri, name: filename, type });
	  formData.append("riderId",props.riderId);
	  //return await fetch('https://turvy.net/api/rider/uploadimage', {
	  fetch('https://www.turvy.net/api/rider/uploadimage', {
	    method: 'POST',
	    body: formData,
	    header: {
	      'content-type': 'multipart/form-data',
	       'Authorization': 'Bearer '+accessTokan
	    }
	  }).then(function (response) {

          return response.json();																																														
     }).then( (result)=> {
     	console.log("AFTER PHOTO 2",result);
     	AsyncStorage.setItem('avatar', DOMAIN+result.url);
     	setModalVisible(false);
     	props.onReload(localUri);
     	setShowloadimg(true);
     		
     		//
     	   //getprofileinfo();
        //	console.log(result);
        	//console.log("AFTER PHOTO");
     });
               
    }
    
   /* let resizedUri = await new Promise((resolve, reject) => {
                ImageEditor.cropImage(result.uri,
                    {
                        offset: { x: 0, y: 0 },
                        size: { width: result.width, height: result.height },
                        displaySize: { width: wantedwidth, height: wantedheight },
                        resizeMode: 'contain',
                    },
                    (uri) => resolve(uri),
                    () => reject(),
                );
            });
            
		alert(resizedUri);            
    */
     
  };
    
    async function getAccessToken(){

		await AsyncStorage.getItem('accesstoken').then((value) => {			
			if(value != '' && value !== null){
				setAccessTokan(value)
			}
		})

	}
  
   const addImageCam = async() =>{
  	let _image = await ImagePicker.launchCameraAsync({
  		 mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1,1],
      quality: 1,
       maxWidth:200,
      maxHeight:200,
  	});
  	 setShowindicator(true);
  	 //console.log("IMAGE CAN Y",JSON.stringify(_image));
	 if (_image.cancelled) {
	    return;
	  }
  
    if (!_image.cancelled) {
      setImage(_image.uri);
      //alert("here"+_image.uri);
      let resizedImage = await ImageManipulator.manipulateAsync(_image.uri, [{ resize: { width: 200 } }],
                { compress: 1,format: ImageManipulator.SaveFormat.PNG , base64: false });
              // console.log("Resize Image",resizedImage);
               
        let localUri = resizedImage.uri;
		  let filename = localUri.split('/').pop();
		
		  let match = /\.(\w+)$/.exec(filename);
		  let type = match ? `image/${match[1]}` : `image`;
		  
		  let formData = new FormData();
		  formData.append('photo', { uri: localUri, name: filename, type });
		   formData.append("riderId",props.riderId);
		  console.log("BEFORE PHOTO");
		  //return await fetch('https://turvy.net/api/rider/uploadimage', {
		  fetch('https://www.turvy.net/api/rider/uploadimage', {
		    method: 'POST',
		    body: formData,
		    header: {
		      'content-type': 'multipart/form-data',
		       'Authorization': 'Bearer '+accessTokan
		    }
		  }).then(function (response) {
	          return response.json();																																														
	     }).then( (result)=> {
	     	   console.log("AFTER Photo",result);
	     	   AsyncStorage.setItem('avatar', DOMAIN+result.url);
	     	   setModalVisible(false);
	     		props.onReload(localUri);
	     		setShowindicator(false);	
          	setShowloadimg(true);	
	     	   //getprofileinfo();
	        //	console.log(result);
	        	//console.log("AFTER PHOTO");
	     });
    }
  };
  
 
  return (
            <><View style={[imageUploaderStyles.container,{width: props.width ? props.width : 200, height: props.height ? props.height : 200}]}>
                {
                    image  && <Image source={{ uri: image }} onLoadStart={() => { setShowloadimg(true)}} 
                     onLoadEnd={() => { setShowloadimg(false)
                                       }}
                     style={{  width: props.width ? props.width : 200, height: props.height ? props.height : 200 }} />
                }
                    <ActivityIndicator size="large" color="#3f78ba" animating={showloadimg} />
                    <View style={[imageUploaderStyles.uploadBtnContainer,{width: props.btnwidth ? props.btnwidth : '100%', height: props.btnheight ? props.btnheight : '25%'}]}>
                    		<Grid>
                    			<Row>
									<Col size={5}>
                    				  <TouchableOpacity onPress={()=>{setModalVisible(true)}} style={imageUploaderStyles.uploadBtn} >
		                            <AntDesign name="camera" size={30} color="#2c5381" />
		                        </TouchableOpacity>
                    				</Col>
                    			</Row>
                    		</Grid>
                    </View>
            </View>
             <Modal
              backdropColor={'green'}
               backdropOpacity= {1}
              animationType="slide"
               visible={modalVisible}
               onRequestClose={() => { setModalVisible(false); } } >
                <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)',flex:1}}>
              <Grid >
     				<Row style={{paddingTop:20,backgroundColor:'#fff',height:100}}>
                 <Col size={6}>
                    <TouchableOpacity onPress={addImage} style={imageUploaderStyles.uploadBtn} >
                     <Entypo name="folder-images" size={24} color="#3f78ba" />
                     <Text>Gallery</Text>
                    </TouchableOpacity>
			        </Col>
			        <Col size={1}><View style={{borderWidth:1,borderColor:'#3f78ba',width:1,height:50}}></View></Col>
			        <Col size={5}>
                    <TouchableOpacity onPress={addImageCam} style={imageUploaderStyles.uploadBtn} >
                            <AntDesign name="camera" size={24} color="#3f78ba" />
                            <Text>Camera</Text>
                       </TouchableOpacity>
                   </Col>
                 </Row>
                 <Row>
                 	<Col size={12}>
                 		<ActivityIndicator size="large" color="#fff" animating={showindicator} />
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
        opacity:0.7,
        position:'absolute',
        right:0,
        bottom:0,
        backgroundColor:'transparent',
        width:'100%',
        height:'25%',
    },
    uploadBtn:{
        display:'flex',
        alignItems:"center",
        justifyContent:'center'
    }
})