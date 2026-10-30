import {
  createIcons,
  UserRound,
  Plus,
  ArrowRight,
  HeartHandshake,
  SlidersHorizontal,
  RotateCcw,
  Sprout,
  Search,
  SearchX,
  Store,
  ArrowUpRight,
  X,
  Heart,
  MapPin,
  LogOut,
  LayoutGrid,
  House,
  CookingPot,
  Shirt,
  Sparkles,
  CarFront,
  Monitor,
  Ellipsis,
  ArrowDownRight,
} from 'lucide';
import {
  categories,
  seeds,
  filterListings,
  money,
  type Listing,
  type Filters,
  type Category,
} from './market';
import { supabase } from './supabase';
const icons = {
  UserRound,
  Plus,
  ArrowRight,
  HeartHandshake,
  SlidersHorizontal,
  RotateCcw,
  Sprout,
  Search,
  SearchX,
  Store,
  ArrowUpRight,
  X,
  Heart,
  MapPin,
  LogOut,
  LayoutGrid,
  House,
  CookingPot,
  Shirt,
  Sparkles,
  CarFront,
  Monitor,
  Ellipsis,
  ArrowDownRight,
};
const refreshIcons = () => createIcons({ icons });
const $ = <T extends HTMLElement = HTMLElement>(id: string) =>
  document.getElementById(id) as T;
const authDialog = $<HTMLDialogElement>('auth-dialog');
const publishDialog = $<HTMLDialogElement>('publish-dialog');
const detailDialog = $<HTMLDialogElement>('detail-dialog');
const publishForm = $<HTMLFormElement>('publish-form');
const authForm = $<HTMLFormElement>('auth-form');
const esc = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ]!,
  );
const safeImage = (url: string) =>
  /^(\/images\/[a-z-]+\.jpg|data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+|https:\/\/[^\s]+)$/.test(
    url,
  )
    ? esc(url)
    : '/images/community.jpg';
