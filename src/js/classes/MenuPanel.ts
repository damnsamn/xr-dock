import * as THREE from 'three';
import { Squircle } from '../shapes/Squircle';
import gsap from 'gsap';

export class MenuPanel extends THREE.Mesh {
    open: boolean;
    timeline: GSAPTimeline;

    // In headSpaceScale: 1 == 1cm
    static offsetZ = -5;
    static offsetY = 7.5;
    static borderRadius = 2;
    static depth = 0.25

    static width = 50;
    static height = 50;

    static closedState = {
        scale: {
            x: 0,
            y: 0,
        },
        position: {
            y: MenuPanel.offsetY - 10,
        }
    }
    static openState = {
        scale: {
            x: 1,
            y: 1,
        },
        position: {
            y: MenuPanel.offsetY,
        }
    }

    constructor(...children: THREE.Object3D[]) {
        const shape = new Squircle(MenuPanel.width, MenuPanel.height, MenuPanel.borderRadius, 0.8);
        const geo = new THREE.ShapeGeometry(shape).translate(-MenuPanel.width / 2, 0, 0);
        const mat = new THREE.MeshStandardMaterial({ color: 0x111111 });
        super(geo, mat);

        this.position.set(0, MenuPanel.offsetY, MenuPanel.offsetZ);
        this.open = false;
        this.timeline = gsap.timeline();

        this.scale.x = MenuPanel.closedState.scale.x;
        this.scale.y = MenuPanel.closedState.scale.y;
        this.position.y = MenuPanel.closedState.position.y;

        if (children.length)
            this.add(...children)
    }

    setOpen(bool: boolean) {
        this.open = bool;
        this.open ? this.animateOpen() : this.animateClose();
    }

    animateOpen() {
        this.timeline
            .clear()
            .set(this, {
                visible: true
            })
            .to(this.scale, {
                ...MenuPanel.openState.scale,
                duration: 0.2
            }, "<")
            .to(this.position, {
                ...MenuPanel.openState.position,
                duration: 0.2
            }, "<")
    }
    animateClose() {
        this.timeline
            .clear()
            .to(this.scale, {
                ...MenuPanel.closedState.scale,
                duration: 0.2
            }, "<")
            .to(this.position, {
                ...MenuPanel.closedState.position,
                duration: 0.2,
                onComplete: () => { this.visible = false }
            }, "<")
    }

}