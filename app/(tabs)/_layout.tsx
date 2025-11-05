import { HapticTab } from '@/components/haptic-tab';
import SignOutButton from '@/components/SignOutButton';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Redirect, Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { userId, loading } = useAuth();

  if (loading) return null;
  if (!userId) return <Redirect href="/sign-in" />;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
    <Tabs.Screen
      name="index"
      options={{
        title: 'Home',
        headerShown: true,
        tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        headerRight: () => <SignOutButton />,
      }}
    />
    </Tabs>
  );
}
