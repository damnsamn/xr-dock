import * as THREE from 'three';
import { LAYERS } from '../config';

class Button extends THREE.Mesh {
    static depth = 1;
    static height = 7;
    static width = Button.height;
    static offset = 1;

    static geo = new THREE.BoxGeometry(Button.height, Button.height, Button.depth);
    static mat = new THREE.MeshDepthMaterial();

    constructor() {
        super(Button.geo, Button.mat);
        this.position.z = Button.offset + Button.depth;
        this.layers.enable(LAYERS.RAYCASTABLE)
    }
}

export class Dock extends THREE.Group {
    // In worldscale - 1 == 1m
    static offsetZ = -1.0;
    static offsetY = -0.5;

    // In localscale - 1 == 1cm
    static depth = 2.5;
    static padding = 1.5;
    static gap = 1.5;
    static rotX = -20 * (Math.PI / 180);

    constructor() {
        super();
        this.position.set(0, Dock.offsetY, Dock.offsetZ);
        this.scale.set(0.01, 0.01, 0.01);
        this.rotation.x = Dock.rotX;

        // Instantiate mesh
        this.geo = new THREE.BoxGeometry();
        this.mat = new THREE.MeshNormalMaterial();
        this.mesh = new THREE.Mesh(this.geo, this.mat);

        this.add(this.mesh);
        this.buttons = [];

        this.calcDimensions();

        this.addButton('test1');
        this.addButton('test1');
        this.addButton('test1');
        this.addButton('test1');
        this.addButton('test1');
    }

    calcDimensions() {
        // Get max height
        const width = this.buttons.length * Button.width + (this.buttons.length - 1) * Dock.gap + Dock.padding * 2;
        const height = Button.height + Dock.padding * 2;

        this.mesh.geometry = new THREE.BoxGeometry(width, height, Dock.depth);
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

    addButton(name, i = this.buttons.length) {
        let button = new Button();
        button.name = name;

        const color = new THREE.Color(0xffffff);
        color.setHex(Math.random() * 0xffffff);
        button.material = new THREE.MeshBasicMaterial({color});

        this.buttons.splice(i, 0, button);
        this.add(button);

        // Recalculate dock
        this.calcDimensions();
        this.calcButtonPositions();
    }
}
