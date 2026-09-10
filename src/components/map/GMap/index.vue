<script setup lang="ts">
import type Geometry from 'ol/geom/Geometry';
import type {
  DrawType,
  DrawCircleResult,
  DrawLineStringResult,
  DrawPolygonResult,
  StartDrawOptions
} from '@/core/interaction/draw';
import type { PickFeatureOptions } from '@/core/interaction/pick';
import type { SelectFeatureOptions } from '@/core/map/select';
import type { GMapExpose, InteractionType } from './types.ts';

import { onMounted, onBeforeUnmount, provide, ref } from 'vue';

import Map from 'ol/Map';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import { defaults as defaultControls } from 'ol/control';

import { MAP_KEY } from '@/context/keys';
import { createMapEventController } from '@/core/map/mapEvents';
import { createDrawController } from '@/core/interaction/draw';
import { createPickFeatureController, createPickPointController } from '@/core/interaction/pick';
import { createMapFeatureController } from '@/core/map/mapFeatures';
import { createSelectController } from '@/core/map/select';

defineOptions({
  name: 'GMap',
});

interface Props {
  /**
   * 是否显示版权署名（Attribution）控件。
   *
   * 使用 OpenStreetMap 等瓦片源时，其服务条款要求展示署名，
   * 因此默认开启。若你已自行提供署名，可将其关闭。
   */
  attribution?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  attribution: true,
});

const INTERACTION_LAYER_Z_INDEX = 9999;
const DRAW_INTERACTION_TYPE: Record<DrawType, InteractionType> = {
  LineString: 'draw-linestring',
  Polygon: 'draw-polygon',
  Circle: 'draw-circle',
};

const mapElement = ref<HTMLDivElement>();

const map = new Map({
  controls: defaultControls({
    attribution: props.attribution,
  }),
});

provide(MAP_KEY, map);

// 交互图层
const interactionSource = new VectorSource();
const interactionLayer = new VectorLayer({
  source: interactionSource,
  zIndex: INTERACTION_LAYER_Z_INDEX,
});
map.addLayer(interactionLayer);

const mapFeatureController = createMapFeatureController(interactionSource);

const DRAW_LAYER_Z_INDEX = 9998;
const drawSource = new VectorSource();

const drawLayer = new VectorLayer({
  source: drawSource,
  zIndex: DRAW_LAYER_Z_INDEX,
});

map.addLayer(drawLayer);

const selectController = createSelectController(map);

// 当前地图交互
let interaction: InteractionType | undefined;

// 第二谓词：仅绘制/拾取（interaction 非 select）时为 true，用于暂停 hover 高亮
const mapEventController = createMapEventController(
  map,
  () => !!interaction,
  () => !!interaction && interaction !== 'select',
);

let cancelInteractionHandler: (() => void) | undefined;
// 地图选点
function pickPoint(): Promise<[number, number]> {
  if (interaction) {
    return Promise.reject(
      new Error('[GMap] point picking is already active'),
    );
  }

  interaction = 'pick-point';

  setInteractionCursor(true);

  const controller = createPickPointController(map);

  cancelInteractionHandler = controller.cancel;

  return controller.promise.finally(() => {
    if (cancelInteractionHandler === controller.cancel) {
      cancelInteractionHandler = undefined;
    }

    interaction = undefined;

    setInteractionCursor(false);
  });
}
// 地图选Feature
function pickFeature<T extends Geometry = Geometry>(
  options?: PickFeatureOptions<T>,
): Promise<Feature<T>> {
  if (interaction) {
    return Promise.reject(
      new Error('[GMap] interaction is already active'),
    );
  }

  interaction = 'pick-feature';

  setInteractionCursor(true);

  const controller = createPickFeatureController(
    map,
    options,
  );

  cancelInteractionHandler = controller.cancel;

  return controller.promise.finally(() => {
    if (cancelInteractionHandler === controller.cancel) {
      cancelInteractionHandler = undefined;
    }

    interaction = undefined;

    setInteractionCursor(false);
  });
}

function startDraw(
  type: 'LineString',
  options?: StartDrawOptions,
): Promise<DrawLineStringResult>;

function startDraw(
  type: 'Polygon',
  options?: StartDrawOptions,
): Promise<DrawPolygonResult>;

function startDraw(
  type: 'Circle',
  options?: StartDrawOptions,
): Promise<DrawCircleResult>;

function startDraw(
  type: DrawType,
  options?: StartDrawOptions,
): Promise<
  DrawLineStringResult |
  DrawPolygonResult |
  DrawCircleResult
> {
  if (interaction) {
    return Promise.reject(
      new Error('[GMap] interaction is already active'),
    );
  }

  interaction = DRAW_INTERACTION_TYPE[type];

  setInteractionCursor(true);

  const controller = createDrawController(
    map,
    drawSource,
    type,
    options,
  );

  cancelInteractionHandler = controller.cancel;

  return controller.promise.finally(() => {
    if (cancelInteractionHandler === controller.cancel) {
      cancelInteractionHandler = undefined;
    }

    interaction = undefined;

    setInteractionCursor(false);
  });
}

function drawLineString(
  options?: StartDrawOptions,
): Promise<DrawLineStringResult> {
  return startDraw('LineString', options);
}

function drawPolygon(
  options?: StartDrawOptions,
): Promise<DrawPolygonResult> {
  return startDraw('Polygon', options);
}

function drawCircle(
  options?: StartDrawOptions,
): Promise<DrawCircleResult> {
  return startDraw('Circle', options);
}

// 取消交互
function cancelInteraction() {
  cancelInteractionHandler?.();
}

// 修改鼠标状态
function setInteractionCursor(enabled: boolean) {
  if (!mapElement.value) return;

  mapElement.value.style.cursor = enabled ? 'crosshair' : '';
}

function selectFeature(
  options?: SelectFeatureOptions,
) {
  if (interaction) {
    cancelInteraction();
  }

  interaction = 'select';

  selectController.start(options);
}

function stopSelect() {
  selectController.stop();

  if (interaction === 'select') {
    interaction = undefined;
  }
}

function clearSelection() {
  selectController.clear();
}

function getSelectedFeatures() {
  return selectController.getSelectedFeatures();
}

onMounted(() => {
  map.setTarget(mapElement.value);
});

onBeforeUnmount(() => {
  cancelInteraction();

  mapEventController.destroy();

  map.setTarget(undefined);
  interaction = undefined;
});

defineExpose<GMapExpose>({
  addPoint: mapFeatureController.addPoint,
  removeFeature: mapFeatureController.removeFeature,
  clearPoints: mapFeatureController.clearPoints,
  pickPoint,
  pickFeature,
  drawLineString,
  drawPolygon,
  drawCircle,
  cancelInteraction,
  selectFeature,
  stopSelect,
  clearSelection,
  getSelectedFeatures,
})
</script>

<template>
  <div ref="mapElement" class="g-map">
    <slot />
  </div>
</template>

<style scoped>
.g-map {
  width: 100%;
  height: 500px;
}
</style>
