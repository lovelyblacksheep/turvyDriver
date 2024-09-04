import React, { Component } from "react";
import { StyleSheet, View, Text, ScrollView, TouchableHighlight, Image } from "react-native";
import { CreditCardInput, LiteCreditCardInput } from "react-native-credit-card-input"; // 0.4.1
import {styles} from './Constant';
import GradientButton from './GradientButton';

const s = StyleSheet.create({  
  container: {
    backgroundColor: "#fff",    
    marginTop:30,    
  },
  label: {
    color: "black",
    fontSize: 12,
  },
  input: {
    fontSize: 16,
    color: "black",
  },
});


export default class AddCard extends Component {
  state = {
    cardInfo:{}
  };

  _onChange = (formData) => {
    //console.log(formData)
    this.setState({
        cardInfo:formData    
    })
}
  _onFocus = (field) => console.log("focusing", field);
  

  async submit(){
    //alert('here')
    console.log('card Data:',this.state.cardInfo)
  }

    render() {
        return (
            <>
                <ScrollView keyboardShouldPersistTaps='handled'>
                <View style={{flexDirection:'column'}}>
                    <View style={s.container}>        
                        <CreditCardInput                          
                          requiresName
                          requiresCVC
                          cardScale={1.0}
                          labelStyle={s.label}
                          inputStyle={s.input}
                          validColor={"black"}
                          invalidColor={"red"}
                          placeholderColor={"darkgray"}
                          onFocus={this._onFocus}
                          onChange={this._onChange} 
                        />        
                    </View>                
                    <View style={{justifyContent:'center',alignItems:'flex-start',marginLeft:20,marginRight:20,height:100,marginTop:80}}>
                        <Text>Debit card are accepted at some locations</Text>
                        <Image 
                        style={{height:35,width:200}}
                        source={require('../assets/cards.png')}
                        resizeMode="cover" />
                    </View>
                </View>
                </ScrollView>
                <View style={{paddingBottom:20,borderRadius:40,marginLeft:25,marginRight:25}}>
                    <TouchableHighlight             
                        style={styles.contentBtn} onPress={() => {this.submit(); }}>
                        <GradientButton title='Save' />    
                    </TouchableHighlight>
                </View>
            </>
        );
    }
}