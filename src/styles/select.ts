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

export interface SelectStyleOptions {
  point?: Partial<PointStyleOptions>;

  line?: Partial<LineStringStyleOptions>;

  polygon?: Partial<PolygonStyleOptions>;
}

const DEFAULT_SELECT_STYLE: Required<SelectStyleOptions> = {
  point: {
    color: '#ffd065',
    radius: 7,
    strokeColor: '#fff',
    strokeWidth: 2,
  },

  line: {
    color: '#ffd065',
    width: 5,
  },

  polygon: {
    fillColor: 'rgb(255 208 101 / 0.3)',
    strokeColor: '#ffd065',
    strokeWidth: 3,
  },
} satisfies SelectStyleOptions;

export function createSelectStyle(feature: Feature<Geometry>, options?: SelectStyleOptions) {
  const geometry = feature.getGeometry();

  if (!geometry) {
    return undefined;
  }

  if (geometry instanceof Point) {
    const style = {
      ...DEFAULT_SELECT_STYLE.point,
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
      ...DEFAULT_SELECT_STYLE.line,
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
      ...DEFAULT_SELECT_STYLE.polygon,
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
      ...DEFAULT_SELECT_STYLE.polygon,
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
