# Entrevecinos

Marketplace de comunidad creado con **Astro 5 + TypeScript**, CSS adaptable y Supabase. Interfaz en español. Moneda inicial: COP. No necesita React ni un servidor propio: Astro genera una web estática y el navegador se conecta a Supabase, protegido por sus políticas de acceso.

## Inicio rápido

Requisitos: Node.js 22.12 o superior y npm.

```bash
npm install
npm run dev
```

Abre la dirección que indique Astro (normalmente http://localhost:4321). Sin variables de entorno, inicia en **modo demo**: ocho ofertas de ejemplo, filtros, favoritos y publicaciones locales. Usa «Ingresar → Explorar como vecino de prueba» para publicar, editar y eliminar tus ofertas. No se piden ni almacenan contraseñas en este modo. Las publicaciones se conservan en localStorage de este navegador y la sesión de prueba en sessionStorage. Los datos no se comparten con otras personas. Las ofertas de ejemplo no tienen un contacto real.

## Activar cuentas y datos compartidos

1. Crea un proyecto de Supabase en https://supabase.com.
2. Ejecuta `supabase/schema.sql` en su SQL Editor. Está pensado para un proyecto nuevo: crea la tabla, índices, políticas RLS y el bucket público `listing-images` con límite de 2 MB y tipos JPG/PNG/WebP.
3. Copia `.env.example` a `.env` y completa:
   ```dotenv
   PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
   PUBLIC_SUPABASE_ANON_KEY=TU_CLAVE_ANON_O_PUBLICABLE
   ```
   Son credenciales públicas de cliente. **Nunca uses la clave service_role**. La autorización de escritura se resuelve con RLS y el usuario autenticado.
4. En Supabase → Authentication → URL Configuration establece Site URL y añade los Redirect URLs:
   - `http://localhost:4321/` para desarrollo.
   - `https://tu-dominio/` para producción.
5. En Authentication → Providers → Email habilita acceso con email y contraseña. Se recomienda mantener la confirmación por correo; configura SMTP para envíos de producción.
6. Para Google: crea un cliente OAuth web en Google Cloud Console. Configura la pantalla de consentimiento y añade como URI de redirección autorizada `https://TU-PROYECTO.supabase.co/auth/v1/callback` (copia el callback exacto que muestra Supabase). En Supabase → Authentication → Providers → Google activa el proveedor y pega su Client ID y Client Secret. El secreto va en Supabase, nunca en el código ni en `.env` público. Si tu consentimiento está en pruebas, agrega los usuarios de prueba en Google.
7. Reinicia `npm run dev`. Ahora se habilitan Google y los formularios de registro/acceso reales, se oculta el acceso demo y el catálogo parte vacío, leyendo exclusivamente la base de datos. Las ofertas demo no se suben automáticamente.

En producción las variables `PUBLIC_*` se incorporan durante el build. Debes volver a compilar al modificarlas.

## Funcionalidades

- Búsqueda tolerante a mayúsculas y tildes; categorías; filtros combinables por precio, tipo, estado y torre; orden por fecha o precio.
- Detalle de la oferta, contacto por WhatsApp y fotos propias.
- Las fotos se orientan y recortan al centro en formato 4:3, hasta 1200 × 900 píxeles, y se comprimen en el navegador a un máximo de 300 KB antes de subirlas (también en modo demo). Acepta originales de más de 2 MB; el límite del bucket se aplica al archivo ya optimizado. WebP preferido, con el formato compatible que ofrezca el navegador como alternativa. HEIC depende del soporte del navegador; si no se puede abrir, se solicita convertir a JPG.
- Registro y acceso con email + contraseña y Google OAuth usando Supabase Auth.
- Publicar, editar y eliminar ofertas propias. RLS impide modificar las de otra cuenta.
- Favoritos persistentes **en este navegador**, disponibles también sin cuenta; no se sincronizan entre dispositivos.
- Modo demo utilizable sin servicios externos. Si el navegador agota su almacenamiento, se informa y no se guarda una publicación parcial.
- Formularios con validación, diálogos nativos, etiquetas accesibles, navegación por teclado y diseño móvil.

## Alcance

La app admite **varias urbanizaciones**. El catálogo muestra todas por defecto y permite filtrar por urbanización y torre o sector. La selección es libre: no verifica residencia ni implica membresía. El catálogo, las fotos y los teléfonos publicados son públicos; las escrituras requieren cuenta y solo el propietario puede editar o eliminar su oferta. Para acceso exclusivo por invitación se necesita implementar membresías y restringir las políticas RLS en un cambio adicional.

No procesa pagos ni reservas. El comprador acuerda entrega y pago por WhatsApp. No incluye chat, moderación, panel administrativo ni verificación de identidad. Los alquileres se muestran por mes. Las fotos sustituidas o de publicaciones eliminadas quedan en Storage para evitar borrar recursos en uso; puedes programar una limpieza de archivos sin referencia.

## Personalización

- Marca, textos, formularios y categorías visibles: `src/pages/index.astro`.
- Colores, tipografía y adaptación móvil: `src/styles/global.css`.
- Tipos, categorías, filtros y ejemplos: `src/lib/market.ts`.
- Interacciones, sesión, persistencia y CRUD: `src/lib/app.ts`.
- Cliente de Supabase: `src/lib/supabase.ts`.
- Permisos y modelo de datos: `supabase/schema.sql`.

Al cambiar categorías o tipos, actualiza tanto el formulario como los tipos y las restricciones SQL. La torre o sector es texto libre de hasta 60 caracteres. Para cambiar moneda, edita `money()` y las etiquetas de precios. El filtro de 1.000.000 representa «sin límite», y los precios superiores siguen apareciendo al usar esa posición.

## Comprobación y publicación

```bash
npm test
npm run build
npm run preview
```

`build` ejecuta la comprobación de TypeScript/Astro antes de compilar. Puedes alojar `dist/` en Netlify, Vercel, Cloudflare Pages o cualquier hosting estático. Comando de build: `npm run build`; carpeta de salida: `dist`. Configura las variables públicas en el hosting **antes de compilar** y autoriza el dominio definitivo en Supabase Auth. No subas `.env`, `node_modules` ni credenciales privadas al repositorio.

### Validación de Supabase después de configurarlo

Si no llega el correo de confirmación:

- Revisa spam y usa «Reenviar correo de confirmación» en el formulario. Espera al menos un minuto entre solicitudes. Una respuesta de registro sin error no demuestra que el mensaje se haya entregado ni que se haya creado una cuenta nueva: Supabase puede ocultar si una dirección ya está registrada.
- En el panel de Supabase revisa los registros de **Authentication** para encontrar errores de envío o límites de solicitudes. No compartas tokens ni enlaces de confirmación al reportar un error.
- El servicio de correo integrado tiene restricciones de destinatarios y límites de envío. Para registrar usuarios reales, configura **SMTP personalizado** en Authentication con un proveedor de correo, un remitente autorizado y su dominio verificado. Usa los registros del proveedor para comprobar entrega, rechazos y spam. Estas credenciales se guardan en Supabase, nunca en las variables `PUBLIC_*` de la aplicación.
- Comprueba que el proveedor Email está habilitado, que la confirmación por correo está configurada y que **Site URL** y **Redirect URLs** corresponden al dominio desde el que registras la cuenta. Después de configurar SMTP, solicita un nuevo enlace para la cuenta pendiente; no hace falta borrarla.

El archivo `.env` debe estar en la raíz del checkout, junto a `package.json`. Reinicia el servidor al cambiarlo; en un hosting estático debes volver a compilar y desplegar. La clave pública permite registrar e iniciar sesión, pero no configura el servicio de correo ni crea el esquema.

1. Registra una cuenta, confirma el email y cierra/inicia sesión.
2. Comprueba Google OAuth en un dominio autorizado.
3. Publica una oferta con foto y comprueba que aparece en otro navegador.
4. Con una segunda cuenta verifica que no se puede editar ni eliminar la oferta de la primera, incluso llamando a la API directamente (RLS).
5. Edita y elimina con la cuenta propietaria, y abre el contacto de WhatsApp.

Las pruebas incluidas cubren la combinación de filtros y la búsqueda; el flujo OAuth y la base de datos requieren un proyecto Supabase configurado y una prueba de integración con tus credenciales.

## Recursos visuales

Fotos de Unsplash descargadas en `public/images/` para que el catálogo no dependa de enlaces remotos. Consulta `public/images/CREDITS.md`. Las fuentes DM Sans y Manrope se cargan desde Google Fonts con alternativas locales del sistema; los avatares decorativos de portada son SVG locales. Iconos: Lucide (ISC).


## Colombia, urbanizaciones y actualización de un proyecto existente

La selección está limitada a Colombia y sigue este orden: departamento → ciudad/municipio → urbanización con autocompletado. Los controles se habilitan progresivamente y al cambiar departamento o ciudad se limpia la selección dependiente. El catálogo muestra todas las ofertas por defecto; puedes filtrar solo por departamento, ciudad, urbanización o combinar con torre y otros filtros. El navegador recuerda la selección geográfica; «Limpiar filtros» la borra.

Si ya ejecutaste el esquema anterior, ejecuta **solo** `supabase/migrations/20261030_communities.sql` en el SQL Editor de Supabase, **antes de desplegar esta versión**. No vuelvas a ejecutar `schema.sql` sobre una base existente. La migración es transaccional y se puede volver a ejecutar: conserva las publicaciones y asigna las que no tienen urbanización a **Prato de la Toscana, Sabaneta, Antioquia**, según confirmó el propietario. No ejecuta cambios automáticamente contra tu proyecto. Para proyectos nuevos, `supabase/schema.sql` incluye la misma estructura.

La lista de urbanizaciones es administrada en Supabase. El usuario puede buscar escribiendo, pero publicar requiere una coincidencia con una comunidad registrada de esa ciudad. No se verifica residencia ni se limita la lectura pública por comunidad. No se incluyen conjuntos no verificados ni se afirma contar con todas las urbanizaciones de Sabaneta: el catálogo inicial contiene Prato de la Toscana; la migración adicional del CSV amplía la lista según los datos suministrados (consulta la sección de importación). Para añadir otra, desde el SQL Editor:

```sql
insert into public.communities(name, municipality_id)
select 'NOMBRE VERIFICADO DE LA URBANIZACIÓN', id
from public.municipalities
where department = 'Antioquia' and name = 'Sabaneta';
```

También puedes usar Table Editor → `communities`: `municipality_id` referencia una ciudad en `municipalities`. Agrega otros conjuntos indicando su ciudad correcta y recarga la aplicación. No cambies el ID de Prato de la Toscana: sus ofertas lo referencian. La torre, bloque o sector se escribe libremente, hasta 60 caracteres. Los usuarios de la aplicación solo pueden leer los catálogos geográficos; únicamente el administrador puede modificarlos. Una ciudad o urbanización con referencias no se puede borrar sin resolver esas referencias.

El catálogo geográfico local contiene 1123 registros municipales en 33 agrupaciones departamentales (incluye Bogotá como distrito separado), obtenido de API Colombia con licencia MIT. Fuente, fecha y límites en `src/data/README.md`; sus identificadores no son códigos DIVIPOLA. No se requiere una API geográfica externa para usar la aplicación. Para actualizarlo, mantén sincronizados `src/data/colombia.json` y las filas de `public.municipalities`; conserva los IDs usados por comunidades existentes.

En modo demo, los datos anteriores sin urbanización siguen disponibles en la comunidad original. La segunda comunidad demo es ficticia y solo sirve para probar los filtros; nunca se inserta en Supabase.

## Página de detalle

Las tarjetas enlazan a `/oferta/?id=IDENTIFICADOR`, una página independiente que funciona en hosting estático sin reglas de rutas dinámicas. Obtiene la oferta por ID desde Supabase, incluso al recargar o abrir un enlace compartido. Incluye foto, precio, urbanización, torre/sector, descripción, vendedor, WhatsApp y botón para copiar enlace. Las ofertas eliminadas, enlaces inválidos y errores de conexión tienen mensajes propios.

El modal se conserva únicamente para confirmar la eliminación de una publicación. Las ofertas demo propias dependen del almacenamiento de su navegador; compartir su enlace no las copia a otros dispositivos. La página carga el contenido mediante JavaScript; las vistas previas sociales y SEO por producto requerirían renderizado de servidor o un servicio de metadatos adicional.


## Galería, edición y publicidad de ejemplo

Cada oferta admite hasta **5 fotos opcionales**. Se pueden seleccionar juntas o en varias tandas, quitar individualmente o todas, y elegir cuál será la portada. Cada foto nueva se orienta, recorta al centro en 4:3 y comprime a un máximo de 300 KB antes de subirla. La galería del detalle permite cambiar de foto con sus miniaturas. Las fotos de publicaciones antiguas se conservan.

Para una base existente, ejecuta primero `supabase/migrations/20261030_communities.sql` si aún no lo hiciste, y después `supabase/migrations/20261030_listing_images.sql`, **antes de desplegar esta versión**. La segunda migración es transaccional y repetible: agrega `listings.images`, conserva la portada anterior y limita el arreglo a 5 imágenes. Para una instalación nueva, `schema.sql` incluye ambos cambios. No vuelvas a ejecutar el esquema completo sobre una base existente.

El dueño puede editar desde «Mis publicaciones» o desde «Editar mi publicación» en el detalle. El formulario conserva los datos y las fotos, y permite reemplazarlas o retirarlas. El botón no aparece para otros usuarios; Supabase también exige que `owner_id` coincida con la sesión mediante RLS. Cambiar la URL no concede permisos de edición. Al publicar o editar, los selectores muestran únicamente departamentos y ciudades con urbanizaciones registradas; los filtros de exploración siguen mostrando todo Colombia.

Si falla la subida de una foto o el guardado, se intenta retirar únicamente los archivos nuevos de ese intento y se mantienen las selecciones para reintentar. Las fotos antiguas retiradas de una oferta siguen en Storage para evitar borrar recursos referenciados; su limpieza requiere una tarea posterior.

Los banners de `AdBanner.astro` aparecen en el catálogo y debajo del detalle, identificados como **PUBLICIDAD · EJEMPLO**. Enlazan a `/publicidad/`, que presenta los espacios disponibles. Son contenido local de demostración: no se cargan redes de anuncios, no hay cobros, formularios de contratación ni seguimiento publicitario. Para comercializarlos se deberán definir anunciantes, precios y contacto reales.

`npm test` ejecuta todos los archivos `src/lib/*.test.ts`.


## Importar urbanizaciones de Sabaneta y registrar estrato

Ejecuta `supabase/migrations/20261030233000_sabaneta_communities_estrato.sql` completo en el SQL Editor de Supabase, después de la migración de comunidades (o de `schema.sql` en una base nueva). La importación agrega 107 urbanizaciones distintas a partir de las 109 filas del archivo suministrado. Es transaccional y repetible: conserva IDs, nombres existentes, publicaciones y permisos; Prato de la Toscana se reutiliza aunque el CSV incluya el prefijo «Unidad Residencial».

`communities.estrato` es un entero opcional de **1 a 6**. Un valor `NULL` significa que no está registrado: no se usa cero ni se calcula a partir del barrio. Puedes editarlo desde Table Editor → communities. El archivo trae 18 estratos; los datos vacíos no borran los ya registrados. No se añade un formulario público para modificar este dato; el catálogo continúa siendo administrado en Supabase.

La copia normalizada del archivo y las correcciones de formato están documentadas en `supabase/data/README.md`. La migración no elimina urbanizaciones que no estén en el CSV y aborta si detecta coincidencias ambiguas existentes. No la ejecuta automáticamente la aplicación. Para comprobar el resultado:

```sql
select c.id, c.name, c.estrato
from public.communities c
join public.municipalities m on m.id = c.municipality_id
where m.country = 'CO' and m.department = 'Antioquia' and m.name = 'Sabaneta'
order by c.name;
```


Si una ejecución anterior de la importación de Sabaneta devolvió `relation "sabaneta_import_source" does not exist`, reemplaza la consulta completa por la versión actual de `20261030233000_sabaneta_communities_estrato.sql`. Ahora contiene una sola sentencia `DO ...`, sin tablas ni funciones temporales y sin `BEGIN` / `COMMIT` separados. En una consulta nueva del SQL Editor, sin texto seleccionado, ejecútala completa. Se puede repetir aunque una ejecución anterior haya dejado parte de la preparación aplicada.
