<script setup lang="ts">
import type { PolygonStyleOptions } from '@/styles/polygon';
import type Style from 'ol/style/Style';

import { inject, onBeforeUnmount, watch } from 'vue';

import Polygon from 'ol/geom/Polygon';

import { fromLonLat, toLonLat } from 'ol/proj';

import { FEATURE_GEOMETRY_KEY, FEATURE_STYLE_KEY } from '@/context/keys';

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

const controller = inject(FEATURE_GEOMETRY_KEY);

if (!controller) {
  throw new Error('[GPolygon] must be used inside [GFeature]');
}

const styleController = inject(FEATURE_STYLE_KEY);

const owner = Symbol('GPolygon');

const polygon = new Polygon(
  props.coordinates.map(ring =>
    ring.map(coordinate =>
      fromLonLat(coordinate),
    ),
  ),
);

controller.registerGeometry(owner, polygon, 'GPolygon');

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

let currentStyle: Style | undefined;

function updateStyle() {
  const result = createPolygonStyle(props);

  currentStyle = result.style;

  styleController?.setStyle('base', currentStyle);
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

  styleController?.clearStyle('base');
  controller.unregisterGeometry(owner, polygon);
})
</script>

<template>
  <slot />
</template>
