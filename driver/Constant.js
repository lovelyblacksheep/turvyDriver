import { StyleSheet, Appearance } from 'react-native';
import { configureFonts,DefaultTheme,  } from 'react-native-paper';
import  MapboxGL from '@react-native-mapbox-gl/maps';
import Moment from 'moment';

export const DOMAIN = 'https://www.turvy.net/'; 

export const PUSHER_API = {
	APP_KEY: '389d667a3d4a50dc91a6',
	APP_CLUSTER:'ap2'
}

//export const MapboxCustomURL = 'mapbox://styles/jkmilla/cl2szgfnn001r14qekzxn3i1j';

export const MapboxCustomURL = MapboxGL.StyleURL.Street;

export const changeMode = () =>{
							 
	Moment.locale('en');
		
	var dt = new Date();
	var newDarkMode =  (Moment(dt).format('HH') >= 18  || (Moment(dt).format('HH') < 6  || (Moment(dt).format('HH') == 6 && Moment(dt).format('mm') <=30))) ? MapboxGL.StyleURL.Dark : MapboxGL.StyleURL.Street;
	
	//console.log("componentDidMount DATE TIME :::: " + new Date() + "::" + Moment(dt).format('HH')  +"::" +  Moment(dt).format('mm')+"::" +  ":::"+newDarkMode )
	
	return newDarkMode;

}

export const styles = StyleSheet.create({
		container: {flex:1,justifyContent:'center',alignItems:'center', alignContent:'center',width:'100%'},
		content: {padding:15},
	pickerStyle:{borderRadius:20,backgroundColor:'#FFF',padding:20,margin:10},
	strong:{fontWeight:'bold',fontSize:16},
	h1:{fontSize:18,textAlign:'center'},
	h1Bold:{fontSize:25,textAlign:'center'},
	space:{height:10},
	space30:{height:30},
	smallText:{textAlign:'center',fontSize:15,lineHeight:25,color:'gray'},
	btn:{width:'100%',borderRadius:60,padding:5},
	inputStyle: {backgroundColor:'#FFF',borderWidth:1,borderColor:'#cecece',borderRadius:40,padding:10,paddingLeft:20,overflow:'hidden',color:'#8c8c8c',fontFamily: "Metropolis-Regular"},
	pickerContainer:{height: 55,backgroundColor:'#FFF',borderWidth:1,borderColor:'#cecece',borderRadius:40,paddingLeft:20,marginLeft:10,marginRight:10,fontFamily: "Metropolis-Regular"},
	marginTop20:{marginTop:20,},
	marginTop10:{marginTop:10,},
	inputContainerStyle:{borderBottomWidth:0},
	themetextcolor:{color:'#3f78ba',fontFamily: "Metropolis-Regular"},
	text8:{fontSize:8,fontFamily: "Metropolis-Regular"},
	error:{color:'red',fontSize:12},
	paddingLeft10:{paddingLeft:10},
	contentBtn:{      
			backgroundColor:"#2270b8",
			justifyContent:'center',
		alignItems:'center',
		flexDirection:'row',    
		borderRadius:50,
	},
	priBtn:{            
			flex:1,
			padding:13,      
			justifyContent:'center',
		alignItems:'center',
		borderRadius:45,    
		fontFamily: "Metropolis-Regular"
	},
	priBtnTxt:{
			color:'#FFF',
			fontSize:16,
			textTransform: 'capitalize',
			letterSpacing: 2
	},
	pickerIcon: {
	 
		position: "absolute",
		bottom: 15,
		right: 10,
		fontSize: 20
	},
	cardShadow:{  
		elevation: 3,
	},
	boxShadow:{
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 8,
		},
		shadowOpacity: 0.46,
		shadowRadius: 11.14,
		elevation: 8,
	},
	ubarFont:{
		fontFamily: "Uber Move Text"  
	}
});

const fontConfig = {
	web: {
		regular: {
			fontFamily: 'Metropolis-Regular',
			fontWeight: 'normal',
		},
		medium: {
			fontFamily: 'Metropolis-Medium',
			fontWeight: 'normal',
		},
		light: {
			fontFamily: 'Metropolis-Light',
			fontWeight: 'normal',
		},
		thin: {
			fontFamily: 'Metropolis-ExtraLight',
			fontWeight: 'normal',
		},
	},
	ios: {
		 regular: {
			fontFamily: 'Metropolis-Regular',
			fontWeight: 'normal',
		},
		medium: {
			fontFamily: 'Metropolis-Medium',
			fontWeight: 'normal',
		},
		light: {
			fontFamily: 'Metropolis-Light',
			fontWeight: 'normal',
		},
		thin: {
			fontFamily: 'Metropolis-ExtraLight',
			fontWeight: 'normal',
		},
	},
	android: {
		 regular: {
			fontFamily: 'Metropolis-Regular',
			fontWeight: 'normal',
		},
		medium: {
			fontFamily: 'Metropolis-Medium',
			fontWeight: 'normal',
		},
		light: {
			fontFamily: 'Metropolis-Light',
			fontWeight: 'normal',
		},
		thin: {
			fontFamily: 'Metropolis-ExtraLight',
			fontWeight: 'normal',
		},
	}
};


export const theme = {
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

export const toFixed = (num, fixed) => {
	var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
	return num.toString().match(re)[0];
}

export const secondsToHms = (d) => {
	d = Number(d);
	var h = Math.floor(d / 3600);
	var m = Math.floor(d % 3600 / 60);
	var s = Math.floor(d % 3600 % 60);

	var hDisplay = h > 0 ? h + (h == 1 ? " hr, " : " hr, ") : "";
	var mDisplay = m > 0 ? m + (m == 1 ? " min, " : " min, ") : "";
	var sDisplay = s > 0 ? s + (s == 1 ? " sec" : " sec") : "";
	return hDisplay + mDisplay + sDisplay; 
}

export const debug = (string) => {
	return JSON.stringify(string, null, 2)
}