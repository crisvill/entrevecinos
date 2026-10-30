-- Ejecutar TODO este bloque en SQL Editor, después de la migración de comunidades.
-- Una sola sentencia atómica: no depende de tablas temporales, funciones
-- temporales ni de que el editor reutilice una conexión entre sentencias.
-- 109 filas del CSV -> 107 urbanizaciones. Conserva IDs, publicaciones y RLS.
do $migration$
declare
  source_data jsonb := $catalog$
[
  {"source_row": 1, "name": "Urbanización Odonata", "estrato": null},
  {"source_row": 2, "name": "Edificio Cigarras", "estrato": null},
  {"source_row": 3, "name": "Edificio Dublin", "estrato": null},
  {"source_row": 4, "name": "Unidad Residencial Paris", "estrato": null},
  {"source_row": 5, "name": "Unidad Residencial Ciudad del Bosque", "estrato": null},
  {"source_row": 6, "name": "Edificio Marat Plus", "estrato": null},
  {"source_row": 7, "name": "Urbanización Selvática", "estrato": null},
  {"source_row": 8, "name": "Ciudadela Monteflor", "estrato": null},
  {"source_row": 9, "name": "Urbanización Vegas Plaza", "estrato": null},
  {"source_row": 10, "name": "Unidad Residencial Zaban", "estrato": null},
  {"source_row": 11, "name": "Unidad Residencial Alaia Mantra", "estrato": null},
  {"source_row": 12, "name": "Edificio Amatista", "estrato": null},
  {"source_row": 13, "name": "Edificio Ángel de María 2", "estrato": null},
  {"source_row": 14, "name": "Edificio Mantis", "estrato": null},
  {"source_row": 15, "name": "Edificio Alondra", "estrato": null},
  {"source_row": 16, "name": "Urbanización Ruiseñor", "estrato": null},
  {"source_row": 17, "name": "Urbanización Messantia", "estrato": null},
  {"source_row": 18, "name": "Unidad Residencial Bonavento", "estrato": null},
  {"source_row": 19, "name": "Edificio San Basilio", "estrato": null},
  {"source_row": 20, "name": "Torres de Sacramento", "estrato": null},
  {"source_row": 21, "name": "Unidad Residencial Bangkok", "estrato": null},
  {"source_row": 22, "name": "Unidad Residencial Cantoluna", "estrato": null},
  {"source_row": 23, "name": "Edificio Colibrí", "estrato": null},
  {"source_row": 24, "name": "Edificio Lyra", "estrato": null},
  {"source_row": 25, "name": "Edificio Marat", "estrato": null},
  {"source_row": 26, "name": "Unidad Residencial Primeiro", "estrato": null},
  {"source_row": 27, "name": "Urbanización Prestige", "estrato": null},
  {"source_row": 28, "name": "Urbanización Mattiz", "estrato": null},
  {"source_row": 29, "name": "Unidad Residencial Cattleya", "estrato": null},
  {"source_row": 30, "name": "Unidad Residencial Mazzaro", "estrato": null},
  {"source_row": 31, "name": "Edificio Montana", "estrato": null},
  {"source_row": 32, "name": "Conjunto Residencial Aires del Campo", "estrato": null},
  {"source_row": 33, "name": "Urbanización Terrah", "estrato": null},
  {"source_row": 34, "name": "Urbanización Maderos del Campo", "estrato": null},
  {"source_row": 35, "name": "Unidad Residencial Aires del Bosque", "estrato": null},
  {"source_row": 36, "name": "Conjunto Residencial Maderos del Campo 3", "estrato": null},
  {"source_row": 37, "name": "Unidad Residencial Prato de la Toscana", "estrato": null},
  {"source_row": 38, "name": "Ciudadela Toscana", "estrato": null},
  {"source_row": 39, "name": "Conjunto Residencial Livorno de la Toscana", "estrato": null},
  {"source_row": 40, "name": "Urbanización Natura", "estrato": null},
  {"source_row": 41, "name": "Urbanización Aramus Style", "estrato": null},
  {"source_row": 42, "name": "Conjunto Residencial Parque del Sol", "estrato": null},
  {"source_row": 43, "name": "Conjunto Residencial Bambu", "estrato": null},
  {"source_row": 44, "name": "Urbanización Aramus", "estrato": null},
  {"source_row": 45, "name": "Urbanización Rincón de la Doctora", "estrato": null},
  {"source_row": 46, "name": "Edificio Puerta del Sol", "estrato": null},
  {"source_row": 47, "name": "Torres de Mayorca", "estrato": null},
  {"source_row": 48, "name": "Edificio Class 48", "estrato": null},
  {"source_row": 49, "name": "Edificio Virgen de Mayorca", "estrato": null},
  {"source_row": 50, "name": "Unidad Residencial Monte Carmelo", "estrato": null},
  {"source_row": 51, "name": "Edificio Portal del Carmelo", "estrato": null},
  {"source_row": 52, "name": "Unidad Residencial Ventum", "estrato": null},
  {"source_row": 53, "name": "Unidad Residencial Sabatto", "estrato": null},
  {"source_row": 54, "name": "Urbanización Canela", "estrato": null},
  {"source_row": 55, "name": "Conjunto Residencial Mostaza", "estrato": null},
  {"source_row": 56, "name": "Urbanización Amonte", "estrato": null},
  {"source_row": 57, "name": "Urbanización Brizza", "estrato": null},
  {"source_row": 58, "name": "Unidad Residencial Siempre Verde", "estrato": null},
  {"source_row": 59, "name": "Urbanización Politan", "estrato": null},
  {"source_row": 60, "name": "Unidad Residencial La Sabana", "estrato": null},
  {"source_row": 61, "name": "Urbanización Río Místico", "estrato": null},
  {"source_row": 62, "name": "Urbanización Río Secreto", "estrato": null},
  {"source_row": 63, "name": "Edificio Lavore", "estrato": null},
  {"source_row": 64, "name": "Unidad Residencial Altos de Valparaíso", "estrato": null},
  {"source_row": 65, "name": "Edificio Cyan", "estrato": null},
  {"source_row": 66, "name": "Urbanización Montecarmelo", "estrato": null},
  {"source_row": 67, "name": "Unidad Residencial Santivari", "estrato": null},
  {"source_row": 68, "name": "Edificio Momotus", "estrato": null},
  {"source_row": 69, "name": "Unidad Residencial Sinsonte", "estrato": null},
  {"source_row": 70, "name": "Urbanización Ecoh", "estrato": null},
  {"source_row": 71, "name": "Urbanización Sabana Alta", "estrato": null},
  {"source_row": 72, "name": "Urbanización Viña San Remo", "estrato": null},
  {"source_row": 73, "name": "Unidad Residencial Nido", "estrato": null},
  {"source_row": 74, "name": "Urbanización Mosaico", "estrato": null},
  {"source_row": 75, "name": "Unidad Residencial Baluarte", "estrato": null},
  {"source_row": 76, "name": "Ciudadela Monte Azul", "estrato": null},
  {"source_row": 77, "name": "Unidad Residencial Menta Ciudad del Bosque", "estrato": null},
  {"source_row": 78, "name": "Unidad Residencial Laurel", "estrato": null},
  {"source_row": 79, "name": "Unidad Residencial Cortijo de San José", "estrato": null},
  {"source_row": 80, "name": "Urbanización Central Park", "estrato": null},
  {"source_row": 81, "name": "Edificio Saltamontes", "estrato": null},
  {"source_row": 82, "name": "Urbanización Balcones de la Holanda", "estrato": null},
  {"source_row": 83, "name": "Edificio Carriquí", "estrato": null},
  {"source_row": 84, "name": "Unidad Residencial Fidelena Park", "estrato": null},
  {"source_row": 85, "name": "Urbanización Civita", "estrato": null},
  {"source_row": 86, "name": "Urbanización Villa Romera", "estrato": null},
  {"source_row": 87, "name": "Edificio Bianco", "estrato": null},
  {"source_row": 88, "name": "Urbanización Jardines de San Remo", "estrato": null},
  {"source_row": 89, "name": "Unidad Residencial Maderos del Campo 2", "estrato": null},
  {"source_row": 90, "name": "San Antonio 1 y 2", "estrato": 3},
  {"source_row": 91, "name": "Alcázar del Pomar", "estrato": 4},
  {"source_row": 92, "name": "Vegas de Guadarrama", "estrato": 4},
  {"source_row": 93, "name": "Espigas", "estrato": 5},
  {"source_row": 94, "name": "Cortijos de San José", "estrato": 4},
  {"source_row": 95, "name": "Aldea Verde", "estrato": 4},
  {"source_row": 96, "name": "Cataluña", "estrato": 4},
  {"source_row": 97, "name": "Alcázar de la Sabana", "estrato": 3},
  {"source_row": 98, "name": "Arco Iris 1 y 2", "estrato": 3},
  {"source_row": 99, "name": "Campo Amalia", "estrato": 3},
  {"source_row": 100, "name": "Jardín de los Alcázares", "estrato": 4},
  {"source_row": 101, "name": "Quintas de Guadarrama", "estrato": 4},
  {"source_row": 102, "name": "Colinas de San Remo", "estrato": 4},
  {"source_row": 103, "name": "Fidelena", "estrato": 4},
  {"source_row": 104, "name": "Poblado de Santa Lucía", "estrato": null},
  {"source_row": 105, "name": "Bosques de Berlín", "estrato": 5},
  {"source_row": 106, "name": "Rincón de la Doctora", "estrato": 4},
  {"source_row": 107, "name": "Quintas de la Loma", "estrato": 4},
  {"source_row": 108, "name": "Mirador de San Judas", "estrato": 4},
  {"source_row": 109, "name": "Monte Carmelo", "estrato": null}
]
$catalog$::jsonb;
  target_city text;
  city_count integer;
  matched_count integer;
  existing_id uuid;
  imported record;
