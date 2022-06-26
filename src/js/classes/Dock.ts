import gsap from 'gsap';
import * as THREE from 'three';
import { LAYERS, setHeadTracking } from '../config';
import { headSpace } from '../setup';
import { Squircle } from '../shapes/Squircle';
import { Button } from './Button';
import { MenuPanel } from './MenuPanel';

type Menu = {
    button: Button;
    menuPanel: MenuPanel;
}
export class Dock extends THREE.Group {
    shape: Squircle;
    mesh: THREE.Mesh;
    dockSpace: THREE.Group;
    menuSpace: THREE.Group;
    buttons?: Button[];
    menus?: Menu[];

    // In headSpaceScale: 1 == 1cm
    static offsetZ = -100;
    static offsetY = -40;
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

        this.layers.set(LAYERS.UI)
        this.mesh = new THREE.Mesh(geo, mat);
        this.mesh.receiveShadow = true;
        this.shape = shape;
        this.menuSpace = new THREE.Group();
        this.dockSpace = new THREE.Group();
        this.buttons = [];
        this.menus = [];
        this.dockSpace.add(this.mesh)
        this.add(this.dockSpace, this.menuSpace);

        this.position.set(0, Dock.offsetY, Dock.offsetZ);
        this.dockSpace.rotation.x = Dock.rotX;

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
        this.dockSpace.add(button);

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

    addMenu(button: Button, menuPanel: MenuPanel) {
        this.menus.splice(this.menus.length, 0, <Menu>{ button, menuPanel });
        this.menuSpace.add(menuPanel);

        this.addButton(button)
        button.addEventListener("selectstart", () => {
            this.menus.filter(menu => menu.menuPanel.uuid !== menuPanel.uuid).forEach(menu => {
                menu.menuPanel.setOpen(false);
                menu.button.setActive(false);
            })

            button.setActive(!button.isActive);
            menuPanel.setOpen(!menuPanel.open)
            if (menuPanel.open) {
                gsap.to(this.position, {
                    z: -50,
                    duration: 0.5,
                    ease: "power2.inOut"
                })
                gsap.to(this.dockSpace.position, {
                    z: MenuPanel.offsetZ,
                    duration: 0.2
                })
                setHeadTracking(false);
            } else {
                gsap.to(this.position, {
                    z: Dock.offsetZ,
                    duration: 0.2,
                    ease: "power2.out"
                })
                gsap.to(this.dockSpace.position, {
                    z: 0,
                    duration: 0.2
                })
                setHeadTracking(true);
            }
        })
        return this;
    }
}
