import * as THREE from 'three';
import {headTracking, LAYERS, setHeadTracking} from '../config';

import {SVGLoader} from 'three/examples/jsm/loaders/SVGLoader';
import gsap from 'gsap';
import {Squircle} from '../shapes/Squircle';

const loaderSVG = new SVGLoader();

/**
 * @typedef {Object} ButtonDefaultOptions
 * @property {number} [color]
 * @property {string} [icon]
 */
class Button extends THREE.Mesh {
    static depth = 0.25;
    static height = 7;
    static width = Button.height;
    static borderRadius = Button.width / 2;
    static offset = 1;
    static iconOffset = 1;
    static hoverOffset = 1.75;

    /** @type {ButtonDefaultOptions} */
    static defaultOptions = {
        color: 0xf5f5f5,
    };
    constructor(options = {}) {
        options = {
            ...Button.defaultOptions,
            ...options,
        };

        const shape = new Squircle(Button.width, Button.height, Button.borderRadius, 0.8);
        const geo = new THREE.ExtrudeGeometry(shape, {depth: Button.depth, bevelEnabled: false}).center();
        const mat = new THREE.MeshStandardMaterial({color: options.color});

        super(geo, mat);

        this.pointLight = new THREE.PointLight(options.color, 4, Button.width * 2 * 0.01, 2);
        // this.pointLight.position.copy(this.position);
        this.add(this.pointLight);

        this.position.z = Button.offset + Button.depth / 2;
        this.layers.enable(LAYERS.RAYCASTABLE);
        this.castShadow = true;

        if (options.icon) {
            this.setIcon(options.icon);
        }

        this.addEventListener('select', (e) => {
            console.log({...e});
        });
        this.addEventListener('pointerenter', (e) => {
            console.log({...e});
            gsap.to(this.position, {
                z: Button.offset + Button.depth + Button.hoverOffset,
                duration: 0.1,
            });
            gsap.to(this.pointLight, {
                intensity: 5,
                duration: 0.1,
            });
        });
        this.addEventListener('pointerleave', (e) => {
            console.log({...e});
            gsap.to(this.position, {
                z: Button.offset + Button.depth,
                duration: 0.1,
            });
            gsap.to(this.pointLight, {
                intensity: 4,
                duration: 0.1,
            });
        });
    }

    setIcon(iconPath) {
        loaderSVG.load(iconPath, (data) => {
            const shapes = SVGLoader.createShapes(data.paths[0]);
            const iconGeo = new THREE.ShapeGeometry(shapes[0]).scale(0.1, -0.1, 0).center();
            const iconMat = new THREE.MeshBasicMaterial({color: 0x333333});
            if (!this.icon) {
                this.icon = new THREE.Mesh(iconGeo, iconMat);
                this.icon.scale.z = -1;
                this.icon.position.z = Button.depth / 2 + Button.iconOffset;
                this.add(this.icon);
            } else {
                this.icon.geometry = iconGeo;
            }
        });
    }
}

export class Dock extends THREE.Group {
    // In worldscale - 1 == 1m
    static offsetZ = -1.0;
    static offsetY = -0.4;

    // In localscale - 1 == 1cm
    static depth = 0.25;
    static padding = 1.2;
    static borderRadius = Button.width/2 + Dock.padding;
    static gap = 1.5;
    static rotX = -20 * (Math.PI / 180);

    constructor() {
        super();
        this.position.set(0, Dock.offsetY, Dock.offsetZ);
        this.scale.set(0.01, 0.01, 0.01);
        this.rotation.x = Dock.rotX;

        // Instantiate mesh
        this.shape = new Squircle(0, 0, Dock.borderRadius, 0.8);
        this.geo = new THREE.ShapeGeometry(this.shape);
        this.mat = new THREE.MeshStandardMaterial({color: 0x111111});
        this.mesh = new THREE.Mesh(this.geo, this.mat);
        this.mesh.receiveShadow = true;

        this.add(this.mesh);
        this.buttons = [];

        this.calcDimensions();
    }

    calcDimensions() {
        let width = this.buttons.length * Button.width + (this.buttons.length - 1) * Dock.gap + Dock.padding * 2;
        let height = Button.height + Dock.padding * 2;

        this.shape.setWidth(width);
        this.shape.setHeight(height);

        this.mesh.geometry = new THREE.ExtrudeGeometry(this.shape, {depth: Dock.depth, bevelEnabled: false}).center();
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

    /**
     * @param {string} name
     * @param {ButtonDefaultOptions} [options]
     * @returns
     */
    addButton(name, options) {
        let button = new Button(options);
        button.name = name;

        this.buttons.splice(this.buttons.length, 0, button);
        this.add(button);

        // Recalculate dock
        this.calcDimensions();
        this.calcButtonPositions();
        return button;
    }
}
