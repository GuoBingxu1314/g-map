import type { IconStyleOptions } from '@/styles/icon';

import CircleStyle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Icon from 'ol/style/Icon';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import { updateIconScale } from '@/utils/iconScale';
import { createIconStyle } from '@/styles/icon';

export interface PointStyleOptions {
  // 圆点颜色
  color?: string;
  // 圆点半径
  radius?: number;
  // 圆点边框颜色
  strokeColor?: string;
  // 圆点边框宽度
  strokeWidth?: number;

  // 圆点透明度
  opacity?: number;
  // 圆点 zIndex
  zIndex?: number;

  icon?: IconStyleOptions;
}

export interface ResolvedPointStyleOptions {
  color: string;
  radius: number;
  strokeColor: string;
  strokeWidth: number;
  opacity: number;
  zIndex: number;
  icon: IconStyleOptions;
}

export const DEFAULT_POINT_STYLE: ResolvedPointStyleOptions = {
  color: '#1677ff',
  radius: 6,
  strokeColor: '#ffffff',
  strokeWidth: 2,
  opacity: 1,
  zIndex: 0,
  icon: {
    src: undefined,
    size: 32,
    anchor: [0.5, 1],
    rotation: 0,
  },
};

export interface PointStyleResult {
  style: Style;
  icon?: Icon;
  circle?: CircleStyle;
  fill?: Fill;
  stroke?: Stroke;
}

/**
 * 合并 Point Style 配置
 */
export function resolvePointStyleOptions(
  options: PointStyleOptions = {},
): ResolvedPointStyleOptions {
  return {
    color: options.color ?? DEFAULT_POINT_STYLE.color,
    radius: options.radius ?? DEFAULT_POINT_STYLE.radius,
    strokeColor: options.strokeColor ?? DEFAULT_POINT_STYLE.strokeColor,
    strokeWidth: options.strokeWidth ?? DEFAULT_POINT_STYLE.strokeWidth,
    opacity: options.opacity ?? DEFAULT_POINT_STYLE.opacity,
    zIndex: options.zIndex ?? DEFAULT_POINT_STYLE.zIndex,
    icon: {
      ...DEFAULT_POINT_STYLE.icon,
      ...options.icon,
    }
  };
}

/**
 * 创建 Point Style
 */
export function createPointStyle(
  options: PointStyleOptions = {},
): PointStyleResult {
  const {
    color,
    radius,
    strokeColor,
    strokeWidth,
    opacity,
    zIndex,
    icon,
  } = resolvePointStyleOptions(options);

  // 图片
  if (icon.src) {
    const createIcon = createIconStyle({
      src: icon.src,
      anchor: icon.anchor,
      rotation: icon.rotation,
      opacity,
    });

    updateIconScale(createIcon, icon.size ?? DEFAULT_POINT_STYLE.icon.size!);

    const style = new Style({
      image: createIcon,
      zIndex,
    });

    return {
      style,
      icon: createIcon,
    };
  }

  // 圆点
  const fill = new Fill({
    color,
  });

  const stroke = new Stroke({
    color: strokeColor,
    width: strokeWidth,
  });

  const circle = new CircleStyle({
    radius,
    fill,
    stroke,
  });

  circle.setOpacity(opacity);

  const style = new Style({
    image: circle,
    zIndex,
  });

  return {
    style,
    circle,
    fill,
    stroke,
  };
}
