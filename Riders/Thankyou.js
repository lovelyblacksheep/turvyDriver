import * as React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider, Text, Button } from 'react-native-paper';
import { View, ScrollView, } from 'react-native'
import { styles, theme } from './Constant'
import Fontisto from 'react-native-vector-icons/Fontisto'
import { useNavigation } from '@react-navigation/native';

export default function Thankyou() {
	const navigation = useNavigation();

	return (
		<>
		<Text>Thank you</Text>
			// <StatusBar style="auto" />
			// <PaperProvider theme={theme}>
			// 	<ScrollView>
			// 		<View style={styles.content}>
			// 			<Fontisto name="close-a" size={20} onPress={() => navigation.navigate('LocationEnableScreen')} style={{ marginTop: 20, marginBottom: 20 }} />
			// 			<View style={styles.space30}></View>
			// 			<View>
			// 				<Text style={styles.h1Bold}>Verify your email</Text>
			// 				<View style={styles.space}></View>
			// 				<View style={styles.space}></View>
			// 				<Text style={styles.smallText}>Thanks for registration with Turvy, we just sent email to your inbox for email verification.</Text>
			// 				<Text style={styles.smallText}>Please check your mail inbox.</Text>
			// 				<View style={styles.space}></View>
			// 			</View>
			// 		</View>
			// 	</ScrollView>
			// 	<View style={{ padding: 20, alignItems: 'center' }}>
			// 		<Button mode="contained" style={styles.btn} onPress={() => navigation.navigate('LocationEnableScreen')}>Next</Button>
			// 	</View>
			// </PaperProvider>
		</>
	);
}