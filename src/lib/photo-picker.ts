import { MAX_LISTING_IMAGES, imageUrl } from './listing-images';
export interface SelectedPhoto {
  url: string;
  file?: File;
}
export class PhotoPicker {
  entries: SelectedPhoto[] = [];
  constructor(
    private input: HTMLInputElement,
    private preview: HTMLElement,
    private status: HTMLElement,
    private clear: HTMLButtonElement,
  ) {
    input.addEventListener('change', () => {
      const files = Array.from(input.files || []);
      input.value = '';
      if (this.entries.length + files.length > MAX_LISTING_IMAGES) {
        this.status.textContent = `Puedes tener hasta ${MAX_LISTING_IMAGES} fotos. Quita alguna o selecciona menos archivos.`;
        return;
      }
      for (const file of files)
        this.entries.push({ file, url: URL.createObjectURL(file) });
      this.render();
    });
    clear.addEventListener('click', () => this.reset([]));
    preview.addEventListener('click', (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
        'button[data-photo-action]',
      );
      if (!button) return;
      const index = Number(button.dataset.index);
      if (!Number.isInteger(index) || !this.entries[index]) return;
      const [entry] = this.entries.splice(index, 1);
      if (button.dataset.photoAction === 'cover') this.entries.unshift(entry);
      else if (entry.file) URL.revokeObjectURL(entry.url);
      this.render();
    });
  }
  reset(urls: string[]) {
    for (const entry of this.entries)
      if (entry.file) URL.revokeObjectURL(entry.url);
    this.entries = urls.slice(0, MAX_LISTING_IMAGES).map((url) => ({ url }));
    this.input.value = '';
    this.render();
  }
  private render() {
    this.preview.replaceChildren();
    for (const [index, entry] of this.entries.entries()) {
      const figure = document.createElement('figure');
      const image = document.createElement('img');
      image.src = imageUrl(entry.url);
      image.alt = `Foto ${index + 1} de la oferta`;
      const caption = document.createElement('figcaption');
      caption.textContent = index === 0 ? 'Portada' : `Foto ${index + 1}`;
      figure.append(image, caption);
      for (const [action, text] of [
        ['remove', 'Quitar foto'],
        ...(index ? [['cover', 'Usar como portada']] : []),
      ]) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'text-button';
        button.dataset.photoAction = action;
        button.dataset.index = String(index);
        button.textContent = text;
        button.setAttribute('aria-label', `${text} ${index + 1}`);
        figure.append(button);
      }
      this.preview.append(figure);
    }
    this.clear.hidden = !this.entries.length;
    this.status.textContent = this.entries.length
      ? `${this.entries.length} de ${MAX_LISTING_IMAGES} fotos. La primera es la portada. Puedes agregar más, quitar o elegir otra portada.`
      : 'Sin fotos propias. Se mostrará la imagen predeterminada.';
  }
}
