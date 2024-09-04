import React, {useEffect, useState} from 'react';
import { StatusBar } from 'expo-status-bar';
import {  Provider as PaperProvider,Text } from 'react-native-paper';
import {View,ScrollView,  } from 'react-native'
import {styles, theme, DOMAIN} from './Constant';
import { WebView } from 'react-native-webview';


export default function PrivacyPolicy() {
  const [prvData, setPrvData] = useState('');  

  useEffect(()=>{
    //console.log('herhjh');
    
    fetch(DOMAIN+'api/policy',{
      method: 'GET',
    }).then(function (response) {
      return response.json();
      }).then( (result)=> {
        
        setPrvData(result.data);
          
    });
  })
  return (<>
     <PaperProvider theme={theme}>
     <View  style={{flex: 1}}>
     
      <WebView
        originWhitelist={['*']}
        source={{ html: '<div style="font-size:40px;padding:10px 30px;line-height:60px;">'+prvData+'</div>' }}
      />
      </View>
</PaperProvider>
  </>);
}