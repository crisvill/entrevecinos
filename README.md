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

La app representa **una comunidad**. El catálogo, las fotos y los teléfonos publicados son públicos; las escrituras requieren cuenta. No verifica por sí sola que la persona resida en la comunidad. Si necesitas acceso exclusivo por invitación o múltiples comunidades, agrega membresías y restringe las políticas `SELECT` y `INSERT` antes de abrir el servicio.

No procesa pagos ni reservas. El comprador acuerda entrega y pago por WhatsApp. No incluye chat, moderación, panel administrativo ni verificación de identidad. Los alquileres se muestran por mes. Las fotos sustituidas o de publicaciones eliminadas quedan en Storage para evitar borrar recursos en uso; puedes programar una limpieza de archivos sin referencia.

## Personalización

- Marca, textos, formularios y categorías visibles: `src/pages/index.astro`.
- Colores, tipografía y adaptación móvil: `src/styles/global.css`.
- Tipos, categorías, filtros y ejemplos: `src/lib/market.ts`.
- Interacciones, sesión, persistencia y CRUD: `src/lib/app.ts`.
- Cliente de Supabase: `src/lib/supabase.ts`.
- Permisos y modelo de datos: `supabase/schema.sql`.

Al cambiar categorías, torres o tipos, actualiza tanto el formulario como los tipos y las restricciones SQL. Para cambiar moneda, edita `money()` y las etiquetas de precios. El filtro de 1.000.000 representa «sin límite», y los precios superiores siguen apareciendo al usar esa posición.

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
