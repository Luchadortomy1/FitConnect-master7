-- Create user_preferences table to store active routine
create table if not exists user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  active_routine_id text references routines(id) on delete set null,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Create RLS policies
alter table user_preferences enable row level security;

create policy "Users can view their own preferences" on user_preferences
  for select
  using (auth.uid() = user_id);

create policy "Users can update their own preferences" on user_preferences
  for update
  using (auth.uid() = user_id);

create policy "Users can insert their own preferences" on user_preferences
  for insert
  with check (auth.uid() = user_id);

-- Create an index for performance
create index idx_user_preferences_user_id on user_preferences(user_id);
