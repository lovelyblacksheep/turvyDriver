import React, {useEffect, useState} from 'react';
import { ToastAndroid, Alert } from 'react-native'
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useNavigation, useRoute } from '@react-navigation/native';

async function registerForPushNotificationsAsync(token) {
  
    if (Constants.isDevice) {
        console.log('PushController device token',token)
        AsyncStorage.setItem('deviceToken', token);
   
    } else {
        alert('Must use physical device for Push Notifications');
    }   
}

const PushController = ({props}) => {
    const navigation = useNavigation();
    const route = useRoute();
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
            //console.log('new message',remoteMessage)
            //ToastAndroid.show('New message arrive! Check Inbox', ToastAndroid.LONG);
            
            //Alert.alert('New message arrived!', remoteMessage.data.body);
            
            //Alert.alert('Message From Rider', route.name);
            
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        // Assume a message-notification contains a "type" property in the data payload of the screen to open
    
        messaging().onNotificationOpenedApp(remoteMessage => {
          //console.log('Notification caused app to open from background state:',remoteMessage.data,);
            //console.log('navigation',navigation)
            navigation.navigate('Inbox');
        });
    
        
      }, []);

    return null;
}

export default PushController