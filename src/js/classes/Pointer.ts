import * as THREE from 'three';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';
import { LAYERS } from '../config';
import { camera, renderer, scene, uiScene } from '../setup';

let activePointer: Pointer = null;

const controllerModelFactory = new XRControllerModelFactory();
const raycaster = new THREE.Raycaster();
raycaster.layers.set(LAYERS.RAYCASTABLE);

export class Pointer {
    laser: THREE.Line;
    raySpace: THREE.XRTargetRaySpace;
    gripSpace: THREE.XRGripSpace;
    hoverIntersectionsBuffer: THREE.Intersection[];


    static laserPoints = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -5)];
    static laserGeo = new THREE.BufferGeometry().setFromPoints(Pointer.laserPoints);
    static laserMat = new THREE.LineBasicMaterial({ color: 0x00ff00 });

    /**
     * @param index Passed directly to WebXRManager.getController() and WebXRManager.getControllerGrip()
     * @param scene Which scene should we add to
     */
    constructor(index: number, scene: THREE.Scene) {
        this.laser = new THREE.Line(Pointer.laserGeo, Pointer.laserMat);
        this.raySpace = renderer.xr.getController(index);
        this.raySpace.layers.set(LAYERS.CONTROLLER);
        this.gripSpace = renderer.xr.getControllerGrip(index);
        this.hoverIntersectionsBuffer = [];
        console.log(this.raySpace)

        scene.add(this.gripSpace);
        uiScene.add(this.raySpace);

        this.raySpace.add(this.laser);
        this.gripSpace.add(controllerModelFactory.createControllerModel(this.gripSpace));

        if (activePointer) activePointer.laser.visible = false;
        activePointer = this;
        this.laser.visible = true;

        this.raySpace.addEventListener('select', (e: THREE.Event) => {
            if (this !== activePointer) {
                activePointer.laser.visible = false;
                activePointer = this;
                this.laser.visible = true;
                return;
            }
            this.handleSelect(e);
        });

        this.raySpace.addEventListener('selectstart', (e: THREE.Event) => {
            if (this !== activePointer) {
                return;
            }
            (<THREE.LineBasicMaterial>this.laser.material).color = new THREE.Color(0xff0000);
        });

        this.raySpace.addEventListener('selectend', (e: THREE.Event) => {
            if (this !== activePointer) {
                return;
            }
            (<THREE.LineBasicMaterial>this.laser.material).color = new THREE.Color(0x00ff00);
        });
    }

    handleSelect(e: THREE.Event) {
        const intersections = this.getRayIntersections();

        intersections.forEach((intersect) => {
            intersect.object.dispatchEvent({ type: 'select', target: intersect.object });
        });
    }

    dispatchHoverEvents() {
        const newIntersections = this.getRayIntersections();
        // console.log(newIntersections)

        this.hoverIntersectionsBuffer.forEach((intersect) => {
            const match = newIntersections.find((item) => item.object.uuid === intersect.object.uuid);
            if (!match)
                intersect.object.dispatchEvent({ type: 'pointerleave', target: intersect.object, dispatcher: this });
        });

        newIntersections.forEach((intersect) => {
            const match = this.hoverIntersectionsBuffer.find((item) => item.object.uuid === intersect.object.uuid);
            if (!match)
                intersect.object.dispatchEvent({ type: 'pointerenter', target: intersect.object, dispatcher: this });
        });

        this.hoverIntersectionsBuffer = newIntersections;
    }

    getRayIntersections(objects = [...scene.children, ...uiScene.children]) {
        const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(this.raySpace.quaternion);
        raycaster.set(this.raySpace.position, dir);

        return raycaster.intersectObjects(objects);
    }

    updatePos() {
        if (this === activePointer) this.dispatchHoverEvents();
        // this.rotationBuffer.push(this.raySpace.rotation);
        // if (this.rotationBuffer.length > Pointer.rotationBufferLength) {
        //     this.rotationBuffer.shift();
        // }
        this.raySpace.updateMatrix();
    }
}