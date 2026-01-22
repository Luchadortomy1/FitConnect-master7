# FitConnect - React Native Fitness App

A comprehensive fitness application built with Expo (React Native) and TypeScript, featuring workout tracking, nutrition monitoring, supplement store, and gym finder functionality.

## 🚀 Features

- **Dark/Light Theme System** - Automatic theme switching with user preference
- **Authentication** - Mock login/signup with form validation
- **Dashboard** - Nutrition tracking, workout progress, and daily overview
- **Workouts** - Custom routines, exercise tracking, and progress monitoring
- **Supplement Store** - Browse products, shopping cart, mock Stripe integration
- **Gym Finder** - Location-based gym discovery with maps integration
- **Profile Management** - User settings, goals, and preferences
- **Responsive Design** - Optimized for both iOS and Android

## 📱 Screenshots

The app includes:
- Animated splash screen and onboarding
- Dark-themed dashboard (as shown in the provided mockup)
- Light-themed listing screens for gyms and supplements
- Comprehensive navigation with bottom tabs and stack navigators

## 🛠 Tech Stack

- **Frontend**: React Native (Expo)
- **Language**: TypeScript
- **Navigation**: React Navigation v6 (Stack + Bottom Tabs)
- **State Management**: React Context API
- **Styling**: StyleSheet with theme system
- **Maps**: React Native Maps
- **Location**: Expo Location
- **Icons**: Expo Vector Icons
- **Animations**: React Native Reanimated

## 📦 Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Expo Go app on your mobile device

### Setup Instructions

1. **Clone and navigate to the project**:
   ```bash
   cd FitConnect
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   # or
   expo start
   ```

4. **Run on device**:
   - Install Expo Go app on your phone
   - Scan the QR code from the terminal/browser
   - The app will load on your device

### Alternative Testing Methods

- **iOS Simulator**: `npm run ios` (requires Xcode)
- **Android Emulator**: `npm run android` (requires Android Studio)
- **Web Browser**: `npm run web`

## 🔧 Project Structure

```
FitConnect/
├── src/
│   ├── api/                 # Mock API services
│   │   ├── auth.ts         # Authentication endpoints
│   │   ├── workouts.ts     # Workout data and operations
│   │   ├── store.ts        # Supplement store with Stripe mock
│   │   └── gyms.ts         # Gym locations and details
│   ├── components/         # Reusable UI components
│   │   ├── Button.tsx      # Custom button component
│   │   ├── Card.tsx        # Card container with variants
│   │   ├── Input.tsx       # Form input with validation
│   │   ├── Header.tsx      # Navigation header
│   │   └── Modal.tsx       # Modal wrapper component
│   ├── contexts/           # React Context providers
│   │   ├── AuthContext.tsx # User authentication state
│   │   ├── ThemeContext.tsx# Dark/light theme management
│   │   └── AppContext.tsx  # Global app state
│   ├── navigation/         # Navigation configuration
│   │   └── index.tsx       # Route definitions and navigators
│   ├── screens/            # Screen components
│   │   ├── auth/           # Login and signup screens
│   │   ├── workouts/       # Workout-related screens
│   │   ├── store/          # Supplement store screens
│   │   ├── gyms/           # Gym finder screens
│   │   └── profile/        # User profile screens
│   ├── constants/          # App constants and theme
│   │   └── theme.ts        # Colors, typography, spacing
│   └── types/              # TypeScript type definitions
│       └── index.ts        # Shared interfaces and types
├── App.tsx                 # Main app component
├── package.json           # Dependencies and scripts
├── app.json              # Expo configuration
└── tsconfig.json         # TypeScript configuration
```

## 🎯 Mock Data Examples

### Authentication
```typescript
// Demo login credentials
Email: test@example.com
Password: password

// Mock user data is automatically created on signup
```

### Workouts
```typescript
// Sample workout data
{
  id: "1",
  name: "Push Day",
  description: "Chest, shoulders, and triceps workout",
  duration: 60,
  difficulty: "intermediate",
  exercises: [
    {
      name: "Bench Press",
      sets: [
        { reps: 8, weight: 80, restTime: 120 }
      ]
    }
  ]
}
```

