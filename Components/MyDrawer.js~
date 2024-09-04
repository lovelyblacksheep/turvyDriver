import React, { Component } from "react";
import { StatusBar,StyleSheet, ImageBackground, View, ScrollView } from "react-native";
import { Appbar  , Provider as PaperProvider , Button,Banner,Text,Card,Badge} from 'react-native-paper';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer,DefaultTheme,DrawerActions } from '@react-navigation/native';
//import SideBar from "./SideBar";
import HomeScreen from './BookDetails';
const Drawer = createDrawerNavigator();

export default class MyDrawer extends React.Component {
  constructor(props) {
    super(props);
    console.log(props);
  }
	

 render(){
  	const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#ffffff',
  },
}

    return (
    		<NavigationContainer>	
         <Drawer.Navigator  >
          <Drawer.Screen name="BookDetails" component={BookDetails} route={this.props.route} {...this.props}  />
          <Drawer.Screen name="BookConfirm" component={BookConfirm} route={this.props.route} {...this.props}  />
         </Drawer.Navigator>
        </NavigationContainer>	
    );

  }
}