function read<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback;
  } catch {
    return fallback;
  }
}
let items: Listing[] = supabase ? [] : read<Listing[]>('ev-listings-v1', seeds);
if (!Array.isArray(items)) items = [...seeds];
const storedFavorites = read<string[]>('ev-favorites-v1', []);
let favorites = new Set<string>(
  Array.isArray(storedFavorites) ? storedFavorites : [],
);
let currentUser: { id: string; name: string } | null = null;
let view: 'all' | 'favorites' | 'mine' = 'all';
let category = 'Todas';
let signup = false;
let pendingPublish = false;
let toastTimer: ReturnType<typeof setTimeout>;
function toast(message: string) {
  clearTimeout(toastTimer);
  $('toast').textContent = message;
  $('toast').hidden = false;
  toastTimer = setTimeout(() => ($('toast').hidden = true), 5000);
}
function setUser(id?: string, name?: string) {
  currentUser = id ? { id, name: name || 'Vecino' } : null;
  $('login').innerHTML = currentUser
    ? `<i data-lucide="log-out"></i><span>${esc(currentUser.name)}</span>`
    : '<i data-lucide="user-round"></i><span>Ingresar</span>';
  $('login').title = currentUser ? 'Cerrar sesión' : 'Ingresar';
  render();
  if (currentUser && pendingPublish) {
    pendingPublish = false;
    authDialog.close();
    openPublish();
  }
}
function filters(): Filters {
  const value = Number($<HTMLInputElement>('price').value);
  return {
    query: $<HTMLInputElement>('search').value.trim(),
    category,
    max: value === 1000000 ? Infinity : value,
    kind: $<HTMLSelectElement>('kind').value,
    condition:
      document.querySelector<HTMLInputElement>(
        'input[name="condition"]:checked',
      )?.value || '',
    building: $<HTMLSelectElement>('building').value,
    sort: $<HTMLSelectElement>('sort').value,
  };
}
function render() {
  const base =
    view === 'favorites'
      ? items.filter((p) => favorites.has(p.id))
      : view === 'mine'
        ? items.filter((p) => p.owner_id === currentUser?.id)
        : items;
  const results = filterListings(base, filters());
  $('cards').innerHTML = results
    .map(
      (p) =>
        `<article class="listing-card"><div class="card-photo"><button class="open-detail" data-detail="${esc(p.id)}" aria-label="Ver ${esc(p.title)}"><img src="${safeImage(p.image)}" alt="${esc(p.title)}" loading="lazy"/></button><span class="card-tag">${esc(p.kind === 'Venta' ? p.condition : p.kind === 'Alquiler' ? 'En alquiler' : 'Servicio local')}</span><button class="save-button ${favorites.has(p.id) ? 'saved' : ''}" data-save="${esc(p.id)}" aria-label="${favorites.has(p.id) ? 'Quitar de' : 'Guardar en'} favoritos" aria-pressed="${favorites.has(p.id)}"><i data-lucide="heart"></i></button></div><div class="card-body"><div class="card-category">${esc(p.category)}</div><button class="card-title" data-detail="${esc(p.id)}">${esc(p.title)}</button><div class="card-price">${money(p.price)}${p.kind === 'Alquiler' ? '<small>/ mes</small>' : ''}</div><div class="card-meta"><span class="seller-avatar">${esc(p.seller.slice(0, 1))}</span><span>${esc(p.seller)}</span><span class="card-location"><i data-lucide="map-pin"></i>${esc(p.building)}</span></div></div>${p.owner_id === currentUser?.id ? `<div class="card-owner-actions"><button data-edit="${esc(p.id)}">Editar</button><button data-delete="${esc(p.id)}">Eliminar</button></div>` : ''}</article>`,
    )
    .join('');
  $('empty').hidden = results.length > 0;
  $('end-note').hidden = results.length === 0;
  $('result-count').textContent =
    `${results.length} ${results.length === 1 ? 'oferta para descubrir' : 'ofertas para descubrir'}${supabase ? '' : ' · comunidad de ejemplo'}`;
  $('view-title').innerHTML =
    view === 'all'
      ? 'Descubre lo que hay cerca <i data-lucide="arrow-down-right"></i>'
      : view === 'favorites'
        ? 'Tus pequeños tesoros <i data-lucide="heart"></i>'
        : 'Lo que tienes para ofrecer <i data-lucide="arrow-up-right"></i>';
  $('favorite-count').textContent = String(favorites.size);
  ['explore', 'favorites-nav', 'mine-nav'].forEach((id, i) =>
    $(id).classList.toggle(
      'active',
      i === (view === 'all' ? 0 : view === 'favorites' ? 1 : 2),
    ),
  );
  document.querySelectorAll<HTMLImageElement>('#cards img').forEach(
    (img) =>
      (img.onerror = () => {
        img.onerror = null;
        img.src = '/images/community.jpg';
      }),
  );
  refreshIcons();
}
function resetFilters() {
  category = 'Todas';
  $<HTMLInputElement>('search').value = '';
  $<HTMLInputElement>('price').value = '1000000';
  $<HTMLSelectElement>('kind').value = '';
  $<HTMLSelectElement>('building').value = '';
  document.querySelector<HTMLInputElement>(
    'input[name="condition"][value=""]',
  )!.checked = true;
  $('price-label').textContent = 'Sin límite';
  document
    .querySelectorAll('[data-category]')
    .forEach((b) =>
      b.classList.toggle(
        'selected',
        (b as HTMLElement).dataset.category === 'Todas',
      ),
    );
  render();
}
async function load() {
  if (!supabase) return;
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    toast(
      'No pudimos cargar las ofertas. Revisa tu conexión y la configuración de Supabase.',
    );
    return;
  }
  items = data as Listing[];
  render();
}
function openAuth() {
  $('auth-message').textContent = '';
  authDialog.showModal();
}
function openPublish(item?: Listing) {
  if (!currentUser) {
    pendingPublish = true;
    openAuth();
    return;
  }
  publishForm.reset();
  $('publish-message').textContent = '';
  $('publish-title').textContent = item
    ? 'Unos pequeños ajustes.'
    : 'Algo bueno que ofrecer.';
  (
    publishForm.querySelector('button[type="submit"]') as HTMLButtonElement
  ).textContent = item ? 'Guardar cambios' : 'Publicar oferta';
  if (item)
    for (const [key, value] of Object.entries(item)) {
      const el = publishForm.elements.namedItem(key);
      if (
        el instanceof HTMLInputElement ||
        el instanceof HTMLSelectElement ||
        el instanceof HTMLTextAreaElement
      )
        el.value = String(value);
    }
  publishDialog.showModal();
}
function showDetail(id: string) {
  const p = items.find((item) => item.id === id);
  if (!p) return;
  const contact = /^\d{8,15}$/.test(p.contact)
    ? `https://wa.me/${p.contact}?text=${encodeURIComponent(`Hola ${p.seller}, vi tu oferta «${p.title}» en Entrevecinos y me interesa.`)}`
    : '';
  $('detail-content').innerHTML =
    `<img class="detail-photo" src="${safeImage(p.image)}" alt="${esc(p.title)}"/><div class="detail-info"><div class="eyebrow">${esc(p.category)}</div><h2>${esc(p.title)}</h2><div class="card-price">${money(p.price)}${p.kind === 'Alquiler' ? '<small>/ mes</small>' : ''}</div><div class="detail-badges"><span>${esc(p.kind)}</span><span>${esc(p.condition)}</span><span>${esc(p.building)}</span></div><p>${esc(p.description)}</p><div class="seller-block"><span class="seller-avatar">${esc(p.seller.slice(0, 1))}</span><div>${esc(p.seller)}<small>Vecino de ${esc(p.building)}</small></div></div>${contact ? `<a class="button dark contact-link" href="${contact}" target="_blank" rel="noopener noreferrer">Contactar por WhatsApp <i data-lucide="arrow-up-right"></i></a>` : '<button class="button dark full" id="sample-contact">Esta es una oferta de ejemplo</button>'}<p class="detail-hint">Acuerda la entrega y el pago directamente con tu vecino.</p></div>`;
  $('sample-contact')?.addEventListener('click', () =>
    toast(
      'Las ofertas de ejemplo no tienen contacto. Publica una propia para probar el flujo.',
    ),
  );
  detailDialog.showModal();
  refreshIcons();
}
document.querySelectorAll<HTMLDialogElement>('dialog').forEach((dialog) => {
  dialog
    .querySelector('[data-close]')
    ?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) {
      const r = dialog.getBoundingClientRect();
      if (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      )
        dialog.close();
    }
  });
});
authDialog.addEventListener('close', () => {
  pendingPublish = false;
});
document
  .querySelectorAll('[data-publish]')
  .forEach((b) => b.addEventListener('click', () => openPublish()));
