export const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};

export const config = {
    headTracking: true,
    showGripRays: false,
    comeHither: true,
    "what's this?": false,
}

export const setHeadTracking = (bool: boolean) => (config.headTracking = bool);

export const enum LAYERS {
    GLOBAL,
    CONTROLLER,
    UI,
};
