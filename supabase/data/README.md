# Urbanizaciones de Sabaneta, Antioquia

Archivo suministrado por el usuario: `urbanizaciones_sabaneta_antioquia.csv`, recibido el 2026-10-30. La copia en esta carpeta normaliza únicamente el formato del CSV. Los campos `fuente` y `observaciones` se conservan como procedencia reportada por el archivo, sin validar externamente sus afirmaciones.

Correcciones de formato, sin inventar datos:

- Se quita el punto y coma sobrante del encabezado `observaciones;`.
- Se agregan las dos columnas vacías omitidas (`barrio` y `estrato`) en la fila de Conjunto Residencial Livorno de la Toscana. Su ciudad y departamento se reconocen como Sabaneta y Antioquia.
- Se corrige el entrecomillado exterior de las últimas 20 filas para separar correctamente nombre, estrato, ciudad, departamento, fuente y observaciones.

La copia conserva las **109 filas**, con 18 estratos informados (4 de estrato 3, 12 de estrato 4 y 2 de estrato 5) y 91 vacíos. La migración `20261030233000_sabaneta_communities_estrato.sql` carga **107 urbanizaciones**: reconoce como equivalentes las dos entradas de Rincón de la Doctora y las dos de Monte Carmelo. Se conserva la primera denominación del CSV al crear registros; Rincón de la Doctora toma el estrato 4 reportado en su segunda entrada. Los nombres vacíos de estrato no permiten inferir un valor.

Al buscar coincidencias en Sabaneta se ignoran mayúsculas, tildes, espacios repetidos y los prefijos Urbanización, Unidad Residencial, Conjunto Residencial y Edificio. Esto permite actualizar la urbanización existente Prato de la Toscana sin cambiar su ID ni crear otro registro por el prefijo del CSV. Si existen varias coincidencias ya registradas para un nombre normalizado, la migración aborta de forma transaccional; no consolida ni elimina registros automáticamente.

Solo se importan nombre y estrato en `communities`; el municipio se busca por Colombia / Antioquia / Sabaneta, sin asumir un ID fijo. Barrio, sector, fuentes y observaciones permanecen en este archivo como referencia. Los valores de estrato del CSV actualizan los existentes; los vacíos conservan cualquier estrato que ya hubiera registrado el administrador. No se modifican urbanizaciones de otras ciudades ni se eliminan conjuntos ausentes del archivo. No se afirma que este sea un directorio completo o validado de Sabaneta.


La importación usa un único bloque `DO` con los registros embebidos como JSON. No depende de tablas temporales, funciones `pg_temp` ni de conservar la conexión entre varias sentencias del editor SQL; todos los cambios del bloque se confirman juntos o se revierten si falla.
