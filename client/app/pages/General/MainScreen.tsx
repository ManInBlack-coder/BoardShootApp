import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import SettingsScreen from '../Settings/SettingsScreen';
import FoldersScreen from '../Folders/FoldersScreen';
import CameraScreen from '../Camera/CameraScreen';

const Tab = createBottomTabNavigator();

export default function MainScreen() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#00C898' },
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#C28D00',
       
      }}
      initialRouteName="Camera"
    >
        <Tab.Screen name="Folders" component={FoldersScreen} />

      <Tab.Screen name="Camera" component={CameraScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}