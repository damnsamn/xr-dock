import * as THREE from "three";
import { AxesHelper } from "three";
import { LAYERS } from "../../config";
import { scene, makeGrippable, registerUpdateFunction, unregisterUpdateFunction } from "../../setup";
import { Squircle } from "../../shapes/Squircle";
import { Pointer } from "../Pointer";


export class HandCrank extends THREE.Group {
    worldPosition: THREE.Vector3;
    gripPosition: THREE.Vector3;
    angle: number;
    incrementPerRotation?: number;
    lastTickAngle: number;
    object: { [key: string]: any };
    property: string;
    gripper?: Pointer;

    constructor(object: object, property: string, incrementPerRotation: number = 10) {
        super();
        this.name = "HandCrank"
        this.worldPosition = new THREE.Vector3();
        this.gripPosition = new THREE.Vector3();
        this.object = object;
        this.property = property;
        this.incrementPerRotation = incrementPerRotation;

        const mat = new THREE.MeshStandardMaterial({ color: 0x222222 });
        const baseGeo = new THREE.CylinderGeometry(2, 2, 1, 8);
        const baseMesh = new THREE.Mesh(baseGeo, mat);

        const axleGeo = new THREE.CylinderGeometry(0.5, 0.5, 10, 8);
        axleGeo.translate(0, 5, 0);
        const axleMesh = new THREE.Mesh(axleGeo, mat);

        const plateGeo = new THREE.ExtrudeGeometry(new Squircle(10, 2, 2), {
            bevelEnabled: false,
            depth: 0.5,
        })
        const plateMesh = new THREE.Mesh(plateGeo, mat)
        plateMesh.rotation.x = Math.PI / 2;
        plateMesh.position.x = -1;
        plateMesh.position.y = 10;
        plateMesh.position.z = -1;

        const handleGeo = new THREE.CylinderGeometry(1, 1, 10);
        handleGeo.translate(0, 5, 0)
        const handleMesh = new THREE.Mesh(handleGeo, mat);
        handleMesh.position.x = 8;
        handleMesh.position.y = 10;

        this.add(baseMesh, axleMesh, plateMesh, handleMesh);
        this.rotation.x = Math.PI / 2;
        this.position.y = 20;

        this.lastTickAngle = this.rotation.y;

        makeGrippable(handleMesh)

        handleMesh.addEventListener("squeezestart", (e: THREE.Event) => {
            const pointer = e.dispatcher;
            const crank = this;
            crank.getWorldPosition(crank.worldPosition)

            registerUpdateFunction(crank.update, crank, pointer)
            pointer.gripSpace.addEventListener("squeezeend", squeezeEndHandler)

            function squeezeEndHandler() {
                unregisterUpdateFunction(crank.update)
                pointer.gripSpace.removeEventListener("squeezeend", squeezeEndHandler)
            }

        })

    }

    update(thisArg: HandCrank, pointer: Pointer) {
        // This v is z-aligned to worldspace >:(
        const v = new THREE.Vector3().subVectors(thisArg.worldPosition, pointer.gripSpace.position).setZ(0).normalize();
        const angle = Math.atan2(v.y, v.x) - Math.PI;

        let angleDiff = angle - thisArg.rotation.y;
        angleDiff += angleDiff > Math.PI ? -Math.PI * 2 : angleDiff < -Math.PI ? Math.PI * 2 : 0;
        thisArg.object[thisArg.property] += angleDiff / Math.PI * thisArg.incrementPerRotation;
        if (angleDiff)
            console.log(thisArg.object[thisArg.property])

        thisArg.rotation.y = angle;

        if (Math.abs(thisArg.lastTickAngle - angle) > Math.PI / 8) {
            thisArg.lastTickAngle = angle;
            pointer.pulse();
        }
    }
}