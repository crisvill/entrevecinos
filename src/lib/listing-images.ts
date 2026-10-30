import type { Listing } from './market';
export const MAX_LISTING_IMAGES = 5;
export const DEFAULT_LISTING_IMAGE = '/images/community.jpg';
export function listingImages(
  listing?: Pick<Listing, 'image' | 'images'>,
): string[] {
  if (Array.isArray(listing?.images) && listing.images.length)
    return listing.images
      .filter((image) => typeof image === 'string' && Boolean(image))
      .slice(0, MAX_LISTING_IMAGES);
  return listing?.image && listing.image !== DEFAULT_LISTING_IMAGE
    ? [listing.image]
    : [];
}
export function imageUrl(url: string): string {
  return /^(\/images\/[a-z-]+\.jpg|data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+|https:\/\/[^\s]+|blob:[^\s]+)$/.test(
    url,
  )
    ? url
    : DEFAULT_LISTING_IMAGE;
}
