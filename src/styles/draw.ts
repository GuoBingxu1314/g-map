import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import CircleStyle from 'ol/style/Circle';
import Style from 'ol/style/Style';

export interface DrawStyleOptions {
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  pointRadius?: number;
}

export const DEFAULT_DRAW_STYLE: Required<DrawStyleOptions> = {
  fillColor: 'rgba(22, 119, 255, 0.15)',
  strokeColor: '#1677ff',
  strokeWidth: 2,
  pointRadius: 5,
};

export function createDrawStyle(options: DrawStyleOptions = {}) {
  const {
    fillColor = DEFAULT_DRAW_STYLE.fillColor,
    strokeColor = DEFAULT_DRAW_STYLE.strokeColor,
    strokeWidth = DEFAULT_DRAW_STYLE.strokeWidth,
    pointRadius = DEFAULT_DRAW_STYLE.pointRadius,
  } = options;

  const fill = new Fill({
    color: fillColor,
  });

  const stroke = new Stroke({
    color: strokeColor,
    width: strokeWidth,
  });

  const point = new CircleStyle({
    radius: pointRadius,
    fill: new Fill({
      color: strokeColor,
    }),
    stroke: new Stroke({
      color: '#ffffff',
      width: 2,
    }),
  });

  return new Style({
    fill,
    stroke,
    image: point,
  });
}
