import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterListings, seeds, money, type Filters } from './market';
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
