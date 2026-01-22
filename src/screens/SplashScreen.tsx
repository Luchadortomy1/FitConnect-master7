import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/contexts/ThemeContext';
import { Typography, Spacing } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Start animations
    Animated.sequence([
      // Logo animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      // Text slide in
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate to onboarding after animation
    const timer = setTimeout(() => {
      navigation.navigate('Onboarding' as never);
    }, 3000);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, slideAnim, navigation]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: Spacing.xxl,
    },
    logo: {
      width: 120,
      height: 120,
      backgroundColor: colors.primary,
      borderRadius: 60,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.lg,
    },
    logoText: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    appName: {
      ...Typography.h1,
      color: colors.text,
      fontWeight: '700',
      marginBottom: Spacing.sm,
    },
    tagline: {
      ...Typography.body1,
      color: colors.textSecondary,
      textAlign: 'center',
      paddingHorizontal: Spacing.lg,
    },
    loadingContainer: {
      position: 'absolute',
      bottom: 100,
      alignItems: 'center',
    },
    loadingText: {
      ...Typography.body2,
      color: colors.textSecondary,
      marginTop: Spacing.md,
    },
    loadingDots: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: Spacing.sm,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
      marginHorizontal: 3,
    },
  });

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.logo}>
          <Text style={styles.logoText}>FC</Text>
        </View>
        
        <Animated.View
          style={{
            transform: [{ translateY: slideAnim }],
            opacity: fadeAnim,
          }}
        >
          <Text style={styles.appName}>FitConnect</Text>
          <Text style={styles.tagline}>
            Your fitness journey starts here
          </Text>
        </Animated.View>
      </Animated.View>

      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your experience...</Text>
        <View style={styles.loadingDots}>
          <Animated.View 
            style={[
              styles.dot,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]} 
          />
          <Animated.View 
            style={[
              styles.dot,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]} 
          />
          <Animated.View 
            style={[
              styles.dot,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]} 
          />
        </View>
      </View>
    </View>
  );
};

export default SplashScreen;