import type Feature from 'ol/Feature';
import type Geometry from 'ol/geom/Geometry';

import Style from 'ol/style/Style';
import CircleStyle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';

import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';
import Polygon from 'ol/geom/Polygon';
import Circle from 'ol/geom/Circle';
import { updateIconScale } from '@/utils/iconScale';
import type { PointStyleOptions } from './point';
import type { LineStringStyleOptions } from './line';
import type { PolygonStyleOptions } from './polygon';
import { createIconStyle } from './icon';

/**
 * Hover 样式配置，结构与 SelectStyleOptions 对齐。
 */
export interface HoverStyleOptions {
  point?: Partial<PointStyleOptions>;

  line?: Partial<LineStringStyleOptions>;

  polygon?: Partial<PolygonStyleOptions>;
}

/**
 * Hover 默认样式：蓝色高亮，视觉上比 base（#1677ff）更亮更大、比 select（黄色）更轻。
 * 形成 base → hover → select 的清晰递进。
 */
export const DEFAULT_HOVER_STYLE: Required<HoverStyleOptions> = {
  point: {
    color: '#409eff',
    radius: 8,
    strokeColor: '#fff',
    strokeWidth: 2,
  },

  line: {
    color: '#409eff',
    width: 4,
  },

  polygon: {
    fillColor: 'rgb(64 158 255 / 0.2)',
    strokeColor: '#409eff',
    strokeWidth: 2,
  },
} satisfies HoverStyleOptions;

/**
 * 根据 Feature 几何类型生成 hover 样式，逻辑与 createSelectStyle 一致，仅默认配色不同。
 */
export function createHoverStyle(feature: Feature<Geometry>, options?: HoverStyleOptions) {
  const geometry = feature.getGeometry();

  if (!geometry) {
    return undefined;
  }

  if (geometry instanceof Point) {
    const style = {
      ...DEFAULT_HOVER_STYLE.point,
      ...options?.point,
    };

    if (style.icon?.src) {
      const icon = createIconStyle(style.icon);

      if (style.icon.size) {
        updateIconScale(icon, style.icon.size);
      }

      return new Style({
        image: icon,
      });
    }

    return new Style({
      image: new CircleStyle({
        radius: style.radius ?? 0,

        fill: new Fill({
          color: style.color,
        }),

        stroke: new Stroke({
          color: style.strokeColor,
          width: style.strokeWidth,
        }),
      }),
    });
  }

  if (geometry instanceof LineString) {
    const style = {
      ...DEFAULT_HOVER_STYLE.line,
      ...options?.line,
    };

    return new Style({
      stroke: new Stroke({
        color: style.color,
        width: style.width,
      }),
    });
  }

  if (geometry instanceof Polygon) {
    const style = {
      ...DEFAULT_HOVER_STYLE.polygon,
      ...options?.polygon,
    };

    return new Style({
      fill: new Fill({
        color: style.fillColor,
      }),

      stroke: new Stroke({
        color: style.strokeColor,
        width: style.strokeWidth,
      }),
    });
  }

  if (geometry instanceof Circle) {
    const style = {
      ...DEFAULT_HOVER_STYLE.polygon,
      ...options?.polygon,
    };

    return new Style({
      fill: new Fill({
        color: style.fillColor,
      }),

      stroke: new Stroke({
        color: style.strokeColor,
        width: style.strokeWidth,
      }),
    });
  }

  return undefined;
}
