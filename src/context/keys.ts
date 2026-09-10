import type { InjectionKey } from 'vue';

import type Map from 'ol/Map';
import type View from 'ol/View';
import type TileLayer from 'ol/layer/Tile';
import type VectorLayer from 'ol/layer/Vector';
import type VectorSource from 'ol/source/Vector';
import type Feature from 'ol/Feature';
import type { FeatureGeometryController } from '@/context/feature/geometry.ts';
import type { FeatureStyleController } from '@/context/feature/style.ts';

export const MAP_KEY: InjectionKey<Map> = Symbol('GMap');
export const VIEW_KEY: InjectionKey<View> = Symbol('GView');
export const TILE_LAYER_KEY: InjectionKey<TileLayer> = Symbol('GTileLayer');
export const VECTOR_LAYER_KEY: InjectionKey<VectorLayer> = Symbol('GVectorLayer');
export const VECTOR_SOURCE_KEY: InjectionKey<VectorSource> = Symbol('GVectorSource');
export const FEATURE_KEY: InjectionKey<Feature> = Symbol('GFeature');
export const FEATURE_GEOMETRY_KEY: InjectionKey<FeatureGeometryController> = Symbol('GFeatureGeometry');
export const FEATURE_STYLE_KEY: InjectionKey<FeatureStyleController> = Symbol('GFeatureStyle');