### Supplements
```typescript
// Sample supplement data
{
  id: "1",
  name: "Whey Protein Isolate",
  price: 49.99,
  category: "protein",
  rating: 4.8,
  reviews: 1250
}
```

### Gyms
```typescript
// Sample gym data with coordinates
{
  id: "1",
  name: "Iron Gym",
  address: "123 Main St, Los Angeles, CA",
  latitude: 34.0522,
  longitude: -118.2437,
  rating: 4.8,
  amenities: ["Free Weights", "Cardio Equipment", "Group Classes"]
}
```

## 💳 Stripe Integration Guide

The app includes a mock Stripe integration for supplement purchases. To integrate with real Stripe:

### 1. Install Stripe SDK
```bash
npm install @stripe/stripe-react-native
```

### 2. Update Store API (`src/api/store.ts`)

Replace the mock checkout function:

```typescript
// Current mock implementation
async createCheckoutSession(items) {
  // Returns mock checkout URL
  return { 
    success: true, 
    checkoutUrl: 'https://checkout.stripe.com/pay/mock-session-id' 
  };
}

// Real Stripe implementation
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';

async createCheckoutSession(items) {
  try {
    // Call your backend to create a Stripe checkout session
    const response = await fetch('YOUR_BACKEND_URL/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });
    
    const { sessionId } = await response.json();
    
    // Redirect to Stripe checkout
    const { error } = await stripe.redirectToCheckout({ sessionId });
    
    if (error) {
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### 3. Add Stripe Provider to App.tsx
```typescript
import { StripeProvider } from '@stripe/stripe-react-native';

export default function App() {
  return (
    <StripeProvider publishableKey="pk_test_YOUR_PUBLISHABLE_KEY">
      <ThemeProvider>
        {/* Rest of your app */}
      </ThemeProvider>
    </StripeProvider>
  );
}
```

### 4. Environment Variables
Create a `.env` file:
```
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
```

## 🎨 Theme Customization

The app uses a centralized theme system. Modify `src/constants/theme.ts`:

```typescript
export const Colors = {
  light: {
    primary: '#00D4AA',     // Change primary color
    background: '#FFFFFF',   // Light background
    // ... other colors
  },
  dark: {
    primary: '#00D4AA',     // Keep consistent primary
    background: '#1A1A2E',  // Dark background (as in mockup)
    surface: '#16213E',     // Dark card color
    // ... other colors
  },
};
```

## 🗺️ Maps Configuration

For production maps functionality:

### iOS (Google Maps)
1. Get Google Maps API key
2. Add to `app.json`:
```json
{
  "expo": {
    "ios": {
      "config": {
        "googleMapsApiKey": "YOUR_IOS_API_KEY"
      }
    }
  }
}
```

### Android
1. Add to `app.json`:
```json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_ANDROID_API_KEY"
        }
      }
    }
  }
}
```

## 📍 Location Permissions

The app requests location permissions for gym finding. Permissions are configured in `app.json`:

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "This app uses location to show nearby gyms."
      }
    },
    "android": {
      "permissions": [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION"
      ]
    }
  }
}
```

## 🚀 Deployment

### Expo Application Services (EAS)
1. Install EAS CLI: `npm install -g eas-cli`
2. Configure: `eas build:configure`
3. Build: `eas build --platform all`
4. Submit: `eas submit --platform all`

### Manual Build
1. Generate app bundle: `expo export`
2. Build with `expo run:ios` or `expo run:android`

## 🐛 Troubleshooting

### Common Issues

1. **Metro bundler cache issues**:
   ```bash
   expo start --clear
   ```

2. **Module resolution errors**:
   ```bash
   npm install
   expo install --fix
   ```

3. **iOS build issues**:
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Android build issues**:
   ```bash
   expo run:android --clear
   ```

### Development Tips

- Use `expo doctor` to check for common issues
- Check Expo documentation for platform-specific requirements
- Test on both iOS and Android devices
- Use physical devices for location and camera features

## 📚 Learning Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Native Documentation](https://reactnative.dev/)
- [TypeScript with React Native](https://reactnative.dev/docs/typescript)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For questions or support:
- Create an issue in the repository
- Check the troubleshooting section above
- Review Expo and React Native documentation

---

**Note**: This is a demo application with mock data and APIs. For production use, implement real backend services, database integration, and proper authentication systems.