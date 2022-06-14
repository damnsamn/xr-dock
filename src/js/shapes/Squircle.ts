import * as THREE from 'three';

export class Squircle extends THREE.Shape {
    width: number;
    height: number;
    borderRadius: number;
    handleFactor: number;

    static handleFactor = (4 / 3) * (Math.sqrt(2) - 1); // Approx. circle by default

    constructor(width: number, height: number, borderRadius: number, handleFactor = Squircle.handleFactor) {
        super();
        this.width = width;
        this.height = height;
        this.borderRadius = borderRadius;
        this.handleFactor = handleFactor;

        this.draw();
    }

    draw() {
        const { width, height, handleFactor } = this;
        let { borderRadius } = this;

        this.curves = [];

        // Get smallest allowable border-radius
        const smallestDimension = width < height ? width : height;
        borderRadius = borderRadius < smallestDimension / 2 ? borderRadius : smallestDimension / 2;

        // Set up QOL consts
        const handleLength = handleFactor * borderRadius;
        const handleLengthInv = borderRadius - handleLength;

        this.moveTo(0, borderRadius)
            .bezierCurveTo(0, handleLengthInv, handleLengthInv, 0, borderRadius, 0)
            .lineTo(width - borderRadius, 0)
            .bezierCurveTo(width - handleLengthInv, 0, width, handleLengthInv, width, borderRadius)
            .lineTo(width, height - borderRadius)
            .bezierCurveTo(
                width,
                height - handleLengthInv,
                width - handleLengthInv,
                height,
                width - borderRadius,
                height,
            )
            .lineTo(borderRadius, height)
            .bezierCurveTo(handleLengthInv, height, 0, height - handleLengthInv, 0, height - borderRadius);
    }

    setWidth(width: number) {
        this.width = width;
        this.draw();
        return this;
    }

    setHeight(height: number) {
        this.height = height;
        this.draw();
        return this;
    }
}
