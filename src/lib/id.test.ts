import { test } from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { createId } from './id';

test('genera UUID v4 cuando randomUUID no está disponible en HTTP', () => {
  const crypto = {
    getRandomValues: webcrypto.getRandomValues.bind(webcrypto),
  } as Crypto;
  const ids = Array.from({ length: 100 }, () => createId(crypto));
  for (const id of ids)
    assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  assert.equal(new Set(ids).size, ids.length);
});

test('usa randomUUID cuando está disponible', () => {
  const expected = webcrypto.randomUUID();
  assert.equal(createId({ randomUUID: () => expected } as Crypto), expected);
});

test('informa si no hay generación criptográfica disponible', () => {
  assert.throws(() => createId({} as Crypto), /HTTPS/);
});
