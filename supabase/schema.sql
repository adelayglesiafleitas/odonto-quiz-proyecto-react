-- Esquema para usuarios reales de ExamPrep.
-- Pega esto en Supabase → SQL Editor → New query → Run.
-- La autenticación (usuarios, contraseñas, sesiones) ya la maneja Supabase Auth
-- automáticamente (tabla auth.users); aquí solo creamos las tablas propias de
-- la app, todas ligadas a auth.users(id) y protegidas con Row Level Security
-- para que cada usuario solo pueda leer/escribir sus propios datos.

-- 1) Historial de intentos de examen (reemplaza la cookie examprep_historial)
create table if not exists public.historial_intentos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  curso_id text not null,
  fecha timestamptz not null default now(),
  total_preguntas int not null,
  correctas int not null,
  porcentaje numeric not null,
  aprobado boolean not null,
  capitulo text not null,
  anio int, -- null = 'todos'
  tiempo_limite_minutos int, -- null = sin límite
  tiempo_usado_seg int not null,
  agoto_tiempo boolean not null
);

create index if not exists historial_intentos_user_curso_idx
  on public.historial_intentos (user_id, curso_id, fecha desc);

alter table public.historial_intentos enable row level security;

create policy "Los usuarios ven su propio historial"
  on public.historial_intentos for select
  using (auth.uid() = user_id);

create policy "Los usuarios insertan su propio historial"
  on public.historial_intentos for insert
  with check (auth.uid() = user_id);

-- No hace falta update/delete: el historial es un registro de solo-lectura
-- una vez creado (como en el modelo de cookies anterior).

-- 2) Configuración de examen guardada por curso (reemplaza
--    examprep_config_examen_<cursoId>)
create table if not exists public.config_examen (
  user_id uuid not null references auth.users(id) on delete cascade,
  curso_id text not null,
  cantidad int not null,
  capitulo text not null,
  anio int, -- null = 'todos'
  con_tiempo boolean not null,
  duracion int not null,
  actualizado_en timestamptz not null default now(),
  primary key (user_id, curso_id)
);

alter table public.config_examen enable row level security;

create policy "Los usuarios ven su propia configuración"
  on public.config_examen for select
  using (auth.uid() = user_id);

create policy "Los usuarios insertan su propia configuración"
  on public.config_examen for insert
  with check (auth.uid() = user_id);

create policy "Los usuarios actualizan su propia configuración"
  on public.config_examen for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
