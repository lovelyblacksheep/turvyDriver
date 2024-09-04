import React from 'react';
import { View, Text, Button } from 'react-native';
import { useRoute } from '@react-navigation/native';

export default function PaypalSuccess(props) {

  const route = useRoute();
  const goHome = () => {
      props.navigation.navigate('Home');    
  }
  return (
    <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
      <Text style={{fontWeight:'bold',fontSize:20}}>Payment Successfull</Text>      
      
     </View>
  );
}