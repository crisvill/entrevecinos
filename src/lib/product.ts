import { locations } from './locations';
import {
  communityName,
  demoCommunities,
  ORIGINAL_COMMUNITY_ID,
  type Community,
} from './communities';
import { seeds, money, type Listing } from './market';
import { supabase } from './supabase';

const $ = <T extends HTMLElement = HTMLElement>(id: string) =>
  document.getElementById(id) as T;
async function initialize() {
  const id = new URLSearchParams(location.search).get('id');
  if (!id) {
    $('product-status').textContent =
      'Falta el identificador de la oferta. Vuelve al catálogo para elegir una.';
    return;
  }
  try {
    let listing: Listing | undefined;
    let communities: Community[] = demoCommunities;
    if (supabase) {
      // Fetch by ID on every visit, so direct links and reloads work without
      // relying on a previously loaded catalog or another user's local storage.
      if (
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          id,
        )
      ) {
        $('product-status').textContent = 'Esta oferta no está disponible.';
        return;
      }
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      listing = data || undefined;
      if (listing) {
        const { data: community, error: communityError } = await supabase
          .from('communities')
          .select('id, name, municipality_id')
          .eq('id', listing.community_id || ORIGINAL_COMMUNITY_ID)
          .maybeSingle();
        if (communityError) throw communityError;
        communities = community ? [community] : [];
      }
    } else {
      let saved: Listing[] = seeds;
      try {
        const parsed = JSON.parse(
          localStorage.getItem('ev-listings-v1') || 'null',
        );
        if (Array.isArray(parsed)) saved = parsed;
      } catch {
        /* Demo seeds remain available when storage is blocked. */
      }
      listing = saved.find((p) => p.id === id);
    }
    if (!listing) {
      $('product-status').textContent =
        'Esta oferta ya no está disponible o fue eliminada.';
      return;
    }
    const p = listing;
    document.title = `${p.title} · Entrevecinos`;
    $('product-title').textContent = p.title;
    $('product-category').textContent = p.category;
    $('product-price').textContent =
      `${money(p.price)}${p.kind === 'Alquiler' ? ' / mes' : ''}`;
    $('product-description').textContent = p.description;
    $('product-seller').textContent = p.seller;
    $('product-avatar').textContent = p.seller.slice(0, 1);
    const locationName = communityName(p.community_id, communities);
    const community = communities.find(
      (community) => community.id === (p.community_id || ORIGINAL_COMMUNITY_ID),
    );
    const municipality = locations.find(
      (city) => city.id === community?.municipality_id,
    );
    $('product-location').textContent = [
      locationName,
      p.building,
      municipality?.name,
      municipality?.department,
      'Colombia',
    ]
      .filter(Boolean)
      .join(' · ');
    for (const text of [p.kind, p.condition, locationName, p.building]) {
      const badge = document.createElement('span');
      badge.textContent = text;
      $('product-badges').append(badge);
    }
    const image = $<HTMLImageElement>('product-image');
    image.alt = p.title;
    image.onerror = () => {
      image.onerror = null;
      image.src = '/images/community.jpg';
    };
    image.src =
      /^(\/images\/[a-z-]+\.jpg|data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+|https:\/\/[^\s]+)$/.test(
        p.image,
      )
        ? p.image
        : '/images/community.jpg';
    if (/^\d{8,15}$/.test(p.contact)) {
      const contact = $<HTMLAnchorElement>('product-contact');
      contact.href = `https://wa.me/${p.contact}?text=${encodeURIComponent(`Hola ${p.seller}, vi tu oferta «${p.title}» en Entrevecinos y me interesa. ${location.href}`)}`;
      contact.hidden = false;
    } else $('product-demo').hidden = false;
    $('product-status').hidden = true;
    $('product').hidden = false;
    $('product-share').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(location.href);
        $('share-status').textContent = supabase
          ? 'Enlace copiado.'
          : 'Enlace copiado. Las ofertas demo propias solo existen en este navegador.';
      } catch {
        $('share-status').textContent =
          `Copia la dirección desde tu navegador: ${location.href}`;
      }
    });
  } catch {
    $('product-status').textContent =
      'No pudimos cargar la oferta. Revisa tu conexión y vuelve a cargar esta página.';
  }
}
void initialize();
