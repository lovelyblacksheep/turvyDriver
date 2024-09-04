import React, { Component } from 'react'
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {Appbar, Divider, Switch, RadioButton} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { moderateScale } from 'react-native-size-matters';
import BottomSheet from 'reanimated-bottom-sheet';

export default class SoundsandVoice extends Component{
    constructor(props){
        super(props)
        this.state={
            volume:'Louder',
            voiceNav:false,
            messages:true,
            bottomSheet:false,
            tripVolume:'Max volume',
            sheetFor:'voice',
            sheetHeight:220
        }

        this.sheetRef = React.createRef();
    }

    async componentDidMount() {
        await AsyncStorage.getItem('volume').then((value) => {
            if(value != '' && value !== null){
                this.setState({
                    volume:value
                }) 
            }
        })

        await AsyncStorage.getItem('tripVolume').then((value) => {
            if(value != '' && value !== null){
                this.setState({
                    tripVolume:value
                }) 
            }
        })

        await AsyncStorage.getItem('voiceNav').then((value) => {
            if(value != '' && value !== null){
                if(value == 'true'){
                    this.setState({
                        voiceNav: true
                    })
                }
                if(value == 'false'){
                    this.setState({
                        voiceNav: false
                    })
                }
            }
        })

        await AsyncStorage.getItem('messages').then((value) => {
            if(value != '' && value !== null){
                if(value == 'true'){
                    this.setState({
                        messages: true
                    })
                }
                if(value == 'false'){
                    this.setState({
                        messages: false
                    })
                }
            }
        })
    }

    toggleNavigationSwitch = () => {
        this.setState({
            voiceNav: !this.state.voiceNav
        },() => {
            if(this.state.voiceNav){
                AsyncStorage.setItem('voiceNav', 'true');
            }else{
                AsyncStorage.setItem('voiceNav', 'false');
            }
        })
    }

    toggleMessageSwitch = () => {
        this.setState({
            messages: !this.state.messages
        },() => {
            if(this.state.messages){
                AsyncStorage.setItem('messages', 'true');
            }else{
                AsyncStorage.setItem('messages', 'false');
            }
        })
    }

    openBottomSheet = (callFor) => {
        this.setState({
            bottomSheet: true,
            sheetFor:callFor,
            sheetHeight: callFor == 'voice' ? 220 : 180
        })
    }

    changeVolume = (value) => {
        
        this.setState({
            volume:value,
            bottomSheet: false
        }) 

        AsyncStorage.setItem('volume', value);
        
    }

    changeTripVolume = (value) => {
        
        this.setState({
            tripVolume:value,
            bottomSheet: false
        }) 

        AsyncStorage.setItem('tripVolume', value);
        
    }

    renderContent = () => (
        <View
            style={{
                backgroundColor: 'white',
                padding: 20,
                height: this.state.sheetHeight,
            }}
        >
            {
                this.state.sheetFor == 'voice'
                ?
                <>
                    <Text style={{fontSize:18,paddingLeft:10}}>Volume</Text>
                    <View style={styles.RadioButton}>
                        <RadioButton
                            value="Softer"
                            status={ this.state.volume === 'Softer' ? 'checked' : 'unchecked' }
                            onPress={() => this.changeVolume('Softer')}
                            color={'#000'}
                        />
                        <Text>Softer</Text>
                    </View>
                    <View style={styles.RadioButton}>
                        <RadioButton
                            value="Normal"
                            status={ this.state.volume === 'Normal' ? 'checked' : 'unchecked' }
                            onPress={() => this.changeVolume('Normal')}
                            color={'#000'}
                        />
                        <Text>Normal</Text>
                    </View>
                    <View style={styles.RadioButton}>
                        <RadioButton
                            value="Louder"
                            status={ this.state.volume === 'Louder' ? 'checked' : 'unchecked' }
                            onPress={() => this.changeVolume('Louder')}
                            color={'#000'}
                        />
                        <Text>Louder</Text>
                    </View>
                </>
                :
                <>
                    <Text style={{fontSize:18,paddingLeft:10}}>Trip alert volume</Text>
                    <View style={styles.RadioButton}>
                        <RadioButton
                            value="Max volume"
                            status={ this.state.tripVolume === 'Max volume' ? 'checked' : 'unchecked' }
                            onPress={() => this.changeTripVolume('Max volume')}
                            color={'#000'}
                        />
                        <Text>Max volume</Text>
                    </View>
                    <View style={styles.RadioButton}>
                        <RadioButton
                            value="Control with phone"
                            status={ this.state.tripVolume === 'Control with phone' ? 'checked' : 'unchecked' }
                            onPress={() => this.changeTripVolume('Control with phone')}
                            color={'#000'}
                        />
                        <Text>Control with phone</Text>
                    </View>
                </>
            }
            
        </View>
      );

    render(){
        return(
            <View style={styles.container}>
                <Appbar.Header style={{backgroundColor:'#FFF'}}>
                    <Appbar.BackAction
                        onPress={() =>this.props.navigation.goBack()}
                    />
                    <Appbar.Content title="Sounds and Voice" />
                </Appbar.Header>
                <ScrollView>
                    <View style={styles.titleHead}>
                        <Text>General sounds</Text>
                    </View>
                    <TouchableOpacity 
                        style={styles.titleHead}
                        onPress={() => this.openBottomSheet('trip')}
                    >
                        <Text style={{fontSize:20}}>Trip alert volume</Text>
                        <Text>{this.state.tripVolume}</Text>
                    </TouchableOpacity>

                    <Divider style={{backgroundColor:'#CCC'}} />
                    <View style={styles.titleHead}>
                        <Text>Voice</Text>
                    </View>
                    <TouchableOpacity 
                        style={styles.titleHead}
                        onPress={() => this.openBottomSheet('voice')}
                    >
                        <Text style={{fontSize:20}}>Volume</Text>
                        <Text>{this.state.volume}</Text>
                    </TouchableOpacity>
                    <View style={[styles.titleHead,{flexDirection:'row',alignItems:'center'}]}>
                        <Text style={{fontSize:18,flex:1}}>Voice Navigation</Text>
                        <Switch
                            trackColor={{ false: "#767577", true: "#767577" }}
                            thumbColor={this.state.voiceNav ? "#000" : "#f4f3f4"}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={() => this.toggleNavigationSwitch()}
                            value={this.state.voiceNav}
                            style={{flex:1,alignSelf:'flex-end'}}
                        />
                    </View>
                    <View style={[styles.titleHead,{flexDirection:'row',alignItems:'center'}]}>
                        <Text style={{fontSize:18,flex:3}}>Read rider messages</Text>
                        <Switch
                            trackColor={{ false: "#767577", true: "#767577" }}
                            thumbColor={this.state.messages ? "#000" : "#f4f3f4"}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={() => this.toggleMessageSwitch()}
                            value={this.state.messages}
                            style={{flex:1,alignSelf:'flex-end'}}
                        />
                    </View>
                    
                </ScrollView>
                {
                this.state.bottomSheet &&
                    <>
                        <BottomSheet
                            ref={this.sheetRef}
                            snapPoints={[this.state.sheetHeight]}
                            borderRadius={10}
                            renderContent={this.renderContent}
                            enabledContentTapInteraction={false}
                        />
                        <TouchableOpacity 
                            activeOpacity={1}
                            onPress={() => this.setState({bottomSheet:false})}
                            style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',backgroundColor:'rgba(0,0,0,.5)'}}>
                        </TouchableOpacity>
                    </>
                }
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
        flexDirection:'row',alignItems:'center',paddingVertical:10
    }
})