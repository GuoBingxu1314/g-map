<script setup lang="ts">
import type { PolygonStyleOptions } from '@/styles/polygon';

import { inject, onBeforeUnmount, watch } from 'vue';

import Polygon from 'ol/geom/Polygon';

import { fromLonLat, toLonLat } from 'ol/proj';

import { FEATURE_KEY } from '@/context/keys';

import { createPolygonStyle } from '@/styles/polygon';

defineOptions({
  name: 'GPolygon',
});

interface Props extends PolygonStyleOptions{
  coordinates: [number, number][][];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:coordinates': [coordinates: [number, number][][]];
}>();

const feature = inject(FEATURE_KEY);

if (!feature) {
  throw new Error('[GPolygon] must be used winth in [GFeature]');
}

if (feature.getGeometry()) {
  throw new Error('[GPolygon] A GFeature can only contain one geometry');
}

const polygon = new Polygon(
  props.coordinates.map(ring =>
    ring.map(coordinate =>
      fromLonLat(coordinate),
    ),
  ),
);

feature.setGeometry(polygon);

function handleGeometryChange() {
  const coordinates = polygon
    .getCoordinates()
    .map(ring => ring.map(coordinate => toLonLat(coordinate) as [number, number]));

  emit('update:coordinates', coordinates);
}

polygon.on('change', handleGeometryChange);

function updateCoordinates(coordinates: [number, number][][]) {
  const next = coordinates.map(ring => ring.map(coordinate => fromLonLat(coordinate)));

  const current = polygon.getCoordinates();

  if (
    current.length === next.length &&
    current.every(
      (ring, ringIndex) =>
        ring.length === next?.[ringIndex]?.length &&
        ring.every(
          (coordinate, coordinateIndex) =>
            coordinate[0] ===
            next?.[ringIndex]?.[coordinateIndex]?.[0] &&
            coordinate[1] ===
            next?.[ringIndex]?.[coordinateIndex]?.[1],
        ),
    )
  ) {
    return;
  }
  polygon.setCoordinates(next);
}

function updateStyle() {
  const result = createPolygonStyle(props);

  feature?.setStyle(result.style);
}

updateStyle();

watch(
  () => props.coordinates,
  coordinates => {
    updateCoordinates(coordinates);
  },
  { deep: true },
);

watch(
  [
    () => props.fillColor,
    () => props.strokeColor,
    () => props.strokeWidth,
    () => props.lineCap,
    () => props.lineJoin,
    () => props.lineDash,
    () => props.zIndex,
  ],
  () => {
    updateStyle();
  },
  { deep: true },
);

onBeforeUnmount(() => {
  polygon.un('change', handleGeometryChange);

  feature.setGeometry(undefined);
  feature.setStyle(undefined);
})
</script>

<template>
  <slot />
</template>
