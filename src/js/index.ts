import '../style.css';
import * as THREE from 'three';
import { LineBasicMaterial } from 'three';
import { Pointer } from './classes/Pointer';
import { Dock } from './classes/Dock';
import { canvas, manager, scene, uiScene, camera, worldCamera, setup, renderer, xrSetup, headSpace } from './setup';
import { headTracking, LAYERS, setHeadTracking, sizes } from './config';
import { AmbientLight } from 'three';
import gsap from 'gsap';
import { Button } from './classes/Button';

const dock = new Dock();
dock.addButtons(
    new Button({
        name: 'test1',
        color: 0xf5f5f5,
        iconPath: headTracking ? '/icons/locked.svg' : '/icons/unlocked.svg',
        onSelect: (e) => {
            setHeadTracking(!headTracking);
            e.target.setIcon(headTracking ? '/icons/locked.svg' : '/icons/unlocked.svg');
        }
    }),
    new Button({
        name: 'triangle',
        color: 0x75ff5f,
        iconPath: "/icons/triangle.svg",
    }),
    new Button({
        name: 'circle',
        color: 0xff5f5f,
        iconPath: "/icons/circle.svg",
    }),
    new Button({
        name: 'cross',
        color: 0x5f82ff,
        iconPath: "/icons/cross.svg",
    }),
    new Button({
        name: 'square',
        color: 0xFF9549,
        iconPath: "/icons/square.svg",
    })
);
headSpace.add(dock);

const uiLight = new THREE.DirectionalLight(0xffffff, 0.5);
uiLight.castShadow = true;
uiLight.shadow.mapSize.width = 1024;
uiLight.shadow.mapSize.height = 1024;
uiLight.shadow.camera.near = 0.25;
uiLight.shadow.camera.far = 0.75;
uiLight.shadow.camera.top = 0.5;
uiLight.shadow.camera.left = -0.5;
uiLight.shadow.camera.right = 0.5;
uiLight.shadow.camera.bottom = -0.5;
uiLight.shadow.camera.layers.set(LAYERS.UI);
uiLight.shadow.radius = 6;
uiLight.position.copy(camera.position);
uiLight.position.z -= 0.5;
uiLight.target = dock;

const uiLightHelper = new THREE.CameraHelper(uiLight.shadow.camera);
headSpace.add(uiLight);
// scene.add(uiLightHelper);

headSpace.position.set(0, 0.6, 1);

const meterGeometry = new THREE.PlaneBufferGeometry(1, 1);
const meterMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });
const meterPlane = new THREE.Mesh(meterGeometry, meterMaterial);
meterPlane.receiveShadow = true;
meterPlane.rotateX(-Math.PI / 2);
scene.add(meterPlane);

const axesHelper = new THREE.AxesHelper();
scene.add(axesHelper);

const controller1 = new Pointer(0, scene);
const controller2 = new Pointer(1, scene);

const light = new AmbientLight(new THREE.Color(0xffffff), 1);
scene.add(light);
const uiAmbientLight = new AmbientLight(new THREE.Color(0xffffff), 1);
uiScene.add(uiAmbientLight);
// uiScene.add(light)

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(window.devicePixelRatio);
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
});

function updateHeadSpace() {
    headSpace.position.copy(camera.position);
    const deltaAngle = headSpace.quaternion.angleTo(camera.quaternion);
    headSpace.quaternion.rotateTowards(camera.quaternion, deltaAngle / 10);
}

setup();

function render() {
    gsap.ticker.tick();

    if (headTracking)
        updateHeadSpace();

    controller1.updatePos();
    controller2.updatePos();

    if (renderer.xr.isPresenting) {
        renderer.clear()
        renderer.render(scene, camera);
        // renderer.clearDepth();
        renderer.render(uiScene, camera);
        return;
    }
    scene.background = new THREE.Color(0x000000);
    renderer.setViewport(0, 0, sizes.width, sizes.height);
    renderer.setScissor(0, 0, sizes.width, sizes.height);
    renderer.setScissorTest(true);
    camera.updateProjectionMatrix();
    renderer.clear()
    renderer.render(scene, camera);
    // renderer.clearDepth();
    renderer.render(uiScene, camera);

    // scene.background = new THREE.Color(0x0f0f0f);
    // let w = sizes.width / 4;
    // let h = sizes.height / 4;
    // renderer.setViewport(sizes.width - w, 0, w, h);
    // renderer.setScissor(sizes.width - w, 0, w, h);
    // renderer.setScissorTest(true);
    // // uiLight.shadow.camera.aspect = w / h;
    // // uiLight.shadow.camera.updateProjectionMatrix();
    // renderer.render(scene, uiLight.shadow.camera);
}

window.requestAnimationFrame(render);

renderer.setAnimationLoop(function () {
    render();
});
// };
