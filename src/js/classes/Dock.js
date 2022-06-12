import * as THREE from 'three';
import {headTracking, LAYERS, setHeadTracking} from '../config';

import {SVGLoader} from 'three/examples/jsm/loaders/SVGLoader';
import {manager} from '../setup';
import {ImageBitmapLoader} from 'three';

const loaderSVG = new SVGLoader(manager);
const loaderImage = new ImageBitmapLoader();
loaderImage.setOptions({imageOrientation: 'flipY'});

let dockShape;
loaderSVG.load('/dock.svg', (data) => {
    const shapes = SVGLoader.createShapes(data.paths[0]);
    dockShape = shapes[0];
});

let buttonShape;
loaderSVG.load('/dock-button.svg', (data) => {
    const shapes = SVGLoader.createShapes(data.paths[0]);
    buttonShape = shapes[0];
});

class Button extends THREE.Mesh {
    static depth = 1;
    static height = 7;
    static width = Button.height;
    static offset = 0.25;

    constructor(imagePath = null) {
        const geo = new THREE.ExtrudeGeometry(buttonShape)
            .scale(0.1, 0.1, 0.1)
            .translate(-Button.height / 2, -Button.width / 2, 0);
        const mat = new THREE.MeshStandardMaterial({color: 0x3a3a3a});

        super(geo, mat);
        this.position.z = Button.offset + Button.depth;
        this.layers.enable(LAYERS.RAYCASTABLE);
        this.castShadow = true;

        if (imagePath) {
            console.log(imagePath);
            loaderImage.load(imagePath, (img) => {
                // Do the thing
            });
        }

        this.addEventListener('select', (e) => {
            console.log({...e});
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
    static offsetY = -0.4;

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
        this.geo = new THREE.ShapeGeometry(dockShape).scale(0.1, 0.1, 0.1);
        this.mat = new THREE.MeshStandardMaterial({color: 0x959595});
        this.mesh = new THREE.Mesh(this.geo, this.mat);
        this.mesh.receiveShadow = true;

        this.add(this.mesh);
        this.buttons = [];

        this.calcDimensions();

        this.addButton('test1', 'icons/locked.png').addEventListener('select', () => {
            setHeadTracking(!headTracking);
        });
        this.addButton('test2');
        this.addButton('test3');
        this.addButton('test4');
        this.addButton('test5');
    }

    calcDimensions() {
        // Get max height
        const shape = new THREE.Shape().copy(dockShape);
        const borderRadius = shape.curves[0].v3.x;
        let width = this.buttons.length * Button.width + (this.buttons.length - 1) * Dock.gap + Dock.padding * 2;
        let height = Button.height + Dock.padding * 2;
        width *= 10;
        width -= borderRadius;
        height *= 10;
        height -= borderRadius;

        // Stretch width
        shape.curves[1].v2.x += width;
        shape.curves[2].v0.x += width;
        shape.curves[2].v1.x += width;
        shape.curves[2].v2.x += width;
        shape.curves[2].v3.x += width;
        shape.curves[3].v1.x += width;
        shape.curves[3].v2.x += width;
        shape.curves[4].v0.x += width;
        shape.curves[4].v1.x += width;
        shape.curves[4].v2.x += width;
        shape.curves[4].v3.x += width;
        shape.curves[5].v1.x += width;
        shape.curves[5].v2.x += width;

        // Stretch height
        shape.curves[3].v2.y += height;
        shape.curves[4].v0.y += height;
        shape.curves[4].v1.y += height;
        shape.curves[4].v2.y += height;
        shape.curves[4].v3.y += height;
        shape.curves[5].v1.y += height;
        shape.curves[5].v2.y += height;
        shape.curves[6].v0.y += height;
        shape.curves[6].v1.y += height;
        shape.curves[6].v2.y += height;
        shape.curves[6].v3.y += height;
        shape.curves[7].v1.y += height;

        this.mesh.geometry = new THREE.ShapeGeometry(shape)
            .translate((-width - borderRadius) / 2, (-height - borderRadius) / 2, 0)
            .scale(0.1, 0.1, 0.1);
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

    addButton(name, imagePath = null, i = this.buttons.length) {
        let button = new Button(imagePath);
        button.name = name;

        // const color = new THREE.Color(0xffffff);
        // color.setHex(Math.random() * 0xffffff);
        // button.material = new THREE.MeshBasicMaterial({color});

        this.buttons.splice(i, 0, button);
        this.add(button);

        // Recalculate dock
        this.calcDimensions();
        this.calcButtonPositions();
        return button;
    }
}
