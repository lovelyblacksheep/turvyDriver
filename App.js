import * as React from 'react';
import {LogBox} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer, DefaultTheme as df } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Spinner from 'react-native-loading-spinner-overlay';
import { useKeepAwake } from 'expo-keep-awake';
import { useFonts } from 'expo-font';
import LoginOtp from './driver/LoginOtp'
import Createaccount from './driver/Createaccount'
import Signupasdriver from './driver/Signupasdriver'
import VerificationOtp from './driver/VerificationOtp'
import Thankyou from './driver/Thankyou'
import PrivacyPolicy from './driver/PrivacyPolicy'
import ForgetPassword from './driver/ForgetPassword'
import ChangePassword from './driver/ChangePassword'
import Home from './driver/Home';
import DriverLogin from './driver/DriverLogin';
import LocationEnableScreen from './driver/LocationEnableScreen';
import MapViewFirst from './driver/MapViewFirst';   
import MapViewOffline from './driver/MapViewOffline';   
import SideBar from './driver/SideBar';
import Profile from './driver/Profile';
import DriverPreferences from './driver/DriverPreferences';
import EditProfile from './driver/EditProfile';
import MyRidesTab from './driver/MyRidesTab';
import BookingMap from './driver/BookingMap';
import MyEarning from './driver/MyEarning';
import VehicleDetails from './driver/VehicleDetails';
import EditVehicleDetails from './driver/EditVehicleDetails';
import Support from './driver/Support';
import Comment from './driver/Comment';
import AppSettings from './driver/AppSettings';
import NavigationSettings from './driver/NavigationSettings';
import TripPlaner from './driver/TripPlaner';
import Abn from './driver/Abn';
import Bank from './driver/Bank';
import Documents from './driver/Documents';
import DriverFeedback from './driver/DriverFeedback';
import LastTrip from './driver/LastTrip';
import Promotions from './driver/Promotions';
import DrivingTime from './driver/DrivingTime';
import SearchDest from './driver/SearchDest';
import FindingTrip from './driver/FindingTrip'
import MyUpcomimgTrip from './driver/MyUpcomimgTrip'
import AcceptanceRate from './driver/AcceptanceRate'
import CancellationRate from './driver/CancellationRate'
import AirportQueue from './driver/AirportQueue';
import WeeklySummary from './driver/WeeklySummary';
import Recommended from './driver/Recommended';
import CurrentQuest from './driver/CurrentQuest';
import Inbox from './driver/Inbox';
import TripDetails from './driver/TripDetails';
import TipReceived from "./driver/TipReceived";
import PushController from "./PushController";
import CheckDrivingTime from "./driver/CheckDrivingTime";
import FareTrip from "./driver/FareTrip";
import GradientLine from "./driver/GradientLine";
import SoundsandVoice from "./driver/SoundsandVoice";
import SpeedLimitSetting from "./driver/SpeedLimitSetting";
import QueueList from "./driver/QueueList";
import DeleteAccount from "./driver/DeleteAccount";

LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
LogBox.ignoreAllLogs();//Ignore all log notifications

const MyTheme = {
  ...df,
  colors: {
    ...df.colors,
    primary: '#135aa8',
    accent: '#3f78ba',
    text: '#111',
    background: '#fff',
  },
};


const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#3f78ba',
    accent: '#3f78ba',
	text: '#111',
    surface: '#FFF',
    background: '#fff',
  },	
};

const Stack = createStackNavigator();

