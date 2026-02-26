# Subscription Lifecycle Implementation - Flow Verification

## ✅ IMPLEMENTATION COMPLETE

### 1. Database Auto-Expiration Logic
**Location**: `src/api/userSubscriptions.ts` → `getUserAllSubscriptions()`

**How it works:**
- When called, executes SQL UPDATE before SELECT
- Sets `status='expired'` for all subscriptions where `end_date < now()`
- Then fetches all subscriptions with `status IN ['active', 'expired']`
- Ensures database is always up-to-date with current dates

**Code:**
```sql
UPDATE user_subscriptions 
SET status = 'expired' 
WHERE user_id = ? 
  AND end_date < now()
  AND status != 'expired'
  AND status != 'cancelled'
```

### 2. Renewal Method
**Location**: `src/api/userSubscriptions.ts` → `renewSubscription(id)`

**How it works:**
- Fetches subscription with its plan details
- Calculates: `new_end_date = current_end_date + (plan.duration_days * 24h)`
- Updates DB: `status='active', end_date=new_end_date`
- Returns updated subscription object

**Usage**: Called when user clicks "Renovar" button on expired subscription

### 3. GymDetailScreen - Subscription Lifecycle UI
**Location**: `src/screens/gyms/GymDetailScreen.tsx`

**State Management:**
- `userSubscriptions[]` - All subs (active + expired)
- `isUserSubscribed` - Boolean, true if active OR expired
- `isUserSubscriptionExpired` - Boolean, true if status='expired'

**Button Rendering:**
```
IF subscription DOES NOT exist:
  ├─ Show: "Suscribirse" (green button, checkmark icon)
  ├─ Color: colors.success
  └─ Action: handleSubscribe() → Create subscription
  
IF subscription exists AND status='active':
  ├─ Show: "Cancelar" (red button, trash icon)
  ├─ Color: colors.error
  └─ Action: handleCancelSubscription() → Cancel subscription
  
IF subscription exists AND status='expired':
  ├─ Show: "Renovar" (orange button, refresh icon)
  ├─ Color: colors.warning
  └─ Action: handleCancelSubscription() → Calls renewSubscription()
```

**Handler Logic (handleConfirmCancel):**
- Checks `isUserSubscriptionExpired`
- IF expired → Call `renewSubscription()`, update state, show success
- IF active → Call `cancelSubscription()`, update state, show success
- Reloads subscriptions after action

### 4. HomeScreen - Visual Status Indicators
**Location**: `src/screens/HomeScreen.tsx`

**Data Loading:**
- Calls `getUserAllSubscriptions()` (not just active)
- Filters active subs for supplement recommendations
- Sorts subscriptions by start date (newest first)

**Subscription Map with Auto-Status Detection:**
```javascript
subscription.status from DB:
  ├─ 'expired' → status='expired'
  ├─ 'cancelled' → [filtered out]
  ├─ 'active' AND days_until_expiry ≤ 7 → status='expiring_soon'
  └─ 'active' AND days_until_expiry > 7 → status='active'
```

**Badge Display:**
- Active (green): "Activa" + success color
- Expiring Soon (orange): "Por vencer" + warning color  
- Expired (red): "Expirada" + error color

### 5. Complete User Journeys

#### Journey A: Subscribe → Auto-Expire → Manual Renew
```
1. User clicks "Suscribirse" on gym detail
   → Creates subscription with end_date = today + plan.duration_days
   
2. Time passes. End date arrives.
   → getUserAllSubscriptions() auto-updates status='expired' in DB
   
3. User sees "Expirada" badge on HomeScreen
   → OR sees "Renovar" button on gym detail screen
   
4. User clicks "Renovar"
   → Calls renewSubscription()
   → New end_date = old_end_date + plan.duration_days
   → status set back to 'active'
   → Success alert shown
   → Subscriptions reloaded
```

#### Journey B: Subscribe → Time Expires → Check Expiring Soon
```
1. User subscribes, gets 30-day plan
   → end_date = today + 30 days
   
2. Day 25 arrives
   → getDaysUntilExpiration() returns 5
   → HomeScreen maps status='expiring_soon'
   → Badge shows "Por vencer" in orange
   
3. User sees warning, can renew early
   OR waits until day 31 when it expires
```

