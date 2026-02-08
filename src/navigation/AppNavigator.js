import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, ActivityIndicator } from 'react-native';

import AuthScreen from '../screens/AuthScreen';
import StudentHomeScreen from '../screens/StudentHomeScreen';
import DriverHome from '../screens/DriverHome';
import RideActive from '../screens/RideActive';
import MapViewScreen from '../screens/MapView';

import { supabase, getUserProfile } from '../services/supabase';
import { COLORS } from '../utils/constants';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs({ route }) {
  const userType = route?.params?.userType || 'student';
  const initialTab = userType === 'driver' ? 'Driver' : 'Student';

  return (
    <Tab.Navigator
      initialRouteName={initialTab}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: COLORS.border,
        },
      }}
    >
      <Tab.Screen
        name="Student"
        component={StudentHomeScreen}
        options={{ tabBarLabel: 'Student', tabBarIcon: () => <Text>🚌</Text> }}
      />
      <Tab.Screen
        name="Driver"
        component={DriverHome}
        options={{ tabBarLabel: 'Driver', tabBarIcon: () => <Text>👤</Text> }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const [session, setSession] = useState(null);
  const [userType, setUserType] = useState('student');
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleGuestLogin = () => {
    setIsGuest(true);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      setSession(sess);
      if (sess?.user) {
        getUserProfile(sess.user.id)
          .then((profile) => setUserType(profile?.user_type || 'student'))
          .catch(() => setUserType(sess.user?.user_metadata?.user_type || 'student'))
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, sess) => {
        setSession(sess);
        if (sess?.user) {
          try {
            const profile = await getUserProfile(sess.user.id);
            setUserType(profile?.user_type || 'student');
          } catch {
            setUserType(sess.user?.user_metadata?.user_type || 'student');
          }
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
        {!session && !isGuest ? (
          <Stack.Screen name="Auth">
            {(props) => <AuthScreen {...props} onGuestLogin={handleGuestLogin} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen
            name="MainTabs"
            component={MainTabs}
            initialParams={{ userType: isGuest ? 'student' : userType }}
          />
        )}
        <Stack.Screen
          name="RideActive"
          component={RideActive}
          options={{ presentation: 'card' }}
        />
        <Stack.Screen
          name="MapView"
          component={MapViewScreen}
          options={{ presentation: 'card' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
