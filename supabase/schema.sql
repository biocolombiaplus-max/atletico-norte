-- BIOfit Database Schema
-- Para usar con Supabase: https://supabase.com
-- Ejecuta este script en el SQL Editor de tu proyecto Supabase

-- Habilitar extensiones
create extension if not exists "uuid-ossp";

-- TABLA: perfiles de usuario
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  name text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  weight numeric(5,2),
  height numeric(5,2),
  age integer,
  goal text,
  level text default 'principiante' check (level in ('principiante', 'intermedio', 'avanzado')),
  activity_level text default 'moderate' check (activity_level in ('sedentary', 'light', 'moderate', 'active')),
  waist numeric(5,2),
  hips numeric(5,2),
  chest numeric(5,2),
  arms numeric(5,2),
  thighs numeric(5,2),
  profile_complete boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- TABLA: entrenamientos completados
create table public.workout_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  routine_id text not null,
  routine_name text not null,
  duration_minutes integer not null,
  calories_burned integer not null,
  exercises_completed integer not null,
  total_exercises integer not null,
  completed_at timestamptz default now()
);

-- TABLA: mediciones corporales
create table public.measurements (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  weight numeric(5,2) not null,
  waist numeric(5,2),
  hips numeric(5,2),
  chest numeric(5,2),
  arms numeric(5,2),
  thighs numeric(5,2),
  notes text,
  measured_at timestamptz default now()
);

-- TABLA: plan nutricional personalizado
create table public.nutrition_plans (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  recipe_id text not null,
  meal_type text not null check (meal_type in ('desayuno', 'almuerzo', 'cena', 'snack')),
  planned_date date not null,
  completed boolean default false,
  created_at timestamptz default now()
);

-- SEGURIDAD: Row Level Security
alter table public.profiles enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.measurements enable row level security;
alter table public.nutrition_plans enable row level security;

-- Políticas de seguridad
-- Cada usuaria solo puede ver y editar sus propios datos
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

create policy "Users can view own workouts" on public.workout_sessions for select using (auth.uid() = user_id);
create policy "Users can insert own workouts" on public.workout_sessions for insert with check (auth.uid() = user_id);

create policy "Users can view own measurements" on public.measurements for select using (auth.uid() = user_id);
create policy "Users can insert own measurements" on public.measurements for insert with check (auth.uid() = user_id);

create policy "Users can view own nutrition" on public.nutrition_plans for select using (auth.uid() = user_id);
create policy "Users can manage own nutrition" on public.nutrition_plans for all using (auth.uid() = user_id);

-- Admin puede ver todo
create policy "Admin can view all profiles" on public.profiles for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Función: crear perfil al registrarse
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', 'Usuario'));
  return new;
end;
$$ language plpgsql security definer;

-- Trigger: ejecutar al crear usuario
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Índices para mejor rendimiento
create index idx_workout_sessions_user_id on public.workout_sessions(user_id);
create index idx_workout_sessions_completed_at on public.workout_sessions(completed_at desc);
create index idx_measurements_user_id on public.measurements(user_id);
create index idx_measurements_measured_at on public.measurements(measured_at desc);
