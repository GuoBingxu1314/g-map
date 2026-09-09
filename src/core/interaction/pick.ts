import type Feature from 'ol/Feature';
import type Geometry from 'ol/geom/Geometry';
import type Map from 'ol/Map';
import type MapBrowserEvent from 'ol/MapBrowserEvent';

import { toLonLat } from 'ol/proj';

export interface PickFeatureOptions<
  T extends Geometry = Geometry,
> {
  filter?: (feature: Feature) => boolean;
}

export interface PickController<T> {
  promise: Promise<T>;
  cancel: () => void;
}

export function createPickPointController(
  map: Map,
): PickController<[number, number]> {
  let settled = false;

  let resolvePromise:
    | ((coordinates: [number, number]) => void)
    | undefined;

  let rejectPromise:
    | ((reason?: unknown) => void)
    | undefined;

  const promise = new Promise<[number, number]>(
    (resolve, reject) => {
      resolvePromise = resolve;
      rejectPromise = reject;
    },
  );

  function cleanup() {
    map.un('click', handleClick);
  }

  function finishResolve(
    coordinates: [number, number],
  ) {
    if (settled) return;

    settled = true;

    const resolve = resolvePromise;

    cleanup();

    resolvePromise = undefined;
    rejectPromise = undefined;

    resolve?.(coordinates);
  }

  function finishReject(reason: unknown) {
    if (settled) return;

    settled = true;

    const reject = rejectPromise;

    cleanup();

    resolvePromise = undefined;
    rejectPromise = undefined;

    reject?.(reason);
  }

  function handleClick(
    event: MapBrowserEvent,
  ) {
    if (settled) return;

    const coordinates = toLonLat(
      event.coordinate,
    ) as [number, number];

    finishResolve(coordinates);
  }

  function cancel() {
    finishReject(
      new Error('[GMap point picking cancelled]'),
    );
  }

  map.on('click', handleClick);

  return {
    promise,
    cancel,
  };
}

export function createPickFeatureController<
  T extends Geometry = Geometry,
>(
  map: Map,
  options?: PickFeatureOptions<T>,
): PickController<Feature<T>> {
  let settled = false;

  let resolvePromise:
    | ((feature: Feature<T>) => void)
    | undefined;

  let rejectPromise:
    | ((reason?: unknown) => void)
    | undefined;

  const promise = new Promise<Feature<T>>(
    (resolve, reject) => {
      resolvePromise = resolve;
      rejectPromise = reject;
    },
  );

  function cleanup() {
    map.un('click', handleClick);
  }

  function finishResolve(
    feature: Feature<T>,
  ) {
    if (settled) return;

    settled = true;

    const resolve = resolvePromise;

    cleanup();

    resolvePromise = undefined;
    rejectPromise = undefined;

    resolve?.(feature);
  }

  function finishReject(reason: unknown) {
    if (settled) return;

    settled = true;

    const reject = rejectPromise;

    cleanup();

    resolvePromise = undefined;
    rejectPromise = undefined;

    reject?.(reason);
  }

  function handleClick(
    event: MapBrowserEvent,
  ) {
    if (settled) return;

    let targetFeature: Feature<T> | undefined;

    map.forEachFeatureAtPixel(
      event.pixel,
      feature => {
        const currentFeature = feature as Feature;

        if (
          options?.filter &&
          !options.filter(currentFeature)
        ) {
          return false;
        }

        targetFeature = currentFeature as Feature<T>;

        return true;
      },
    );

    if (!targetFeature) return;

    finishResolve(targetFeature);
  }

  function cancel() {
    finishReject(
      new Error('[GMap feature picking cancelled]'),
    );
  }

  map.on('click', handleClick);

  return {
    promise,
    cancel,
  };
}
