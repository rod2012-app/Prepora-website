import React, { useState, useEffect, createContext, useContext } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments, useRootNavigationState } from 'expo-router';

// Create a context for onboarding state
type OnboardingContextType = {
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => Promise<void>;
};

const OnboardingContext = createContext<OnboardingContextType>({
  hasCompletedOnboarding: false,
  completeOnboarding: async () => {},
});

export const useOnboarding = () => useContext(OnboardingContext);

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (!navigationState?.key) return; // Wait for navigation to be ready

    const inOnboarding = segments[0] === 'onboarding';

    if (!hasCompletedOnboarding && !inOnboarding) {
      // User hasn't completed onboarding, redirect to onboarding
      router.replace('/onboarding');
    } else if (hasCompletedOnboarding && inOnboarding) {
      // User has completed onboarding but is on onboarding screen, redirect to tabs
      router.replace('/(tabs)');
    }
  }, [isLoading, hasCompletedOnboarding, segments, navigationState?.key]);

  const checkOnboardingStatus = async () => {
    try {
      const status = await AsyncStorage.getItem('hasCompletedOnboarding');
      setHasCompletedOnboarding(status === 'true');
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setHasCompletedOnboarding(false);
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      setHasCompletedOnboarding(true);
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9B85" />
      </View>
    );
  }

  return (
    <OnboardingContext.Provider value={{ hasCompletedOnboarding, completeOnboarding }}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="recipe-detail" options={{ headerShown: false }} />
      </Stack>
    </OnboardingContext.Provider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEFEFE',
  },
});
