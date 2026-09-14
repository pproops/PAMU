import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { AppColors } from '@/constants/colors';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarButton: HapticTab,

        tabBarActiveTintColor: AppColors.accent,
        tabBarInactiveTintColor: AppColors.textDim,

        tabBarHideOnKeyboard: true,

        tabBarStyle: {
          backgroundColor: AppColors.surfaceMuted,
          borderTopColor: AppColors.border,
          borderTopWidth: 1,

          height:
            64 +
            Math.max(
              insets.bottom,
              Platform.OS === 'android'
                ? 16
                : 8
            ),

          paddingTop: 8,

          paddingBottom:
            Math.max(
              insets.bottom,
              Platform.OS === 'android'
                ? 14
                : 8
            ),

          elevation: 0,
        },

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 2,
        },

        tabBarIconStyle: {
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Početna',

          tabBarIcon: ({
            color,
            focused,
          }) => (
            <Ionicons
              name={
                focused
                  ? 'home'
                  : 'home-outline'
              }
              size={25}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="tournaments"
        options={{
          title: 'Turniri',

          tabBarIcon: ({
            color,
            focused,
          }) => (
            <Ionicons
              name={
                focused
                  ? 'trophy'
                  : 'trophy-outline'
              }
              size={25}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',

          tabBarIcon: ({
            color,
            focused,
          }) => (
            <Ionicons
              name={
                focused
                  ? 'person'
                  : 'person-outline'
              }
              size={25}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}