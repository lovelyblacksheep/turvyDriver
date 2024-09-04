import React, { Component } from 'react'
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {Appbar, Divider, Switch, RadioButton} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { moderateScale } from 'react-native-size-matters';
import BottomSheet from 'reanimated-bottom-sheet';

export default class SpeedLimitSetting extends Component{
    constructor(props){
        super(props)
        this.state={
            limitBelow:'1',
            limitAbove:'1',
            showSpeedLimit:false,
            
        }

        this.sheetRef = React.createRef();
    }

    async componentDidMount() {
        await AsyncStorage.getItem('limitBelow').then((value) => {
            if(value != '' && value !== null){
                this.setState({
                    limitBelow:value
                }) 
            }
        })

        await AsyncStorage.getItem('limitAbove').then((value) => {
            if(value != '' && value !== null){
                this.setState({
                    limitAbove:value
                }) 
            }
        })


        await AsyncStorage.getItem('showSpeedLimit').then((value) => {
            if(value != '' && value !== null){
                if(value == 'true'){
                    this.setState({
                        showSpeedLimit: true
                    })
                }
                if(value == 'false'){
                    this.setState({
                        showSpeedLimit: false
                    })
                }
            }
        })

        
    }

    toggleSpeedLimitSwitch = () => {
        this.setState({
            showSpeedLimit: !this.state.showSpeedLimit
        },() => {
            if(this.state.showSpeedLimit){
                AsyncStorage.setItem('showSpeedLimit', 'true');
            }else{
                AsyncStorage.setItem('showSpeedLimit', 'false');
            }
        })
    }

    
    changeLimitBelow = (value) => {
        
        this.setState({
            limitBelow:value
        }) 

        AsyncStorage.setItem('limitBelow', value);
        
    }
    changeLimitAbove = (value) => {
        
        this.setState({
            limitAbove:value
        }) 

        AsyncStorage.setItem('limitAbove', value);
        
    }

    render(){
        return(
            <View style={styles.container}>
                <Appbar.Header style={{backgroundColor:'#FFF'}}>
                    <Appbar.BackAction
                        onPress={() =>this.props.navigation.goBack()}
                    />
                    <Appbar.Content title="Speed Limit" />
                </Appbar.Header>
                <ScrollView>
                    <View style={[styles.titleHead,{flexDirection:'row',alignItems:'center'}]}>
                        <Text style={{fontSize:18,flex:1}}>Show Speed Limit</Text>
                        <Switch
                            trackColor={{ false: "#767577", true: "#767577" }}
                            thumbColor={this.state.showSpeedLimit ? "#000" : "#f4f3f4"}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={() => this.toggleSpeedLimitSwitch()}
                            value={this.state.showSpeedLimit}
                            style={{flex:1,alignSelf:'flex-end'}}
                        />
                    </View>
                    <Divider style={{backgroundColor:'#CCC'}} />
                    
                    <View 
                        style={styles.titleHead}
                    >
                        <Text style={{fontSize:18}}>Speeding alert</Text>
                        <Text>Set when you want to get alerts</Text>
                    </View>
                    
                    <View style={styles.titleHead}>
                        <Text>Speed limit <Text style={{fontWeight:'bold'}}>below 60km/h</Text></Text>
                    </View>
                    <View style={{paddingHorizontal:15}}>
                        <View style={{flexDirection:'row'}}>
                            <View style={styles.RadioButton}>
                                <RadioButton
                                    value="1"
                                    status={ this.state.limitBelow === '1' ? 'checked' : 'unchecked' }
                                    onPress={() => this.changeLimitBelow('1')}
                                    color={'#000'}
                                />
                                <Text>1 km/h</Text>
                            </View>
                            <View style={styles.RadioButton}>
                                <RadioButton
                                    value="10"
                                    status={ this.state.limitBelow === '10' ? 'checked' : 'unchecked' }
                                    onPress={() => this.changeLimitBelow('10')}
                                    color={'#000'}
                                />
                                <Text>10 km/h</Text>
                            </View>
                            <View style={styles.RadioButton}>
                                <RadioButton
                                    value="15"
                                    status={ this.state.limitBelow === '15' ? 'checked' : 'unchecked' }
                                    onPress={() => this.changeLimitBelow('15')}
                                    color={'#000'}
                                />
                                <Text>15 km/h</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.titleHead}>
                        <Text>Speed limit <Text style={{fontWeight:'bold'}}>60km/h or above</Text></Text>
                    </View>
                    <View style={{paddingHorizontal:15}}>
                        <View style={{flexDirection:'row'}}>
                            <View style={styles.RadioButton}>
                                <RadioButton
                                    value="1"
                                    status={ this.state.limitAbove === '1' ? 'checked' : 'unchecked' }
                                    onPress={() => this.changeLimitAbove('1')}
                                    color={'#000'}
                                />
                                <Text>1 km/h</Text>
                            </View>
                            <View style={styles.RadioButton}>
                                <RadioButton
                                    value="10"
                                    status={ this.state.limitAbove === '10' ? 'checked' : 'unchecked' }
                                    onPress={() => this.changeLimitAbove('10')}
                                    color={'#000'}
                                />
                                <Text>10 km/h</Text>
                            </View>
                            <View style={styles.RadioButton}>
                                <RadioButton
                                    value="15"
                                    status={ this.state.limitAbove === '15' ? 'checked' : 'unchecked' }
                                    onPress={() => this.changeLimitAbove('15')}
                                    color={'#000'}
                                />
                                <Text>15 km/h</Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>
                
            </View>
        )
    }
}

let styles = StyleSheet.create({
    container:{
        flex:1,
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
    },
    titleHead:{
        paddingHorizontal:20,
        paddingVertical:10
    },
    RadioButton:{
        flexDirection:'row',alignItems:'center',paddingRight:10
    }
})