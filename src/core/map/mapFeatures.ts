import type VectorSource from 'ol/source/Vector';
import type { PointStyleOptions } from '@/styles/point';

import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';

import { fromLonLat } from 'ol/proj';

import { createPointStyle } from '@/styles/point';

import {
  getFeatureSource,
  registerFeatureSource,
  unregisterFeatureSource,
} from '@/context/feature/source';

export interface MapFeatureController {
  addPoint: (
    coordinates: [number, number],
    options?: PointStyleOptions,
  ) => Feature<Point>;

  removeFeature: (
    feature: Feature,
  ) => boolean;

  clearPoints: () => void;
}

export function createMapFeatureController(
  source: VectorSource,
): MapFeatureController {
  function addPoint(
    coordinates: [number, number],
    options?: PointStyleOptions,
  ): Feature<Point> {
    const point = new Point(
      fromLonLat(coordinates),
    );

    const feature = new Feature(point);

    const pointStyle = createPointStyle(options);

    feature.setStyle(pointStyle.style);

    source.addFeature(feature);

    registerFeatureSource(
      feature,
      source,
    );

    return feature;
  }

  function removeFeature(
    feature: Feature,
  ): boolean {
    const featureSource =
      getFeatureSource(feature);

    if (!featureSource) {
      return false;
    }

    if (!featureSource.hasFeature(feature)) {
      return false;
    }

    featureSource.removeFeature(feature);

    unregisterFeatureSource(feature);

    return true;
  }

  function clearPoints() {
    source
      .getFeatures()
      .forEach(feature => {
        unregisterFeatureSource(feature);
      });

    source.clear();
  }

  return {
    addPoint,
    removeFeature,
    clearPoints,
  };
}
