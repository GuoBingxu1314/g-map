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

组件遵循嵌套结构：`GMap → Layer → Source → GFeature → 几何`。

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
