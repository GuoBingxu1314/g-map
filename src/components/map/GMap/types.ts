import type { PointStyleOptions } from '@/styles/point';
import type { PickFeatureOptions } from '@/core/interaction/pick';
import type {
  DrawCircleResult,
  DrawLineStringResult,
  DrawPolygonResult,
  StartDrawOptions
} from '@/core/interaction/draw';
import type { SelectFeatureOptions } from '@/core/map/select';

import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Geometry from 'ol/geom/Geometry';

export type InteractionType = 'pick-point' | 'pick-feature' | 'draw-linestring' | 'draw-polygon' | 'draw-circle' | 'select';

export interface GMapExpose {
  addPoint(coordinates: [number, number], options?: PointStyleOptions): Feature<Point>;
  removeFeature(feature: Feature): boolean;
  clearPoints(): void;
  pickPoint(): Promise<[number, number]>;
  pickFeature<T extends Geometry = Geometry>(
    options?: PickFeatureOptions<T>,
  ): Promise<Feature<T>>;
  drawLineString(options?: StartDrawOptions): Promise<DrawLineStringResult>;
  drawPolygon(options?: StartDrawOptions): Promise<DrawPolygonResult>;
  drawCircle(options?: StartDrawOptions): Promise<DrawCircleResult>;
  cancelInteraction(): void;
  selectFeature(options?: SelectFeatureOptions): void;
  stopSelect(): void;
  clearSelection(): void;
  getSelectedFeatures(): Feature[];
}
