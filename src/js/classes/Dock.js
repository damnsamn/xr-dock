import * as THREE from 'three';
import {LAYERS} from '../config';

import {SVGLoader} from 'three/examples/jsm/loaders/SVGLoader';
import { manager } from '../setup';

const loader = new SVGLoader(manager);

let buttonShape;
loader.load('/dock-button.svg', (data) => {
    const shapes = SVGLoader.createShapes(data.paths[0])
    buttonShape = shapes[0]
});

class Button extends THREE.Mesh {
    static depth = 1;
    static height = 7;
    static width = Button.height;
    static offset = 1;


    constructor() {
        const geo = new THREE.ShapeGeometry(buttonShape).scale(0.1,0.1,0.1).translate(-Button.height/2, -Button.width/2, 0)
        const mat = new THREE.MeshBasicMaterial({color: 0x3a3a3a});

        super(geo, mat);
        this.position.z = Button.offset + Button.depth;
        this.layers.enable(LAYERS.RAYCASTABLE);

        this.addEventListener('select', (e) => {
            console.log({...e});

            const color = new THREE.Color(0xffffff);
            color.setHex(Math.random() * 0xffffff);
            this.material.color = color;
        });
        this.addEventListener('pointerenter', (e) => {
            console.log({...e});
            this.material.wireframe = true;
        });
        this.addEventListener('pointerleave', (e) => {
            console.log({...e});
            this.material.wireframe = false;
        });
    }
}

export class Dock extends THREE.Group {
    // In worldscale - 1 == 1m
    static offsetZ = -1.0;
    static offsetY = -0.5;

    // In localscale - 1 == 1cm
    static depth = 0.5;
    static padding = 1.2;
    static gap = 1.5;
    static rotX = -20 * (Math.PI / 180);

    constructor() {
        super();
        this.position.set(0, Dock.offsetY, Dock.offsetZ);
        this.scale.set(0.01, 0.01, 0.01);
        this.rotation.x = Dock.rotX;

        // Instantiate mesh
        this.geo = new THREE.BoxGeometry();
        this.mat = new THREE.MeshBasicMaterial({color: 0x959595});
        this.mesh = new THREE.Mesh(this.geo, this.mat);

        this.add(this.mesh);
        this.buttons = [];

        this.calcDimensions();

        this.addButton('test1');
        this.addButton('test2');
        this.addButton('test3');
        this.addButton('test4');
        this.addButton('test5');
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

        // const color = new THREE.Color(0xffffff);
        // color.setHex(Math.random() * 0xffffff);
        // button.material = new THREE.MeshBasicMaterial({color});

        this.buttons.splice(i, 0, button);
        this.add(button);

        // Recalculate dock
        this.calcDimensions();
        this.calcButtonPositions();
    }
}
