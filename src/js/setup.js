import GUI from 'lil-gui';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {VRButton} from 'three/examples/jsm/webxr/VRButton.js';
import * as THREE from 'three';
import {sizes} from './config';

export const gui = new GUI();

export const canvas = document.querySelector('canvas.webgl');

export const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
export const worldCamera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);

const controls = new OrbitControls(camera, canvas);

// Scene
export const scene = new THREE.Scene();
export const uiSpace = new THREE.Group();
uiSpace.renderOrder = 999;

//
export const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
});

export let xrSession;

export function setup() {
    scene.add(uiSpace);
    controls.update();

    // Camera
    camera.position.z = 0;
    camera.position.y = 1.8;
    scene.add(camera);
    worldCamera.position.y = 5;
    worldCamera.lookAt(0, 0, 0);

    // Renderer

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.xr.enabled = true;
    document.body.appendChild(VRButton.createButton(renderer));

    renderer.xr.addEventListener("sessionstart", (e)=>{
        xrSetup();
    })
}

export function xrSetup() {
    xrSession = renderer.xr.getSession();
    console.log(xrSession);
    renderer.setPixelRatio(window.devicePixelRatio);
}
