# Notifications Persistence Setup

## Overview
Notifications are now **persisted in Supabase** for each user. This means notifications will be saved and visible even after the user closes and reopens the app.

## Changes Made

### 1. **New API File**: `src/api/notifications.ts`
- `getUserNotifications()` - Fetch all notifications for the current user
- `createNotification()` - Create and save a new notification to the database
- `markAsRead()` - Mark a notification as read in the database
- `deleteNotification()` - Delete a notification
- `notificationExists()` - Check if a notification already exists

### 2. **Updated AppContext** (`src/contexts/AppContext.tsx`)
- Changed `addNotification` to be **async** and save to database
- Changed `markNotificationAsRead` to be **async** and update database
- Added `loadNotifications()` function to manually reload notifications
- Notifications are automatically loaded when app starts
- Added `notificationsLoaded` state to track loading status

### 3. **Updated Screens**
All places where notifications are created now use `await`:
- `HomeScreen.tsx` - When checking subscription expiration
- `CartScreen.tsx` - When confirming purchase
- `GymDetailScreen.tsx` - When subscribing or renewing
- `NotificationsScreen.tsx` - Mark as read when user checks notification

### 4. **Database Table Required**
You must create a `notifications` table in Supabase with the following structure:

```sql
create table notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text not null,
  date timestamp with time zone not null,
  read boolean not null default false,
  type text not null check (type in ('workout', 'supplement', 'general', 'achievement', 'subscription', 'order')),
  data jsonb default null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

## Setup Instructions

### Option 1: Using the SQL Migration File (Recommended)
1. Open your Supabase project dashboard
2. Go to **SQL Editor** 
3. Create a new query
4. Copy the contents of `SETUP_NOTIFICATIONS_TABLE.sql`
5. Run the query
6. The table and all indexes/policies will be created automatically

### Option 2: Manual Setup
1. In Supabase SQL Editor, run the full SQL from `SETUP_NOTIFICATIONS_TABLE.sql`
2. Verify the table was created:
   ```sql
   select * from information_schema.tables where table_name = 'notifications';
   ```

## Features

✅ **Automatic Loading** - Notifications load when app starts
✅ **Persistent Storage** - All notifications saved in database
✅ **Per-User** - Each user sees only their own notifications
✅ **Read Status** - Track which notifications user has read
✅ **Data Field** - Store additional data (e.g., gym_id for navigation)
✅ **Automatic Indexing** - Optimized queries for performance
✅ **Row Level Security** - Users can only access their own notifications

## How It Works

### Adding a Notification:
```typescript
const result = await addNotification({
  title: 'Title',
  message: 'Message',
  type: 'subscription',
  date: new Date().toISOString(),
  read: false,
  data: { gym_id: '123' }
});
```

### Marking as Read:
```typescript
await markNotificationAsRead(notificationId);
```

### Loading Notifications:
```typescript
await loadNotifications();
```

## Data Structure

Each notification in the database has:
- `id` - Unique identifier (UUID)
- `user_id` - User who owns the notification
- `title` - Notification title
- `message` - Notification message
- `date` - Timestamp when notification was created
- `read` - Boolean indicating if user has read it
- `type` - One of: 'workout', 'supplement', 'general', 'achievement', 'subscription', 'order'
- `data` - JSON field for storing additional data (optional)
- `created_at` - When the record was inserted
- `updated_at` - When the record was last updated

## Testing

After setting up:

1. **Test Subscription Notification**:
   - Subscribe to a gym
   - Check that a "✅ Suscripción activa" notification appears
   - Refresh the app - notification should still be there

2. **Test Read Status**:
   - Mark a notification as read
   - Refresh the app
   - Notification should show as read (grayed out)

3. **Test Navigation**:
   - Click on a subscription notification
   - Navigate to gym detail screen
   - Notification should stay marked as read

## Performance Optimization

The table includes indexes on:
- `user_id` - For fast user-specific queries
- `user_id, date` - For sorted notification lists
- `user_id, read` - For filtering unread notifications

This ensures your queries stay fast even with many notifications.

## Troubleshooting

### Notifications not showing after app restart
- Check that the `notifications` table exists in Supabase
- Verify Row Level Security policies are enabled
- Check browser console for API errors

### Notifications not saving
- Verify user is authenticated
- Check that RLS policies allow writes
- Look at Supabase logs for database errors

### App crashes when creating notifications
- Make sure all screen files were updated with `await addNotification(...)`
- Check that `notificationsApi` is properly imported
- Verify the `data` field uses proper JSON structure
