import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';

export interface LineStringStyleOptions {
  color?: string;
  width?: number;
  opacity?: number;
  lineCap?: CanvasLineCap;
  lineJoin?: CanvasLineJoin;
  lineDash?: number[];
  zIndex?: number;
}

export interface ResolvedLineStringStyleOptions {
  color: string;
  width: number;
  opacity: number;
  lineCap: CanvasLineCap;
  lineJoin: CanvasLineJoin;
  lineDash?: number[];
  zIndex: number;
}

export const DEFAULT_LINE_STRING_STYLE: ResolvedLineStringStyleOptions = {
  color: '#1677ff',
  width: 3,
  opacity: 1,
  lineCap: 'round',
  lineJoin: 'round',
  lineDash: undefined,
  zIndex: 0,
};

export interface LineStringStyleResult {
  style: Style;
  stroke: Stroke;
}

export function resolveLineStringStyleOptions(options: LineStringStyleOptions = {}): ResolvedLineStringStyleOptions {
  return  {
    color: options.color ?? DEFAULT_LINE_STRING_STYLE.color,
    width: options.width ?? DEFAULT_LINE_STRING_STYLE.width,
    opacity: options.opacity ?? DEFAULT_LINE_STRING_STYLE.opacity,
    lineCap: options.lineCap ?? DEFAULT_LINE_STRING_STYLE.lineCap,
    lineJoin: options.lineJoin ?? DEFAULT_LINE_STRING_STYLE.lineJoin,
    lineDash: options.lineDash ?? DEFAULT_LINE_STRING_STYLE.lineDash,
    zIndex: options.zIndex ?? DEFAULT_LINE_STRING_STYLE.zIndex,
  }
}

export function createLineStringStyle(options: LineStringStyleOptions = {}): LineStringStyleResult {
  const {
    color,
    width,
    // opacity,
    lineCap,
    lineJoin,
    lineDash,
    zIndex,
  } = resolveLineStringStyleOptions(options);

  const stroke = new Stroke({
    color,
    width,
    // opacity,
    lineCap,
    lineJoin,
    lineDash,
  });

  const style = new Style({
    stroke,
    zIndex,
  });

  return {
    style,
    stroke,
  }
}
