import React,{useState, useEffect} from 'react';
import {  Provider as PaperProvider,Text,Button,Appbar } from 'react-native-paper';
import {View,ScrollView, } from 'react-native'
import {styles, theme, DOMAIN} from './Constant'
import { Input } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';

export default function ForgetPassword() {
 	const [email, setEmail] = useState('');
 	const [emailError, setEmailError] = useState('');
 	const navigation = useNavigation();
 	
 	const submit = () => {
 		
			alert('Dummy Page')
		
 	}
  return (<PaperProvider theme={theme}>
  				<Appbar.Header>
   <Appbar.BackAction onPress={() => navigation.goBack()} />
  			<Appbar.Content title="Forget Password" />
  </Appbar.Header>
          <View style={styles.content}>
		      <ScrollView contentContainerStyle={styles.scrollViewStyle} keyboardShouldPersistTaps='handled'>		        
		        <View style={styles.space30}></View>
		        <Input placeholder="Email Address" inputStyle={styles.inputStyle} inputContainerStyle={styles.inputContainerStyle} errorStyle={styles.error} errorMessage={emailError} onChangeText={value => {setEmail(value);setEmailError('')}}
  value={email} />
					<Button mode={'contained'} style={{padding:5,borderRadius:40,marginLeft:10,marginRight:10}}
		          onPress={() => submit()}>Send</Button>
		      </ScrollView>
		      </View>
		  </PaperProvider>);
}