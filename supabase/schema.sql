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

-- 3) Control de dispositivos activos por cuenta (máximo 2 simultáneos).
--    Cada fila es un dispositivo (identificado por un UUID generado en el
--    navegador y guardado en localStorage) que ha iniciado sesión con esa
--    cuenta. Al detectar un 3er dispositivo distinto, la app bloquea el
--    acceso hasta que el usuario cierre sesión en otro o libere espacio.
create table if not exists public.dispositivos_activos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  device_id text not null,
  primer_uso timestamptz not null default now(),
  ultimo_uso timestamptz not null default now(),
  unique (user_id, device_id)
);

alter table public.dispositivos_activos enable row level security;

create policy "Los usuarios ven sus propios dispositivos"
  on public.dispositivos_activos for select
  using (auth.uid() = user_id);

create policy "Los usuarios registran sus propios dispositivos"
  on public.dispositivos_activos for insert
  with check (auth.uid() = user_id);

create policy "Los usuarios actualizan sus propios dispositivos"
  on public.dispositivos_activos for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Los usuarios borran sus propios dispositivos"
  on public.dispositivos_activos for delete
  using (auth.uid() = user_id);

-- 4) Verificación de dispositivo en una sola llamada atómica.
--    Antes el cliente hacía hasta 3 consultas seguidas (select, y luego
--    update o count+insert) cada vez que se abría la app. Además, al ser
--    pasos separados sin bloqueo, dos pestañas nuevas podían pasar el
--    conteo casi a la vez y colarse ambas por encima del límite. Esta
--    función hace el chequeo, el conteo y el alta/actualización dentro de
--    una sola transacción, y usa un bloqueo consultivo por usuario
--    (pg_advisory_xact_lock) para serializar llamadas concurrentes de la
--    misma cuenta y cerrar esa ventana de carrera.
create or replace function public.verificar_dispositivo(
  p_device_id text,
  p_limite int default 2
)
returns table (permitido boolean, dispositivos int)
language plpgsql
security invoker
as $$
declare
  v_user_id uuid := auth.uid();
  v_ahora timestamptz := now();
  v_existe boolean;
  v_count int;
begin
  if v_user_id is null then
    raise exception 'No autenticado';
  end if;

  -- Serializa las llamadas concurrentes de este usuario (p.ej. dos
  -- pestañas abriéndose a la vez) para que el conteo de más abajo sea
  -- siempre correcto.
  perform pg_advisory_xact_lock(hashtext(v_user_id::text));

  select exists (
    select 1 from public.dispositivos_activos
    where user_id = v_user_id and device_id = p_device_id
  ) into v_existe;

  if v_existe then
    update public.dispositivos_activos
      set ultimo_uso = v_ahora
      where user_id = v_user_id and device_id = p_device_id;
    return query select true, null::int;
    return;
  end if;

  select count(*) into v_count
    from public.dispositivos_activos
    where user_id = v_user_id;

  if v_count >= p_limite then
    return query select false, v_count;
    return;
  end if;

  insert into public.dispositivos_activos (user_id, device_id, primer_uso, ultimo_uso)
    values (v_user_id, p_device_id, v_ahora, v_ahora);

  return query select true, null::int;
end;
$$;

revoke all on function public.verificar_dispositivo(text, int) from public;
grant execute on function public.verificar_dispositivo(text, int) to authenticated;

-- 5) Panel de administración: quién es admin.
--    Deliberadamente NO se usa la service_role key en el panel de admin:
--    esa clave se salta toda la seguridad (RLS incluida), y si viviera en
--    el código de una app de navegador cualquiera podría extraerla desde
--    las herramientas de desarrollador. En su lugar, esta tabla marca qué
--    cuentas son administradoras, y se usa desde políticas de RLS y desde
--    una función "security definer" para los pocos datos (el email) que
--    viven fuera del esquema public y no son accesibles por la API.
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  creado_en timestamptz not null default now()
);

alter table public.admins enable row level security;

create policy "Cada cuenta ve si ella misma es admin"
  on public.admins for select
  using (auth.uid() = user_id);

-- No hay política de insert/update/delete: dar de alta a un admin es un
-- paso manual y deliberado desde el SQL Editor o el Table Editor de
-- Supabase, nunca algo que una cuenta pueda hacerse a sí misma desde la
-- app. Para dar de alta al primer admin, ejecuta aparte:
--   insert into public.admins (user_id) values ('<uuid-de-tu-usuario>');

-- 6) Los admins pueden ver los datos de cualquier usuario en las tablas ya
--    existentes (y liberar dispositivos ajenos, por si alguien se queda
--    bloqueado). Estas políticas se SUMAN a las que ya dejaban a cada
--    usuario ver solo lo suyo: en Postgres, varias políticas permisivas
--    para la misma acción se combinan con OR, así que no hace falta tocar
--    ni una línea de las políticas que ya existían.
create policy "Los admins ven todo el historial"
  on public.historial_intentos for select
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

create policy "Los admins ven toda la configuración"
  on public.config_examen for select
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

create policy "Los admins ven todos los dispositivos"
  on public.dispositivos_activos for select
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

create policy "Los admins liberan cualquier dispositivo"
  on public.dispositivos_activos for delete
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

-- 7) Listado de usuarios para el panel de admin.
--    auth.users no se expone por la API de Supabase ni se puede proteger
--    con RLS desde el cliente, así que hace falta una función "security
--    definer": corre con los permisos de quien la creó (que sí puede leer
--    auth.users), pero la función misma comprueba que quien la llama es
--    admin antes de devolver ninguna fila.
create or replace function public.admin_listar_usuarios()
returns table (
  user_id uuid,
  email text,
  nickname text,
  creado_en timestamptz,
  ultimo_acceso timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.admins where user_id = auth.uid()) then
    raise exception 'No autorizado';
  end if;

  return query
    select u.id, u.email, (u.raw_user_meta_data->>'nickname')::text, u.created_at, u.last_sign_in_at
    from auth.users u
    order by u.created_at desc;
end;
$$;

revoke all on function public.admin_listar_usuarios() from public;
grant execute on function public.admin_listar_usuarios() to authenticated;
