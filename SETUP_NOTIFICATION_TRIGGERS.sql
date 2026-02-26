-- TRIGGERS: Auto-create notifications when new gyms or products are added

-- Trigger for new gyms
-- This trigger fires when a new gym is inserted and creates a general notification
create or replace function notify_on_new_gym()
returns trigger as $$
begin
  -- Insert notification for all users when a new gym is added
  -- Note: This inserts one notification per user in the system
  insert into notifications (id, user_id, title, message, date, read, type, data)
  select
    'gym-new-' || new.id || '-' || u.id,
    u.id,
    '🏋️ Nuevo Gimnasio Disponible',
    'Se ha añadido un nuevo gimnasio: ' || new.name,
    now(),
    false,
    'general',
    jsonb_build_object('gym_id', new.id, 'gym_name', new.name)
  from auth.users u
  on conflict (id) do nothing;
  
  return new;
end;
$$ language plpgsql;

-- Create the trigger for gyms
drop trigger if exists trigger_notify_new_gym on gyms;
create trigger trigger_notify_new_gym
  after insert on gyms
  for each row
  execute function notify_on_new_gym();


-- Trigger for new products
-- This trigger fires when a new product is inserted and creates a notification
-- for users subscribed to that gym
create or replace function notify_on_new_product()
returns trigger as $$
begin
  -- Get the gym name
  with gym_info as (
    select name from gyms where id = new.gym_id
  )
  insert into notifications (id, user_id, title, message, date, read, type, data)
  select
    'product-new-' || new.id || '-' || us.user_id,
    us.user_id,
    '💪 Nuevo Suplemento en ' || g.name,
    'Se ha añadido un nuevo producto: ' || new.name || ' por $' || new.price,
    now(),
    false,
    'supplement',
    jsonb_build_object(
      'product_id', new.id,
      'product_name', new.name,
      'gym_id', new.gym_id,
      'price', new.price
    )
  from user_subscriptions us
  join subscription_plans sp on sp.id = us.plan_id
  join gyms g on g.id = sp.gym_id
  where sp.gym_id = new.gym_id
    and us.status = 'active'
  on conflict (id) do nothing;
  
  return new;
end;
$$ language plpgsql;

-- Create the trigger for products
drop trigger if exists trigger_notify_new_product on products;
create trigger trigger_notify_new_product
  after insert on products
  for each row
  execute function notify_on_new_product();
