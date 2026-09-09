import type { InjectionKey } from 'vue';

import type Map from 'ol/Map';
import type View from 'ol/View';
import type TileLayer from 'ol/layer/Tile';
import type Source from 'ol/source/Source';
import type VectorLayer from 'ol/layer/Vector';
import type VectorSource from 'ol/source/Vector';
import type Feature from 'ol/Feature';

export const MAP_KEY: InjectionKey<Map> = Symbol('GMap');
export const VIEW_KEY: InjectionKey<View> = Symbol('GView');
export const TILE_LAYER_KEY: InjectionKey<TileLayer> = Symbol('GTileLayer');
export const VECTOR_LAYER_KEY: InjectionKey<VectorLayer> = Symbol('GVectorLayer');
export const VECTOR_SOURCE_KEY: InjectionKey<VectorSource> = Symbol('GVectorSource');
export const FEATURE_KEY: InjectionKey<Feature> = Symbol('GFeature');

