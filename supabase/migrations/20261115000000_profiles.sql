-- =====================================================================
-- Kardinal — Phase 1 : profils membres
-- =====================================================================

-- 1. Table
create table public.profiles (
  id                  uuid primary key references auth.users (id) on delete cascade,
  email               text,
  full_name           text,
  stripe_customer_id  text unique,                 -- renseigné par le webhook Stripe
  is_vip              boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

comment on column public.profiles.stripe_customer_id is 'ID client Stripe (cus_...). Écriture : service_role uniquement.';
comment on column public.profiles.is_vip is 'Accès premium. Écriture : service_role uniquement (webhooks Stripe).';

-- 2. Row Level Security
alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- 3. Privilèges colonne par colonne
-- RLS filtre les LIGNES, pas les COLONNES. Sans ce bloc, un membre pourrait
-- exécuter depuis le navigateur : update profiles set is_vip = true.
revoke all on public.profiles from anon;
revoke insert, update, delete on public.profiles from authenticated;
grant select on public.profiles to authenticated;
grant update (full_name) on public.profiles to authenticated;
-- service_role (webhooks Stripe) conserve tous les droits et contourne la RLS.

-- 4. Création automatique du profil à l'inscription
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5. updated_at automatique
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
