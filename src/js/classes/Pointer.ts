import * as THREE from 'three';
import { Vector3, WebXRController } from 'three';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';
import { config, LAYERS } from '../config';
import { camera, renderer, scene, pointableObjects, xrSession, grippableObjects, registerUpdateFunction, unregisterUpdateFunction } from '../setup';

let activePointer: Pointer = null;

const controllerModelFactory = new XRControllerModelFactory();

export class Pointer {
    laser: THREE.Line;
    inputSource: XRInputSource;
    raySpace: THREE.XRTargetRaySpace;
    gripSpace: THREE.XRGripSpace;
    hoverIntersectionsBuffer: THREE.Intersection[];


    private static gripRayDistance = 0.06;
    private static gripRaySphereVertices = new THREE.IcosahedronGeometry(Pointer.gripRayDistance, 2).getAttribute("position").array;
    private static pointRaycaster = new THREE.Raycaster();
    private static gripRayCaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0,0,1), 0, Pointer.gripRayDistance);


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

        this.raySpace.addEventListener("connected", (e) => {
            this.inputSource = e.data;
            registerUpdateFunction(this.update, this)
        })

        this.raySpace.addEventListener("disconnected", (e) => {
            unregisterUpdateFunction(this.update)
        })

        this.raySpace.matrixAutoUpdate = true;
        this.gripSpace.matrixAutoUpdate = true;

        scene.add(this.gripSpace);
        scene.add(this.raySpace);

        this.raySpace.add(this.laser);
        this.gripSpace.add(controllerModelFactory.createControllerModel(this.gripSpace));

        if (activePointer) activePointer.laser.visible = false;
        activePointer = this;
        this.laser.visible = true;

        if (config.showGripRays) {
            for (let i = 0; i < Pointer.gripRaySphereVertices.length; i += 3) {
                const v = new Vector3(Pointer.gripRaySphereVertices[i], Pointer.gripRaySphereVertices[i + 1], Pointer.gripRaySphereVertices[i + 2]).normalize();
                const lineGeo = new THREE.BufferGeometry().setFromPoints([new Vector3(), v.multiplyScalar(Pointer.gripRayDistance)]);
                const line = new THREE.Line(lineGeo, Pointer.laserMat)
                this.gripSpace.add(line)
            }
        }

        this.gripSpace.addEventListener('squeezestart', (e: THREE.Event) => {
            this.dispatchInputEventToIntersections(e, this.getGripSphereIntersections());
        });

        this.gripSpace.addEventListener('squeezeend', (e: THREE.Event) => {
            this.dispatchInputEventToIntersections(e, this.getGripSphereIntersections());
        });

        this.raySpace.addEventListener('select', (e: THREE.Event) => {
            if (this !== activePointer) {
                activePointer.laser.visible = false;
                activePointer = this;
                this.laser.visible = true;
                return;
            }
            this.dispatchInputEventToIntersections(e, this.getRayIntersections());
        });

        this.raySpace.addEventListener('selectstart', (e: THREE.Event) => {
            if (this !== activePointer) {
                return;
            }
            (<THREE.LineBasicMaterial>this.laser.material).color = new THREE.Color(0xff0000);
            this.dispatchInputEventToIntersections(e, this.getRayIntersections());
        });

        this.raySpace.addEventListener('selectend', (e: THREE.Event) => {
            if (this !== activePointer) {
                return;
            }
            (<THREE.LineBasicMaterial>this.laser.material).color = new THREE.Color(0x00ff00);
            this.dispatchInputEventToIntersections(e, this.getRayIntersections());
        });
        console.log(this)
    }

    dispatchInputEventToIntersections(e: THREE.Event, intersections:THREE.Intersection[]) {
        intersections.forEach((intersect) => {
            intersect.object.dispatchEvent({ type: e.type, target: intersect.object, dispatcher: this });
        });
    }

    dispatchHoverEvents() {
        const newIntersections = this.getRayIntersections();


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

    getRayIntersections(objects = pointableObjects) {
        const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(this.raySpace.quaternion);
        Pointer.pointRaycaster.set(this.raySpace.position, dir);

        const intersections = Pointer.pointRaycaster.intersectObjects(objects, true)

        return intersections;
    }

    getGripSphereIntersections(objects = grippableObjects) {
        let intersections;
        let v = new Vector3();
        for (let i = 0; i < Pointer.gripRaySphereVertices.length; i += 3) {
            v.set(Pointer.gripRaySphereVertices[i], Pointer.gripRaySphereVertices[i + 1], Pointer.gripRaySphereVertices[i + 2]).normalize();
            Pointer.gripRayCaster.set(this.gripSpace.position, v);

            intersections = Pointer.gripRayCaster.intersectObjects(objects, true)
            if (intersections.length)
                break;
        }

        return intersections;
    }

    update(thisArg:Pointer) {
        if (thisArg === activePointer) thisArg.dispatchHoverEvents();
    }

    pulse(): void {
        const haptic = this.inputSource.gamepad.hapticActuators?.[0];

        if (haptic) {
            // @ts-ignore
            haptic.pulse(0.5, 5)
        }
    }
}
