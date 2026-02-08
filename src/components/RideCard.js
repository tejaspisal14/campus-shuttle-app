import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../utils/constants';

export default function RideCard({ ride, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <Text style={styles.shuttleId}>Shuttle #{ride?.id || 'N/A'}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{ride?.status || 'Active'}</Text>
        </View>
      </View>
      <View style={styles.route}>
        <Text style={styles.routeText}>{ride?.origin || 'Campus Center'}</Text>
        <View style={styles.routeLine} />
        <Text style={styles.routeText}>{ride?.destination || 'Library'}</Text>
      </View>
      <Text style={styles.eta}>ETA: {ride?.eta || '~5 min'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  shuttleId: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  statusBadge: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: '600',
  },
  route: {
    marginBottom: SPACING.sm,
  },
  routeText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  routeLine: {
    width: 1,
    height: 12,
    backgroundColor: COLORS.primary,
    marginLeft: SPACING.sm,
    marginVertical: 2,
  },
  eta: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
});
