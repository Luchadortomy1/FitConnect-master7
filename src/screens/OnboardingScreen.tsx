import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components';
import { Typography, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const onboardingSlides: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Track Your Progress',
    description: 'Monitor your daily nutrition, calories, and macros with our intuitive dashboard.',
    icon: 'analytics',
    color: '#00D4AA',
  },
  {
    id: '2',
    title: 'Personalized Workouts',
    description: 'Get custom workout routines based on your fitness goals and experience level.',
    icon: 'fitness',
    color: '#4ECDC4',
  },
  {
    id: '3',
    title: 'Find Nearby Gyms',
    description: 'Discover gyms and fitness centers near you with ratings and amenities.',
    icon: 'location',
    color: '#FF6B6B',
  },
  {
    id: '4',
    title: 'Supplement Store',
    description: 'Shop for high-quality supplements to support your fitness journey.',
    icon: 'nutrition',
    color: '#4ECDC4',
  },
];

const OnboardingScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleNext = () => {
    if (currentSlide < onboardingSlides.length - 1) {
      const nextSlide = currentSlide + 1;
      setCurrentSlide(nextSlide);
      scrollViewRef.current?.scrollTo({
        x: nextSlide * width,
        animated: true,
      });
    }
  };

  const handleGetStarted = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      // Navigate to Auth screen
      navigation.navigate('Auth' as never);
    });
  };

  const handleScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentSlide(slideIndex);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    slideContainer: {
      width,
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: Spacing.xl,
    },
    iconContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.xxl,
    },
    title: {
      ...Typography.h2,
      color: colors.text,
      textAlign: 'center',
      marginBottom: Spacing.md,
    },
    description: {
      ...Typography.body1,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      paddingHorizontal: Spacing.md,
    },
    bottomContainer: {
      padding: Spacing.lg,
      paddingBottom: 50,
    },
    pagination: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: Spacing.xl,
    },
    paginationDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginHorizontal: 4,
    },
    activeDot: {
      backgroundColor: colors.primary,
      width: 24,
    },
    inactiveDot: {
      backgroundColor: colors.border,
    },
    navigationContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    skipButton: {
      padding: Spacing.md,
    },
    skipText: {
      ...Typography.button,
      color: colors.textSecondary,
    },
    nextButton: {
      minWidth: 120,
    },
  });

  const renderSlide = (slide: OnboardingSlide, index: number) => (
    <View key={slide.id} style={styles.slideContainer}>
      <View style={[styles.iconContainer, { backgroundColor: slide.color + '20' }]}>
        <Ionicons name={slide.icon} size={60} color={slide.color} />
      </View>
      
      <Text style={styles.title}>{slide.title}</Text>
      <Text style={styles.description}>{slide.description}</Text>
    </View>
  );

  const isLastSlide = currentSlide === onboardingSlides.length - 1;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
      >
        {onboardingSlides.map(renderSlide)}
      </ScrollView>

      <View style={styles.bottomContainer}>
        {/* Pagination */}
        <View style={styles.pagination}>
          {onboardingSlides.map((slide, index) => (
            <View
              key={slide.id}
              style={[
                styles.paginationDot,
                index === currentSlide ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        {/* Navigation */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity 
            style={styles.skipButton}
            onPress={handleGetStarted}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>

          {isLastSlide ? (
            <Button
              title="Get Started"
              onPress={handleGetStarted}
            />
          ) : (
            <Button
              title="Next"
              onPress={handleNext}
            />
          )}
        </View>
      </View>
    </Animated.View>
  );
};

export default OnboardingScreen;