$('login').addEventListener('click', async () => {
  if (!currentUser) return openAuth();
  if (supabase) {
    const { error } = await supabase.auth.signOut();
    if (error) return toast(error.message);
  } else {
    try {
      sessionStorage.removeItem('ev-demo');
    } catch {}
  }
  setUser();
  if (view === 'mine') {
    view = 'all';
    render();
  }
  toast('Sesión cerrada. ¡Nos vemos por aquí!');
});
$('explore').addEventListener('click', () => {
  view = 'all';
  resetFilters();
});
$('favorites-nav').addEventListener('click', () => {
  view = 'favorites';
  resetFilters();
  $('market').scrollIntoView({ behavior: 'smooth' });
});
$('mine-nav').addEventListener('click', () => {
  if (!currentUser) return openAuth();
  view = 'mine';
  resetFilters();
  $('market').scrollIntoView({ behavior: 'smooth' });
});
$('toggle-filters').addEventListener('click', () => {
  const open = $('filter-panel').classList.toggle('shown');
  $('toggle-filters').setAttribute('aria-expanded', String(open));
});
$('toggle-filters').setAttribute('aria-expanded', 'false');
$('toggle-filters').setAttribute('aria-controls', 'filter-panel');
document.querySelectorAll<HTMLElement>('[data-category]').forEach((button) =>
  button.addEventListener('click', () => {
    category = button.dataset.category!;
    document
      .querySelectorAll('[data-category]')
      .forEach((b) => b.classList.toggle('selected', b === button));
    render();
  }),
);
$('search-form').addEventListener('submit', (e) => {
  e.preventDefault();
  render();
  $('market').scrollIntoView({ behavior: 'smooth' });
});
$('search').addEventListener('input', render);
['kind', 'building', 'sort'].forEach((id) =>
  $(id).addEventListener('change', render),
);
document
  .querySelectorAll('input[name="condition"]')
  .forEach((i) => i.addEventListener('change', render));
