-- Create notifications table for FitConnect app
-- This table stores all user notifications across the application

create table if not exists notifications (
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

-- Create index on user_id for faster queries
create index if not exists notifications_user_id_idx on notifications(user_id);

-- Create index on user_id and date for sorting
create index if not exists notifications_user_id_date_idx on notifications(user_id, date desc);

-- Create index on read status
create index if not exists notifications_user_id_read_idx on notifications(user_id, read);

-- Enable Row Level Security
alter table notifications enable row level security;

-- Create RLS policy - users can only see their own notifications
create policy "Users can view their own notifications"
  on notifications for select
  using (auth.uid() = user_id);

-- Create RLS policy - users can only insert their own notifications
create policy "Users can insert their own notifications"
  on notifications for insert
  with check (auth.uid() = user_id);

-- Create RLS policy - users can only update their own notifications
create policy "Users can update their own notifications"
  on notifications for update
  using (auth.uid() = user_id);

-- Create RLS policy - users can only delete their own notifications
create policy "Users can delete their own notifications"
  on notifications for delete
  using (auth.uid() = user_id);
