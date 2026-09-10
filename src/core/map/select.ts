import type Feature from 'ol/Feature';
import type Map from 'ol/Map';
import type MapBrowserEvent from 'ol/MapBrowserEvent';
import { createSelectStyle, type SelectStyleOptions } from '@/styles/select';

import { createGFeatureEvent, getFeatureEvents } from '@/context/feature/events';
import { isFeatureSelected, setFeatureSelected } from '@/context/feature/state';
import { getFeatureStyleController } from '@/context/feature/style';

export interface SelectFeatureOptions {
  filter?: (feature: Feature) => boolean;
  style?: SelectStyleOptions;
  multi?: boolean;
}

export interface SelectController {
  start: (options?: SelectFeatureOptions) => void;
  stop: () => void;
  clear: () => void;
  isActive: () => boolean;
  getSelectedFeatures: () => Feature[];
  destroy: () => void;
}

function getFeatureAtPixel(map: Map, pixel: number[]): Feature | undefined {
  let result: Feature | undefined;

  map.forEachFeatureAtPixel(
    pixel,
    feature => {
      result = feature as Feature;
      return true;
    },
  );

  return result;
}

export function createSelectController(map: Map): SelectController {
  const selectedFeatures = new Set<Feature>();

  let options: SelectFeatureOptions = {
    multi: false,
  };

  function select(feature: Feature, event: MapBrowserEvent) {
    if (options.filter && !options.filter(feature)) return;

    if (!options.multi) {
      selectedFeatures.forEach(selectedFeature => {
        if (selectedFeature !== feature) {
          unselect(selectedFeature, event);
        }
      });
    }

    if (selectedFeatures.has(feature)) return;

    selectedFeatures.add(feature);
    setFeatureSelected(feature, true);

    const style = createSelectStyle(feature, options.style);

    getFeatureStyleController(feature).setStyle('select', style);

    getFeatureEvents(feature)?.select?.(createGFeatureEvent(feature, event));
  }

  function unselect(feature: Feature, event: MapBrowserEvent) {
    if (!selectedFeatures.has(feature)) return;

    selectedFeatures.delete(feature);
    setFeatureSelected(feature, false);

    getFeatureStyleController(feature).clearStyle('select');

    getFeatureEvents(feature)?.unselect?.(createGFeatureEvent(feature, event));
  }

  function handleClick(event: MapBrowserEvent) {
    const feature = getFeatureAtPixel(map, event.pixel);

    if (!feature) return;

    if (isFeatureSelected(feature)) {
      unselect(feature, event);
      return;
    }

    select(feature, event);
  }

  let active = false;

  function start(selectOptions: SelectFeatureOptions = {}) {
    options = {
      multi: false,
      ...selectOptions,
    }

    if (active) return;

    map.on('click', handleClick);

    active = true;
  }

  function stop() {
    if (!active) return;

    map.un('click', handleClick);

    active = false;
  }

  function clear() {
    selectedFeatures.forEach(feature => {
      setFeatureSelected(feature, false);

      getFeatureStyleController(feature).clearStyle('select');
    });

    selectedFeatures.clear();
  }

  function isActive() {
    return active;
  }

  function getSelectedFeatures() {
    return [...selectedFeatures];
  }

  function destroy() {
    stop();
    clear();
  }

  return {
    start,
    stop,
    clear,
    isActive,
    getSelectedFeatures,
    destroy,
  }
}
