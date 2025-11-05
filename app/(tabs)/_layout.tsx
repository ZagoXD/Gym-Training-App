import { HapticTab } from '@/components/haptic-tab';
import SignOutButton from '@/components/SignOutButton';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getOwnProfileWithTrainer } from '@/services/profile';
import { Redirect, Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { userId, loading } = useAuth();
  const [isTrainer, setIsTrainer] = useState(false);

  useEffect(() => {
    (async () => {
      if (!userId) return;
      try {
        const p = await getOwnProfileWithTrainer(userId);
        setIsTrainer(p.role === 'trainer');
      } catch { /* noop */ }
    })();
  }, [userId]);

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
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
          headerRight: () => <SignOutButton />,
        }}
      />

      <Tabs.Screen
        name="users"
        options={{
          title: 'Perfil',
          headerShown: true,
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.crop.circle" color={color} />
          ),
          headerRight: () => <SignOutButton />,
        }}
      />

      <Tabs.Screen
        name="exercises"
        options={{
          title: 'Exercícios',
          headerShown: true,
          href: isTrainer ? '/(tabs)/exercises' : null,
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="fitness-center" color={color} />
          ),
          headerRight: () => <SignOutButton />,
        }}
      />
    </Tabs>
  );
}
