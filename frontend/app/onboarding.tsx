import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useOnboarding } from './_layout';

const { width, height } = Dimensions.get('window');

type SlideData = {
  id: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
  description: string;
};

const onboardingData: SlideData[] = [
  {
    id: '1',
    icon: 'food',
    iconColor: '#FF9B85',
    iconBg: '#FFF5F3',
    title: 'Welcome to Prepora',
    subtitle: 'Your AI Meal Planner',
    description: 'Plan smart. Eat better. Live easier. Let us help you create delicious meal plans tailored just for you.',
  },
  {
    id: '2',
    icon: 'basket-plus-outline',
    iconColor: '#A8C5A8',
    iconBg: '#F0F5F0',
    title: 'Smart Pantry',
    subtitle: 'Track Your Ingredients',
    description: "Add ingredients you have at home. We'll suggest recipes based on what's in your kitchen to reduce waste.",
  },
  {
    id: '3',
    icon: 'auto-fix',
    iconColor: '#B8A8D8',
    iconBg: '#F8F5FF',
    title: 'AI-Powered Plans',
    subtitle: 'Daily or Weekly',
    description: 'Choose healthy or comfort meals. Our AI creates personalized meal plans with detailed recipes in seconds.',
  },
  {
    id: '4',
    icon: 'heart',
    iconColor: '#FFB5A0',
    iconBg: '#FFF5F3',
    title: 'Save Favorites',
    subtitle: 'Never Lose a Recipe',
    description: 'Love a recipe? Save it to your favorites for quick access anytime. Build your personal cookbook!',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { completeOnboarding } = useOnboarding();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleComplete = async () => {
    await completeOnboarding();
    // The _layout.tsx will automatically redirect to (tabs) after state updates
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const currentSlide = onboardingData[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Current Slide Content */}
      <View style={styles.slideContainer}>
        <View style={styles.slideContent}>
          {/* Icon Container */}
          <View style={[styles.iconContainer, { backgroundColor: currentSlide.iconBg }]}>
            <MaterialCommunityIcons
              name={currentSlide.icon}
              size={80}
              color={currentSlide.iconColor}
            />
          </View>

          {/* Text Content */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>{currentSlide.title}</Text>
            <Text style={[styles.subtitle, { color: currentSlide.iconColor }]}>
              {currentSlide.subtitle}
            </Text>
            <Text style={styles.description}>{currentSlide.description}</Text>
          </View>
        </View>
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {/* Pagination */}
        <View style={styles.pagination}>
          {onboardingData.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => setCurrentIndex(index)}
              style={[
                styles.paginationDot,
                {
                  backgroundColor: item.iconColor,
                  width: index === currentIndex ? 24 : 8,
                  opacity: index === currentIndex ? 1 : 0.4,
                },
              ]}
            />
          ))}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          {currentIndex > 0 && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
            >
              <MaterialCommunityIcons name="arrow-left" size={24} color="#999" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.nextButton,
              { backgroundColor: currentSlide.iconColor },
            ]}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>
              {currentIndex === onboardingData.length - 1 ? "Get Started" : "Next"}
            </Text>
            <MaterialCommunityIcons
              name={currentIndex === onboardingData.length - 1 ? "check" : "arrow-right"}
              size={20}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFEFE',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  skipButton: {
    padding: 10,
  },
  skipText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  },
  slideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  slideContent: {
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#3D3D3D',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomSection: {
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    gap: 8,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  backButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
});
