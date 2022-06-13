export const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};

export let headTracking = false;
export const setHeadTracking = (bool) => (headTracking = bool);

export const LAYERS = {
    GLOBAL: 0,
    CONTROLLER: 1,
    RAYCASTABLE: 2,
    UI: 2,
};
