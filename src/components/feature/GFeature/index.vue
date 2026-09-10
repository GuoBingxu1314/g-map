<script setup lang="ts">
import type { GFeatureEvent } from '@/context/feature/events';

import { inject, onBeforeUnmount, provide, watch } from 'vue';

import Feature from 'ol/Feature';

import { FEATURE_KEY, VECTOR_SOURCE_KEY, FEATURE_GEOMETRY_KEY, FEATURE_STYLE_KEY } from '@/context/keys';

import { registerFeatureEvents, unregisterFeatureEvents } from '@/context/feature/events';
import { registerFeatureSource, unregisterFeatureSource } from '@/context/feature/source';
import { removeFeatureState } from '@/context/feature/state';
import { createFeatureGeometryController } from '@/context/feature/geometry.ts';
import { getFeatureStyleController, unregisterFeatureStyleController } from '@/context/feature/style.ts';
import { createHoverStyle, type HoverStyleOptions } from '@/styles/hover';

defineOptions({
  name: 'GFeature',
});

interface Props {
  id?: string | number;
  properties?: Record<string, unknown>;

  /**
   * 是否开启悬停高亮（默认 false，需显式开启）。
   *
   * 开启后鼠标悬停在本 feature 上会施加 hover 层样式，与选中样式共存
   * （select 优先级高于 hover）。绘制/拾取交互进行时由地图统一暂停。
   */
  hoverable?: boolean;

  /**
   * 自定义 hover 样式配置，结构同 SelectStyleOptions；缺省用 DEFAULT_HOVER_STYLE。
   */
  hoverStyle?: HoverStyleOptions;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  click: [event: GFeatureEvent];
  dblclick: [event: GFeatureEvent];
  mouseenter: [event: GFeatureEvent];
  mouseleave: [event: GFeatureEvent];
  select: [event: GFeatureEvent];
  unselect: [event: GFeatureEvent];
}>();

const source = inject(VECTOR_SOURCE_KEY);

if (!source) {
  throw new Error('[GFeature] must be used within a [GVectorSource]');
}

const feature = new Feature();
source.addFeature(feature);

registerFeatureSource(feature, source);

const geometryController = createFeatureGeometryController(feature);
const styleController = getFeatureStyleController(feature);

provide(FEATURE_KEY, feature);
provide(FEATURE_GEOMETRY_KEY, geometryController);
provide(FEATURE_STYLE_KEY, styleController);

function updateId() {
  feature.setId(props.id);
}

let previousProperties: Record<string, unknown> = {};

function updateProperties(properties: Record<string, unknown>) {
  Object.keys(previousProperties).forEach(key => {
    if (!(key in properties)) {
      feature.unset(key);
    }
  });

  feature.setProperties(properties);

  previousProperties = {
    ...properties,
  };
}

updateId();
updateProperties(props.properties ?? {})

watch(
  () => props.id,
  id => {
    feature.setId(id);
  }
)

watch(
  () => props.properties,
  properties => {
    updateProperties(properties ?? {});
  },
  { deep: true },
)

let isHovered = false;

function applyHoverStyle() {
  if (props.hoverable) {
    styleController.setStyle('hover', createHoverStyle(feature, props.hoverStyle));
  } else {
    styleController.clearStyle('hover');
  }
}

registerFeatureEvents(feature, {
  singleclick: event => emit('click', event),
  dblclick: event => emit('dblclick', event),
  mouseenter: event => {
    isHovered = true;
    applyHoverStyle();
    emit('mouseenter', event);
  },
  mouseleave: event => {
    isHovered = false;
    styleController.clearStyle('hover');
    emit('mouseleave', event);
  },
  select: event => emit('select', event),
  unselect: event => emit('unselect', event),
})

watch(
  () => [props.hoverable, props.hoverStyle] as const,
  () => {
    if (isHovered) {
      applyHoverStyle();
    }
  },
  { deep: true },
)

onBeforeUnmount(() => {
  if (source.hasFeature(feature)) {
    source.removeFeature(feature);
  }
  unregisterFeatureEvents(feature);
  unregisterFeatureSource(feature);
  unregisterFeatureStyleController(feature);
  removeFeatureState(feature);
});
</script>

<template>
  <slot />
</template>
