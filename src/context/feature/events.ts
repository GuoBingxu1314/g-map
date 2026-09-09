import type Feature from 'ol/Feature';
import type MapBrowserEvent from 'ol/MapBrowserEvent';

export interface FeatureEvents {
  singleclick?: (event: GFeatureEvent) => void;
  click?: (event: GFeatureEvent) => void;
  dblclick?: (event: GFeatureEvent) => void;
  mouseenter?: (event: GFeatureEvent) => void;
  mouseleave?: (event: GFeatureEvent) => void;
  select?: (event: GFeatureEvent) => void;
  unselect?: (event: GFeatureEvent) => void;
}

export interface GFeatureEvent<T extends MapBrowserEvent = MapBrowserEvent> {
  feature: Feature;
  id: string | number | undefined;
  properties: Record<string, unknown>;
  originalEvent: T;
}

const featureEvents = new WeakMap<Feature, FeatureEvents>();

export function registerFeatureEvents(feature: Feature, events: FeatureEvents) {
  featureEvents.set(feature, events);
}

export function unregisterFeatureEvents(feature: Feature) {
  featureEvents.delete(feature);
}

export function getFeatureEvents(feature: Feature) {
  return featureEvents.get(feature);
}

function getFeatureProperties(feature: Feature): Record<string, unknown> {
  const properties = {
    ...feature.getProperties(),
  };

  delete properties.geometry;

  return properties;
}

export function createGFeatureEvent<T extends MapBrowserEvent>(feature: Feature, originalEvent: T): GFeatureEvent<T> {
  return {
    feature,
    id: feature.getId() as string | number | undefined,
    properties: getFeatureProperties(feature),
    originalEvent,
  };
}