begin
  alter table public.communities add column if not exists estrato smallint;
  alter table public.communities drop constraint if exists communities_estrato_check;
  alter table public.communities add constraint communities_estrato_check
    check (estrato between 1 and 6);
  comment on column public.communities.estrato is
    'Estrato socioeconómico reportado, de 1 a 6; NULL significa no registrado.';

  lock table public.communities in share row exclusive mode;

  select count(*), min(id) into city_count, target_city
  from public.municipalities
  where country = 'CO' and department = 'Antioquia' and name = 'Sabaneta';
  if city_count <> 1 then
    raise exception 'Se esperaba un único municipio Sabaneta, Antioquia, Colombia. Aplica primero la migración de comunidades.';
  end if;

  if exists (
    select 1 from jsonb_to_recordset(source_data) as src(source_row integer, name text, estrato smallint)
    where name is null or char_length(trim(name)) not between 1 and 120
      or estrato not between 1 and 6
  ) then
    raise exception 'El catálogo contiene un nombre o estrato inválido.';
  end if;

  if exists (
    select 1 from jsonb_to_recordset(source_data) as src(source_row integer, name text, estrato smallint)
    group by regexp_replace(regexp_replace(trim(translate(lower(src.name), 'áéíóúüñ', 'aeiouun')), '[[:space:]]+', ' ', 'g'), '^(urbanizacion|unidad residencial|conjunto residencial|edificio) ', '')
    having count(distinct estrato) > 1
  ) then
    raise exception 'El catálogo contiene estratos contradictorios para una misma urbanización.';
  end if;

  for imported in
    select
      regexp_replace(regexp_replace(trim(translate(lower(src.name), 'áéíóúüñ', 'aeiouun')), '[[:space:]]+', ' ', 'g'), '^(urbanizacion|unidad residencial|conjunto residencial|edificio) ', '') as import_key,
      (array_agg(name order by source_row))[1] as name,
      max(estrato) as estrato
    from jsonb_to_recordset(source_data) as src(source_row integer, name text, estrato smallint)
    group by regexp_replace(regexp_replace(trim(translate(lower(src.name), 'áéíóúüñ', 'aeiouun')), '[[:space:]]+', ' ', 'g'), '^(urbanizacion|unidad residencial|conjunto residencial|edificio) ', '')
    order by min(source_row)
  loop
    select count(*), (array_agg(c.id))[1] into matched_count, existing_id
    from public.communities c
    where c.municipality_id = target_city
      and regexp_replace(regexp_replace(trim(translate(lower(c.name), 'áéíóúüñ', 'aeiouun')), '[[:space:]]+', ' ', 'g'), '^(urbanizacion|unidad residencial|conjunto residencial|edificio) ', '') = imported.import_key;

    if matched_count > 1 then
      raise exception 'Hay varias urbanizaciones equivalentes a "%" en Sabaneta. Revisa sus referencias antes de consolidarlas.', imported.name;
    elsif matched_count = 1 then
      -- Un dato vacío no borra un estrato registrado por el administrador.
      update public.communities
      set estrato = coalesce(imported.estrato, estrato)
      where id = existing_id;
    else
      insert into public.communities(name, municipality_id, estrato)
      values (imported.name, target_city, imported.estrato);
    end if;
  end loop;
end;
$migration$;