$('price').addEventListener('input', () => {
  const n = Number($<HTMLInputElement>('price').value);
  $('price-label').textContent = n === 1000000 ? 'Sin límite' : money(n);
  render();
});
$('clear-filters').addEventListener('click', resetFilters);
$('empty-reset').addEventListener('click', () => {
  view = 'all';
  resetFilters();
});
$('cards').addEventListener('click', async (e) => {
  const button = (e.target as HTMLElement).closest<HTMLButtonElement>('button');
  if (!button) return;
  if (button.dataset.detail) showDetail(button.dataset.detail);
  if (button.dataset.save) {
    const id = button.dataset.save;
    const next = new Set(favorites);
    next.has(id) ? next.delete(id) : next.add(id);
    try {
      localStorage.setItem('ev-favorites-v1', JSON.stringify([...next]));
      favorites = next;
      render();
    } catch {
      toast(
        'Tu navegador no permite guardar favoritos. Habilita el almacenamiento local.',
      );
    }
  }
  if (button.dataset.edit)
    openPublish(items.find((p) => p.id === button.dataset.edit));
  if (button.dataset.delete) {
    const p = items.find((p) => p.id === button.dataset.delete);
    if (!p || p.owner_id !== currentUser?.id) return;
    $('detail-content').innerHTML =
      `<div class="detail-info"><h2>¿Eliminar esta oferta?</h2><p>${esc(p.title)}</p><p>La publicación dejará de aparecer en la comunidad.</p><button class="button dark" id="confirm-delete">Sí, eliminar oferta</button> <button class="text-button" id="cancel-delete">Conservar oferta</button></div>`;
    detailDialog.showModal();
    $('cancel-delete').onclick = () => detailDialog.close();
    $('confirm-delete').onclick = async () => {
      $<HTMLButtonElement>('confirm-delete').disabled = true;
      try {
        if (supabase) {
          const { error } = await supabase
            .from('listings')
            .delete()
            .eq('id', p.id)
            .eq('owner_id', currentUser!.id);
          if (error) throw error;
        }
        const next = items.filter((item) => item.id !== p.id);
        if (!supabase)
          localStorage.setItem('ev-listings-v1', JSON.stringify(next));
        items = next;
        detailDialog.close();
        render();
        toast('Oferta eliminada.');
      } catch {
        toast('No se pudo eliminar. Inténtalo de nuevo.');
        $<HTMLButtonElement>('confirm-delete').disabled = false;
      }
    };
  }
});
$('auth-switch').addEventListener('click', () => {
  signup = !signup;
  $('name-field').hidden = !signup;
  const name = authForm.elements.namedItem('name') as HTMLInputElement;
  name.required = signup;
  (authForm.elements.namedItem('password') as HTMLInputElement).autocomplete =
    signup ? 'new-password' : 'current-password';
  $('auth-title').textContent = signup
    ? 'Tu comunidad te espera.'
    : 'Qué bueno verte por aquí.';
  $('auth-submit').textContent = signup ? 'Crear mi cuenta' : 'Ingresar';
  $('auth-switch').textContent = signup
    ? '¿Ya tienes cuenta? Ingresa'
    : '¿Eres nuevo? Crea tu cuenta';
  $('auth-message').textContent = '';
});
authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!supabase) return;
  const data = new FormData(authForm);
  const button = $<HTMLButtonElement>('auth-submit');
  button.disabled = true;
  $('auth-message').textContent = '';
  try {
    const credentials = {
      email: String(data.get('email')),
      password: String(data.get('password')),
    };
    const result = signup
      ? await supabase.auth.signUp({
          ...credentials,
          options: {
            data: { display_name: String(data.get('name')).trim() },
            emailRedirectTo: location.origin + '/',
          },
        })
      : await supabase.auth.signInWithPassword(credentials);
    if (result.error) throw result.error;
    authForm.reset();
    if (result.data.session) {
      authDialog.close();
      toast('¡Bienvenido a la comunidad!');
    } else
      $('auth-message').textContent =
        'Revisa tu correo para confirmar la cuenta. Después podrás ingresar.';
  } catch (error) {
    $('auth-message').textContent =
      error instanceof Error
        ? error.message
        : 'No pudimos iniciar sesión. Inténtalo de nuevo.';
  } finally {
    button.disabled = false;
  }
});
$('google-login').addEventListener('click', async () => {
  if (!supabase) return;
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: location.origin + '/' },
  });
  if (error) $('auth-message').textContent = error.message;
});
$('demo-login').addEventListener('click', () => {
  if (supabase) return;
  try {
    sessionStorage.setItem('ev-demo', '1');
  } catch {}
  setUser('demo-neighbor', 'Vecino de prueba');
  authDialog.close();
  toast('Sesión de prueba: tus publicaciones se guardan en este navegador.');
});
const photoData = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
publishForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentUser) return;
  const button = publishForm.querySelector<HTMLButtonElement>(
    'button[type="submit"]',
  )!;
  button.disabled = true;
  $('publish-message').textContent = '';
  let uploadedPath: string | null = null;
  try {
    const d = new FormData(publishForm);
    const id = String(d.get('id') || crypto.randomUUID());
    const old = items.find((p) => p.id === id);
    if (old && old.owner_id !== currentUser.id)
      throw new Error('Esta oferta pertenece a otro vecino.');
    let image = old?.image || '/images/community.jpg';
    const file = d.get('photo') as File;
    if (file?.size) {
      if (
        !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
        file.size > 2 * 1024 * 1024
      )
        throw new Error(
          'La foto debe ser JPG, PNG o WebP y pesar menos de 2 MB.',
        );
      if (supabase) {
        const ext = {
          'image/jpeg': 'jpg',
          'image/png': 'png',
          'image/webp': 'webp',
        }[file.type]!;
        uploadedPath = `${currentUser.id}/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage
          .from('listing-images')
          .upload(uploadedPath, file, { contentType: file.type });
        if (error) throw error;
        image = supabase.storage
          .from('listing-images')
          .getPublicUrl(uploadedPath).data.publicUrl;
      } else image = await photoData(file);
    }
    const listing: Listing = {
      id,
      owner_id: currentUser.id,
      seller: currentUser.name,
      title: String(d.get('title')).trim(),
      description: String(d.get('description')).trim(),
      category: String(d.get('category')) as Category,
      kind: String(d.get('kind')) as Listing['kind'],
      condition: String(d.get('condition')) as Listing['condition'],
      price: Number(d.get('price')),
      building: String(d.get('building')),
      contact: String(d.get('contact')).trim(),
      image,
      created_at: old?.created_at || new Date().toISOString(),
    };
    if (
      !listing.title ||
      !listing.description ||
      !categories
        .slice(1)
        .includes(listing.category as Exclude<Category, 'Todas'>) ||
      !Number.isInteger(listing.price) ||
      listing.price < 0 ||
      listing.price > 1000000000 ||
      !/^\d{8,15}$/.test(listing.contact)
    )
      throw new Error(
        'Revisa el título, la descripción, el precio y el teléfono.',
      );
    if (supabase) {
      const result = old
        ? await supabase
            .from('listings')
            .update(listing)
            .eq('id', id)
            .eq('owner_id', currentUser.id)
            .select()
            .single()
        : await supabase.from('listings').insert(listing).select().single();
      if (result.error) throw result.error;
    }
    const next = [listing, ...items.filter((p) => p.id !== id)];
    if (!supabase) {
      try {
        localStorage.setItem('ev-listings-v1', JSON.stringify(next));
      } catch {
        throw new Error(
          'No queda espacio en este navegador. Prueba una foto más pequeña o activa Supabase.',
        );
      }
    }
    items = next;
    publishDialog.close();
    view = 'mine';
    resetFilters();
    toast(
      old ? 'Cambios guardados.' : '¡Tu oferta ya forma parte de la comunidad!',
    );
  } catch (error) {
    if (supabase && uploadedPath)
      await supabase.storage.from('listing-images').remove([uploadedPath]);
    $('publish-message').textContent =
      error instanceof Error
        ? error.message
        : 'No se pudo guardar. Revisa la conexión y vuelve a intentarlo.';
  } finally {
    button.disabled = false;
  }
});
$('about-demo').addEventListener('click', () =>
  toast(
    supabase
      ? 'Un espacio para comprar, vender y apoyar a los emprendedores de tu comunidad. Precios en pesos colombianos.'
      : 'Estás en una comunidad de ejemplo. Publicaciones y favoritos se guardan en este navegador. Activa Supabase para conectar vecinos reales.',
  ),
);
async function initialize() {
  refreshIcons();
  render();
  if (supabase) {
    $('demo-label').hidden = true;
    $('demo-login').hidden = true;
    $('auth-demo-note').hidden = true;
    supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      setUser(
        user?.id,
        user?.user_metadata.display_name ||
          user?.user_metadata.full_name ||
          user?.email?.split('@')[0],
      );
    });
    const { data, error } = await supabase.auth.getSession();
    if (error) toast('No se pudo recuperar la sesión. Vuelve a ingresar.');
    const user = data.session?.user;
    setUser(
      user?.id,
      user?.user_metadata.display_name ||
        user?.user_metadata.full_name ||
        user?.email?.split('@')[0],
    );
    await load();
  } else {
    authForm.hidden = true;
    $('google-login').hidden = true;
    $('auth-switch').hidden = true;
    document.querySelector<HTMLElement>('.divider')!.hidden = true;
    $('auth-message').textContent =
      'El acceso con Google y correo estará disponible cuando conectes tu proyecto de Supabase. Puedes probar la app con una sesión de demostración.';
    try {
      if (sessionStorage.getItem('ev-demo'))
        setUser('demo-neighbor', 'Vecino de prueba');
    } catch {}
  }
}
void initialize();
