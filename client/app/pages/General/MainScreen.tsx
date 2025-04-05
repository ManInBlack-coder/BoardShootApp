import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { View } from 'react-native';
import SettingsScreen from '../Settings/SettingsScreen';
import FoldersScreen from '../Folders/FoldersScreen';
import CameraScreen from '../Camera/CameraScreen';

const Tab = createBottomTabNavigator();

export default function MainScreen() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { 
          backgroundColor: '#00C898',
          height: 80,
          borderTopWidth: 0,
          
        },
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#005A2C',
        tabBarShowLabel: false,
      }}
      initialRouteName="Camera"
    >
      <Tab.Screen 
        name="Folders" 
        component={FoldersScreen} 
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center' }}>
              {focused ? (
                <View
                  style={{
                    width: 45,
                    height: 45,
                    backgroundColor: '#005A2C',
                    borderRadius: 25,
                    marginTop: 35,
                  }}
                />
              ) : (
                <View
                  style={{
                    width: 75,
                    height: 45,
                    backgroundColor: 'white',
                    borderRadius: 15,
                    borderWidth: 2,
                    borderColor: '#005A2C',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 35,

                  }}
                >
                  <Ionicons name="folder" size={26} color="black" />
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="Camera" 
        component={CameraScreen} 
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center' }}>
              {focused ? (
                <View
                  style={{
                    width: 45,
                    height: 45,
                    backgroundColor: '#005A2C',
                    borderRadius: 25,
                    marginTop: 35,

                  }}

                />
              ) : (
                <View
                  style={{
                    width: 75,
                    height: 45,
                    backgroundColor: 'white',
                    borderRadius: 15,
                    borderWidth: 2,
                    borderColor: '#005A2C',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 35,
                  }}
                >
                  <MaterialCommunityIcons name="camera-iris" size={26} color="black" />
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center' }}>
              {focused ? (
                <View
                  style={{
                    width: 45,
                    height: 45,
                    backgroundColor: '#005A2C',
                    borderRadius: 25,
                    marginTop: 35,
                  }}
                />
              ) : (
                <View
                  style={{
                    width: 75,
                    height: 45,
                    backgroundColor: 'white',
                    borderRadius: 15,
                    borderWidth: 2,
                    borderColor: '#005A2C',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 35,
                  }}
                >
                  <Ionicons name="settings-outline" size={26} color="black" />
                </View>
              )}
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}