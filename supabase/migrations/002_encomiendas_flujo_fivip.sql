-- FIVIP V5: flujo de Encomiendas Perú -> Venezuela.
-- Additive only: no tables or columns are dropped and no existing rows are modified.
-- Requires the tables from 001 (encomiendas, encomienda_paquetes, encomienda_eventos).

-- 1. Pre-registros -----------------------------------------------------------
create table if not exists public.encomienda_preregistros (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  codigo_env text,
  remitente_nombre text not null,
  remitente_documento text,
  remitente_telefono text,
  remitente_direccion text,
  remitente_ciudad text,
  remitente_pais text default 'Perú',
  remitente_email text,
  destinatario_nombre text not null,
  destinatario_documento text,
  destinatario_telefono text,
  destinatario_estado text,
  destinatario_ciudad text,
  agencia_zoom text,
  destinatario_observaciones text,
  cantidad_paquetes integer check (cantidad_paquetes is null or cantidad_paquetes > 0),
  contenido_declarado text,
  valor_fob numeric(12, 2) check (valor_fob >= 0),
  observaciones text,
  estado text not null default 'Pendiente' check (estado in ('Pendiente', 'Convertido', 'Anulado')),
  encomienda_id uuid references public.encomiendas (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists encomienda_preregistros_codigo_env_key
  on public.encomienda_preregistros (codigo_env) where codigo_env is not null;
create index if not exists encomienda_preregistros_user_created_idx
  on public.encomienda_preregistros (user_id, created_at desc);

-- 2. Encomiendas: extra sender/recipient data, ENV code, link to pre-registro --
alter table public.encomiendas add column if not exists codigo_env text;
alter table public.encomiendas add column if not exists preregistro_id uuid
  references public.encomienda_preregistros (id) on delete set null;
alter table public.encomiendas add column if not exists remitente_direccion text;
alter table public.encomiendas add column if not exists remitente_pais text;
alter table public.encomiendas add column if not exists remitente_email text;
alter table public.encomiendas add column if not exists destinatario_estado text;
alter table public.encomiendas add column if not exists destinatario_observaciones text;
alter table public.encomiendas add column if not exists peso_facturable_total numeric(10, 2) not null default 0;
alter table public.encomiendas add column if not exists revisado boolean not null default false;

create unique index if not exists encomiendas_codigo_env_key
  on public.encomiendas (codigo_env) where codigo_env is not null;
create index if not exists encomiendas_user_salida_idx
  on public.encomiendas (user_id, fecha_salida);

-- 3. Paquetes: billable weight per package ------------------------------------
alter table public.encomienda_paquetes add column if not exists peso_facturable numeric(10, 2);

-- 4. Contenido declarado por líneas -------------------------------------------
create table if not exists public.encomienda_contenido (
  id uuid primary key default gen_random_uuid(),
  encomienda_id uuid not null references public.encomiendas (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  linea integer not null check (linea > 0),
  descripcion text not null,
  cantidad numeric(10, 2) check (cantidad is null or cantidad >= 0),
  created_at timestamptz not null default now(),
  unique (encomienda_id, linea)
);
create index if not exists encomienda_contenido_encomienda_idx on public.encomienda_contenido (encomienda_id);

-- 5. Guías ZOOM (1 or more per shipment) --------------------------------------
create table if not exists public.encomienda_guias (
  id uuid primary key default gen_random_uuid(),
  encomienda_id uuid not null references public.encomiendas (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  numero_guia text not null,
  peso numeric(10, 2) check (peso is null or peso >= 0),
  estado text not null default 'Asignada' check (estado in (
    'Asignada', 'Despachada', 'En tránsito', 'En agencia ZOOM', 'Entregada', 'Devuelta'
  )),
  paquete_numero integer check (paquete_numero is null or paquete_numero > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (encomienda_id, numero_guia)
);
create index if not exists encomienda_guias_encomienda_idx on public.encomienda_guias (encomienda_id);
create index if not exists encomienda_guias_numero_idx on public.encomienda_guias (numero_guia);

-- 6. Row Level Security -------------------------------------------------------
alter table public.encomienda_preregistros enable row level security;
alter table public.encomienda_contenido enable row level security;
alter table public.encomienda_guias enable row level security;

drop policy if exists "encomienda_preregistros_owner_select" on public.encomienda_preregistros;
drop policy if exists "encomienda_preregistros_owner_insert" on public.encomienda_preregistros;
drop policy if exists "encomienda_preregistros_owner_update" on public.encomienda_preregistros;
drop policy if exists "encomienda_preregistros_owner_delete" on public.encomienda_preregistros;
create policy "encomienda_preregistros_owner_select" on public.encomienda_preregistros
  for select using (auth.uid() = user_id);
create policy "encomienda_preregistros_owner_insert" on public.encomienda_preregistros
  for insert with check (auth.uid() = user_id);
create policy "encomienda_preregistros_owner_update" on public.encomienda_preregistros
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "encomienda_preregistros_owner_delete" on public.encomienda_preregistros
  for delete using (auth.uid() = user_id);

-- Child rows must belong to the caller AND point to a shipment the caller owns.
do $$
declare t text;
begin
  foreach t in array array['encomienda_contenido', 'encomienda_guias'] loop
    execute format('drop policy if exists "%1$s_owner_select" on public.%1$I', t);
    execute format('drop policy if exists "%1$s_owner_insert" on public.%1$I', t);
    execute format('drop policy if exists "%1$s_owner_update" on public.%1$I', t);
    execute format('drop policy if exists "%1$s_owner_delete" on public.%1$I', t);
    execute format('create policy "%1$s_owner_select" on public.%1$I for select using (auth.uid() = user_id)', t);
    execute format(
      'create policy "%1$s_owner_insert" on public.%1$I for insert with check (
         auth.uid() = user_id and exists (
           select 1 from public.encomiendas e where e.id = encomienda_id and e.user_id = auth.uid()))', t);
    execute format(
      'create policy "%1$s_owner_update" on public.%1$I for update using (auth.uid() = user_id) with check (
         auth.uid() = user_id and exists (
           select 1 from public.encomiendas e where e.id = encomienda_id and e.user_id = auth.uid()))', t);
    execute format('create policy "%1$s_owner_delete" on public.%1$I for delete using (auth.uid() = user_id)', t);
  end loop;
end $$;
