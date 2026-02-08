import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapViewScreen from './MapView';
import RideCard from '../components/RideCard';
import PaymentModal from '../components/PaymentModal';
import { COLORS, SPACING, FONT_SIZES } from '../utils/constants';

export default function RideActive({ route, navigation }) {
  const ride = route?.params?.ride || {};
  const [showPayment, setShowPayment] = useState(false);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.mapContainer}>
        <MapViewScreen />
      </View>
      <View style={styles.bottomSheet}>
        <RideCard ride={ride} />
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.payBtn}
            onPress={() => setShowPayment(true)}
          >
            <Text style={styles.payBtnText}>Pay</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelBtnText}>Cancel Ride</Text>
          </TouchableOpacity>
        </View>
      </View>
      <PaymentModal
        visible={showPayment}
        onClose={() => setShowPayment(false)}
        onSubmit={(data) => console.log('Payment:', data)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mapContainer: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
    marginHorizontal: SPACING.md,
  },
  payBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  payBtnText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: '#ffffff',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});
