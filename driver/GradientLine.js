
import React from 'react';
import { Easing, Button } from 'react-native';
import { Animated, MapView, Camera } from '@react-native-mapbox-gl/maps';
import along from '@turf/along';
import length from '@turf/length';
import { point, lineString } from '@turf/helpers';


const blon = -73.99155;
const blat = 40.73481;
const bdelta = 0.0005;

const lon = -73.99255;
const lat = 40.73581;
const delta = 0.001;
const steps = 300;

const styles = {
lineLayerOne: {
lineCap: 'round',
lineWidth: 6,
lineOpacity: 0.84,
lineColor: '#514ccd',
},
circleLayer: {
circleOpacity: 0.8,
circleColor: '#c62221',
circleRadius: 20,
},
lineLayerTwo: {
lineCap: 'round',
lineWidth: 6,
lineOpacity: 0.84,
lineColor: '#314ccd',
},
};

class GradientLine extends React.Component {

constructor(props) {
super(props);

const route = new Animated.RouteCoordinatesArray([
  [blon, blat],
  [blon, blat + 2 * bdelta],
  [blon + bdelta, blat + 2 * bdelta + bdelta],
  [blon + bdelta + 2 * bdelta, blat + 2 * bdelta + bdelta + bdelta],
]);

this.state = {
  backgroundColor: 'blue',
  coordinates: [[-73.99155, 40.73581]],

  shape: new Animated.CoordinatesArray(
	[...Array(steps).keys()].map((v, i) => [
	  lon + delta * (i / steps) * (i / steps),
	  lat + (delta * i) / steps,
	]),
  ),
  targetPoint: {
	type: 'FeatureCollection',
	features: [],
  },
  route,
  actPoint: new Animated.ExtractCoordinateFromArray(route, -1),
};
}

startAnimateRoute() {
const vec = this.state.route.__getValue();


const ls = {
  type: 'LineString',
  coordinates: vec,
};


const len = length(ls, { units: 'meters' });
let dest = len - 89.0;
let pt;
if (len === 0.0) {
  const { originalRoute } = this.state.route;
  dest = length(lineString(originalRoute), { units: 'meters' });
  pt = point(originalRoute[originalRoute.length - 1]);
  console.log('this.state.route len is 0 =================>',pt)
} else {
  if (dest < 0) {
	dest = 0;
  }
  pt = along(ls, dest, { units: 'meters' });
  console.log('this.state.route len not 0 =================>',pt)
}

this.state.route
  .timing({
	toValue: { end: { point: pt } },
	duration: 2000,
	easing: Easing.linear,
  })
  .start();
}

render() {
return (
  <>
	<MapView
	  ref={(c) => (this._map = c)}
	  onPress={this.onPress}
	  onDidFinishLoadingMap={this.onDidFinishLoadingMap}
	  style={{flex:1}}
	>
	  <Camera zoomLevel={16} centerCoordinate={this.state.coordinates[0]} />

	  <Animated.ShapeSource
		id={'route'}
		shape={
		  new Animated.Shape({
			type: 'LineString',
			coordinates: this.state.route,
		  })
		}
	  >
		<Animated.LineLayer id={'lineroute'} style={styles.lineLayerOne} />
	  </Animated.ShapeSource>

	  <Animated.ShapeSource
		id="currentLocationSource"
		shape={
		  new Animated.Shape({
			type: 'Point',
			coordinates: this.state.actPoint,
		  })
		}
	  >
		<Animated.CircleLayer
		  id="currentLocationCircle"
		  style={styles.circleLayer}
		/>
	  </Animated.ShapeSource>

	  
	</MapView>

	  
	  <Button
		title="Animate route"
		onPress={() => this.startAnimateRoute()}
	  />
  </>
);
}
}

export default GradientLine;