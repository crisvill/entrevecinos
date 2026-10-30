-- Ejecutar DESPUÉS de 20261030_communities.sql en proyectos existentes.
-- Conserva la foto anterior y los permisos de edición por propietario.
begin;
alter table public.listings add column if not exists images text[];
update public.listings
set images = case when image <> '/images/community.jpg' then array[image] else array[]::text[] end
where images is null;
alter table public.listings alter column images set default array[]::text[];
alter table public.listings alter column images set not null;
alter table public.listings drop constraint if exists listings_images_limit;
alter table public.listings add constraint listings_images_limit check (
  cardinality(images) <= 5
  and (array_ndims(images) is null or array_ndims(images) = 1)
  and array_position(images, null) is null
  and octet_length(array_to_string(images, '')) <= 10240
);
commit;
