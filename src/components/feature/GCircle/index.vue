<script setup lang="ts">
import type { CircleStyleOptions } from '@/styles/circle';

import { inject, onBeforeUnmount, watch } from 'vue';

import Circle from 'ol/geom/Circle';

import { fromLonLat, toLonLat } from 'ol/proj';

import { FEATURE_KEY } from '@/context/keys';

import { createCircleStyle } from '@/styles/circle';

defineOptions({
  name: 'GCircle',
});

interface Props extends CircleStyleOptions{
  center: [number, number];
  radius: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:center': [center: [number, number]],
  'update:radius': [radius: number],
}>();

const feature = inject(FEATURE_KEY);

if (!feature) {
  throw new Error('[GCircle] must be used within [GFeature]');
}

if (feature.getGeometry()) {
  throw new Error('[GCircle] feature already has geometry');
}

const circle = new Circle(
  fromLonLat(props.center),
  props.radius,
);

feature.setGeometry(circle);

function handleGeometryChange() {
  const center = toLonLat(circle.getCenter()) as [number, number];

  emit('update:center', center);

  emit('update:radius', circle.getRadius());
}

circle.on('change', handleGeometryChange);

function updateGeometry(center: [number, number], radius: number) {
  const nextCenter = fromLonLat(center);
  const currentCenter = circle.getCenter();

  if (currentCenter[0] !== nextCenter[0] || currentCenter[1] !== nextCenter[1]) {
    circle.setCenter(nextCenter);
  }

  if (circle.getRadius() !== radius) {
    circle.setRadius(radius);
  }
}

function updateStyle() {
  const result = createCircleStyle(props);

  feature?.setStyle(result.style);
}

updateStyle();

watch(
  () => props.center,
  center => {
    updateGeometry(center, props.radius);
  },
  { deep: true },
);

watch(
  () => props.radius,
  radius => {
    updateGeometry(
      props.center,
      radius,
    );
  },
);

watch(
  [
    () => props.fillColor,
    () => props.strokeColor,
    () => props.strokeWidth,
    () => props.zIndex,
  ],
  () => {
    updateStyle();
  },
);

onBeforeUnmount(() => {
  circle.un('change', handleGeometryChange);

  feature.setGeometry(undefined);
  feature.setStyle(undefined);
})
</script>

<template>
  <slot />
</template>
