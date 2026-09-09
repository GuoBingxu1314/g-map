import type { App, Plugin } from 'vue';

import {
  GMap,
  GView,
  GTileLayer,
  GVectorLayer,
  GOsmSource,
  GVectorSource,
  GFeature,
  GPoint,
  GLineString,
  GPolygon,
  GCircle,
} from './components';

const components = [
  GMap,
  GView,
  GTileLayer,
  GVectorLayer,
  GOsmSource,
  GVectorSource,
  GFeature,
  GPoint,
  GLineString,
  GPolygon,
  GCircle,
];

export function install(app: App) {
  components.forEach(component => {
    app.component(
      component.name!,
      component,
    );
  });
}

export const GMapPlugin: Plugin = {
  install,
};
