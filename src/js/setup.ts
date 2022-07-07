import GUI from 'lil-gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import * as THREE from 'three';
import { config, setHeadTracking, sizes } from './config';
import { WebXRController } from 'three';
import { Pointer } from './classes/Pointer';

THREE.Cache.enabled = true;

export const gui = new GUI();

export const manager = new THREE.LoadingManager();

export const canvas: HTMLElement = document.querySelector('canvas.webgl');

export const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
export const worldCamera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);

const controls = new OrbitControls(camera, canvas);

// Scene
export const scene = new THREE.Scene();
export const headSpace = new THREE.Group();
headSpace.scale.set(0.01, 0.01, 0.01);


export const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
});

export const pointableObjects: THREE.Object3D[] = [];
export function makePointable(object: THREE.Object3D) {
    pointableObjects.push(object)
}

export const grippableObjects: THREE.Object3D[] = [];
export function makeGrippable(object: THREE.Mesh) {
    //@ts-ignore
    object.material.setValues({ side: THREE.DoubleSide });
    grippableObjects.push(object)
}

type FnObject = {
    fn:Function,
    args: any[]
}
export const updateFunctions: FnObject[] = [];
export function registerUpdateFunction(fn: Function, ...args: any) {
    updateFunctions.push({fn, args});
}
export function unregisterUpdateFunction(fn: Function) {
    const i = updateFunctions.findIndex(it => it.fn === fn);
    if (i !== -1)
        updateFunctions.splice(i, 1);
}

export let xrSession: XRSession;
export let pointers: Pointer[] = [];

function setupPointers() {
    pointers.push(new Pointer(0, scene))
    pointers.push(new Pointer(1, scene))
}

export function setup() {
    gui.add(config, "comeHither")
    gui.add(config, "showGripRays")

    scene.add(headSpace)
    scene.background = new THREE.Color(0x0a0a0a);

    controls.update();

    setHeadTracking(false);

    // Camera
    camera.position.z = 1;
    camera.position.y = 0.5;
    scene.add(camera);
    worldCamera.position.y = 2;
    worldCamera.lookAt(0, 0, 0);

    // Renderer

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.xr.enabled = true;
    renderer.shadowMap.enabled = true;
    renderer.autoClear = false;
    document.body.appendChild(VRButton.createButton(renderer));

    renderer.xr.addEventListener('sessionstart', (e) => {
        xrSetup();
    });
}

export function xrSetup() {
    xrSession = renderer.xr.getSession();
    // renderer.xr.setFoveation(0)

    setupPointers();


    setHeadTracking(true);

    renderer.setPixelRatio(window.devicePixelRatio);
}
