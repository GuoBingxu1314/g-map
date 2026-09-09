import type Feature from 'ol/Feature';
import type Map from 'ol/Map';
import type MapBrowserEvent from 'ol/MapBrowserEvent';

import { createGFeatureEvent, getFeatureEvents } from '@/context/feature/events';

export interface MapEventController {
  handlePointerMove: (
    event: MapBrowserEvent,
  ) => void;

  handleSingleClick: (
    event: MapBrowserEvent,
  ) => void;

  handleClick: (
    event: MapBrowserEvent,
  ) => void;

  handleDblClick: (
    event: MapBrowserEvent,
  ) => void;

  destroy: () => void;
}

export function createMapEventController(
  map: Map,
  isInteractionActive: () => boolean,
): MapEventController {
  let hoveredFeature: Feature | undefined;

  function getFeatureAtPixel(
    pixel: number[],
  ): Feature | undefined {
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

  function handlePointerMove(
    event: MapBrowserEvent,
  ) {
    const targetFeature = getFeatureAtPixel(
      event.pixel,
    );

    if (targetFeature === hoveredFeature) {
      return;
    }

    if (hoveredFeature) {
      getFeatureEvents(
        hoveredFeature,
      )?.mouseleave?.(createGFeatureEvent(hoveredFeature, event));
    }

    if (targetFeature) {
      getFeatureEvents(
        targetFeature,
      )?.mouseenter?.(createGFeatureEvent(targetFeature, event));
    }

    hoveredFeature = targetFeature;
  }

  function handleSingleClick(
    event: MapBrowserEvent,
  ) {
    if (isInteractionActive()) {
      return;
    }

    const feature = getFeatureAtPixel(
      event.pixel,
    );

    if (!feature) {
      return;
    }

    getFeatureEvents(
      feature,
    )?.singleclick?.(createGFeatureEvent(feature, event));
  }

  function handleClick(
    event: MapBrowserEvent,
  ) {
    if (isInteractionActive()) {
      return;
    }

    const feature = getFeatureAtPixel(
      event.pixel,
    );

    if (!feature) {
      return;
    }

    getFeatureEvents(
      feature,
    )?.click?.(createGFeatureEvent(feature, event));
  }

  function handleDblClick(
    event: MapBrowserEvent,
  ) {
    if (isInteractionActive()) {
      return;
    }

    const feature = getFeatureAtPixel(
      event.pixel,
    );

    if (!feature) {
      return;
    }

    getFeatureEvents(
      feature,
    )?.dblclick?.(createGFeatureEvent(feature, event));
  }

  map.on(
    'pointermove',
    handlePointerMove,
  );

  map.on(
    'singleclick',
    handleSingleClick,
  );

  map.on(
    'click',
    handleClick,
  );

  map.on(
    'dblclick',
    handleDblClick,
  );

  function destroy() {
    map.un(
      'pointermove',
      handlePointerMove,
    );

    map.un(
      'singleclick',
      handleSingleClick,
    );

    map.un(
      'click',
      handleClick,
    );

    map.un(
      'dblclick',
      handleDblClick,
    );

    if (hoveredFeature) {
      hoveredFeature = undefined;
    }
  }

  return {
    handlePointerMove,
    handleSingleClick,
    handleClick,
    handleDblClick,
    destroy,
  };
}
