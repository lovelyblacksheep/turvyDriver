import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { useFonts } from 'expo-font';
import { useKeepAwake } from 'expo-keep-awake';
import {  Provider as PaperProvider } from 'react-native-paper';
import { styles,theme, DOMAIN} from './Riders/Constant';
import { StyleSheet, Text, View,LogBox } from 'react-native';
import LocationEnableScreen from "./Components/LocationEnableScreen";
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Login from "./Riders/Login";

import BookMain  from "./Components/BookMain";
import BookConfirm  from "./Components/BookConfirm";
import BookDetails  from "./Components/BookDetails";

import Verification from './Riders/Verification';
import Createaccount from './Riders/Createaccount';
import SideBar from "./Components/SideBar";
import MyRidesTab from "./Components/MyRidesTab";
import MyReceipts from "./Components/MyReceipts";
import MyMessages from "./Components/MyMessages";

import MyPayments from "./Components/MyPayments";
import MyTransaction from "./Components/MyTransaction";
import RateCard from "./Components/RateCard";
import Wallet from "./Components/Wallet";
import Support from "./Components/Support";
import Comment  from "./Components/Comment";
import PrivacyPolicy from "./Riders/PrivacyPolicy";
import PromoCode  from "./Components/PromoCode";
import BookPickUpTime from "./Components/BookPickUpTime";
import PickUpTIme from "./Components/PickUpTIme";
import BookProcess from "./Components/BookProcess";
import RideConfirm1 from "./Components/RideConfirm1";
import Thankyou from "./Riders/Thankyou";
import ForgetPassword from "./Riders/ForgetPassword";
import ChangePassword from "./Riders/ChangePassword";
import Profile from "./Riders/Profile";
import RideArriveDest from "./Components/RideArriveDest";
import EditProfile from "./Riders/EditProfile";
import BookCancel from "./Components/BookCancel";
import BookCancelEnrt from "./Components/BookCancelEnrt";

import PaymentMethods from "./Components/PaymentMethods"; 
import StripScreen from "./Riders/StripScreen";
import PaypalPayment from "./Riders/PaypalPayment";
import PaypalSuccess from "./Riders/PaypalSuccess";
import AddCard from "./Riders/AddCard";
import AddCardWallet from "./Riders/AddCardWallet";
import AddPayment from "./Components/AddPayment";
import BookingMap1  from "./Components/BookingMap1";
import MultiDestination from "./Components/MultiDestination";
import bookingSchedule from "./Components/bookingSchedule";
import Charity from "./Components/Charity"; 
import TripDetails from "./Components/TripDetails";
import TripReceipt from "./Components/TripReceipt";
import Spinner from 'react-native-loading-spinner-overlay';
import TipThankyou from './Components/TipThankyou';
import InMessages from './Components/InMessages';
import PushController from './PushController';

LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
LogBox.ignoreAllLogs();//Ignore all log notifications

const Stack = createStackNavigator();



