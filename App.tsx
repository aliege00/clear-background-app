import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, ActivityIndicator } from 'react-native';

import { useTheme, loadThemeMode } from './src/services/themeService';
import { adMobService } from './src/services/adMobService';

import BackgroundRemovalScreen from './src/screens/BackgroundRemovalScreen';
import HelpCenterScreen from './src/screens/HelpCenterScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  const { resolved } = useTheme();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      await loadThemeMode();
      await adMobService.initialize();
      setIsReady(true);
    })();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A1A2E' }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  const navTheme = resolved === 'dark' ? DarkTheme : {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: '#F8F9FB',
      card: '#FFFFFF',
      text: '#1A1A2E',
      border: '#E5E7EB',
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style={resolved === 'dark' ? 'light' : 'dark'} />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: resolved === 'dark' ? '#FFFFFF' : '#1A1A2E',
          tabBarInactiveTintColor: resolved === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)',
          tabBarStyle: {
            backgroundColor: resolved === 'dark' ? '#1A1A22' : '#FFFFFF',
            borderTopColor: resolved === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
            height: 85,
            paddingBottom: 25,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
        }}
      >
        <Tab.Screen
          name="remove"
          component={BackgroundRemovalScreen}
          options={{
            tabBarLabel: 'Arka Plan',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>✂️</Text>,
          }}
        />
        <Tab.Screen
          name="help"
          component={HelpCenterScreen}
          options={{
            tabBarLabel: 'Yardım',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>❓</Text>,
          }}
        />
        <Tab.Screen
          name="settings"
          component={SettingsScreen}
          options={{
            tabBarLabel: 'Ayarlar',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>⚙️</Text>,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
