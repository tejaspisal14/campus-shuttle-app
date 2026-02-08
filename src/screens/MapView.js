import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import RNMapView from 'react-native-maps';
import { getCurrentLocation } from '../services/location';

const DEFAULT_REGION = {
  latitude: 37.78825,
  longitude: -122.4324,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

export default function MapViewScreen() {
  const [region, setRegion] = useState(DEFAULT_REGION);

  useEffect(() => {
    getCurrentLocation()
      .then((coords) => {
        setRegion({
          ...region,
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
      })
      .catch(() => {
        // Use default region if location fails
      });
  }, []);

  return (
    <View style={styles.container}>
      <RNMapView
        style={styles.map}
        initialRegion={region}
        showsUserLocation
        showsMyLocationButton
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
