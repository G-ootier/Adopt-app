import React from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { Home, Heart, User } from 'lucide-react-native';

const TAB_CONFIG = [
  { name: 'animals', label: 'My animals', Icon: Home },
  { name: 'interest', label: 'Interest', Icon: Heart },
  { name: 'profile', label: 'Profile', Icon: User },
] as const;

function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const inner = (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, gap: 6 }}>
      {state.routes.map((route, index) => {
        const config = TAB_CONFIG.find((t) => t.name === route.name);
        if (!config) return null;
        const isFocused = state.index === index;
        const { Icon, label } = config;
        const iconColor = isFocused ? '#FF7A4F' : '#B0ACBB';
        const labelColor = isFocused ? '#FF7A4F' : '#B0ACBB';
        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
        };
        return (
          <Pressable key={route.key} onPress={onPress} accessibilityRole="button" accessibilityState={isFocused ? { selected: true } : {}} accessibilityLabel={label}
            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, backgroundColor: isFocused ? 'rgba(255,122,79,0.1)' : 'transparent' }}>
            <Icon size={20} color={iconColor} strokeWidth={isFocused ? 2.2 : 1.8} />
            <Text style={{ fontFamily: 'DMSans-SemiBold', fontSize: 10, color: labelColor }}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );

  const containerStyle = {
    position: 'absolute' as const, bottom: 28, left: 16, right: 16, borderRadius: 999, overflow: 'hidden' as const,
    shadowColor: '#1F1B2E', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 28, elevation: 8,
    borderWidth: 1, borderColor: 'rgba(31,27,46,0.06)',
  };

  if (Platform.OS === 'ios') {
    return (
      <BlurView intensity={60} tint="light" style={containerStyle}>
        <View style={{ backgroundColor: 'rgba(255,246,233,0.82)' }}>{inner}</View>
      </BlurView>
    );
  }
  return <View style={[containerStyle, { backgroundColor: '#FFF6E9' }]}>{inner}</View>;
}

export default function ShelterLayout() {
  return (
    <Tabs tabBar={(props) => <FloatingTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="animals" />
      <Tabs.Screen name="interest" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="add-pet" options={{ href: null }} />
      <Tabs.Screen name="edit-pet" options={{ href: null }} />
    </Tabs>
  );
}
