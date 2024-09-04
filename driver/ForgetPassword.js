import React,{useState, useEffect} from 'react';
import {  Provider as PaperProvider,Text,Button } from 'react-native-paper';
import {View,ScrollView, TouchableHighlight} from 'react-native'
import {styles, theme, DOMAIN} from './Constant'
import { Input } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

export default function ForgetPassword() {
 	const [email, setEmail] = useState('');
 	const [emailError, setEmailError] = useState('');
 	const navigation = useNavigation();
 	
 	const submit = () => {
 		
			alert('Dummy Page')
		
 	}
  return (<PaperProvider theme={theme}>
          <View style={styles.content}>
		      <ScrollView contentContainerStyle={styles.scrollViewStyle} keyboardShouldPersistTaps='handled'>		        
		        <View style={styles.space30}></View>
		        <Input placeholder="Email Address" inputStyle={styles.inputStyle} inputContainerStyle={styles.inputContainerStyle} errorStyle={styles.error} errorMessage={emailError} onChangeText={value => {setEmail(value);setEmailError('')}}
  value={email} />					
		          <View style={{marginLeft:10,marginRight:10}}>
        	<TouchableHighlight             
              style={styles.contentBtn} onPress={() => submit()}>
              <LinearGradient  
                  style={styles.priBtn}       
                  colors={['#2270b8', '#74c0ee']}
                  end={{ x: 1.2, y: 1 }}>          
                    <Text style={styles.priBtnTxt}>Send</Text>          
              </LinearGradient>
            </TouchableHighlight>
        </View>
		      </ScrollView>
		      </View>
		  </PaperProvider>);
}