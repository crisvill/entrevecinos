export interface Community {
  id: string;
  name: string;
  municipality_id: string;
  estrato?: number | null;
}
export const ORIGINAL_COMMUNITY_ID = '00000000-0000-4000-8000-000000000001';
export const demoCommunities: Community[] = [
  {
    id: ORIGINAL_COMMUNITY_ID,
    name: 'Prato de la Toscana',
    municipality_id: '93',
  },
  {
    id: '00000000-0000-4000-8000-000000000002',
    name: 'Urbanización de ejemplo',
    municipality_id: '93',
  },
];
export function communityName(
  id: string | undefined,
  communities: Community[],
): string {
  return (
    communities.find(
      (community) => community.id === (id || ORIGINAL_COMMUNITY_ID),
    )?.name || 'Urbanización no disponible'
  );
}
