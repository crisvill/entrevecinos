import { test } from 'node:test';
import assert from 'node:assert/strict';
import { locations, matchCommunity, normalizeLocation } from './locations';
import { demoCommunities } from './communities';

test('incluye Sabaneta en Antioquia y municipios agrupados por departamento', () => {
  assert.equal(locations.find((city) => city.id === '93')?.name, 'Sabaneta');
  assert.equal(
    locations.find((city) => city.id === '93')?.department,
    'Antioquia',
  );
  assert.equal(
    new Set(locations.map((city) => city.id)).size,
    locations.length,
  );
  assert.equal(new Set(locations.map((city) => city.department)).size, 33);
});

test('autocompleta urbanizaciones ignorando tildes, espacios y mayúsculas', () => {
  assert.equal(
    matchCommunity('  PRATO DE LA TOSCANA ', '93', demoCommunities)?.id,
    demoCommunities[0].id,
  );
  assert.equal(normalizeLocation('  Urbanización '), 'urbanizacion');
});

test('rechaza urbanizaciones no registradas, coincidencias parciales y otras ciudades', () => {
  assert.equal(matchCommunity('Prato', '93', demoCommunities), undefined);
  assert.equal(
    matchCommunity('Prato de la Toscana', '12', demoCommunities),
    undefined,
  );
  assert.equal(
    matchCommunity('Conjunto no registrado', '93', demoCommunities),
    undefined,
  );
});
