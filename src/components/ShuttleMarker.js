import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';

export default function ShuttleMarker({ size = 24, color = COLORS.primary }) {
  return (
    <View style={[styles.marker, { width: size, height: size, backgroundColor: color }]}>
      <View style={[styles.inner, { width: size / 2, height: size / 2 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  marker: {
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  inner: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
  },
});
