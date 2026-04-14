-- Adds optional lifecycle fields for gym subscriptions.
-- Run this in Supabase SQL editor before using recurring billing controls in the app.

alter table if exists public.user_subscriptions
  add column if not exists auto_renew boolean not null default false,
  add column if not exists cancel_at_period_end boolean not null default false,
  add column if not exists cancellation_requested_at timestamptz null;

-- Keep existing active subscriptions in a clean default state.
update public.user_subscriptions
set
  auto_renew = coalesce(auto_renew, false),
  cancel_at_period_end = coalesce(cancel_at_period_end, false)
where status = 'active';
