export const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};

export let headTracking = false;
export const setHeadTracking = (bool: boolean) => (headTracking = bool);

export const enum LAYERS {
    GLOBAL,
    CONTROLLER,
    RAYCASTABLE,
    UI,
};
