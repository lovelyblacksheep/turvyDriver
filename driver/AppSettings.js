import React, { Component } from 'react'
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {Appbar} from 'react-native-paper';
import { FontAwesome,MaterialCommunityIcons,Ionicons,MaterialIcons } from '@expo/vector-icons';
import { moderateScale } from 'react-native-size-matters';

export default class AppSettings extends Component{
    constructor(props){
        super(props)
        this.state={}
    }

    render(){
        return(
            <View style={styles.container}>
                <Appbar.Header style={{backgroundColor:'#FFF'}}>
                    <Appbar.BackAction
                        onPress={() =>this.props.navigation.goBack()}
                    />
                    <Appbar.Content title="App Settings" />
                </Appbar.Header>
                <ScrollView>
                    <TouchableOpacity
                        activeOpacity={0.5}
                        style={styles.rowContainer}
                        onPress={()=>this.props.navigation.navigate('SoundsandVoice')}
                    >
                        <FontAwesome
                            name="volume-up"
                            size={moderateScale(24)}
                            color="black"
                        />
                        <Text style={styles.rowText}>Sounds and Voice</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={()=>this.props.navigation.navigate('NavigationSettings')}
                        activeOpacity={0.8}
                        style={styles.rowContainer}
                    >
                        <MaterialCommunityIcons
                            name="navigation"
                            size={moderateScale(24)}
                            color="black"
                        />
                        <Text style={styles.rowText}>Navigation</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.rowContainer}
                    >
                        <MaterialIcons
                            name="accessibility"
                            size={moderateScale(24)}
                            color="black"
                        />
                        <Text style={styles.rowText}>Accessibility</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.rowContainer}
                    >
                        <Ionicons
                            name="moon"
                            size={moderateScale(24)}
                            color="black"
                        />
                        <Text style={styles.rowText}>Night mode</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.rowContainer}
                    >
                        <Ionicons
                            name="location"
                            size={moderateScale(24)}
                            color="black"
                        />
                        <Text style={styles.rowText}>Follow my ride</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.rowContainer}
                    >
                        <FontAwesome
                            name="phone"
                            size={moderateScale(24)}
                            color="black"
                        />
                        <Text style={styles.rowText}>Emergency Contacts</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.5}
                        style={styles.rowContainer}
                        onPress={()=>this.props.navigation.navigate('SpeedLimitSetting')}
                    >
                        <Ionicons
                            name="md-speedometer-sharp"
                            size={moderateScale(24)}
                            color="black"
                        />
                        <Text style={styles.rowText}>Speed limit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.rowContainer}
                    >
                        <Ionicons
                            name="shield"
                            size={moderateScale(24)}
                            color="black"
                        />
                        <Text style={styles.rowText}>Ride Check</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        )
    }
}

let styles = StyleSheet.create({
    container:{
        flex:1
    },
    rowContainer:{
        width:'100%',
        height: moderateScale(60),
        flexDirection:'row',
        alignItems:'center',
        paddingHorizontal:moderateScale(20),
        borderBottomColor:'#999',
        borderBottomWidth:moderateScale(1)
    },
    rowText:{
        color:'#000',
        fontSize:moderateScale(16),
        marginStart:moderateScale(20)
    }
})