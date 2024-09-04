import MapboxDirectionsFactory from '@mapbox/mapbox-sdk/services/directions';

//import config from './utils/config';

const clientOptions = { accessToken: 'pk.eyJ1IjoibWFsLXdvb2QiLCJhIjoiY2oyZ2t2em50MDAyMzJ3cnltMDFhb2NzdiJ9.X-D4Wvo5E5QxeP7K_I3O8w' };
const directionsClient = MapboxDirectionsFactory(clientOptions);

export { directionsClient };
