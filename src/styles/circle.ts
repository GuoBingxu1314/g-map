import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';

export interface CircleStyleOptions {
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  zIndex?: number;
}

export interface ResolvedCircleStyleOptions {
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  zIndex: number;
}

export const DEFAULT_CIRCLE_STYLE: ResolvedCircleStyleOptions = {
  fillColor: 'rgba(22, 119, 225, 0.2)',
  strokeColor: '#1677ff',
  strokeWidth: 2,
  zIndex: 0,
}

export interface CircleStyleResult {
  style: Style;
  fill: Fill;
  stroke: Stroke;
}

export function resolveCircleStyleOptions(options: CircleStyleOptions = {}): ResolvedCircleStyleOptions {
  return {
    fillColor: options.fillColor || DEFAULT_CIRCLE_STYLE.fillColor,
    strokeColor: options.strokeColor || DEFAULT_CIRCLE_STYLE.strokeColor,
    strokeWidth: options.strokeWidth || DEFAULT_CIRCLE_STYLE.strokeWidth,
    zIndex: options.zIndex || DEFAULT_CIRCLE_STYLE.zIndex,
  }
}

export function createCircleStyle(options: CircleStyleOptions = {}): CircleStyleResult {
  const {
    fillColor,
    strokeColor,
    strokeWidth,
    zIndex,
  } = resolveCircleStyleOptions(options);

  const fill = new Fill({
    color: fillColor,
  });

  const stroke = new Stroke({
    color: strokeColor,
    width: strokeWidth,
  });

  const style = new Style({
    fill,
    stroke,
    zIndex,
  });

  return {
    style,
    fill,
    stroke,
  }
}
