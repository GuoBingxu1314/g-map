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
  isPointerBusy?: () => boolean,
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

  // hover 命中检测主体（在 rAF 回调中执行）
  function doHover(
    event: MapBrowserEvent,
  ) {
    // 绘制/拾取占用指针时暂停 hover：清除当前悬停高亮并跳过
    if (isPointerBusy?.()) {
      if (hoveredFeature) {
        getFeatureEvents(
          hoveredFeature,
        )?.mouseleave?.(createGFeatureEvent(hoveredFeature, event));

        hoveredFeature = undefined;
      }

      return;
    }

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

  // rAF 节流：pointermove 高频（海量点场景尤甚），合并到每帧一次命中检测
  let rafId: number | null = null;
  let pendingEvent: MapBrowserEvent | null = null;

  function handlePointerMove(
    event: MapBrowserEvent,
  ) {
    pendingEvent = event;

    if (rafId !== null) return;

    rafId = requestAnimationFrame(() => {
      rafId = null;

      if (pendingEvent) doHover(pendingEvent);

      pendingEvent = null;
    });
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

    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    pendingEvent = null;

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
