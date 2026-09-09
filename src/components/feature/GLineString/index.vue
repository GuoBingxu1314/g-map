<script setup lang="ts">
import type { LineStringStyleOptions, ResolvedLineStringStyleOptions } from '@/styles/line';
import type Style from 'ol/style/Style';
import type Stroke from 'ol/style/Stroke';

import { inject, onBeforeUnmount, watch } from 'vue';

import LineString from 'ol/geom/LineString';
import { fromLonLat, toLonLat } from 'ol/proj';

import { createLineStringStyle, resolveLineStringStyleOptions } from '@/styles/line';

import { FEATURE_KEY } from '@/context/keys';

defineOptions({
  name: 'GLineString',
});

interface Props extends LineStringStyleOptions{
  coordinates: [number, number][];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:coordinates': [coordinates: [number, number][]];
}>();

const feature = inject(FEATURE_KEY);

if (!feature) {
  throw new Error('[GLineString] must be used within [GFeature]');
}

if (feature.getGeometry()) {
  throw new Error('[GLineString] A GFeature can only contain one geometry');
}

const lineString = new LineString(
  props.coordinates.map(coordinate => fromLonLat(coordinate)),
);

feature.setGeometry(lineString);

function handleGeometryChange() {
  const coordinates = lineString
    .getCoordinates()
    .map(coordinate => toLonLat(coordinate) as [number, number]);

  emit('update:coordinates', coordinates);
}

lineString.on('change', handleGeometryChange);

function updateCoordinates(coordinates: [number, number][]) {
  const next = coordinates.map(coordinate => fromLonLat(coordinate));

  const current = lineString.getCoordinates();

  if (
    current.length === next.length &&
    current.every(
      (coordinate, index) =>
        coordinate[0] === next?.[index]?.[0] && coordinate[1] === next?.[index]?.[1]
    )
  ) {
    return;
  }

  lineString.setCoordinates(next);
}

function getStyleOptions(): ResolvedLineStringStyleOptions {
  return resolveLineStringStyleOptions(props);
}

let currentStyle: Style | undefined;
let currentStroke: Stroke | undefined;

function updateStyle() {
  const result = createLineStringStyle(props);

  currentStyle = result.style;
  currentStroke = result.stroke;

  feature?.setStyle(currentStyle);
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
    () => props.color,
    () => props.width,
    () => props.opacity,
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
  lineString.un(
    'change',
    handleGeometryChange,
  );

  feature.setGeometry(undefined);
})
</script>

<template>
  <slot />
</template>
