import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RideCard from '../components/RideCard';
import { COLORS, SPACING, FONT_SIZES } from '../utils/constants';

export default function StudentHome({ navigation }) {
  const [activeRides] = useState([
    { id: '1', origin: 'Campus Center', destination: 'Library', status: 'Active', eta: '~3 min' },
    { id: '2', origin: 'Dorms', destination: 'Science Building', status: 'Active', eta: '~7 min' },
  ]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Campus Shuttle</Text>
        <Text style={styles.subtitle}>Track your ride</Text>
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Available Rides</Text>
        {activeRides.map((ride) => (
          <RideCard
            key={ride.id}
            ride={ride}
            onPress={() => navigation.navigate('RideActive', { ride })}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
});
