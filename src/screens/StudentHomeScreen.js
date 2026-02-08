import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';

import ShuttleMarker from '../components/ShuttleMarker';
import { getCurrentLocation } from '../services/location';
import {
  supabase,
  getActiveShuttlesWithRealtime,
  startRide,
  getStudentActiveRide,
  subscribeToStudentRide,
} from '../services/supabase';
import { COLORS, SPACING, FONT_SIZES, ROUTE_TYPES } from '../utils/constants';

// Default campus region - customize for your campus
const CAMPUS_REGION = {
  latitude: 19.076,
  longitude: 72.8777,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

// Mock data when Supabase shuttles table is empty - remove when using real data
const MOCK_SHUTTLES = [
  {
    id: '1',
    vehicle_number: '1001',
    route_type: ROUTE_TYPES.REGULAR,
    current_seats: 12,
    total_seats: 22,
    latitude: 19.076,
    longitude: 72.8777,
    is_active: true,
  },
  {
    id: '2',
    vehicle_number: '1002',
    route_type: ROUTE_TYPES.MENS_HOSTEL,
    current_seats: 22,
    total_seats: 22,
    latitude: 19.077,
    longitude: 72.8785,
    is_active: true,
  },
];

export default function StudentHomeScreen({ navigation }) {
  const [shuttles, setShuttles] = useState([]);
  const [selectedShuttle, setSelectedShuttle] = useState(null);
  const [activeRide, setActiveRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [region, setRegion] = useState(CAMPUS_REGION);
  const [vehicleCode, setVehicleCode] = useState('');
  const [startRideLoading, setStartRideLoading] = useState(false);
  const [startRideError, setStartRideError] = useState('');
  const [showStartRideModal, setShowStartRideModal] = useState(false);
  const bottomSheetRef = useRef(null);
  const mapRef = useRef(null);
  const snapPoints = ['25%', '50%'];

  const [userId, setUserId] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadShuttles = useCallback(async () => {
    try {
      const { data } = await supabase.from('shuttles').select('*').eq('is_active', true);
      setShuttles(data?.length ? data : MOCK_SHUTTLES);
    } catch {
      setShuttles(MOCK_SHUTTLES);
    }
  }, []);

  useEffect(() => {
    getCurrentLocation()
      .then((coords) => {
        setRegion({
          ...CAMPUS_REGION,
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let unsubscribe;
    getActiveShuttlesWithRealtime((list) => {
      setShuttles(list?.length ? list : MOCK_SHUTTLES);
      setLoading(false);
      setRefreshing(false);
    }).then((fn) => {
      unsubscribe = fn;
    });
    return () => unsubscribe?.();
  }, []);

  useEffect(() => {
    if (userId) {
      getStudentActiveRide(userId).then(setActiveRide);
      const unsub = subscribeToStudentRide(userId, setActiveRide);
      return unsub;
    }
  }, [userId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadShuttles().finally(() => setRefreshing(false));
  }, [loadShuttles]);

  const handleMarkerPress = (shuttle) => {
    setSelectedShuttle(shuttle);
    bottomSheetRef.current?.expand();
    mapRef.current?.animateToRegion(
      {
        ...region,
        latitude: shuttle.latitude,
        longitude: shuttle.longitude,
      },
      300
    );
  };

  const handleStartRide = async () => {
    if (!userId) {
      setStartRideError('Please sign in to start a ride');
      return;
    }
    const code = vehicleCode.replace(/\D/g, '').slice(-4);
    if (code.length < 4) {
      setStartRideError('Enter 4-digit vehicle code');
      return;
    }
    setStartRideError('');
    setStartRideLoading(true);
    try {
      await startRide(userId, code);
      setShowStartRideModal(false);
      setVehicleCode('');
      const ride = await getStudentActiveRide(userId);
      setActiveRide(ride);
      navigation.navigate('RideActive', { ride });
    } catch (err) {
      setStartRideError(err.message || 'Failed to start ride');
    } finally {
      setStartRideLoading(false);
    }
  };

  const handleMyActiveRide = () => {
    if (activeRide) {
      navigation.navigate('RideActive', { ride: activeRide });
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        mapType="none"
        showsUserLocation
        showsMyLocationButton
      >
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
        />
        {shuttles.map((shuttle) => (
          <Marker
            key={shuttle.id}
            coordinate={{
              latitude: shuttle.latitude || CAMPUS_REGION.latitude,
              longitude: shuttle.longitude || CAMPUS_REGION.longitude,
            }}
            onPress={() => handleMarkerPress(shuttle)}
            tracksViewChanges={false}
          >
            <ShuttleMarker
              vehicleNumber={shuttle.vehicle_number || shuttle.vehicle_code}
              routeType={shuttle.route_type || ROUTE_TYPES.REGULAR}
              currentSeats={shuttle.current_seats ?? 0}
              totalSeats={shuttle.total_seats ?? 22}
              size={52}
            />
          </Marker>
        ))}
      </MapView>

      <SafeAreaView style={styles.headerOverlay} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Campus Shuttle</Text>
          <Text style={styles.subtitle}>Tap a shuttle to view details</Text>
        </View>
      </SafeAreaView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}

      {activeRide && (
        <TouchableOpacity
          style={styles.fab}
          onPress={handleMyActiveRide}
          activeOpacity={0.9}
        >
          <Text style={styles.fabIcon}>🚌</Text>
          <Text style={styles.fabText}>My Active Ride</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.startRideFab}
        onPress={() => setShowStartRideModal(true)}
        activeOpacity={0.9}
      >
        <Text style={styles.startRideFabText}>Start Ride</Text>
      </TouchableOpacity>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={() => setSelectedShuttle(null)}
        backgroundStyle={styles.bottomSheetBg}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <BottomSheetScrollView
          contentContainerStyle={styles.bottomSheetContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
          }
        >
          {selectedShuttle ? (
            <>
              <View style={styles.shuttleDetailHeader}>
                <Text style={styles.shuttleNumber}>
                  Shuttle #{String(selectedShuttle.vehicle_number || selectedShuttle.vehicle_code).padStart(4, '0')}
                </Text>
                <View
                  style={[
                    styles.routeBadge,
                    {
                      backgroundColor:
                        selectedShuttle.route_type === ROUTE_TYPES.MENS_HOSTEL ? '#ed8936' : '#48bb78',
                    },
                  ]}
                >
                  <Text style={styles.routeBadgeText}>
                    {selectedShuttle.route_type === ROUTE_TYPES.MENS_HOSTEL ? 'Mens Hostel' : 'Regular'}
                  </Text>
                </View>
              </View>
              <Text style={styles.seatsText}>
                {selectedShuttle.current_seats ?? 0}/{selectedShuttle.total_seats ?? 22} seats
                {(selectedShuttle.current_seats ?? 0) >= (selectedShuttle.total_seats ?? 22) && (
                  <Text style={styles.fullWarning}> • Full</Text>
                )}
              </Text>
              <TouchableOpacity
                style={styles.boardBtn}
                onPress={() => {
                  setVehicleCode(selectedShuttle.vehicle_number || selectedShuttle.vehicle_code || '');
                  setShowStartRideModal(true);
                  bottomSheetRef.current?.close();
                }}
              >
                <Text style={styles.boardBtnText}>Board This Shuttle</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.emptyText}>Tap a shuttle on the map to view details</Text>
          )}
        </BottomSheetScrollView>
      </BottomSheet>

      <Modal visible={showStartRideModal} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowStartRideModal(false)}
          />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Start Ride</Text>
            <Text style={styles.modalSubtitle}>Enter the 4-digit vehicle code shown on the shuttle</Text>
            <TextInput
              style={styles.vehicleInput}
              placeholder="e.g. 1001"
              placeholderTextColor={COLORS.textSecondary}
              value={vehicleCode}
              onChangeText={(t) => setVehicleCode(t.replace(/\D/g, '').slice(0, 4))}
              keyboardType="number-pad"
              maxLength={4}
            />
            {startRideError ? (
              <Text style={styles.errorText}>{startRideError}</Text>
            ) : null}
            <TouchableOpacity
              style={[styles.submitBtn, startRideLoading && styles.submitBtnDisabled]}
              onPress={handleStartRide}
              disabled={startRideLoading}
            >
              {startRideLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitBtnText}>Start Ride</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowStartRideModal(false)}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  header: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    padding: SPACING.md,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 140,
    right: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  fabIcon: {
    fontSize: 18,
    marginRight: SPACING.xs,
  },
  fabText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: '#ffffff',
  },
  startRideFab: {
    position: 'absolute',
    bottom: SPACING.lg + 48,
    left: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  startRideFabText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: '#ffffff',
  },
  bottomSheetBg: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  handleIndicator: {
    backgroundColor: COLORS.border,
    width: 40,
  },
  bottomSheetContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl * 2,
  },
  shuttleDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  shuttleNumber: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  routeBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
  },
  routeBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: '#ffffff',
  },
  seatsText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  fullWarning: {
    color: COLORS.error,
    fontWeight: '600',
  },
  boardBtn: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  boardBtnText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: '#ffffff',
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.lg,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.lg,
    paddingBottom: SPACING.xl + 24,
  },
  modalTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  modalSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  vehicleInput: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: COLORS.border,
    letterSpacing: 4,
    textAlign: 'center',
  },
  errorText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
    marginBottom: SPACING.sm,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: '#ffffff',
  },
  cancelBtn: {
    alignItems: 'center',
    padding: SPACING.sm,
  },
  cancelBtnText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
});
