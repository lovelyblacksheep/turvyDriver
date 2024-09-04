import * as React from 'react';
import { StatusBar } from 'expo-status-bar';
import {  Provider as PaperProvider,Text, Button } from 'react-native-paper';
import {View, ScrollView, TouchableHighlight } from 'react-native'
import {styles, theme} from './Constant'
import Fontisto from 'react-native-vector-icons/Fontisto'
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign } from '@expo/vector-icons';

export default function Thankyou() {
		const navigation = useNavigation();
		
  return (<><StatusBar style="auto" />
     <PaperProvider theme={theme}>
<ScrollView>
          <View style={styles.content}>
          <Fontisto name="close-a" size={20} onPress={()=>navigation.navigate('LocationEnableScreen')} style={{marginTop:20,marginBottom:20}} />
          <View style={styles.space30}></View>
          	<View>
          		<Text style={styles.h1Bold}>Verify your email</Text>
          		<View style={styles.space}></View>
          		<View style={styles.space}></View>
          		<Text style={styles.smallText}>Thanks for registration with Turvy, we just sent email to your inbox for email verification.</Text>
          		<Text style={styles.smallText}>Please check your mail inbox.</Text>
          		<View style={styles.space}></View>
          	</View>
          </View>
</ScrollView>
<View style={{padding:20,alignItems:'center',marginBottom:10}}>        	
            <TouchableHighlight             
              style={styles.contentBtn} onPress={()=>navigation.navigate('LocationEnableScreen')}>
              <LinearGradient  
                  style={styles.priBtn}       
                  colors={['#2270b8', '#74c0ee']}
                  end={{ x: 1.2, y: 1 }}>          
                    <Text style={styles.priBtnTxt}>Next</Text>          
              </LinearGradient>
            </TouchableHighlight>  
        </View>

</PaperProvider>
  </>);
}