import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  listingImages,
  imageUrl,
  DEFAULT_LISTING_IMAGE,
} from './listing-images';

test('conserva fotos anteriores y permite quitar todas de forma explícita', () => {
  assert.deepEqual(listingImages({ image: '/images/sofa.jpg' }), [
    '/images/sofa.jpg',
  ]);
  assert.deepEqual(
    listingImages({ image: '/images/sofa.jpg', images: [] }),
    ['/images/sofa.jpg'],
  );
  assert.deepEqual(listingImages({ image: DEFAULT_LISTING_IMAGE, images: [] }), []);
  assert.deepEqual(listingImages({ image: DEFAULT_LISTING_IMAGE }), []);
  assert.deepEqual(listingImages(), []);
});
test('preserva orden de la galería y limita su presentación a cinco fotos', () => {
  const images = [
    '/images/bike.jpg',
    '/images/sofa.jpg',
    '/images/plant.jpg',
    '/images/bread.jpg',
    '/images/bag.jpg',
    '/images/cookies.jpg',
  ];
  assert.deepEqual(
    listingImages({ image: images[0], images }),
    images.slice(0, 5),
  );
});
test('rechaza protocolos de imagen ejecutables', () => {
  assert.equal(imageUrl('javascript:alert(1)'), DEFAULT_LISTING_IMAGE);
  assert.equal(
    imageUrl('data:text/html,<script>alert(1)</script>'),
    DEFAULT_LISTING_IMAGE,
  );
  assert.equal(imageUrl('/images/sofa.jpg'), '/images/sofa.jpg');
});
