import * as THREE from 'three';
import { LAYERS } from '../config';
import { Squircle } from '../shapes/Squircle';
import { Button } from './Button';

export class Dock extends THREE.Group {
    shape: Squircle;
    mesh: THREE.Mesh;
    buttons?: Button[];

    // In worldscale - 1 == 1m
    static offsetZ = -1.0;
    static offsetY = -0.4;

    // In localscale - 1 == 1cm
    static depth = 0.25;
    static padding = 1.2;
    static borderRadius = Button.width / 2 + Dock.padding;
    static gap = 1.5;
    static rotX = -20 * (Math.PI / 180);

    constructor() {
        super();
        const shape = new Squircle(0, 0, Dock.borderRadius, 0.8);
        const geo = new THREE.ShapeGeometry(shape);
        const mat = new THREE.MeshStandardMaterial({ color: 0x111111 });

        this.mesh = new THREE.Mesh(geo, mat);
        this.shape = shape;
        this.buttons = [];
        this.add(this.mesh);
        this.layers.set(LAYERS.UI)

        this.position.set(0, Dock.offsetY, Dock.offsetZ);
        this.scale.set(0.01, 0.01, 0.01);
        this.rotation.x = Dock.rotX;
        this.mesh.receiveShadow = true;

        this.calcDimensions();
    }

    calcDimensions() {
        let width = this.buttons.length * Button.width + (this.buttons.length - 1) * Dock.gap + Dock.padding * 2;
        let height = Button.height + Dock.padding * 2;

        this.shape.setWidth(width);
        this.shape.setHeight(height);

        this.mesh.geometry = new THREE.ExtrudeGeometry(this.shape, { depth: Dock.depth, bevelEnabled: false }).center();
        this.mesh.position.z = -Dock.depth / 2;
    }

    calcButtonPositions() {
        const t = this.buttons.length;
        const w = Button.width;
        const g = Dock.gap;
        const width = t * w + (t - 1) * g;
        const min = width / 2 - width;
        this.buttons.forEach((button, i) => {
            const x = min + (width / t) * i + ((t - 1) * g) / t / 2;
            button.position.x = x + w / 2;
        });
    }

    addButton(button: Button) {
        this.buttons.splice(this.buttons.length, 0, button);
        this.add(button);

        // Recalculate dock
        this.calcDimensions();
        this.calcButtonPositions();
        return this;
    }

    addButtons(...buttons: Button[]) {
        this.buttons.splice(this.buttons.length, 0, ...buttons)
        this.add(...buttons);

        // Recalculate dock
        this.calcDimensions();
        this.calcButtonPositions();
        return this;
    }
}
