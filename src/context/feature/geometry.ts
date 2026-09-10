import type Feature from 'ol/Feature';
import type Geometry from 'ol/geom/Geometry';

export type GeometryOwner = symbol;

export interface FeatureGeometryController {
  registerGeometry(owner: symbol, geometry: Geometry, componentName: string): void;
  unregisterGeometry(owner: symbol, geometry: Geometry): void;
}

export function createFeatureGeometryController(feature: Feature): FeatureGeometryController {
  let geometryOwner: GeometryOwner | undefined;

  function registerGeometry(owner: GeometryOwner, geometry: Geometry, componentName: string) {
    // 单几何约束：已存在且不是自己 → 统一报错
    if (geometryOwner !== undefined && geometryOwner !== owner) {
      throw new Error(`[${componentName}] A GFeature can only contain one geometry`);
    }

    geometryOwner = owner;
    feature.setGeometry(geometry);
  }

  function unregisterGeometry(owner: GeometryOwner, geometry: Geometry) {
    // 归属校验：不是当前拥有者，什么都不做（避免误清替换后的几何）
    if (geometryOwner !== owner) return;

    geometryOwner = undefined;
    // feature 上的几何仍是自己那份才清空
    if (feature.getGeometry() === geometry) {
      feature.setGeometry(undefined);
    }
  }

  return {
    registerGeometry,
    unregisterGeometry
  }
}
