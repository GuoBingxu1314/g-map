export * from './components';

export {
  install,
  GMapPlugin,
} from './install';

// Feature events
export type {
  GFeatureEvent,
  FeatureEvents,
} from './context/feature/events';

// Styles
export type { PointStyleOptions, ResolvedPointStyleOptions } from './styles/point';
export type { IconStyleOptions } from './styles/icon';
export type { LineStringStyleOptions } from './styles/line';
export type { PolygonStyleOptions } from './styles/polygon';
export type { CircleStyleOptions } from './styles/circle';
export type { SelectStyleOptions } from './styles/select';
export type { DrawStyleOptions } from './styles/draw';

// Interaction & map controllers
export type {
  Coordinate,
  DrawType,
  StartDrawOptions,
  DrawLineStringResult,
  DrawPolygonResult,
  DrawCircleResult,
} from './core/interaction/draw';
export type { PickFeatureOptions } from './core/interaction/pick';
export type { SelectFeatureOptions } from './core/map/select';
