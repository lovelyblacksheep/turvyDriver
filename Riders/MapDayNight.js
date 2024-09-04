import  MapboxGL from '@react-native-mapbox-gl/maps';
import Moment from 'moment';
export const MapboxCustomURL = MapboxGL.StyleURL.Street;

export const changeMode = () =>{
							 
	Moment.locale('en');
		
	var dt = new Date();
	var newDarkMode =  (Moment(dt).format('HH') >= 18  || (Moment(dt).format('HH') < 6  || (Moment(dt).format('HH') == 6 && Moment(dt).format('mm') <=30))) ? MapboxGL.StyleURL.Dark : MapboxGL.StyleURL.Street;
	
	//console.log("componentDidMount DATE TIME :::: " + new Date() + "::" + Moment(dt).format('HH')  +"::" +  Moment(dt).format('mm')+"::" +  ":::"+newDarkMode )
	//alert(newDarkMode);
	//return newDarkMode;

	return MapboxGL.StyleURL.Street

}
