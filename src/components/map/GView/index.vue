<script setup lang="ts">
import type { EventsKey } from 'ol/events';

import { inject, onBeforeUnmount, provide, watch } from 'vue';

import { fromLonLat, toLonLat } from 'ol/proj';
import View from 'ol/View';

import { MAP_KEY, VIEW_KEY } from '@/context/keys';

defineOptions({
  name: 'GView',
});

interface Props {
  center?: [number, number];
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  rotation?: number;
}

const props = withDefaults(defineProps<Props>(), {
  center: () => [0, 0],
  zoom: 2,
});
const emit = defineEmits<{
  'update:center': [center: [number, number]];
  'update:zoom': [zoom: number];
}>();

const map = inject(MAP_KEY);

if (!map) {
  throw new Error('[GView] must be used inside [GMap]');
}

const view = new View({
  center: fromLonLat(props.center),
  zoom: props.zoom,
  minZoom: props.minZoom,
  maxZoom: props.maxZoom,
  rotation: props.rotation,
})

map.setView(view);

provide(VIEW_KEY, view);

function isSameCoordinate(
  a: [number, number],
  b: [number, number],
) {
  return a[0] === b[0] && a[1] === b[1];
}

watch(
  () => props.center,
  (center) => {
    const currentCenter = view.getCenter();

    if (!currentCenter) {
      return;
    }

    const currentLonLat = toLonLat(
      currentCenter,
    ) as [number, number];

    if (isSameCoordinate(currentLonLat, center)) {
      return;
    }

    view.setCenter(fromLonLat(center));
  },
);

watch(
  () => props.zoom,
  (zoom) => {
    const currentZoom = view.getZoom();

    if (
      currentZoom === undefined ||
      currentZoom === zoom
    ) {
      return;
    }

    view.setZoom(zoom);
  },
);

const centerListener: EventsKey = view.on(
  'change:center',
  () => {
    const center = view.getCenter();

    if (!center) {
      return;
    }

    emit('update:center', toLonLat(center) as [number, number]);
  },
);

const zoomListener: EventsKey = view.on(
  'change:resolution',
  () => {
    const zoom = view.getZoom();

    if (!zoom) {
      return;
    }

    emit('update:zoom', zoom);
  },
);

onBeforeUnmount(() => {
  view.un('change:center', centerListener.listener);
  view.un('change:resolution', zoomListener.listener);

  if (map.getView() === view) {
    map.setView(null);
  }
});
</script>

<template>
  <slot />
</template>
