import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";
import gsap from 'gsap';
import { Squircle } from "../shapes/Squircle";
import { LAYERS } from "../config";
import { Pointer } from "./Pointer";
import { makePointable } from "../setup";

const loaderSVG = new SVGLoader();

interface ButtonDefaultOptions {
    name: string;
    color?: number | THREE.Color;
    iconPath?: string;
    onSelect?: THREE.EventListener<THREE.Event, string, any>;
    onSelectStart?: THREE.EventListener<THREE.Event, string, any>;
    onPointerEnter?: THREE.EventListener<THREE.Event, string, any>;
    onPointerLeave?: THREE.EventListener<THREE.Event, string, any>;
}

export class Button extends THREE.Mesh {
    pointLight: THREE.PointLight;
    shape: Squircle;
    isActive: boolean;
    icon?: THREE.Mesh;

    static depth = 0.25;
    static height = 7;
    static width = Button.height;
    static borderRadius = Button.width / 2;
    static offset = 1;
    static iconOffset = 1;
    static hoverOffset = 1.75;
    static shape = () => new Squircle(Button.width, Button.height, Button.borderRadius, 0.8);

    static defaultOptions: ButtonDefaultOptions = {
        name: "Button",
        color: 0xf5f5f5,
        onSelect: () => { },
        onSelectStart: () => { },
        onPointerEnter: () => { },
        onPointerLeave: () => { },
    };

    constructor(options: ButtonDefaultOptions) {
        options = {
            ...Button.defaultOptions,
            ...options,
        };

        const shape = Button.shape();
        const geo = new THREE.ExtrudeGeometry(shape, { depth: Button.depth, bevelEnabled: false }).center();
        const mat = new THREE.MeshStandardMaterial({ color: options.color });

        super(geo, mat);

        this.shape = shape;
        this.pointLight = new THREE.PointLight(options.color, 4, Button.width * 2 * 0.01, 2);
        this.add(this.pointLight);
        this.isActive = false;

        this.position.z = Button.offset + Button.depth / 2;
        this.castShadow = true;

        if (options.iconPath) {
            this.setIcon(options.iconPath);
        }

        makePointable(this);

        options.onSelect && this.addEventListener('select', options.onSelect);
        options.onSelectStart && this.addEventListener('selectstart', options.onSelectStart);
        options.onPointerEnter && this.addEventListener('pointerenter', options.onPointerEnter);
        options.onPointerLeave && this.addEventListener('pointerleave', options.onPointerLeave);

        this.addEventListener('selectstart', (e) => {
            (<Pointer>e.dispatcher).pulse()
        });

        this.addEventListener('pointerenter', (e) => {
            (<Pointer>e.dispatcher).pulse()
            this.animateActive();

        });

        this.addEventListener('pointerleave', (e) => {
            if (!this.isActive)
                this.animateInactive();
        });
    }

    setActive(bool: boolean) {
        this.isActive = bool;
        bool ? this.animateActive() : this.animateInactive();
    }

    animateActive() {
        gsap.to(this.shape, {
            height: Button.height + 0.5,
            width: Button.width + 0.5,
            onUpdate: () => {
                this.shape.draw()
                this.geometry = new THREE.ExtrudeGeometry(Button.shape(), { depth: Button.depth, bevelEnabled: false }).center();
            },
            duration: 0.1,
        });
        gsap.to(this.position, {
            z: Button.offset + Button.depth + Button.hoverOffset,
            duration: 0.1,
        });
        gsap.to(this.pointLight, {
            intensity: 5,
            duration: 0.1,
        });
    }

    animateInactive() {
        gsap.to(this.shape, {
            height: Button.height,
            width: Button.width,
            onUpdate: () => {
                this.shape.draw()
                this.geometry = new THREE.ExtrudeGeometry(Button.shape(), { depth: Button.depth, bevelEnabled: false }).center();
            },
            duration: 0.1,
        });
        gsap.to(this.position, {
            z: Button.offset + Button.depth,
            duration: 0.1,
        });
        gsap.to(this.pointLight, {
            intensity: 4,
            duration: 0.1,
        });
    }

    setIcon(iconPath: string): void {
        loaderSVG.load(iconPath, (data) => {
            const shapes = SVGLoader.createShapes(data.paths[0]);
            const iconGeo = new THREE.ShapeGeometry(shapes[0]).scale(0.1, -0.1, 0).center();
            const iconMat = new THREE.MeshBasicMaterial({ color: 0x333333 });
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