-- FIVIP V5: catálogo de agencias ZOOM + líneas de declaración con marca y valor.
-- Additive only: no tables or columns are dropped and no existing rows are modified.
-- Requires 001 and 002.

-- 1. Catálogo de agencias ZOOM (compartido por todos los operadores) -----------
create table if not exists public.zoom_agencias (
  id uuid primary key default gen_random_uuid(),
  estado text not null,
  ciudad text not null,
  nombre_agencia text not null,
  direccion text,
  active boolean not null default true,
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists zoom_agencias_unique_key
  on public.zoom_agencias (lower(estado), lower(ciudad), lower(nombre_agencia));
create index if not exists zoom_agencias_lookup_idx
  on public.zoom_agencias (estado, ciudad) where active;

create or replace function public.zoom_agencias_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists zoom_agencias_touch_updated_at on public.zoom_agencias;
create trigger zoom_agencias_touch_updated_at
  before update on public.zoom_agencias
  for each row execute function public.zoom_agencias_touch_updated_at();

alter table public.zoom_agencias enable row level security;

-- Signed-in operators can read and maintain the catalog. There is no delete policy:
-- agencies are deactivated instead, so historical shipments keep their reference.
drop policy if exists "zoom_agencias_authenticated_select" on public.zoom_agencias;
drop policy if exists "zoom_agencias_authenticated_insert" on public.zoom_agencias;
drop policy if exists "zoom_agencias_authenticated_update" on public.zoom_agencias;
create policy "zoom_agencias_authenticated_select" on public.zoom_agencias
  for select to authenticated using (true);
create policy "zoom_agencias_authenticated_insert" on public.zoom_agencias
  for insert to authenticated with check (auth.uid() is not null);
create policy "zoom_agencias_authenticated_update" on public.zoom_agencias
  for update to authenticated using (auth.uid() is not null) with check (auth.uid() is not null);

-- 2. Referencia estructurada en pre-registros y encomiendas -------------------
-- agencia_zoom (text) se mantiene como copia del nombre al momento del registro.
alter table public.encomienda_preregistros add column if not exists agencia_zoom_id uuid
  references public.zoom_agencias (id) on delete set null;
alter table public.encomiendas add column if not exists agencia_zoom_id uuid
  references public.zoom_agencias (id) on delete set null;
alter table public.encomiendas add column if not exists agencia_zoom_direccion text;

create index if not exists encomiendas_agencia_zoom_idx on public.encomiendas (agencia_zoom_id);

-- 3. Líneas de declaración: marca y valor USD ---------------------------------
alter table public.encomienda_contenido add column if not exists marca text;
alter table public.encomienda_contenido add column if not exists valor_usd numeric(12, 2)
  check (valor_usd is null or valor_usd >= 0);
