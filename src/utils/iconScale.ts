import Icon from 'ol/style/Icon';

export function updateIconScale(icon: Icon, size: number) {
  const image = icon.getImage(1);

  if (!(image instanceof HTMLImageElement)) return;


  const update = () => {
    const width = image.naturalWidth;
    const height = image.naturalHeight;

    if (!width || !height) return;

    const maxSize = Math.max(width, height);

    icon.setScale(size / maxSize);

    return true;
  }

  if (update()) return;

  image.onload = update;
}
