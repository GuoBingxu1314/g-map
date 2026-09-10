import Icon from 'ol/style/Icon';

/**
 * 按「最长边 = size」等比缩放图标。
 *
 * 图片可能尚未加载（首次使用某个 src 时），此时 naturalWidth/Height 为 0，
 * 直接渲染会以原始尺寸显示导致「首次尺寸失控」。这里改用 OL 的 imageChange
 * 事件（与矢量渲染器同源）在加载完成后设置 scale，渲染器会在同一次重绘
 * 中采用新 scale，从而首次即正确。
 */
export function updateIconScale(icon: Icon, size: number) {
  const image = icon.getImage(1);

  if (!(image instanceof HTMLImageElement)) return;

  const apply = (): boolean => {
    const width = image.naturalWidth;
    const height = image.naturalHeight;

    if (!width || !height) return false;

    icon.setScale(size / Math.max(width, height));

    return true;
  };

  // 图片已加载（含缓存命中）：同步设置，首帧即为正确尺寸
  if (apply()) return;

  // 图片尚未加载：监听 OL 的 imageChange 事件（与渲染器同源），
  // 加载完成后在同一事件里设置 scale，随后的重绘会采用新 scale，
  // 避免「首次进入尺寸失控、再次才正常」。
  const onload = () => {
    icon.unlistenImageChange(onload);
    apply();
  };

  icon.listenImageChange(onload);
  icon.load();
}