function stackNavigation(props) {
  return (
    <>
      <Stack.Navigator initialRouteName="LoginOtp">
        <Stack.Screen name="LoginOtp" component={LoginOtp} options={{title:'Login',headerShown:false}} />
        <Stack.Screen name="DriverLogin" component={DriverLogin} options={{title:'Login',headerShown:false}}  />
        <Stack.Screen name="VerificationOtp" component={VerificationOtp} options={{title:'OTP Verification',headerTitleStyle: { justifyContent: 'center',textAlign:"center",marginLeft:-40 },headerStyle:{backgroundColor:'#3f78ba'},headerTintColor:'#FFF'}}  />
        <Stack.Screen name="Createaccount" component={Createaccount}  options={{title:'Create Account',headerTitleStyle: { justifyContent: 'center',textAlign:"center",marginLeft:-40 },headerStyle:{backgroundColor:'#3f78ba'},headerTintColor:'#FFF'}}  />
        <Stack.Screen name="Signupasdriver" component={Signupasdriver} options={{title:'Sign up as Driver',headerTitleStyle: { justifyContent: 'center',textAlign:"center",marginLeft:-40 },headerStyle:{backgroundColor:'#3f78ba'},headerTintColor:'#FFF'}}  />
        <Stack.Screen name="Thankyou" component={Thankyou}  options={{title:'Thank You',headerShown:false}}  />
        <Stack.Screen name="ForgetPassword" component={ForgetPassword}  options={{title:'Forgot Password',headerTitleStyle: { justifyContent: 'center',textAlign:"center",marginLeft:-40 },headerStyle:{backgroundColor:'#3f78ba'},headerTintColor:'#FFF'}} />
        <Stack.Screen name="ChangePassword" component={ChangePassword}  options={{title:'Reset Account Password',headerTitleStyle: { justifyContent: 'center',textAlign:"center",marginLeft:-40 },headerStyle:{backgroundColor:'#3f78ba'},headerTintColor:'#FFF'}} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy}  options={{title:'Privacy Policy',headerTitleStyle: { justifyContent: 'center',textAlign:"center",marginLeft:-40 },headerStyle:{backgroundColor:'#3f78ba'},headerTintColor:'#FFF'}} />
        <Stack.Screen name="Home" component={Home}  options={{headerShown:false,title:'Home',headerTitleStyle: { justifyContent: 'center',textAlign:"center",marginLeft:-40 },headerStyle:{backgroundColor:'#3f78ba'},headerTintColor:'#FFF'}} />
        <Stack.Screen name="LocationEnableScreen" component={LocationEnableScreen} options={{headerShown:false}}  />
        <Stack.Screen name="MapViewFirst" component={MapViewFirst} options={{title:'Online',headerShown:false}}  />
        <Stack.Screen name="MapViewOffline" component={MapViewOffline} options={{title:'Offline',headerShown:false}}  />
        <Stack.Screen name="Profile" component={Profile} options={{title:'Offline',headerShown:false}}  />
        <Stack.Screen name="DriverPreferences" component={DriverPreferences} options={{title:'Driver Preferences',headerShown:false}}  />
        <Stack.Screen name="EditProfile" component={EditProfile}  options={{title:'Edit Profile',headerTitleStyle: { justifyContent: 'center',textAlign:"center",marginLeft:-40 },headerStyle:{backgroundColor:'#FFF'},headerTintColor:'#000'}} />
        <Stack.Screen name="MyRidesTab" component={MyRidesTab}  options={{title:'My Rides',headerTitleStyle: { justifyContent: 'center',textAlign:"center",marginLeft:-40 },headerStyle:{backgroundColor:'#FFF'},headerTintColor:'#000'}} />
        <Stack.Screen name="BookingMap" component={BookingMap} options={{headerShown:false}}  />
        
        <Stack.Screen name="MyEarning" component={MyEarning}  options={{title:'My Earning',headerTitleStyle: { justifyContent: 'center',textAlign:"center",marginLeft:-40 },headerStyle:{backgroundColor:'#FFF'},headerTintColor:'#000'}} />
        <Stack.Screen name="VehicleDetails" component={VehicleDetails} options={{title:'Vehicle Details',headerShown:false}}  />
        <Stack.Screen name="EditVehicleDetails" component={EditVehicleDetails} options={{title:'Vehicle Details',headerShown:false}}  />
        <Stack.Screen name="Support" component={Support} options={{title:'Support',headerShown:false}}  />
        <Stack.Screen name="Comment" component={Comment} options={{title:'Comment',headerShown:false}}  />
        <Stack.Screen name="AppSettings" component={AppSettings} options={{title:'App Settings',headerShown:false}}  />
        <Stack.Screen name="SoundsandVoice" component={SoundsandVoice} options={{title:'Sounds and Voice',headerShown:false}}  />
        <Stack.Screen name="SpeedLimitSetting" component={SpeedLimitSetting} options={{title:'Speed Limit',headerShown:false}}  />
        
        <Stack.Screen name="NavigationSettings" component={NavigationSettings} options={{title:'Navigation',headerShown:false}}  />
        <Stack.Screen name="TripPlaner" component={TripPlaner}  options={{title:'Trip Planer',headerShown:false}} />
        <Stack.Screen name="Abn" component={Abn} options={{title:'Abn',headerShown:false}}  />
        <Stack.Screen name="Bank" component={Bank} options={{title:'Bank',headerShown:false}}  />
        <Stack.Screen name="Documents" component={Documents} options={{title:'Documents',headerShown:false}}  />
        <Stack.Screen name="DriverFeedback" component={DriverFeedback} options={{title:'DriverFeedback',headerShown:false}}  />
        <Stack.Screen name="LastTrip" component={LastTrip} options={{title:'LastTrip',headerShown:false}}  />
        <Stack.Screen name="Promotions" component={Promotions} options={{title:'Promotions',headerShown:false}}  />
        <Stack.Screen name="DrivingTime" component={DrivingTime} options={{title:'DrivingTime',headerShown:false}}  />
        <Stack.Screen name="SearchDest" component={SearchDest} options={{title:'SearchDest',headerShown:false}}  />
        <Stack.Screen name="MyUpcomimgTrip" component={MyUpcomimgTrip} options={{title:'MyUpcomimgTrip',headerShown:false}}  />
        <Stack.Screen name="AcceptanceRate" component={AcceptanceRate} options={{title:'AcceptanceRate',headerShown:false}}  />
        <Stack.Screen name="CancellationRate" component={CancellationRate} options={{title:'CancellationRate',headerShown:false}}  />        
        <Stack.Screen name="WeeklySummary" component={WeeklySummary}  options={{title:'Weekly Summary',headerTitleStyle: { justifyContent: 'center',textAlign:"center",marginLeft:-40 },headerStyle:{backgroundColor:'#FFF'},headerTintColor:'#000'}} />
        <Stack.Screen name="Recommended" component={Recommended} options={{title:'Recommended',headerShown:false}}  />
        <Stack.Screen name="CurrentQuest" component={CurrentQuest} options={{title:'CurrentQuest',headerShown:false}}  />
        <Stack.Screen name="Inbox" component={Inbox} options={{title:'Inbox',headerShown:false}}  />
        <Stack.Screen name="TripDetails" component={TripDetails} options={{title:'TripDetails',headerShown:false}}  />
        <Stack.Screen name="TipReceived" component={TipReceived}  options={{title:'Tip Received',headerTitleStyle: { justifyContent: 'center',textAlign:"center",marginLeft:-40 },headerStyle:{backgroundColor:'#FFF'},headerTintColor:'#000'}} />
        <Stack.Screen name="GradientLine" component={GradientLine} options={{title:'GradientLine',headerShown:false}}  />
        <Stack.Screen name="QueueList" component={QueueList} options={{title:'QueueList',headerShown:false}}  />
        <Stack.Screen name="DeleteAccount" component={DeleteAccount} options={{title:'Delete Account',headerShown:false}}  />
        
        
      </Stack.Navigator>
      <FindingTrip {...props} />
      <AirportQueue {...props} />
      <TipReceived {...props} />
      <PushController {...props} />
      <CheckDrivingTime {...props} />
      <FareTrip {...props} />
      
    </>
  );
}

const Drawer = createDrawerNavigator();

export default function App() {
  useKeepAwake();
  let [fontsLoaded] = useFonts({
    'Metropolis-Regular': require('./assets/fonts/Metropolis-Regular.ttf'),
    'Uber Move Text': require('./assets/fonts/ubermovetext-medium.otf'),
  });
  if (!fontsLoaded) {
    return (
      <Spinner visible={true} color='#FFF' overlayColor='rgba(0, 0, 0, 0.5)' />
    );
  }else{
    return (
      <>
        <StatusBar style="auto" />
        <PaperProvider theme={theme}>
          <NavigationContainer theme={MyTheme}>
            <Drawer.Navigator initialRouteName="Home" drawerContent={props => <SideBar {...props} />} >
              <Drawer.Screen name="Home" component={stackNavigation} options={{ hidden: true,drawerLabel: 'Home', headerShown:false }} />
            </Drawer.Navigator>
          </NavigationContainer>
        </PaperProvider>
        
      </>
    );
  }
}