# g-map

基于 [OpenLayers](https://openlayers.org/) 的声明式 Vue 3 地图组件库。用组件化的方式描述地图、图层、数据源与要素，把命令式的 OL API 封装成直观的模板语法。

## 安装

```bash
pnpm add g-map ol
# 或
npm install g-map ol
```

> `ol` 与 `vue` 为 peerDependencies，需自行安装。
>
> 地图控件（缩放、版权署名等）依赖 OpenLayers 的样式，请在应用入口引入一次：
>
> ```ts
> import 'ol/ol.css';
> ```

## 快速开始

### 全局注册

```ts
import { createApp } from 'vue';
import { GMapPlugin } from 'g-map';
import 'g-map/style.css';
import App from './App.vue';

createApp(App).use(GMapPlugin).mount('#app');
```

### 按需引入

```vue
<script setup lang="ts">
import { GMap, GView, GTileLayer, GOsmSource } from 'g-map';
import 'g-map/style.css';
</script>

<template>
  <GMap>
    <GView :center="[116.39, 39.9]" :zoom="10" />
    <GTileLayer>
      <GOsmSource />
    </GTileLayer>
  </GMap>
</template>
```

## 组件

| 组件 | 说明 |
| --- | --- |
| `GMap` | 地图容器，通过 `ref` 暴露交互方法 |
| `GView` | 视图（中心点、缩放、旋转），支持 `v-model:center` / `v-model:zoom` |
| `GTileLayer` | 瓦片图层 |
| `GVectorLayer` | 矢量图层 |
| `GOsmSource` | OpenStreetMap 数据源 |
| `GVectorSource` | 矢量数据源 |
| `GFeature` | 要素，绑定点击 / 双击 / 悬停 / 选中等事件 |
| `GPoint` | 点几何（支持圆点、图标、`#icon` 插槽自定义 SVG） |
| `GLineString` | 线几何 |
| `GPolygon` | 面几何 |
| `GCircle` | 圆几何 |
| `GMassPoints` | 海量点（WebGL 数据驱动，承载数万~百万点，与普通点共用地图级交互） |

组件遵循嵌套结构：`GMap → Layer → Source → GFeature → 几何`。海量点为独立的顶层组件（`GMap → GMassPoints`），数据驱动，无需嵌套图层 / 数据源。

### GMap 属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `attribution` | `boolean` | `true` | 是否显示版权署名（Attribution）控件 |

## 版权署名与 OpenStreetMap 使用政策

`GMap` 默认开启 OpenLayers 的 **Attribution 控件**。当使用 `GOsmSource`（OpenStreetMap 瓦片）时，地图右下角会自动显示：

```html
<li>© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors.</li>
```

请务必注意：

- OpenStreetMap 官方瓦片服务遵循 [Tile Usage Policy](https://operations.osmfoundation.org/policies/tiles/)，**要求在使用其瓦片时展示上述署名**，请勿移除。
- 该政策**禁止**在生产环境大规模或商业性地直接请求 OSM 官方瓦片服务器。生产项目请自备瓦片源或使用商业瓦片服务。
- 若你已在页面其他位置自行提供署名，可通过 `:attribution="false"` 关闭内置控件：

```vue
<GMap :attribution="false">
  <!-- ... -->
</GMap>
```

## 要素与几何示例

```vue
<template>
  <GMap>
    <GView :center="[116.39, 39.9]" :zoom="10" />
    <GTileLayer>
      <GOsmSource />
    </GTileLayer>
    <GVectorLayer>
      <GVectorSource>
        <GFeature @click="onClick">
          <GPoint :coordinates="[116.39, 39.9]" color="#ff0000" :radius="8" />
        </GFeature>
      </GVectorSource>
    </GVectorLayer>
  </GMap>
</template>
```

## GMap 暴露的方法

通过模板 `ref` 获取地图实例后调用：

```ts
const mapRef = ref<InstanceType<typeof GMap>>();

// 命令式加点
mapRef.value?.addPoint([116.39, 39.9], { color: '#1890ff', radius: 6 });

// 交互（返回 Promise，可用 cancelInteraction 取消）
const coord = await mapRef.value!.pickPoint();
const line = await mapRef.value!.drawLineString();
const polygon = await mapRef.value!.drawPolygon();
const circle = await mapRef.value!.drawCircle();
const feature = await mapRef.value!.pickFeature();

// 选中
mapRef.value!.selectFeature({ multi: true });
const selected = mapRef.value!.getSelectedFeatures();
mapRef.value!.clearSelection();
mapRef.value!.stopSelect();
```

完整方法见类型 `GMapExpose`。

## 海量点（GMassPoints）

`GMassPoints` 走「数据驱动 + WebGL 单层渲染」通道，可流畅承载数万~百万点。它与普通点（`GFeature` / `GPoint`）**共用同一套地图级交互 API**——选中、取选中、清空、删除、hover 全部一致，开发者无需感知底层差异。

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { GMap, GView, GTileLayer, GOsmSource, GMassPoints } from 'g-map';
import type { MassPointItem } from 'g-map';

const mapRef = ref<InstanceType<typeof GMap>>();

// 数据项：{ id, coordinates: [lng, lat], ...业务字段 }
const data = ref<MassPointItem[]>([
  { id: 1, coordinates: [116.39, 39.9], level: 0 },
  { id: 2, coordinates: [116.4, 39.91], level: 1 },
]);

// 样式值可为字面量（所有点一致）或映射函数（逐点差异化，仅在数据/样式变化时求值一次）
const style = {
  radius: 5,
  color: (item: MassPointItem) => (item.level === 0 ? '#1677ff' : '#52c41a'),
};
</script>

<template>
  <GMap ref="mapRef">
    <GView :center="[116.39, 39.9]" :zoom="10" />
    <GTileLayer><GOsmSource /></GTileLayer>

    <GMassPoints
      :data="data"
      :style="style"
      :hover-style="{ point: { color: '#409eff', radius: 8 } }"
      :select-style="{ point: { color: '#ffd065', radius: 9 } }"
      @click="e => console.log(e.properties)"
    />
  </GMap>
</template>
```

### 属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `data` | `MassPointItem[]` | — | 海量点数据；替换数组即触发按 `id` 的增量更新 |
| `style` | `MassPointStyleMapping` | `{}` | 基础样式：圆点（`color/radius/strokeColor/strokeWidth/opacity`）或图标（`icon.*`）；值可为字面量或映射函数 |
| `hoverable` | `boolean` | `true` | 是否对本图层应用 hover 高亮（命中检测由地图级统一负责） |
| `hoverStyle` | `HoverStyleOptions` | 内置默认 | 悬停样式，结构与普通点 `GFeature` 完全一致 |
| `selectStyle` | `SelectStyleOptions` | 内置默认 | 选中样式，结构同 `hoverStyle` |
| `zIndex` | `number` | `100` | 图层层级 |

事件：`@click` / `@dblclick` / `@mouseenter` / `@mouseleave` / `@select` / `@unselect`，回调参数均为 `GFeatureEvent`（`event.properties` 为原始数据项，不含内部渲染属性）。

### 图标模式

提供 `style.icon.src` 即整层切换为图标模式。`src` 可为映射函数（逐点不同图标）——OL 的 `icon-src` 是图层级静态纹理，库内部会把用到的所有 URL **自动合成一张雪碧图**，逐点用索引取子图。图标为纹理无法换色，故 hover / select 表现为**放大**（由 `hoverStyle.point.icon.size` 相对基准尺寸推导）。

```ts
const iconStyle = {
  icon: {
    src: (item: MassPointItem) => `/icons/${item.level}.png`, // 逐点不同图标
    size: 32,
  },
};
```

### 交互：与普通点完全一致

```ts
// 选中（点击即选；multi 开启多选）——两种点通用
mapRef.value!.selectFeature({ multi: true });
// 取选中：Feature[]，同时包含普通点与海量点
const selected = mapRef.value!.getSelectedFeatures();
// 清空选中：一次清空两种点
mapRef.value!.clearSelection();
// 删除：两种点通用
mapRef.value!.removeFeature(feature);
```

> **约定**：命令式 `removeFeature(feature)` 删除声明式点（海量点 / `GFeature`）后，需同步更新数据源（海量点的 `:data`、`GFeature` 的 `v-for`），否则下次数据刷新会恢复该点。

## 迁移说明（破坏性变更）

海量点交互已统一为地图级驱动，以下旧用法失效：

| 旧用法（GMassPoints） | 新用法 |
| --- | --- |
| `:selectable` 开启选中 | `mapRef.selectFeature({ multi: true })`（多选传 `multi`） |
| `style` 内扁平字段 `hoverColor` / `hoverRadius` / `hoverScale` / `selectColor` / `selectRadius` / `selectScale` | 独立属性 `:hover-style` / `:select-style`（结构同普通点 `GFeature` 的 `hoverStyle` / `selectStyle`） |
| 组件 ref 的 `getSelected()` / `clearSelection()` | `mapRef.getSelectedFeatures(): Feature[]` / `mapRef.clearSelection()` |
| `:hit-tolerance` | 已移除；命中检测由地图级统一负责，暂不支持按图层单独设置命中容差 |

此外，海量点的选中 / hover / 事件现由地图级驱动；`@select` 等事件仍保留，回调参数仍为 `GFeatureEvent`。

## 类型导出

库导出了公共类型，便于 TypeScript 使用者引入：

```ts
import type {
  GMapExpose,
  GFeatureEvent,
  PointStyleOptions,
  LineStringStyleOptions,
  PolygonStyleOptions,
  CircleStyleOptions,
  MassPointItem,
  MassPointStyleMapping,
  HoverStyleOptions,
  SelectStyleOptions,
  SelectFeatureOptions,
  DrawStyleOptions,
} from 'g-map';
```

## 开发

```bash
pnpm build       # 构建产物到 dist
pnpm type-check  # 类型检查
```

## License

[MIT](./LICENSE)
