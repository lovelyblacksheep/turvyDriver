import React ,{useRef,useEffect,useCallback} from 'react';
import { StyleSheet, Text, View, Button ,ScrollView,TouchableOpacity,Image,TextInput,TouchableHighlight } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { FontAwesome ,FontAwesome5 } from '@expo/vector-icons'; 
import * as Location from 'expo-location';

const GooglePlacesInput = () => {
	
	const clearText=() =>{
	
	}
  const GooglePlacesRef = useRef();
  
  const fetchMyAPI = useCallback(async () => {
     let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
      let location = await Location.getCurrentPositionAsync();
      if (location.coords) {
		    const { latitude, longitude } = location.coords;
		    let response = await Location.reverseGeocodeAsync({
		      latitude,
		      longitude
		    });
		   let address = '';
		    for (let item of response) {
		      let address = `${item.name}, ${item.district}, ${item.city} , ${item.postalCode}`;
		     // console.log(address);
		      GooglePlacesRef.current.setAddressText(address);
		    }
		  }
		  
		  
  		 
  }, []);
  
  useEffect(() => {    
   // Update the document title using the browser API    document.title = `You clicked ${count} times`;
      fetchMyAPI()
     });
  return (
  <ScrollView keyboardShouldPersistTaps={'handled'}>
       <ScrollView keyboardShouldPersistTaps={'handled'}>
    <GooglePlacesAutocomplete
     enablePoweredByContainer={false}
     ref={(instance) => { GooglePlacesRef.current = instance }}
      placeholder='Search'
      onPress={(data, details = null) => {
        // 'details' is provided when fetchDetails = true
        console.log(data, details);
        //GooglePlacesRef.current.setAddressText("")
      }}
      query={{
        key: 'AIzaSyAr2ESV30J7hFsOJ5Qjaa96u9ADSRX6_Sk',
        language: 'en', 
      }} 
      listViewDisplayed='auto'    // true/false/undefined
       styles={{
        textInputContainer: {
          width: '100%',
        },textInput: {
		      height: 38,
		      color: '#5d5d5d',
		      fontSize: 16,
		      backgroundColor:'#ccc'
		    },
        description: {
          fontWeight: 'bold'
        },
        predefinedPlacesDescription: {
          color: '#1faadb'
        }
      }}
      renderLeftButton={()=>{ 
      			
      	     return(<View style={{justifyContent: 'center', alignItems: 'center',padding:10}}><FontAwesome5 name="sourcetree" size={24} color="black" /></View>);
      }}
   	renderRightButton ={()=>{
   		return(<View style={{justifyContent: 'center', alignItems: 'center',padding:10}}><FontAwesome name="remove" size={24} color="black" /></View>);
   	}}
      	
   	
    />
  
     </ScrollView> 
     </ScrollView> 
  );
};

export default GooglePlacesInput;