import * as THREE from 'three';
import {XRControllerModelFactory} from 'three/examples/jsm/webxr/XRControllerModelFactory.js';
import { LAYERS } from '../config';
import {renderer, scene} from '../setup';

let activePointer = null;

const controllerModelFactory = new XRControllerModelFactory();
const raycaster = new THREE.Raycaster();
raycaster.layers.set(LAYERS.RAYCASTABLE)

export class Pointer {
    static laserPoints = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -5)];
    static laserGeo = new THREE.BufferGeometry().setFromPoints(Pointer.laserPoints);
    static laserMat = new THREE.LineBasicMaterial({color: 0x00ff00});
    static rotationBufferLength = 1;

    /**
     * @param {number} index Passed directly to WebXRManager.getController() and WebXRManager.getControllerGrip()
     * @param {THREE.Scene} scene Which scene should we add to
     */
    constructor(index, scene) {
        this.laser = new THREE.Line(Pointer.laserGeo, Pointer.laserMat);
        this.group = renderer.xr.getController(index);
        this.group.layers.set(LAYERS.CONTROLLER)
        this.grip = renderer.xr.getControllerGrip(index);

        scene.add(this.group, this.grip);

        this.group.add(this.laser);
        this.grip.add(controllerModelFactory.createControllerModel(this.grip));
        this.rotationBuffer = new Array(Pointer.rotationBufferLength).fill(new THREE.Euler(), 0, -1);

        if (activePointer) activePointer.laser.visible = false;
        activePointer = this;
        this.laser.visible = true;

        this.group.addEventListener('selectstart', (e) => {
            if (this !== activePointer) return;
            this.handleSelectStart(e);
        });
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

    handleSelectStart(e) {
        console.log(e);
    }

    handleSelect(e) {
        console.log(e);
        console.log(this.group);

        const dir = new THREE.Vector3(0,0,-1).applyQuaternion(this.group.quaternion)
        console.log(dir)

        const arrowHelper = new THREE.ArrowHelper(dir, this.group.position);
        arrowHelper.layers.set(2)
        scene.add(arrowHelper)

        raycaster.set(this.group.position, dir);
        const intersects = raycaster.intersectObjects(scene.children);
        console.log({intersects});
        for (let i = 0; i < intersects.length; i++) {
            intersects[i].object.material = new THREE.MeshBasicMaterial({color: 0x00ffff})
        }
    }

    getRayIntersections() {

    }

    updatePos() {
        this.rotationBuffer.push(this.group.rotation);
        if (this.rotationBuffer.length > Pointer.rotationBufferLength) {
            this.rotationBuffer.shift();
        }
        // console.log(this.group.position)
        // this.artificialJitter();
        this.smoothRotation();
        this.group.updateMatrix();
        // console.log(this.rotationBuffer)
    }

    smoothRotation() {
        const smoothEuler = new THREE.Euler();
        this.rotationBuffer.forEach((euler) => {
            smoothEuler.x += euler.x;
            smoothEuler.y += euler.y;
            smoothEuler.z += euler.z;
        });
        smoothEuler.x /= Pointer.rotationBufferLength;
        smoothEuler.y /= Pointer.rotationBufferLength;
        smoothEuler.z /= Pointer.rotationBufferLength;

        this.group.rotation.copy(smoothEuler);
    }

    artificialJitter() {
        this.group.rotateX((Math.random() - 0.5) * 2 * 0.01);
        this.group.rotateY((Math.random() - 0.5) * 2 * 0.01);
        this.group.rotateZ((Math.random() - 0.5) * 2 * 0.01);
    }
}
