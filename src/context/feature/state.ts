import type Feature from 'ol/Feature';

interface State {
  selected: boolean;
}

const featureStates = new WeakMap<Feature, State>();

function getOrCreateState(feature: Feature): State {
  let state = featureStates.get(feature);

  if (!state) {
    state = {
      selected: false,
    };

    featureStates.set(feature, state);
  }

  return state;
}

export function isFeatureSelected(feature: Feature): boolean {
  return getOrCreateState(feature).selected;
}

export function setFeatureSelected(feature: Feature, selected: boolean) {
  getOrCreateState(feature).selected = selected;
}

export function removeFeatureState(feature: Feature) {
  featureStates.delete(feature);
}
