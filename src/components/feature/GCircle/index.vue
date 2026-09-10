<script setup lang="ts">
import type { CircleStyleOptions } from '@/styles/circle';
import type Style from 'ol/style/Style';

import { inject, onBeforeUnmount, watch } from 'vue';

import Circle from 'ol/geom/Circle';

import { fromLonLat, toLonLat } from 'ol/proj';

import { FEATURE_GEOMETRY_KEY, FEATURE_STYLE_KEY } from '@/context/keys';

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

const controller = inject(FEATURE_GEOMETRY_KEY);

if (!controller) {
  throw new Error('[GCircle] must be used inside [GFeature]');
}

const styleController = inject(FEATURE_STYLE_KEY);

const owner = Symbol('GCircle');

const circle = new Circle(
  fromLonLat(props.center),
  props.radius,
);

controller.registerGeometry(owner, circle, 'GCircle');

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

let currentStyle: Style | undefined;

function updateStyle() {
  const result = createCircleStyle(props);

  currentStyle = result.style;

  styleController?.setStyle('base', currentStyle);
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

  styleController?.clearStyle('base');
  controller.unregisterGeometry(owner, circle);
})
</script>

<template>
  <slot />
</template>
