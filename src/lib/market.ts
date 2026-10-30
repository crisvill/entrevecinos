import { ORIGINAL_COMMUNITY_ID, demoCommunities } from './communities';
export const categories = [
  'Todas',
  'Hogar y decoración',
  'Comida y antojos',
  'Moda y accesorios',
  'Servicios',
  'Parqueaderos',
  'Tecnología',
  'Otros',
] as const;
export type Category = (typeof categories)[number];
export interface Listing {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  category: Category;
  price: number;
  kind: 'Venta' | 'Alquiler' | 'Servicio';
  condition: 'Nuevo' | 'Como nuevo' | 'Usado' | 'No aplica';
  building: string;
  community_id?: string;
  image: string;
  seller: string;
  contact: string;
  created_at: string;
}
export interface Filters {
  query: string;
  category: string;
  max: number;
  kind: string;
  condition: string;
  building: string;
  community?: string;
  communityIds?: string[];
  sort: string;
}
export function filterListings(items: Listing[], f: Filters): Listing[] {
  const normalize = (s: string) =>
    s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  return items
    .filter(
      (p) =>
        normalize(`${p.title} ${p.description} ${p.category}`).includes(
          normalize(f.query),
        ) &&
        (f.category === 'Todas' || p.category === f.category) &&
        p.price <= f.max &&
        (!f.kind || p.kind === f.kind) &&
        (!f.condition || p.condition === f.condition) &&
        (!f.building || p.building === f.building) &&
        (!f.community ||
          (p.community_id || ORIGINAL_COMMUNITY_ID) === f.community) &&
        (!f.communityIds ||
          f.communityIds.includes(p.community_id || ORIGINAL_COMMUNITY_ID)),
    )
    .sort((a, b) =>
      f.sort === 'low'
        ? a.price - b.price
        : f.sort === 'high'
          ? b.price - a.price
          : b.created_at.localeCompare(a.created_at),
    );
}
export const money = (n: number) =>
  n === 0
    ? 'Gratis'
    : new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
      }).format(n);
export const seeds: Listing[] = [
  [
    'Sofá que merece otra historia',
    'Un sofá cómodo, en excelente estado. Ideal para tardes de películas. Recogida en la comunidad.',
    'Hogar y decoración',
    480000,
    'Venta',
    'Como nuevo',
    'Torre 2',
    'sofa',
    'Laura M.',
  ],
  [
    'Hechas en casa, con mucho amor',
    'Caja de seis galletas artesanales con chocolate. Horneamos por encargo. Pregunta por sabores y alérgenos.',
    'Comida y antojos',
    24000,
    'Venta',
    'Nuevo',
    'Torre 1',
    'cookies',
    'Ana P.',
  ],
  [
    'Un lugar para tu carro',
    'Parqueadero cubierto disponible en alquiler mensual. Acceso cómodo, cerca del ascensor.',
    'Parqueaderos',
    180000,
    'Alquiler',
    'No aplica',
    'Torre 3',
    'parking',
    'Carlos R.',
  ],
  [
    'Tu rincón verde empieza aquí',
    'Planta de interior sana y cuidada con cariño. Incluye consejos para cuidarla.',
    'Hogar y decoración',
    65000,
    'Venta',
    'Nuevo',
    'Torre 2',
    'plant',
    'Sofía G.',
  ],
  [
    'Pan de masa madre, recién hecho',
    'Pan artesanal de fermentación lenta. Entregas los sábados en la portería, por encargo.',
    'Comida y antojos',
    18000,
    'Venta',
    'Nuevo',
    'Torre 1',
    'bread',
    'Mateo L.',
  ],
  [
    'Bici lista para nuevos paseos',
    'Bicicleta urbana con mantenimiento reciente. Puedes verla y probarla antes de comprar.',
    'Otros',
    350000,
    'Venta',
    'Usado',
    'Torre 3',
    'bike',
    'Daniela C.',
  ],
  [
    'Más música, menos ruido',
    'Audífonos inalámbricos con estuche. Funcionan perfecto. Se entregan cargados y limpios.',
    'Tecnología',
    120000,
    'Venta',
    'Como nuevo',
    'Torre 1',
    'headphones',
    'Andrés V.',
  ],
  [
    'Mochila para el día a día',
    'Mochila azul con varios compartimentos. Perfecta para estudiar, trabajar o salir de paseo.',
    'Moda y accesorios',
    85000,
    'Venta',
    'Nuevo',
    'Torre 2',
    'bag',
    'María F.',
  ],
].map(
  (p, i) =>
    ({
      id: `demo-${i}`,
      owner_id: 'sample',
      title: p[0],
      description: p[1],
      category: p[2],
      price: p[3],
      kind: p[4],
      condition: p[5],
      building: p[6],
      community_id: i < 4 ? ORIGINAL_COMMUNITY_ID : demoCommunities[1].id,
      image: `/images/${p[7]}.jpg`,
      seller: p[8],
      contact: '',
      created_at: new Date(Date.UTC(2026, 9, 29, 12 - i)).toISOString(),
    }) as Listing,
);
