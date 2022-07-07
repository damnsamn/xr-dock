import '../style.css';
import * as THREE from 'three';
import { Pointer } from './classes/Pointer';
import { Dock } from './classes/Dock';
import { canvas, manager, scene, camera, worldCamera, setup, renderer, xrSetup, headSpace, pointers, gui, updateFunctions } from './setup';
import { config, LAYERS, setHeadTracking, sizes } from './config';
import gsap from 'gsap';
import { Button } from './classes/Button';
import { MenuPanel } from './classes/MenuPanel';
import { HandCrank } from './classes/Controls/HandCrank';




// Add Lee
const leeTex = new THREE.TextureLoader(manager).load("lee.png")
const leeMat = new THREE.MeshBasicMaterial({
    map: leeTex,
    transparent: true
});
const leeGeo = new THREE.PlaneGeometry(0.995, 1.778);
const leeMesh = new THREE.Mesh(leeGeo, leeMat);
leeMesh.position.y = 1.778 / 2;
leeMesh.position.z = -200;
leeMesh.visible = false;
scene.add(leeMesh);
gui.add(leeMesh, "visible").name("What's this?")





const dock = new Dock();
dock.addButton(
    new Button({
        name: 'test1',
        color: 0xf5f5f5,
        iconPath: config.headTracking ? '/icons/locked.svg' : '/icons/unlocked.svg',
        onSelectStart: (e) => {
            setHeadTracking(!config.headTracking);
            e.target.setIcon(config.headTracking ? '/icons/locked.svg' : '/icons/unlocked.svg');
        }
    }),
);
dock
    .addMenu(
        new Button({
            name: 'triangle',
            color: 0x75ff5f,
            iconPath: "/icons/triangle.svg",
        }),
        new MenuPanel()
    )
    .addMenu(
        new Button({
            name: 'circle',
            color: 0xff5f5f,
            iconPath: "/icons/circle.svg",
        }),
        new MenuPanel()
    )
    .addMenu(
        new Button({
            name: 'cross',
            color: 0x5f82ff,
            iconPath: "/icons/cross.svg",
        }),
        new MenuPanel(
            new HandCrank(leeMesh.position, "z"),
        )
    )
    .addMenu(
        new Button({
            name: 'square',
            color: 0xFF9549,
            iconPath: "/icons/square.svg",
        }),
        new MenuPanel()
    )

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

headSpace.add(uiLight);

headSpace.position.set(0, 0.6, 1);

const meterGeometry = new THREE.PlaneGeometry(1, 1);
const meterMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });
const meterPlane = new THREE.Mesh(meterGeometry, meterMaterial);
meterPlane.receiveShadow = true;
meterPlane.rotateX(-Math.PI / 2);
const gridHelper = new THREE.GridHelper(10, 20, 0xffffff, 0x555555);
scene.add(meterPlane, gridHelper);

const axesHelper = new THREE.AxesHelper();
scene.add(axesHelper);

gridHelper.position.y = -0.002;
axesHelper.position.y = 0.001;

const light = new THREE.AmbientLight(new THREE.Color(0xffffff), 1);
scene.add(light);


window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(window.devicePixelRatio);
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
});

function updateHeadSpace() {
    headSpace.position.lerp(camera.position, 0.1);
    headSpace.quaternion.slerp(camera.quaternion, 0.1);
}



setup();

function render() {
    gsap.ticker.tick();

    if (config.headTracking)
        updateHeadSpace();



    for (let i = 0; i < updateFunctions.length; i++) updateFunctions[i].fn(...updateFunctions[i].args);


    if (renderer.xr.isPresenting) {
        renderer.render(scene, camera);
        return;
    }
    renderer.render(scene, camera);
}

// window.requestAnimationFrame(render);

renderer.setAnimationLoop(function () {
    render();
});