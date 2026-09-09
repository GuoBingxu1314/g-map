import type Feature from 'ol/Feature';
import type Circle from 'ol/geom/Circle';
import type Geometry from 'ol/geom/Geometry';
import type LineString from 'ol/geom/LineString';
import type Map from 'ol/Map';
import type Polygon from 'ol/geom/Polygon';
import type VectorSource from 'ol/source/Vector';

import Draw from 'ol/interaction/Draw';
import { toLonLat } from 'ol/proj';

import {
  createDrawStyle,
  type DrawStyleOptions,
} from '@/styles/draw';

export type Coordinate = [
  number,
  number,
];

export type DrawLineStringResult = Coordinate[];

export type DrawPolygonResult = Coordinate[];

export interface DrawCircleResult {
  center: Coordinate;
  radius: number;
}

export type DrawType = 'LineString' | 'Polygon' | 'Circle';

export interface StartDrawOptions {
  style?: DrawStyleOptions;
}

export interface DrawController<T> {
  promise: Promise<T>;
  cancel: () => void;
}

export function createDrawController(
  map: Map,
  source: VectorSource,
  type: 'LineString',
  options?: StartDrawOptions,
): DrawController<DrawLineStringResult>;

export function createDrawController(
  map: Map,
  source: VectorSource,
  type: 'Polygon',
  options?: StartDrawOptions,
): DrawController<DrawPolygonResult>;

export function createDrawController(
  map: Map,
  source: VectorSource,
  type: 'Circle',
  options?: StartDrawOptions,
): DrawController<DrawCircleResult>;

export function createDrawController(
  map: Map,
  source: VectorSource,
  type: DrawType,
  options?: StartDrawOptions,
): DrawController<
  DrawLineStringResult |
  DrawPolygonResult |
  DrawCircleResult
>;

export function createDrawController(
  map: Map,
  source: VectorSource,
  type: DrawType,
  options?: StartDrawOptions,
): DrawController<
  DrawLineStringResult |
  DrawPolygonResult |
  DrawCircleResult
> {
  const draw = new Draw({
    source,
    type,
    style: createDrawStyle(options?.style),
  });

  let settled = false;

  let resolvePromise:
    | ((
    value:
      | DrawLineStringResult
      | DrawPolygonResult
      | DrawCircleResult,
  ) => void)
    | undefined;

  let rejectPromise:
    | ((reason?: unknown) => void)
    | undefined;

  const promise = new Promise<
    DrawLineStringResult |
    DrawPolygonResult |
    DrawCircleResult
  >((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });

  function cleanup() {
    map.removeInteraction(draw);
    source.clear();
  }

  function finishResolve(
    value:
      | DrawLineStringResult
      | DrawPolygonResult
      | DrawCircleResult,
  ) {
    if (settled) return;

    settled = true;

    const resolve = resolvePromise;

    resolvePromise = undefined;
    rejectPromise = undefined;

    queueMicrotask(() => {
      cleanup();
      resolve?.(value);
    });
  }

  function finishReject(reason: unknown) {
    if (settled) return;

    settled = true;

    const reject = rejectPromise;

    resolvePromise = undefined;
    rejectPromise = undefined;

    cleanup();

    reject?.(reason);
  }

  function handleDrawEnd(event: {
    feature: Feature<Geometry>;
  }) {
    if (settled) return;

    const geometry = event.feature.getGeometry();

    if (!geometry) {
      finishReject(
        new Error('[GMap] drawn feature has no geometry'),
      );

      return;
    }

    if (type === 'LineString') {
      const lineString = geometry as LineString;

      const coordinates = lineString
        .getCoordinates()
        .map(
          coordinate =>
            toLonLat(coordinate) as Coordinate,
        );

      finishResolve(coordinates);

      return;
    }

    if (type === 'Polygon') {
      const polygon = geometry as Polygon;

      const coordinates = polygon
        .getCoordinates()[0]
        ?.map(coordinate =>
          toLonLat(coordinate) as Coordinate,
        ) || [];

      finishResolve(coordinates);

      return;
    }

    const circle = geometry as Circle;

    const center = toLonLat(
      circle.getCenter(),
    ) as Coordinate;

    const radius = circle.getRadius();

    finishResolve({
      center,
      radius,
    });
  }

  function cancel() {
    if (settled) return;

    draw.abortDrawing();

    finishReject(
      new Error('[GMap drawing cancelled]'),
    );
  }

  draw.once(
    'drawend',
    event => {
      handleDrawEnd(
        event as unknown as {
          feature: Feature<Geometry>;
        },
      );
    },
  );

  map.addInteraction(draw);

  return {
    promise,
    cancel,
  };
}