function stackNavigation(props) {
    return (
        <>
            <Stack.Navigator initialRouteName="Login">
            <Stack.Screen name="Login" component={Login} options={{title:'Login',headerShown:false}} route={props.route} {...props}  />                    
            <Stack.Screen name="BookMain" component={BookMain}  route={props.route} {...props} options={{headerShown:false}}   />
           <Stack.Screen name="BookConfirm" component={BookConfirm} route={props.route} {...props} options={{headerShown:false}}   />
           <Stack.Screen name="BookDetails" component={BookDetails} route={props.route} {...props} options={{headerShown:false}}  />
           <Stack.Screen name="Createaccount" component={Createaccount} route={props.route} {...props} options={{headerShown:false}}   />
           <Stack.Screen name="LocationEnableScreen" component={LocationEnableScreen} route={props.route} {...props} options={{headerShown:false}}   />
           <Stack.Screen name="Verification" component={Verification} route={props.route} {...props} options={{headerShown:false}}   />
           <Stack.Screen name="MyRidesTab" component={MyRidesTab} route={props.route} {...props}   options={{title:'My Rides',headerTitleStyle: { justifyContent: 'center',textAlign:"center",marginLeft:-40 },headerStyle:{backgroundColor:'#FFF'},headerTintColor:'#000'}}   />
           <Stack.Screen name="MyPayments" component={MyPayments} route={props.route} {...props}  options={{headerShown:false}}  />
           <Stack.Screen name="MyReceipts" component={MyReceipts} route={props.route} {...props}  options={{headerShown:false}}  />
           <Stack.Screen name="MyMessages" component={MyMessages} route={props.route} {...props}  options={{headerShown:false}}  />
           <Stack.Screen name="MyTransaction" component={MyTransaction} route={props.route} {...props}  options={{headerShown:false}}  />
           <Stack.Screen name="RateCard" component={RateCard} route={props.route} {...props} options={{headerShown:false}}   />
           <Stack.Screen name="Wallet" component={Wallet} route={props.route} {...props}  options={{headerShown:false}}  />
           <Stack.Screen name="Support" component={Support} route={props.route} {...props}  options={{headerShown:false}}  />
           <Stack.Screen name="Comment" component={Comment} route={props.route} {...props}  options={{headerShown:false}}  />
           <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} route={props.route} {...props} options={{headerShown:false}}   />
           <Stack.Screen name="PromoCode" component={PromoCode} route={props.route} {...props} options={{headerShown:false}}   />
           <Stack.Screen name="BookPickUpTime" component={BookPickUpTime} route={props.route} {...props}  options={{headerShown:false}}  />
           <Stack.Screen name="BookProcess" component={BookProcess} route={props.route} {...props} options={{headerShown:false}}   />
           <Stack.Screen name="RideConfirm1" component={RideConfirm1} route={props.route} {...props} options={{headerShown:false}}   />
           <Stack.Screen name="InMessages" component={InMessages} route={props.route} {...props} options={{headerShown:false}}   />
            <Stack.Screen name="Thankyou" component={Thankyou} route={props.route} {...props} options={{headerShown:false}}   />
           <Stack.Screen name="ForgetPassword" component={ForgetPassword} route={props.route} {...props} options={{headerShown:false}}   /> 
           <Stack.Screen name="Profile" component={Profile} route={props.route} {...props} options={{headerShown:false}}   /> 
           <Stack.Screen name="RideArriveDest" component={RideArriveDest} route={props.route} {...props} options={{headerShown:false}}   /> 
           <Stack.Screen name="EditProfile" component={EditProfile} route={props.route} {...props} options={{headerShown:false}}    /> 
          <Stack.Screen name="BookCancel" component={BookCancel} route={props.route} {...props} options={{headerShown:false}}   />  
          <Stack.Screen name="PaymentMethods" component={PaymentMethods} route={props.route} {...props} options={{headerShown:false}}   />  
          <Stack.Screen name="BookCancelEnrt" component={BookCancelEnrt} route={props.route} {...props} options={{headerShown:false}}   />  
          <Stack.Screen name="StripScreen" component={StripScreen} route={props.route} {...props} options={{headerShown:false}}   /> 
          <Stack.Screen name="PaypalPayment" component={PaypalPayment} route={props.route} {...props}  options={{headerShown:false}}  />
          <Stack.Screen name="PaypalSuccess" component={PaypalSuccess} route={props.route} {...props}  options={{headerShown:false}}  />  
          <Stack.Screen name="AddCard" component={AddCard} route={props.route} {...props} options={{headerShown:false}}   />  
          <Stack.Screen name="BookingMap1" component={BookingMap1} route={props.route} {...props} options={{headerShown:false}}   />  
          <Stack.Screen name="MultiDestination" component={MultiDestination} route={props.route} {...props} options={{headerShown:false}}  />
          <Stack.Screen name="PickUpTIme" component={PickUpTIme} route={props.route} {...props} options={{headerShown:false}}  />
          <Stack.Screen name="bookingSchedule" component={bookingSchedule} route={props.route} {...props} options={{headerShown:false}}  />
          <Stack.Screen name="Charity" component={Charity} route={props.route} {...props} options={{headerShown:false}}  />
          <Stack.Screen name="AddPayment" component={AddPayment} route={props.route} {...props} options={{headerShown:false}}  />
          <Stack.Screen name="AddCardWallet" component={AddCardWallet} route={props.route} {...props} options={{headerShown:false}}  />
          <Stack.Screen name="TripDetails" component={TripDetails} route={props.route} {...props} options={{title:'Back to trips',headerTitleStyle: { justifyContent: 'center',textAlign:"left",marginLeft:-10 },headerStyle:{backgroundColor:'#FFF'},headerTintColor:'#000'}} />
          <Stack.Screen name="TripReceipt" component={TripReceipt} route={props.route} {...props} options={{title:'Trip Receipt',headerTitleStyle: { justifyContent: 'center',textAlign:"center",marginLeft:-40 },headerStyle:{backgroundColor:'#FFF'},headerTintColor:'#000'}} />
          <Stack.Screen name="ChangePassword" component={ChangePassword} route={props.route} {...props} options={{title:'Change Password',headerTitleStyle: { justifyContent: 'center',textAlign:"center",marginLeft:-40 },headerStyle:{backgroundColor:'#FFF'},headerTintColor:'#000'}}   />
          </Stack.Navigator>
          <TipThankyou {...props} />
          <PushController {...props} />
        </>);
}

const Drawer = createDrawerNavigator();
export default function App() {
  useKeepAwake();
    
  let [fontsLoaded] = useFonts({
    'Metropolis-Regular': require('./assets/fonts/Metropolis-Regular.ttf'),    
    'Uber Move Text': require('./assets/fonts/ubermovetext-medium.ttf'),
    
  });
  if (!fontsLoaded) {
    return (<Spinner
          visible={true}
          color='#FFF'
          overlayColor='rgba(0, 0, 0, 0.5)'
        />);
  }else{
  		return (<><StatusBar style={'auto'}/>
  				<PaperProvider theme={theme}>
  				<NavigationContainer>		
         <Drawer.Navigator initialRouteName="Home" drawerContent={props => <SideBar {...props} />} >
           <Drawer.Screen name="Home" component={stackNavigation} options={{ hidden: true,drawerLabel: 'Home', headerShown:false }} />
         </Drawer.Navigator>
    </NavigationContainer>
    </PaperProvider>
    </>
  );	
 }
}

