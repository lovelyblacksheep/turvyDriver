import * as React from 'react';
import { View, useWindowDimensions, Text } from 'react-native';
import { Appbar} from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import MyUpcomingRides from './MyUpcomingRides';
import MyCancelRides	 from './MyCancelRides';
import MyCompleteRides from './MyCompleteRides';

const UpcomingRoute = (props) => (

  <MyUpcomingRides {...props}  />
);

const CompleteRoute = (props) => (
  <MyCompleteRides {...props} />
);

const CancelRoute = (props) => (
  <MyCancelRides {...props} />
);

const renderScene = SceneMap({
  first: UpcomingRoute,
  second: CompleteRoute,	
  third: CancelRoute,	
});
																																												
const renderTabBar = props => (
  <TabBar
    {...props}
    indicatorStyle={{borderWidth:2,borderColor:'#2270b8' }}
    style={{ backgroundColor: '#fff'}}
    activeColor='#2270b8'
    inactiveColor='#000' 
  />
);

export default function MyRidesTab() {
  const layout = useWindowDimensions();
  const navigation = useNavigation(); // extract navigation prop here 
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'first', title: 'Upcoming' ,navigation: navigation},
    { key: 'second', title: 'Complete' ,navigation: navigation},
    { key: 'third', title: 'Cancelled' ,navigation: navigation},
  ]);

  return (
    <>
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
      renderTabBar={renderTabBar}
    />
    </>
  );
}