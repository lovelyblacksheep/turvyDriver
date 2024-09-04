import { PermissionsAndroid } from "react-native";
import Geolocation from 'react-native-geolocation-service';

let coord = {}

export async function getPosition() {
    await Geolocation.getCurrentPosition(
        (position) => {
            coord = {latitude:position.coords.latitude, longitude: position.coords.longitude}
            console.log(coord);
            if(coord){
                return coord
            }
            return false
        },
        (error) => {
            console.log(error.code, error.message);
        },
        { forceRequestLocation: true, distanceFilter:0, enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    )
}

export function watchPosition() {
    
}

export async function getPermission() {
    try {
        const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ])
        if ( granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED && granted['android.permission.ACCESS_COARSE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED ) {
            return true
        }
        else {
            return false
        }
    } catch (error) {
        console.log(error);
        return false
    }
}