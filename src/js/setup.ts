import GUI from 'lil-gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import * as THREE from 'three';
import { setHeadTracking, sizes } from './config';
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
export const uiScene = new THREE.Scene();
export const headSpace = new THREE.Group();
headSpace.scale.set(0.01,0.01,0.01);


export const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
});

export let xrSession: XRSession;
export let pointers: Pointer[] = [];

function setupPointers() {
    pointers.push(new Pointer(0, scene))
    pointers.push(new Pointer(1, scene))
}

export function setup() {
    uiScene.add(headSpace)
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

    setupPointers();


    setHeadTracking(true);

    renderer.setPixelRatio(window.devicePixelRatio);
}
