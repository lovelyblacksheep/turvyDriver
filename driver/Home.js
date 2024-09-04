import * as React from 'react';
import { StatusBar } from 'expo-status-bar';
import {  Provider as PaperProvider,Text, Button } from 'react-native-paper';
import {View, ScrollView,  } from 'react-native'
import {styles, theme} from './Constant'
import Fontisto from 'react-native-vector-icons/Fontisto'

export default function Home() {
  return (<><StatusBar style="auto" />
     	<PaperProvider theme={theme}>
		<View style={styles.container}>
			<Text>Home </Text>
		</View>
		</PaperProvider>
  </>);
}