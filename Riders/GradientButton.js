import React, { Component } from "react";
import { TouchableHighlight, Text } from "react-native";
import {styles} from './Constant';
import { LinearGradient } from 'expo-linear-gradient';

export default function GradientButton(props) {	
	return (
	<LinearGradient  
        style={styles.priBtn}       
        colors={['#2270b8', '#74c0ee']}
        end={{ x: 1.2, y: 1 }}>          
        <Text style={styles.priBtnTxt}>{props.title}</Text>
    </LinearGradient>
    );
}