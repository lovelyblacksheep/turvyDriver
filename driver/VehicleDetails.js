import React from 'react';
import { StatusBar } from 'expo-status-bar';
import {  
	Provider as PaperProvider,
	Text, 
	Button, 
	Appbar, 
	Card, 
	Title, 
	Paragraph,
	TouchableRipple,
	Divider 
} from 'react-native-paper';
import {
	View, 
	ScrollView, 
	TouchableWithoutFeedback,
	Image,
	TouchableHighlight, 
	StyleSheet, 
	TouchableOpacity, 
	Dimensions 
} from 'react-native'

import {styles, theme, DOMAIN} from './Constant';
import Spinner from 'react-native-loading-spinner-overlay';
import { AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

export default class VehicleDetails extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        	driverId:null,
        	spinner:true,
        	accessTokan:'',
        	data:{},
        	isDataFetch:false
        }
    }

    async componentDidMount() {
        //console.log(this.props)
        await AsyncStorage.getItem('driverId').then((value) => {           
            if(value != '' && value !== null){
                this.setState({
                    driverId:value
                })
            }
        })

        await AsyncStorage.getItem('accesstoken').then((value) => {			
			if(value != '' && value !== null){
				this.setState({
                    accessTokan:value
                })
			}
		})

        fetch(DOMAIN+'api/driver/vehicle-details',{
            method: 'GET',
            headers : {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer '+this.state.accessTokan
            }
        }).then(function (response) {
            return response.json();
        }).then( (result)=> {
            //console.log(result);
            this.setState({
                spinner:false,
                data:result.data,
                isDataFetch:true
            })
        })
    }

    uploadFrontImage = async () => {
    	//alert('jhjhj')
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
            this.state.data.front_photo = _image.uri;
            this.setState({
                data: this.state.data,
            })
        }  
        let resizedImage = await ImageManipulator.manipulateAsync(_image.uri, 
            [{ resize: { width: 300 } }],
            { compress:1,
                format: ImageManipulator.SaveFormat.PNG , 
                base64: false 
            });
        //console.log("Resize Image",resizedImage);
    
        let localUri = resizedImage.uri;        
        //let localUri = _image.uri;
        let filename = localUri.split('/').pop();

        let match = /\.(\w+)$/.exec(filename);
        let type = match ? `image/${match[1]}` : `image`;

        let formData = new FormData();
        formData.append('frontImage', { uri: localUri, name: filename, type });
        //console.log('formdate:',formData);
        return await AsyncStorage.getItem('accesstoken').then((value) => {
            fetch(`${DOMAIN}api/driver/vehicle-image/${this.state.driverId}`,{
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
                console.log('document:',result.data);
            });
        })
    }

    render() {
        //console.log(this.state.data)
        const info = this.state.data
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
                    	title="Vehicle Details" 
                    	titleStyle={{textAlign:'center',alignContent:'center'}} 
                    />
                    <AntDesign 
                    	name="edit" 
                    	size={24} 
                    	color="black" 
                    	style={{paddingRight:15}}
                    	onPress={() => this.props.navigation.replace('EditVehicleDetails')}
                    />
                </Appbar.Header>  
                {(info)
            	?
                <PaperProvider theme={theme}> 
                    <ScrollView keyboardShouldPersistTaps='handled' style={{ backgroundColor: "#FFF"}}>                     	
                    	<View style={{padding:20,alignItems:'center'}}>
                    		<Text style={{fontSize:16,paddingBottom:10}}>Front photo of vehicle</Text>
                    		<TouchableOpacity style={{marginVertical:10}}
                    			onPress={()=>{
                                    this.uploadFrontImage()
                                }}
                    		>
                    		{
                    			info.front_photo
                    			?
			        		<Image
				        	style={{width:200,height:200,borderRadius:10}}
				        	source={{uri: info.front_photo}}
				        	resizeMode='contain'
				      		/>
				      		:
				      		<Image 
                                source={require('../assets/no-image.png')} 
                                style={{alignItems:'center', width:224,height:244,borderRadius:5}}
                            />
				      		}
				      		</TouchableOpacity>
			        	</View>
			        	<Divider orientation="horizontal" />
			        	<View style={{padding:20}}>
			        		<View style={{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center',marginBottom:15}}>
				        		<View style={{alignItems:'flex-start',flex:1,justifyContent:'center'}}>
				        			<Text style={pageStyles.lable}>Make</Text>
				        			<Text style={pageStyles.val}>{info.make_name}</Text>
				        		</View>
				        		<View style={{alignItems:'flex-end',flex:1,justifyContent:'center'}}>
					        		<Image
						        	style={{width:80,height:80,borderRadius:10}}
						        	source={{uri: DOMAIN+info.make_image}}
						        	resizeMode='contain'
						      		/>
					      		</View>
				      		</View>
			        		<View style={pageStyles.infoOuter}>
			        			<Text style={pageStyles.lable}>Model</Text>
			        			<Text style={pageStyles.val}>{info.model_name}</Text>
			        		</View>			        		
			        		<View style={pageStyles.infoOuter}>
			        			<Text style={pageStyles.lable}>Plate Number</Text>
			        			<Text style={pageStyles.val}>{info.plate}</Text>
			        		</View>
			        		<View style={pageStyles.infoOuter}>
			        			<Text style={pageStyles.lable}>Color</Text>
			        			<Text style={pageStyles.val}>{info.color}</Text>
			        		</View>
			        		<View style={pageStyles.infoOuter}>
			        			<Text style={pageStyles.lable}>Year</Text>
			        			<Text style={pageStyles.val}>{info.year}</Text>
			        		</View>
			        	</View>
                    </ScrollView>
                </PaperProvider>
                :
	        	<View></View>
	        	}
            </>
        );
    }            

}

const pageStyles = StyleSheet.create({
	infoOuter:{
		marginBottom:20
	},
	lable:{
		fontSize:20,
		color:'#a4a4ac',
		marginBottom:5
	},
	val:{
		fontSize:20,
		color:'#000'
	}

})