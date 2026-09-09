import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';

export interface PolygonStyleOptions {
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  lineCap?: CanvasLineCap;
  lineJoin?: CanvasLineJoin;
  lineDash?: number[];
  zIndex?: number;
}

export interface ResolvedPolygonStyleOptions {
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  lineCap: CanvasLineCap;
  lineJoin: CanvasLineJoin;
  lineDash?: number[];
  zIndex: number;
}

export const DEFAULT_POLYGON_STYLE: ResolvedPolygonStyleOptions = {
  fillColor: 'rgba(22, 119, 255, 0.2)',
  strokeColor: '#1677ff',
  strokeWidth: 2,
  lineCap: 'round',
  lineJoin: 'round',
  lineDash: undefined,
  zIndex: 0,
}

export interface PolygonStyleResult {
  style: Style;
  fill: Fill;
  stroke: Stroke;
}

export function resolvePolygonStyleOptions(options: PolygonStyleOptions = {}): ResolvedPolygonStyleOptions {
  return {
    fillColor: options.fillColor ?? DEFAULT_POLYGON_STYLE.fillColor,
    strokeColor: options.strokeColor ?? DEFAULT_POLYGON_STYLE.strokeColor,
    strokeWidth: options.strokeWidth ?? DEFAULT_POLYGON_STYLE.strokeWidth,
    lineCap: options.lineCap ?? DEFAULT_POLYGON_STYLE.lineCap,
    lineJoin: options.lineJoin ?? DEFAULT_POLYGON_STYLE.lineJoin,
    lineDash: options.lineDash ?? DEFAULT_POLYGON_STYLE.lineDash,
    zIndex: options.zIndex ?? DEFAULT_POLYGON_STYLE.zIndex,
  }
}

export function createPolygonStyle(options: PolygonStyleOptions = {}): PolygonStyleResult {
  const {
    fillColor,
    strokeColor,
    strokeWidth,
    lineCap,
    lineJoin,
    lineDash,
    zIndex,
  } = resolvePolygonStyleOptions(options);

  const fill = new Fill({
    color: fillColor,
  });

  const stroke = new Stroke({
    color: strokeColor,
    width: strokeWidth,
    lineCap,
    lineJoin,
    lineDash,
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
