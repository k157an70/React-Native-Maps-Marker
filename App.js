import React, { useState, useEffect } from 'react';
import { View, Text, Image, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

// create a component
const initialState = {
  latitude: null,
  longitude: null,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
}

const INITIAL_MARKER = [
  {
    id: 1,
    region: { latitude: -6.298295, longitude: 106.669749 },
    title: 'EKA HOSPITAL',
    desc: 'Telp.(021)8888800',
    urlImg: 'https://serpongku.com/wp-content/uploads/2018/08/Eka-Hospital-BSD-City.jpg'
  },
  {
    id: 2,
    region: { latitude: -6.304952, longitude: 106.684736 },
    title: 'PASAR MODERN BSD',
    desc: 'Telp.(021)9999800',
    urlImg: 'https://www.pontianakpost.co.id/sites/default/files/styles/large_with_watermark/public/field/image/Ilustrasi_1.jpg?itok=jY1bljNH'
  },
];

const App = () => {
  let myMap;
  const [curentPosition, setCurentPosition] = useState(initialState);
  const [marker, setMarker] = useState({});
 const[coords,setCoords] = useState([])

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      const { longitude, latitude } = position.coords;
      setCurentPosition({
        ...curentPosition,
        latitude,
        longitude,
      });
    },
      error => alert(error.message),
      { timeout: 20000, maximumAge: 1000 }
    );
    return () => {

    }
  }, [])

  const renderMarker = () => {
    return INITIAL_MARKER.map(_marker => (
      <Marker
        key={_marker['id']}
        coordinate={_marker['region']}
        title={_marker['title']}
        description={_marker['desc']}
        onPress={() => {
          setMarker(_marker);
          getJarak(_marker);
          //alert(JSON.stringify(marker));
          myMap.fitToCoordinates([_marker['region']], {
              edgePadding: { top: 10, bottom: 10, left: 10, right: 10 },
              animated: true
          });
          //setTimeout( getJarak, 1000);
        }}
      />
    ));
  }

  const getJarak = async _marker => {
    //const region = await marker;
    //alert(JSON.stringify(_marker));
    const {latitude, longitude } = _marker;
    
    const concatStart = `${curentPosition.latitude},${curentPosition.longitude}`
    const concatEnd = `${latitude},${longitude}`;
    try {
      const resp = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${concatStart}&destination=${concatEnd}&key=[YOUR_KEY]`)
      const respJson = await resp.json();
      alert(JSON.stringify(respJson));
      return;
      const response = respJson.routes[0]
      const distanceTime = response.legs[0]
      const distance = distanceTime.distance.text
      const time = distanceTime.duration.text
      const points = Polyline.decode(respJson.routes[0].overview_polyline.points);
      const coords = points.map(point => {
        alert(JSON.stringify(point))
        // return {
        //   latitude: point[0],
        //   longitude: point[1]
        // }
      })
      //this.setState({ coords, distance, time })
    } catch(error) {
      alert('Error: '+ error)
    }
  }

  const renderDetailMarker = () => (
    <View
      style={{
        position:'absolute',
        bottom:0,
        padding: 5,
        width: '100%',
        flexDirection:'row',
        backgroundColor:'#E1F5FE'
      }}
    >
      <Image
        source={{ uri: marker['urlImg']}}
        resizeMode="cover"
        style={{ width: 100, height: 90 }}
      />
      <View
        style={{ flex:1, paddingLeft: 5, flexDirection:'column'}}
      >
        <Text style={{ fontWeight: 'bold' }}>{ marker['title'] }</Text>
        <Text allowFontScaling={false}>{ marker['desc'] }</Text>
      </View>
    </View>
  )

  return curentPosition.latitude ? (
    <View style={{ flex: 1 }}>
      <MapView
        ref={ref => myMap = ref}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        showsUserLocation
        initialRegion={curentPosition}
      >
        { renderMarker() }
        <Polyline
          strokeWidth={2}
          strokeColor="red"
          coordinates={coords}
        />
      </MapView>
      { marker.hasOwnProperty('id') && renderDetailMarker() }
    </View>
  ) : <ActivityIndicator style={{ flex: 1 }} animating size="large" />
};


export default App;