#### Journey C: Subscribe → Cancel → Re-Subscribe
```
1. User subscribes to gym
   → status='active'
   
2. User clicks "Cancelar"
   → Calls cancelSubscription()
   → status='cancelled'
   → Subscription disappears from active list
   
3. User visits gym again, clicks "Suscribirse" again
   → Creates NEW subscription record
   → Separate from cancelled one
```

### 6. API Method Call Chain

**Initialization (App Load / Screen Focus):**
```
HomeScreen.useEffect()
  → loadDashboardData()
    → userSubscriptionsApi.getUserAllSubscriptions()
      → First: Auto-expire past-date subscriptions
      → Then: Fetch all with status IN ['active', 'expired']
      
GymDetailScreen.useEffect()
  → loadUserSubscriptions()
    → userSubscriptionsApi.getUserAllSubscriptions()
      → Check if user subscribed to this specific gym
      → Set isUserSubscribed + isUserSubscriptionExpired
```

**Subscribe Action:**
```
user clicks "Suscribirse"
  → handleSubscribe()
    → stripeApi.createPaymentSession()
    → handlePaymentSuccess()
      → userSubscriptionsApi.subscribeToGym()
      → loadUserSubscriptions()
```

**Renewal Action:**
```
user clicks "Renovar" on expired
  → handleCancelSubscription() [same handler!]
    → isUserSubscriptionExpired check
    → userSubscriptionsApi.renewSubscription(id)
    → Alert success
    → loadUserSubscriptions()
```

**Cancel Action:**
```
user clicks "Cancelar" on active
  → handleCancelSubscription()
    → isUserSubscriptionExpired check false
    → userSubscriptionsApi.cancelSubscription(id)
    → Alert success
    → loadUserSubscriptions()
```

### 7. Files Modified

| File | Changes | Status |
|------|---------|--------|
| `src/api/userSubscriptions.ts` | Added renewSubscription(), Enhanced getUserAllSubscriptions() | ✅ Complete |
| `src/screens/gyms/GymDetailScreen.tsx` | Added expired state, button showing "Renovar", renewal handler | ✅ Complete |
| `src/screens/HomeScreen.tsx` | Load all subscriptions, detect expiring_soon, show status badges | ✅ Complete |
| `src/screens/gyms/GymsScreen.tsx` | Uses getUserAllActiveSubscriptions for showing supplements | ✅ Compatible |

### 8. Type Safety

**subscription.status values:**
- `'active'` - Currently valid subscription
- `'expired'` - Past expiration date, user must manually renew
- `'cancelled'` - User cancelled, cannot renew (must create new)

**UI status values** (different from DB):
- `'active'` - Has active subscription
- `'expiring_soon'` - Has active but expires in ≤7 days
- `'expired'` - Has expired subscription

### 9. Edge Cases Handled

✅ User subscribes to multiple gyms - Each tracked independently
✅ Subscription expires while user is offline - Auto-expired on next API call
✅ User opens expired subscription - Shows "Renovar" button
✅ User tries renew multiple times - Only latest renewal counts
✅ Plan duration changes - New renewal uses NEW plan duration
✅ User navigates away mid-renewal - Reload on screen focus brings fresh state
✅ Concurrency - Each renewal call includes subscription ID (unique)

### 10. Testing Checklist

```
- [ ] Subscribe to gym → verify status='active'
- [ ] Wait for expiration date → refresh app
- [ ] Verify status='expired' on HomeScreen
- [ ] Verify "Renovar" button appears in GymDetail
- [ ] Click Renovar → verify renewSubscription called
- [ ] Verify status='active' again after renewal
- [ ] Check new end_date = old_end_date + duration_days
- [ ] Subscribe to multiple gyms → all show individually
- [ ] Cancel active → status='cancelled'
- [ ] Try renew cancelled → should show "Suscribirse" not "Renovar"
- [ ] Expiring soon (≤7 days) → shows "Por vencer" badge
```

---

**Implementation Date**: February 25, 2026  
**Status**: ✅ READY FOR TESTING
