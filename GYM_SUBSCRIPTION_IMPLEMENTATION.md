# Gym Subscription System Implementation

## Overview
Complete gym subscription system where users can subscribe to a gym and see products filtered by their subscription.

## Components Implemented

### 1. **API Layer** (`src/api/`)

#### `src/api/userSubscriptions.ts` (NEW)
- **`getUserActiveSubscription()`**: Fetches user's active gym subscription with all related data
  - Joins: `user_subscriptions` → `subscription_plans` → `gyms`
  - Returns: `gym_id`, `gym_name`, `plan_name`, `plan_price`, `start_date`, `end_date`
  - Handles cases when user has no active subscription
  
- **`subscribeToGym(planId)`**: Subscribes user to a gym via a subscription plan
  - Creates/updates `user_subscriptions` row with calculated end_date
  - Uses `duration_days` from plan to calculate expiration
  - Returns subscription data with mapped gym info

- **`cancelSubscription(subscriptionId)`**: Marks subscription as cancelled

#### `src/api/store.ts` (MODIFIED)
- **`getSupplementsByGym(gymId)`**: New method to fetch products filtered by gym
  - Queries: `products` WHERE `gym_id=X` AND `is_active=true`
  - Falls back to mock data if error or no data
  - Maps database rows to Supplement interface

#### `src/api/gyms.ts` (MODIFIED)
- **`getGymSubscriptionPlans(gymId)`**: Fetches subscription plans available for a gym
  - Queries: `subscription_plans` WHERE `gym_id=X` AND `is_active=true`
  - Used by GymDetailScreen to show available plans

#### `src/api/index.ts` (MODIFIED)
- Exports: `routinesApi`, `userSubscriptionsApi` (newly added to centralized imports)

### 2. **Screens**

#### `src/screens/HomeScreen.tsx` (MODIFIED)
- **New Import**: `userSubscriptionsApi` from `/api`
- **New State**: `gymSubscription: GymSubscription | null`
- **New Logic**: `loadDashboardData()` now calls `userSubscriptionsApi.getUserActiveSubscription()`
- **Display**: Shows:
  - Gym name and subscription plan
  - Subscription price and expiration date
  - Days remaining until expiration
  - "No subscription" message if user not subscribed
- **Trigger**: `useFocusEffect` reloads subscription when screen is focused

#### `src/screens/store/StoreScreen.tsx` (MODIFIED)
- **New Import**: `userSubscriptionsApi` from `/api`
- **New Logic**: `loadSupplements()` now:
  1. Fetches user's active subscription
  2. If user subscribed: calls `storeApi.getSupplementsByGym(gym_id)`
  3. If not subscribed: shows all products via `storeApi.getSupplements()`
- **Trigger**: `useFocusEffect` reloads supplements when screen is focused (handles gym changes)

#### `src/screens/gyms/GymDetailScreen.tsx` (MODIFIED)
- **New Imports**: `userSubscriptionsApi` from `/api`, `Alert` from react-native
- **New State**: 
  - `subscriptionPlans: any[]` - available plans for the gym
  - `isSubscribing: boolean` - loading state during subscription
- **New Methods**:
  - `loadSubscriptionPlans()`: Fetches available plans for the gym
  - `handleSubscribe()`: Shows plan selection or directly subscribes to single plan
  - `subscribeToGym(planId)`: Calls API and handles success/error alerts
- **New UI**: 
  - Subscribe button (green) appears when plans are available
  - Shows loading state during subscription
  - Success/error alerts with navigation back on success

### 3. **Data Flow**

```
User subscribes to gym
    ↓
GymDetailScreen.subscribeToGym() calls userSubscriptionsApi.subscribeToGym(planId)
    ↓
Supabase: user_subscriptions row created with end_date = now + plan.duration_days
    ↓
HomeScreen loads and displays subscription info + gym details
    ↓
StoreScreen loads and filters products by user's gym_id
    ↓
Products shown filtered to only that gym's products
```

### 4. **Database Tables Used**

- **user_subscriptions**: user_id, plan_id, start_date, end_date, status
- **subscription_plans**: id, gym_id, name, price, duration_days, is_active
- **gyms**: id, name
- **products**: id, gym_id, name, price, image_url, is_active (gym_id field added via SQL)

### 5. **Key Features**

✅ Multi-tenant product filtering by subscribed gym
✅ Automatic subscription expiration calculation
✅ Real-time subscription status display
✅ Plan selection during subscription
✅ No subscription message with gym search link
✅ Loading states and error handling
✅ Auto-refresh on screen focus

### 6. **Testing Checklist**

- [ ] Create account and verify user exists in profiles table
- [ ] Navigate to Gyms screen
- [ ] Select a gym and see available subscription plans
- [ ] Click Subscribe button and select a plan
- [ ] Verify HomeScreen shows gym subscription details
- [ ] Navigate to Store and verify products are filtered to that gym
- [ ] Check that expiration date and days remaining are calculated correctly
- [ ] Unsubscribe and verify products revert to all/none

## Configuration

All endpoints connect to Supabase at: `https://tpruptccnvsnyqrjbags.supabase.co`

No additional configuration needed - all RLS policies have been configured.
