import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterListings, seeds, money, type Filters } from './market';
import { demoCommunities, ORIGINAL_COMMUNITY_ID } from './communities';
const base: Filters = {
  query: '',
  category: 'Todas',
  max: Infinity,
  kind: '',
  condition: '',
  building: '',
  sort: 'recent',
};
test('busca sin depender de tildes o mayúsculas', () => {
  assert.equal(
    filterListings(seeds, { ...base, query: 'SOFA' })[0]?.id,
    'demo-0',
  );
});
test('combina categoría, precio, estado y ubicación', () => {
  assert.deepEqual(
    filterListings(seeds, {
      ...base,
      category: 'Hogar y decoración',
      max: 100000,
      condition: 'Nuevo',
      building: 'Torre 2',
    }).map((p) => p.id),
    ['demo-3'],
  );
});
test('separa alquileres y ordena precios numéricamente', () => {
  assert.equal(filterListings(seeds, { ...base, kind: 'Alquiler' }).length, 1);
  const result = filterListings(seeds, { ...base, sort: 'low' });
  assert.equal(result[0].price, 18000);
  assert.equal(result.at(-1)?.price, 480000);
});
test('respeta el límite de precio cero y no muta las ofertas', () => {
  const original = seeds.map((p) => p.id);
  assert.equal(filterListings(seeds, { ...base, max: 0 }).length, 0);
  filterListings(seeds, { ...base, sort: 'high' });
  assert.deepEqual(
    seeds.map((p) => p.id),
    original,
  );
  assert.equal(money(0), 'Gratis');
});
test('filtra urbanizaciones y torres de forma combinada', () => {
  const community = demoCommunities[1].id;
  const matches = filterListings(seeds, {
    ...base,
    community,
    building: 'Torre 1',
  });
  assert.deepEqual(
    matches.map((p) => p.id),
    ['demo-4', 'demo-6'],
  );
  assert.equal(filterListings(seeds, { ...base, community }).length, 4);
  assert.equal(filterListings(seeds, { ...base, community: '' }).length, 8);
  assert.equal(
    filterListings(seeds, { ...base, community: 'missing' }).length,
    0,
  );
});
test('conserva ofertas demo antiguas en la comunidad original', () => {
  const legacy = { ...seeds[0], community_id: undefined };
  assert.equal(
    filterListings([legacy], { ...base, community: ORIGINAL_COMMUNITY_ID })
      .length,
    1,
  );
  assert.equal(
    filterListings([legacy], { ...base, community: demoCommunities[1].id })
      .length,
    0,
  );
});
test('filtra regiones sin incluir ofertas de ciudades sin urbanizaciones', () => {
  assert.equal(filterListings(seeds, { ...base, communityIds: [] }).length, 0);
  assert.equal(
    filterListings(seeds, { ...base, communityIds: [ORIGINAL_COMMUNITY_ID] })
      .length,
    4,
  );
});
