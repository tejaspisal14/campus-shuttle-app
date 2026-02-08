import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import Auth from '../screens/Auth';
import StudentHome from '../screens/StudentHome';
import DriverHome from '../screens/DriverHome';
import RideActive from '../screens/RideActive';
import MapViewScreen from '../screens/MapView';

import { COLORS } from '../utils/constants';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
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
        component={StudentHome}
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
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
        <Stack.Screen name="Auth" component={Auth} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
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
