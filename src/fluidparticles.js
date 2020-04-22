'use strict'
import { WrappedGL} from './wrappedgl';
import { Utilities} from './utilities';
import { Camera} from './camera';
import { BoxEditor} from './boxeditor';
import { SimulatorRenderer} from './simulatorrenderer';


export const FluidParticles = (function () {
    var FOV = Math.PI / 3;

    var State = {
        EDITING: 0,
        SIMULATING: 1
    };

    var GRID_WIDTH = 60,
        GRID_HEIGHT = 40,
        GRID_DEPTH = 4;

    var PARTICLES_PER_CELL = 10;

    function FluidParticles (canvasId, sceneSetting, cameraSetting, particlesSetting) {

        GRID_WIDTH = sceneSetting.width || GRID_WIDTH
        GRID_HEIGHT = sceneSetting.height || GRID_HEIGHT
        GRID_DEPTH = sceneSetting.depth || GRID_DEPTH

        var canvas = this.canvas = document.getElementById(canvasId);
        var wgl = this.wgl = new WrappedGL(canvas);

        window.wgl = wgl;


        this.projectionMatrix = Utilities.makePerspectiveMatrix(new Float32Array(16), FOV, this.canvas.width / this.canvas.height, 0.1, 100.0);
        this.camera = new Camera(this.canvas, [GRID_WIDTH / 2, GRID_HEIGHT / 3, GRID_DEPTH / 2], cameraSetting);

        var boxEditorLoaded = false,
            simulatorRendererLoaded = false;

        this.boxEditor = new BoxEditor.BoxEditor(this.canvas, this.wgl, this.projectionMatrix, this.camera, [GRID_WIDTH, GRID_HEIGHT, GRID_DEPTH], (function () {
            boxEditorLoaded = true;
            if (boxEditorLoaded && simulatorRendererLoaded) {
                start.call(this);
            }
        }).bind(this),
        (function () {
            this.redrawUI(); 
        }).bind(this));

        this.simulatorRenderer = new SimulatorRenderer(this.canvas, this.wgl, this.projectionMatrix, this.camera, [GRID_WIDTH, GRID_HEIGHT, GRID_DEPTH], (function () {
            simulatorRendererLoaded = true;
            if (boxEditorLoaded && simulatorRendererLoaded) {
                start.call(this);
            }
        }).bind(this), particlesSetting);

        this.startAnimation = function(){

        }.bind(this)


        function start(programs) {
            this.state = State.SIMULATING;

            this.currentPresetIndex = 0;
            this.editedSinceLastPreset = false;
            var PRESETS = [
                [
                    new BoxEditor.AABB([0, 0, 0], [15, 20, 20]) 
                ],
            ];

            this.editedSinceLastPreset = false;
            this.boxEditor.boxes.length = 0;
            var preset = PRESETS[this.currentPresetIndex];
            for (var i = 0; i < preset.length; ++i) {
                this.boxEditor.boxes.push(preset[i].clone());
            }
            
            this.gridCellDensity = 0.5;

            this.timeStep = 1.0 / 60.0;

            canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
            window.addEventListener('resize', this.onResize.bind(this));
            this.onResize();


            ////////////////////////////////////////////////////
            // start the update loop

            var lastTime = 0;
            var update = (function (currentTime) {
                var deltaTime = currentTime - lastTime || 0;
                lastTime = currentTime;

                this.update(deltaTime);

                requestAnimationFrame(update);
            }).bind(this);
            update();

            this.startSimulation(particlesSetting.count, particlesSetting.radius);

        }
    }

    FluidParticles.prototype.onResize = function (event) {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        Utilities.makePerspectiveMatrix(this.projectionMatrix, FOV, this.canvas.width / this.canvas.height, 0.1, 100.0);
        this.simulatorRenderer.onResize(event);
    }

    FluidParticles.prototype.onMouseMove = function (event) {
        event.preventDefault();
        if (this.state === State.EDITING) {
            this.boxEditor.onMouseMove(event);

            if (this.boxEditor.interactionState !== null) {
                this.editedSinceLastPreset = true;
            }
        } else if (this.state === State.SIMULATING) {
            this.simulatorRenderer.onMouseMove(event);
        }
    };


    FluidParticles.prototype.getParticleCount = function () {
        var boxEditor = this.boxEditor;
        var gridCells = GRID_WIDTH * GRID_HEIGHT * GRID_DEPTH * this.gridCellDensity;
        var gridResolutionY = Math.ceil(Math.pow(gridCells / 2, 1.0 / 3.0));
        var gridResolutionZ = gridResolutionY * 1;
        var gridResolutionX = gridResolutionY * 2;
        var totalGridCells = gridResolutionX * gridResolutionY * gridResolutionZ;
        var totalVolume = 0;
        var cumulativeVolume = [];
        for (var i = 0; i < boxEditor.boxes.length; ++i) {
            var box = boxEditor.boxes[i];
            var volume = box.computeVolume();
            totalVolume += volume;
            cumulativeVolume[i] = totalVolume;
        }
        var fractionFilled = totalVolume / (GRID_WIDTH * GRID_HEIGHT * GRID_DEPTH);
        var desiredParticleCount = fractionFilled * totalGridCells * PARTICLES_PER_CELL; //theoretical number of particles
        return desiredParticleCount;
    }

    FluidParticles.prototype.startSimulation = function (count, radius) {
        this.state = State.SIMULATING;
        var desiredParticleCount = count;
        var particlesWidth = 10; 
        var particlesHeight = Math.ceil(desiredParticleCount / particlesWidth);
        var particleCount = particlesWidth * particlesHeight;
        var particlePositions = [];       
        var boxEditor = this.boxEditor;
        var totalVolume = 0;
        for (var i = 0; i < boxEditor.boxes.length; ++i) {
            totalVolume += boxEditor.boxes[i].computeVolume();
        }
        var particlesCreatedSoFar = 0;
        for (var i = 0; i < boxEditor.boxes.length; ++i) {
            var box = boxEditor.boxes[i];
            var particlesInBox = 0;
            if (i < boxEditor.boxes.length - 1) { 
                particlesInBox = Math.floor(particleCount * box.computeVolume() / totalVolume);
            } else { 
                particlesInBox = particleCount - particlesCreatedSoFar;
            }
            for (var j = 0; j < particlesInBox; ++j) {
                var position = box.randomPoint();
                particlePositions.push(position);
            }
            particlesCreatedSoFar += particlesInBox;
        }

        var gridCells = GRID_WIDTH * GRID_HEIGHT * GRID_DEPTH * this.gridCellDensity;
        var gridResolutionY = Math.ceil(Math.pow(gridCells / 2, 1.0 / 3.0));
        var gridResolutionZ = gridResolutionY * 1;
        var gridResolutionX = gridResolutionY * 2;
        var gridSize = [GRID_WIDTH, GRID_HEIGHT, GRID_DEPTH];
        var gridResolution = [gridResolutionX, gridResolutionY, gridResolutionZ];
        var sphereRadius = radius / gridResolutionX;
        this.simulatorRenderer.reset(particlesWidth, particlesHeight, particlePositions, gridSize, gridResolution, PARTICLES_PER_CELL, sphereRadius);
        this.camera.setBounds(0, Math.PI / 2);
    }

    FluidParticles.prototype.stopSimulation = function () {
        this.state = State.EDITING;
        this.camera.setBounds(-Math.PI / 4, Math.PI / 4);
    }

    FluidParticles.prototype.update = function () {
        if (this.state === State.EDITING) {
            this.boxEditor.draw();
        } else if (this.state === State.SIMULATING) {
            this.simulatorRenderer.update(this.timeStep);
        }
    }

    return FluidParticles;
}());

