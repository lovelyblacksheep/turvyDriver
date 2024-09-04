import React, { Component } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Appbar } from 'react-native-paper';
import { moderateScale } from "react-native-size-matters";
import { Octicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class NavigationSettings extends Component{
    constructor(props){
        super(props)
        this.state={
            selected:0
        }
    }

    componentDidMount(){
        AsyncStorage.getItem('NavigationOption').then(val => {
            let data = JSON.parse(val)
            this.setState({selected:data});
        });
    }

    onPress(val){
        this.setState({selected:val})
        AsyncStorage.setItem('NavigationOption',JSON.stringify(val))
    }

    render(){
        return(
            <View style={styles.container}>
                <Appbar.Header style={{backgroundColor:'#fff'}}>
                    <Appbar.BackAction onPress={() =>this.props.navigation.goBack()} />
                    <Appbar.Content title="Navigation" />
                </Appbar.Header>
                <View style={styles.subContainer}>
                    <Text style={styles.heading}>Navigation App</Text>
                    <TouchableOpacity activeOpacity={0.8} style={styles.rowBox} onPress={()=>this.onPress(0)}>
                        <View>
                            <Text style={styles.rowHeading}>Turvy Navigation</Text>
                            <Text style={styles.rowText}>Recommended: Stay in this app.</Text>
                        </View>
                        {this.state.selected==0?
                            <Octicons name="check" size={moderateScale(20)} color="#8397ce" />
                        :
                            null
                        }
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.8} style={styles.rowBox} onPress={()=>this.onPress(1)}>
                        <View>
                            <Text style={styles.rowHeading}>Google Maps</Text>
                            <Text style={styles.rowText}>Opens in a seperate.</Text>
                        </View>
                        {this.state.selected==1?
                            <Octicons name="check" size={moderateScale(20)} color="#8397ce" />
                        :
                            null
                        }
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.8} style={styles.rowBox} onPress={()=>this.onPress(2)}>
                        <View>
                            <Text style={styles.rowHeading}>Waze</Text>
                            <Text style={styles.rowText}>Opens in a seperate.</Text>
                        </View>
                        {this.state.selected==2?
                            <Octicons name="check" size={moderateScale(20)} color="#8397ce" />
                        :
                            null
                        }
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}

let styles = StyleSheet.create({
    container:{
        flex:1,
    },
    subContainer:{
        flex:1,
        padding:moderateScale(20)
    },
    heading:{
        fontSize:moderateScale(14),
        color:'#000',
        fontWeight:'600',
        marginBottom:moderateScale(10)
    },
    rowBox:{
        width:'100%',
        height:moderateScale(60),
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between'
    },
    rowHeading:{
        fontSize:moderateScale(16),
        color:'#000',
        fontWeight:'900'
    },
    rowText:{
        fontSize:moderateScale(12),
        color:'#000',
    }
})