import React, {useEffect, useState} from 'react';
import { Alert,ToastAndroid } from 'react-native';
import { firebase } from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useNavigation } from '@react-navigation/native';


async function registerForPushNotificationsAsync(token) {
  
   // if (Constants.isDevice) {
        console.log('PushController device token',token)
        AsyncStorage.setItem('deviceToken', token);
   
    /*} else {
        alert('Must use physical device for Push Notifications');
    } 
    */  
}

const PushController = ({props}) => {

  const navigation = useNavigation();
     	const [avatar, setAvatar] = useState([]);
    useEffect(() => {
        async function fetchRequestPermission() {
            const authStatus = await messaging().requestPermission();
            const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;
            
        }
        fetchRequestPermission()
        
        
    }, []);

    useEffect(() => {       
        // Get the device token
        messaging()
        .getToken()
        .then(token => {
            return registerForPushNotificationsAsync(token);
        });

       
        // If using other push notification providers (ie Amazon SNS, etc)
        // you may need to get the APNs token instead for iOS:
        // if(Platform.OS == 'ios') { messaging().getAPNSToken().then(token => { return registerForPushNotificationsAsync(token); }); }

        // Listen to whether the token changes
        return messaging().onTokenRefresh(token => {
            registerForPushNotificationsAsync(token);
        });
    }, []);

    useEffect(() => {
        const unsubscribe = messaging().onMessage(async remoteMessage => {
            console.log('new message 12345',remoteMessage);
            ToastAndroid.show('New message arrive! Check Inbox', ToastAndroid.LONG);
          await AsyncStorage.getItem('accesstoken').then((value) => {
  			//console.log("SYANC TOEN");
			//console.log(value);
			if(value != '' && value != null){
		
            fetch('https://www.turvy.net/api/rider/getunreadmessages',{
		     	  	method: 'GET', 
				   headers: new Headers({
				     'Authorization': 'Bearer '+value, 
				     'Content-Type': 'application/json'
				   }), 
				   })
		      .then((response) => response.json())
		      .then((json) =>{ 
		      console.log("MESSAGE COUNT ",json);
		      //alert(json.data.count);
		         if(json.data.count != null && json.data.count > 0){
		         	AsyncStorage.setItem('newmessgae','yes');
		         }
		         AsyncStorage.setItem('messagecount', JSON.stringify(json.data.count));
		         
		   	}).catch((error) => console.error(error));
		     } 	
			})
            //Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
        });
        return unsubscribe;
    }, []);
    
    useEffect(() => {
        // Assume a message-notification contains a "type" property in the data payload of the screen to open
        messaging().onNotificationOpenedApp(remoteMessage => {
          //console.log('Notification caused app to open from background state:',remoteMessage.data,);
            //console.log('navigation',navigation)
            navigation.navigate('MyMessages');
        });
        
      }, []);
      

    return null;
}

export default PushController