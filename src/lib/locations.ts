import locations from '../data/colombia.json';
import type { Community } from './communities';
export { locations };
export const normalizeLocation = (value: string) =>
  value
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es');
export function matchCommunity(
  name: string,
  municipality: string,
  communities: Community[],
): Community | undefined {
  return communities.find(
    (community) =>
      community.municipality_id === municipality &&
      normalizeLocation(community.name) === normalizeLocation(name),
  );
}
export class LocationPicker {
  private department: HTMLSelectElement;
  private city: HTMLSelectElement;
  private search: HTMLInputElement;
  private id: HTMLInputElement;
  private list: HTMLDataListElement;
  private hint: HTMLElement;
  private communities: Community[] = [];
  constructor(
    prefix: string,
    private required: boolean,
    private onChange: () => void,
  ) {
    const get = (suffix: string) =>
      document.getElementById(`${prefix}-${suffix}`)!;
    this.department = get('department') as HTMLSelectElement;
    this.city = get('city') as HTMLSelectElement;
    this.search = get('community') as HTMLInputElement;
    this.id = get('community-id') as HTMLInputElement;
    this.list = get('options') as HTMLDataListElement;
    this.hint = get('hint');
    for (const name of [
      ...new Set(this.availableLocations.map((city) => city.department)),
    ].sort((a, b) => a.localeCompare(b, 'es')))
      this.department.add(new Option(name, name));
    this.department.addEventListener('change', () => {
      this.updateCities();
      this.updateOptions();
      this.onChange();
    });
    this.city.addEventListener('change', () => {
      this.updateOptions();
      this.onChange();
    });
    this.search.addEventListener('input', () => {
      this.resolve();
      this.onChange();
    });
    this.updateCities();
    this.updateOptions();
  }
  setCommunities(communities: Community[]) {
    const selection = this.selection;
    this.communities = communities;
    this.department.replaceChildren(
      new Option(
        this.required
          ? 'Selecciona un departamento'
          : 'Todos los departamentos',
        '',
      ),
    );
    for (const name of [
      ...new Set(this.availableLocations.map((city) => city.department)),
    ].sort((a, b) => a.localeCompare(b, 'es')))
      this.department.add(new Option(name, name));
    this.department.disabled = this.required && !this.communities.length;
    this.restore(selection);
  }
  get selection() {
    return {
      department: this.department.value,
      municipality: this.city.value,
      community: this.id.value,
    };
  }
  get communityIds(): string[] | undefined {
    if (this.search.value && !this.id.value) return [];
    if (!this.department.value) return undefined;
    return this.communities
      .filter((community) => {
        const location = locations.find(
          (city) => city.id === community.municipality_id,
        );
        return (
          location?.department === this.department.value &&
          (!this.city.value || location.id === this.city.value)
        );
      })
      .map((community) => community.id);
  }
  restore(value: {
    department?: string;
    municipality?: string;
    community?: string;
  }) {
    this.department.value = value.department || '';
    this.updateCities();
    this.city.value = value.municipality || '';
    if (!this.city.value) this.city.value = '';
    this.updateOptions();
    const community = this.communities.find(
      (community) =>
        community.id === value.community &&
        community.municipality_id === this.city.value,
    );
    this.search.value = community?.name || '';
    this.resolve();
  }
  setCommunity(id: string) {
    const community = this.communities.find((community) => community.id === id);
    const location = locations.find(
      (city) => city.id === community?.municipality_id,
    );
    this.restore({
      department: location?.department,
      municipality: location?.id,
      community: community?.id,
    });
  }
  private get availableLocations() {
    if (!this.required) return locations;
    const ids = new Set(
      this.communities.map((community) => community.municipality_id),
    );
    return locations.filter((city) => ids.has(city.id));
  }
  private updateCities() {
    this.city.replaceChildren(
      new Option(
        this.required ? 'Selecciona una ciudad' : 'Todas las ciudades',
        '',
      ),
    );
    for (const city of this.availableLocations
      .filter((city) => city.department === this.department.value)
      .sort((a, b) => a.name.localeCompare(b.name, 'es')))
      this.city.add(new Option(city.name, city.id));
    this.city.disabled = !this.department.value;
  }
  private updateOptions() {
    this.search.value = '';
    this.id.value = '';
    this.list.replaceChildren();
    const choices = this.communities.filter(
      (community) => community.municipality_id === this.city.value,
    );
    for (const community of choices)
      this.list.append(new Option(community.name));
    this.search.disabled = !this.city.value;
    this.hint.textContent = !this.city.value
      ? 'Selecciona departamento y ciudad para buscar una urbanización.'
      : choices.length
        ? 'Escribe para buscar y elige una urbanización registrada.'
        : 'Todavía no hay urbanizaciones registradas en esta ciudad. Solicita al administrador que agregue la tuya.';
    this.resolve();
  }
  private resolve() {
    const match = matchCommunity(
      this.search.value,
      this.city.value,
      this.communities,
    );
    this.id.value = match?.id || '';
    this.search.setCustomValidity(
      (this.search.value || this.required) && !match
        ? 'Selecciona una urbanización registrada de esta ciudad.'
        : '',
    );
  }
}
