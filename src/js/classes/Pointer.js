import * as THREE from 'three';
import {XRControllerModelFactory} from 'three/examples/jsm/webxr/XRControllerModelFactory.js';
import {LAYERS} from '../config';
import {renderer, scene} from '../setup';

let activePointer = null;

const controllerModelFactory = new XRControllerModelFactory();
const raycaster = new THREE.Raycaster();
raycaster.layers.set(LAYERS.RAYCASTABLE);

export class Pointer {
    static laserPoints = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -5)];
    static laserGeo = new THREE.BufferGeometry().setFromPoints(Pointer.laserPoints);
    static laserMat = new THREE.LineBasicMaterial({color: 0x00ff00});

    /**
     * @param {number} index Passed directly to WebXRManager.getController() and WebXRManager.getControllerGrip()
     * @param {THREE.Scene} scene Which scene should we add to
     */
    constructor(index, scene) {
        this.laser = new THREE.Line(Pointer.laserGeo, Pointer.laserMat);
        this.group = renderer.xr.getController(index);
        this.group.layers.set(LAYERS.CONTROLLER);
        this.grip = renderer.xr.getControllerGrip(index);
        this.hoverIntersectionsBuffer = [];

        scene.add(this.group, this.grip);

        this.group.add(this.laser);
        this.grip.add(controllerModelFactory.createControllerModel(this.grip));

        if (activePointer) activePointer.laser.visible = false;
        activePointer = this;
        this.laser.visible = true;
        this.group.addEventListener('select', (e) => {
            if (this !== activePointer) {
                activePointer.laser.visible = false;
                activePointer = this;
                this.laser.visible = true;
                return;
            }
            this.handleSelect(e);
        });
    }

    handleSelect(e) {

        const intersections = this.getRayIntersections();

        intersections.forEach((intersect) => {
            intersect.object.dispatchEvent({type: 'select', target: intersect.object});
        });
    }

    dispatchHoverEvents() {
        const newIntersections = this.getRayIntersections();

        this.hoverIntersectionsBuffer.forEach((intersect) => {
            const match = newIntersections.find(item=>item.object.uuid === intersect.object.uuid);
            if(!match)
                intersect.object.dispatchEvent({type: 'pointerleave', target: intersect.object});
        });

        newIntersections.forEach((intersect) => {
            const match = this.hoverIntersectionsBuffer.find(item=>item.object.uuid === intersect.object.uuid);
            if(!match)
                intersect.object.dispatchEvent({type: 'pointerenter', target: intersect.object});
        });

        this.hoverIntersectionsBuffer = newIntersections;

    }

    getRayIntersections(objects = scene.children) {
        const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(this.group.quaternion);
        raycaster.set(this.group.position, dir);

        return raycaster.intersectObjects(objects);
    }

    updatePos() {
        this.dispatchHoverEvents()
        // this.rotationBuffer.push(this.group.rotation);
        // if (this.rotationBuffer.length > Pointer.rotationBufferLength) {
        //     this.rotationBuffer.shift();
        // }
        // console.log(this.group.position)
        this.group.updateMatrix();
    }
}
