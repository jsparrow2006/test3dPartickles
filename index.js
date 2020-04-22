// import { WrappedGL} from './wrappedgl';
import { FluidParticles} from './fluidparticles';

const defaultSettings = {
    scene: {
        width: 60,
        heigth: 40,
        depth: 4,
    },
    camera: {
        distance: 24.0,
        azimuth: -0.009999999990000001,
        elevation: 0.004999999999999998,
    },
    particles: {
        count: 6000,
        radius: 7.0,
        color1: '#9466ff',
        color2: '#ff5e2d'
    }
}

export default class ParticlesScene {
    constructor(scene = {}, camera = {}, particles = {}) {
        this.fluidBox = null;
        this.initData = {
            scene: {...defaultSettings.scene, ...scene},
            camera: {...defaultSettings.camera, ...camera},
            particles: {...defaultSettings.particles, ...particles}
        };
    }

    initScene = (canvasId) => {
        this.fluidBox = new FluidParticles(canvasId, this.initData.scene, this.initData.camera, this.initData.particles);
    };

    isEnableScene = () => {
        var isMobilePlatform = /Android|webOS|iPhone|iPad|iPod|Opera Mini/i.test(navigator.userAgent);
        var canvas = document.createElement('canvas');
            var gl = null;
            try {
                gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            } catch (e) {
                return false;
            }
            if (gl === null || isMobilePlatform) {
                return false;
            } else {
                return true
            }
    };

    startAnimation = () => {
        if (fluidBox){
            fluidBox.startSimulation()   
        }
    };

    stopAnimation = () => {
        if (fluidBox){
            fluidBox.stopSimulation()   
        }
    };
}