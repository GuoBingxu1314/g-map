import type Feature from 'ol/Feature';
import type VectorSource from 'ol/source/Vector';

const featureSourceMap = new WeakMap<Feature, VectorSource>();

export function registerFeatureSource(feature: Feature, source: VectorSource) {
  featureSourceMap.set(feature, source);
}

export function unregisterFeatureSource(feature: Feature) {
  featureSourceMap.delete(feature);
}

export function getFeatureSource(feature: Feature) {
  return featureSourceMap.get(feature);
}
