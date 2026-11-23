-- FIVIP V5: Encomiendas y Entretenimiento.
-- Apply in the FIVIP-V5 Supabase project (SQL editor or `supabase db push`).

create extension if not exists pgcrypto;

create table if not exists public.encomiendas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  codigo text not null unique default ('ENC-' || to_char(now(), 'YYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6))),
  remitente_nombre text not null,
  remitente_documento text,
  remitente_telefono text,
  remitente_ciudad text,
  destinatario_nombre text not null,
  destinatario_documento text,
  destinatario_telefono text,
  destinatario_ciudad text not null,
  agencia_zoom text,
  codigo_guia text,
  contenido_declarado text,
  valor_fob numeric(12, 2) check (valor_fob >= 0),
  estado text not null default 'Pre-registrada' check (estado in (
    'Pre-registrada', 'Recibida', 'En preparación', 'Despachada', 'En tránsito',
    'En aduana', 'En agencia ZOOM', 'Entregada', 'Devuelta'
  )),
  fecha_recepcion date,
  fecha_salida date,
  fecha_llegada_estimada date,
  observaciones text,
  cantidad_paquetes integer not null default 0 check (cantidad_paquetes >= 0),
  peso_fisico_total numeric(10, 2) not null default 0,
  peso_volumetrico_total numeric(10, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.encomienda_paquetes (
  id uuid primary key default gen_random_uuid(),
  encomienda_id uuid not null references public.encomiendas (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  numero integer not null check (numero > 0),
  ancho numeric(10, 2) check (ancho >= 0),
  largo numeric(10, 2) check (largo >= 0),
  alto numeric(10, 2) check (alto >= 0),
  peso_fisico numeric(10, 2) not null check (peso_fisico >= 0),
  peso_volumetrico numeric(10, 2),
  etiqueta text,
  verificado boolean not null default false,
  created_at timestamptz not null default now(),
  unique (encomienda_id, numero)
);

create table if not exists public.encomienda_eventos (
  id uuid primary key default gen_random_uuid(),
  encomienda_id uuid not null references public.encomiendas (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  evento text not null,
  estado_anterior text,
  estado_nuevo text,
  observaciones text,
  created_at timestamptz not null default now()
);

create table if not exists public.suscripciones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  cliente text not null,
  whatsapp text,
  pais text,
  producto text not null,
  tipo_plan text check (tipo_plan in ('1 dispositivo', 'Multi dispositivo')),
  estado text not null default 'Activa' check (estado in (
    'Activa', 'Por vencer', 'Vencida', 'Prueba / demo', 'Suspendida', 'Cancelada'
  )),
  fecha_inicio date,
  fecha_vencimiento date check (fecha_vencimiento is null or fecha_inicio is null or fecha_vencimiento >= fecha_inicio),
  usuario_acceso text,
  contrasena_cifrada text,
  costo numeric(12, 2) check (costo >= 0),
  precio_venta numeric(12, 2) check (precio_venta >= 0),
  ganancia numeric(12, 2) generated always as (precio_venta - costo) stored,
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists encomiendas_user_created_idx on public.encomiendas (user_id, created_at desc);
create index if not exists encomienda_paquetes_encomienda_idx on public.encomienda_paquetes (encomienda_id);
create index if not exists encomienda_eventos_encomienda_idx on public.encomienda_eventos (encomienda_id, created_at desc);
create index if not exists suscripciones_user_vencimiento_idx on public.suscripciones (user_id, fecha_vencimiento);

alter table public.encomiendas enable row level security;
alter table public.encomienda_paquetes enable row level security;
alter table public.encomienda_eventos enable row level security;
alter table public.suscripciones enable row level security;

do $$
declare t text;
begin
  foreach t in array array['encomiendas', 'encomienda_paquetes', 'encomienda_eventos', 'suscripciones'] loop
    execute format('drop policy if exists "%1$s_owner_select" on public.%1$I', t);
    execute format('drop policy if exists "%1$s_owner_insert" on public.%1$I', t);
    execute format('drop policy if exists "%1$s_owner_update" on public.%1$I', t);
    execute format('drop policy if exists "%1$s_owner_delete" on public.%1$I', t);
    execute format('create policy "%1$s_owner_select" on public.%1$I for select using (auth.uid() = user_id)', t);
    execute format('create policy "%1$s_owner_insert" on public.%1$I for insert with check (auth.uid() = user_id)', t);
    execute format('create policy "%1$s_owner_update" on public.%1$I for update using (auth.uid() = user_id) with check (auth.uid() = user_id)', t);
    execute format('create policy "%1$s_owner_delete" on public.%1$I for delete using (auth.uid() = user_id)', t);
  end loop;
end $$;
