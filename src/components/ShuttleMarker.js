import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, ROUTE_COLORS, ROUTE_TYPES, FONT_SIZES, SPACING } from '../utils/constants';

const ROUTE_LABELS = {
  [ROUTE_TYPES.REGULAR]: 'Regular',
  [ROUTE_TYPES.MENS_HOSTEL]: 'Mens Hostel',
};

export default function ShuttleMarker({
  vehicleNumber = '0000',
  routeType = ROUTE_TYPES.REGULAR,
  currentSeats = 0,
  totalSeats = 22,
  size = 56,
}) {
  const routeColor = ROUTE_COLORS[routeType] || COLORS.primary;
  const routeLabel = ROUTE_LABELS[routeType] || 'Regular';
  const isFull = currentSeats >= totalSeats;

  return (
    <View style={[styles.container, { width: size, minHeight: size }]}>
      <View style={[styles.marker, { backgroundColor: routeColor }]}>
        <Text style={styles.vehicleNumber}>{String(vehicleNumber).padStart(4, '0').slice(-4)}</Text>
      </View>
      <View style={[styles.badge, { backgroundColor: routeColor }]}>
        <Text style={styles.badgeText}>{routeLabel}</Text>
      </View>
      <View style={[styles.occupancy, isFull && styles.occupancyFull]}>
        <Text style={[styles.occupancyText, isFull && styles.occupancyTextFull]}>
          {currentSeats}/{totalSeats} seats
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  marker: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  vehicleNumber: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  badge: {
    marginTop: 2,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#ffffff',
  },
  occupancy: {
    marginTop: 2,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: COLORS.background,
  },
  occupancyFull: {
    backgroundColor: COLORS.error + '20',
  },
  occupancyText: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  occupancyTextFull: {
    color: COLORS.error,
  },
});
