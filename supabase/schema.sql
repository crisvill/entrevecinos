-- Ejecutar una vez en el SQL Editor de un proyecto nuevo de Supabase.
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  title text not null check (char_length(trim(title)) between 1 and 90),
  description text not null check (char_length(trim(description)) between 1 and 2000),
  category text not null check (category in ('Hogar y decoración','Comida y antojos','Moda y accesorios','Servicios','Parqueaderos','Tecnología','Otros')),
  price bigint not null check (price between 0 and 1000000000),
  kind text not null check (kind in ('Venta','Alquiler','Servicio')),
  condition text not null check (condition in ('Nuevo','Como nuevo','Usado','No aplica')),
  building text not null check (building in ('Torre 1','Torre 2','Torre 3')),
  image text not null default '/images/community.jpg' check (char_length(image) <= 2048),
  seller text not null check (char_length(seller) between 1 and 120),
  contact text not null check (contact ~ '^[0-9]{8,15}$'),
  created_at timestamptz not null default now()
);
create index listings_category_date_idx on public.listings(category, created_at desc);
create index listings_owner_idx on public.listings(owner_id);
alter table public.listings enable row level security;
-- Este proyecto representa una comunidad. El tablón y el contacto son públicos.
create policy "Anyone can read offers" on public.listings for select to anon, authenticated using (true);
create policy "Members create their offers" on public.listings for insert to authenticated with check (owner_id = (select auth.uid()));
create policy "Owners edit their offers" on public.listings for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "Owners delete their offers" on public.listings for delete to authenticated using (owner_id = (select auth.uid()));
grant select on public.listings to anon, authenticated;
grant insert, update, delete on public.listings to authenticated;
insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('listing-images','listing-images',true,2097152,array['image/jpeg','image/png','image/webp']);
create policy "Members upload their images" on storage.objects for insert to authenticated
with check (bucket_id = 'listing-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Owners remove their images" on storage.objects for delete to authenticated
using (bucket_id = 'listing-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
-- El bucket público permite servir imágenes sin sesiones. No se necesita service_role en el cliente.
