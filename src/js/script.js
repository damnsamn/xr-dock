import '../style.css';
import * as THREE from 'three';
import {LineBasicMaterial} from 'three';
import {Pointer} from './classes/Pointer';
import {Dock} from './classes/Dock';
import {canvas, manager, scene, uiSpace, camera, worldCamera, setup, renderer, xrSetup} from './setup';
import {sizes} from './config';
import {AmbientLight} from 'three';


manager.onLoad = () => {
    const dock = new Dock();
    uiSpace.add(dock);

    const meterGeometry = new THREE.PlaneBufferGeometry(1, 1);
    const meterMaterial = new THREE.MeshNormalMaterial();
    const meterPlane = new THREE.Mesh(meterGeometry, meterMaterial);
    meterPlane.rotateX(-Math.PI / 2);
    scene.add(meterPlane);

    const axesHelper = new THREE.AxesHelper();
    scene.add(axesHelper);

    const controller1 = new Pointer(0, scene);
    const controller2 = new Pointer(1, scene);

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
};
