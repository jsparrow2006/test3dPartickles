'use strict'
import { Utilities} from './utilities';

export const Camera = (function () {
    var SENSITIVITY = 0.005;

    var MIN_DISTANCE = 10.0;
    var MAX_DISTANCE = 60.0;

    function Camera (element, orbitPoint, cameraSetting) {
        
        this.element = element;
        // this.distance = 28.0;
        this.distance = cameraSetting.distance;
        this.orbitPoint = orbitPoint;

        this.azimuth = cameraSetting.azimuth,
        this.elevation = cameraSetting.elevation

        this.minElevation = -Math.PI / 4;
        this.maxElevation = Math.PI / 4;

        this.currentMouseX = 0,
        this.currentMouseY = 0;

        this.lastMouseX = 0,
        this.lastMouseY = 0;

        this.viewMatrix = new Float32Array(16);


        this.recomputeViewMatrix();
        
    };

    Camera.prototype.recomputeViewMatrix = function () {
        var xRotationMatrix = new Float32Array(16),
            yRotationMatrix = new Float32Array(16),
            distanceTranslationMatrix = Utilities.makeIdentityMatrix(new Float32Array(16)),
            orbitTranslationMatrix = Utilities.makeIdentityMatrix(new Float32Array(16));

        Utilities.makeIdentityMatrix(this.viewMatrix);

        Utilities.makeXRotationMatrix(xRotationMatrix, this.elevation);
        Utilities.makeYRotationMatrix(yRotationMatrix, this.azimuth);
        distanceTranslationMatrix[14] = -this.distance;
        orbitTranslationMatrix[12] = -this.orbitPoint[0];
        orbitTranslationMatrix[13] = -this.orbitPoint[1];
        orbitTranslationMatrix[14] = -this.orbitPoint[2];

        Utilities.premultiplyMatrix(this.viewMatrix, this.viewMatrix, orbitTranslationMatrix);
        Utilities.premultiplyMatrix(this.viewMatrix, this.viewMatrix, yRotationMatrix);
        Utilities.premultiplyMatrix(this.viewMatrix, this.viewMatrix, xRotationMatrix);
        Utilities.premultiplyMatrix(this.viewMatrix, this.viewMatrix, distanceTranslationMatrix);
    };

    Camera.prototype.getPosition = function () {
        var position = [
            this.distance * Math.sin(Math.PI / 2 - this.elevation) * Math.sin(-this.azimuth) + this.orbitPoint[0],
            this.distance * Math.cos(Math.PI / 2 - this.elevation) + this.orbitPoint[1],
            this.distance * Math.sin(Math.PI / 2 - this.elevation) * Math.cos(-this.azimuth) + this.orbitPoint[2]
        ];

        return position;
    };

    Camera.prototype.getViewMatrix = function () {
        return this.viewMatrix;
    };

    Camera.prototype.setBounds = function (minElevation, maxElevation) {
        this.minElevation = minElevation;
        this.maxElevation = maxElevation;

        if (this.elevation > this.maxElevation) this.elevation = this.maxElevation;
        if (this.elevation < this.minElevation) this.elevation = this.minElevation;

        this.recomputeViewMatrix();
    };

    return Camera;
}());
