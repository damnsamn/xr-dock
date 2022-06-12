import '../style.css';
import * as THREE from 'three';
import {LineBasicMaterial} from 'three';
import {Pointer} from './classes/Pointer';
import {Dock} from './classes/Dock';
import {canvas, scene, uiSpace, camera, worldCamera, setup, renderer, xrSetup} from './setup';
import {sizes} from './config';
import {AmbientLight} from 'three';
import {createClient} from '@liveblocks/client';
import {XRControllerModelFactory} from 'three/examples/jsm/webxr/XRControllerModelFactory.js';

const controllerModelFactory = new XRControllerModelFactory();

const controller1 = new Pointer(0, scene);
const controller2 = new Pointer(1, scene);

const p2Grip1 = new THREE.Group();
const p2Grip1Mesh = controllerModelFactory.createControllerModel(controller1.grip);
// console.log(p2Grip1Mesh.material = new THREE.MeshBasicMaterial({color: 0xff0000}))
const p2Grip2 = new THREE.Group();
const p2Grip2Mesh = controllerModelFactory.createControllerModel(controller2.grip);
// console.log(p2Grip2Mesh.material = new THREE.MeshBasicMaterial({color: 0xff0000}))
p2Grip1.add(p2Grip1Mesh);
p2Grip2.add(p2Grip2Mesh);
scene.add(p2Grip1, p2Grip2);

// Create a liveblocks client
const client = createClient({
    publicApiKey: process.env.LIVEBLOCKS_API_KEY,
});
const room = client.enter('xr-dock');

room.subscribe('others', (others) => {
    if (others.count) {
        const otherPresence = others.toArray()[0].presence;

        p2Grip1.position.set(
            otherPresence.grip1.position.x,
            otherPresence.grip1.position.y,
            otherPresence.grip1.position.z,
        );
        p2Grip1.quaternion.set(
            otherPresence.grip1.quaternion._x,
            otherPresence.grip1.quaternion._y,
            otherPresence.grip1.quaternion._z,
            otherPresence.grip1.quaternion._w,
        );
        // p2Grip

        p2Grip2.position.set(
            otherPresence.grip2.position.x,
            otherPresence.grip2.position.y,
            otherPresence.grip2.position.z,
        );
        p2Grip2.quaternion.set(
            otherPresence.grip2.quaternion._x,
            otherPresence.grip2.quaternion._y,
            otherPresence.grip2.quaternion._z,
            otherPresence.grip2.quaternion._w,
        );
    }
});

const dock = new Dock();
uiSpace.add(dock);

const meterGeometry = new THREE.PlaneBufferGeometry(1, 1);
const meterMaterial = new THREE.MeshNormalMaterial();
const meterPlane = new THREE.Mesh(meterGeometry, meterMaterial);
meterPlane.rotateX(-Math.PI / 2);
scene.add(meterPlane);

const axesHelper = new THREE.AxesHelper();
scene.add(axesHelper);

const light = new AmbientLight(new THREE.Color(0xffffff), 1);
scene.add(light);

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(window.devicePixelRatio);
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
});

function updateDockPos() {
    uiSpace.position.copy(camera.position);
    const deltaAngle = uiSpace.quaternion.angleTo(camera.quaternion);
    uiSpace.quaternion.rotateTowards(camera.quaternion, deltaAngle / 10);
}

setup();

function render() {
    updateDockPos();
    controller1.updatePos();
    controller2.updatePos();
    room.updatePresence({
        grip1: {position: {...controller1.grip.position}, quaternion: {...controller1.grip.quaternion}},
        grip2: {position: {...controller2.grip.position}, quaternion: {...controller2.grip.quaternion}},
    });

    if (renderer.xr.isPresenting) {
        renderer.render(scene, camera);
        return;
    }
    scene.background = new THREE.Color(0x000000);
    renderer.setViewport(0, 0, sizes.width, sizes.height);
    renderer.setScissor(0, 0, sizes.width, sizes.height);
    renderer.setScissorTest(true);
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);

    scene.background = new THREE.Color(0x0f0f0f);
    let w = sizes.width / 4;
    let h = sizes.height / 4;
    renderer.setViewport(sizes.width - w, 0, w, h);
    renderer.setScissor(sizes.width - w, 0, w, h);
    renderer.setScissorTest(true);
    worldCamera.aspect = w / h;
    worldCamera.updateProjectionMatrix();
    renderer.render(scene, worldCamera);
}

window.requestAnimationFrame(render);

renderer.setAnimationLoop(function () {
    render();
});
