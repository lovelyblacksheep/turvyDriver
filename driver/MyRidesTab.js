import * as React from 'react';
import { View, useWindowDimensions, Text } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import MyUpcomimgTrip from './MyUpcomimgTrip';
import MyCompletedTrip from './MyCompletedTrip';
import MyCanceledTrip from './MyCanceledTrip';
import { useNavigation } from '@react-navigation/native';




export default function MyRidesTab() {
    const navigation = useNavigation();  
    const [nav, setNav] = React.useState(navigation);

    const layout = useWindowDimensions();

    const [index, setIndex] = React.useState(0);
    const [routes] = React.useState([
    { key: 'first', title: 'Upcoming' },
    { key: 'second', title: 'Complete' },
    { key: 'third', title: 'Canceled' },    
    ]);

    const UpcomingRoute = () => (  
        <MyUpcomimgTrip navigation={navigation} />
    );

    const CompleteRoute = () => (
        <MyCompletedTrip navigationProp={navigation} />
    );
    const CanceledRoute = () => (
        <MyCanceledTrip navigationProp={navigation} />
    );

    const renderScene = SceneMap({
        first: UpcomingRoute,
        second: CompleteRoute,
        third: CanceledRoute,  
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

    return (
        <>    
            <TabView
                navigationState={{ index, routes, navigation }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={{ width: layout.width }}
                renderTabBar={renderTabBar}
            />
        </>
    );
}