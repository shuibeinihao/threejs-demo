/*
 * @Author: winter
 */

import * as THREE from "three";
import { OrbitControls } from "./lib/controls/OrbitControls";
import "./index.less";
import { GUI } from "./lib/dat.gui.module.js";
import { GLTFLoader } from "./lib/loaders/GLTFLoader.js";
import { RGBELoader } from "./lib//loaders/RGBELoader.js";

import { FirstPersonCameraControl } from "./firstPersonCameraControl";

const scene = new THREE.Scene();

//renderer
const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    canvas: document.getElementById("renderCanvas"),
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;

//model
new RGBELoader()
    .setDataType(THREE.UnsignedByteType)
    .setPath("assets/textures/")
    .load("autumn_park_1k.hdr", function (texture) {
        var pmremGenerator = new THREE.PMREMGenerator(renderer);
        pmremGenerator.compileEquirectangularShader();
        var envMap = pmremGenerator.fromEquirectangular(texture).texture;
        //scene.background = envMap;
        scene.environment = envMap;
        texture.dispose();
        pmremGenerator.dispose();
        // model
        var loader = new GLTFLoader().setPath("assets/models/");
        loader.load("scene.gltf", function (gltf) {
            scene.add(gltf.scene);
            firstperson.colliders = gltf.scene;
        });
    });

//camera
const camera = new THREE.PerspectiveCamera(
    65,
    window.innerWidth / window.innerHeight,
    0.01,
    100
);
camera.position.set(10, 3, 1.5);
camera.lookAt(new THREE.Vector3(0, 0, 0));

//axesHelper
const axesHelper = new THREE.AxesHelper( 50 );
scene.add( axesHelper );

// controls
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.enabled = true;

//firstperson
const firstperson = new FirstPersonCameraControl(camera, renderer.domElement);
firstperson.enabled = false;

let settings = {
    firstPerson: false,
    gravity: false,
    collision: false,
    positionEasing: false,
    threePerson: false,
};

//GUI
var gui = new GUI();
gui.domElement.parentElement.style.zIndex = 1000;
gui.add(settings, "firstPerson", false).onChange(onSettingsChange);
gui.add(settings, "gravity", false).onChange(onSettingsChange);
gui.add(settings, "collision", false).onChange(onSettingsChange);
gui.add(settings, "positionEasing", true).onChange(onSettingsChange);
gui.add(settings, "threePerson", true).onChange(onSettingsChange);
function onSettingsChange() {
    if (settings.firstPerson) {
        camera.position.set(10, 3, 1.5);
        camera.lookAt(new THREE.Vector3(0, 0, 0));
        firstperson.enabled = true;
        firstperson.applyGravity = settings.gravity;
        firstperson.applyCollision = settings.collision;
        firstperson.positionEasing = settings.positionEasing;
        orbit.enabled = false;
    } else if(settings.threePerson){
        camera.position.set(15, 3, 1.5);
        camera.lookAt(new THREE.Vector3(0, 0, 0));
        firstperson.enabled = true;
        firstperson.applyGravity = settings.gravity;
        firstperson.applyCollision = settings.collision;
        firstperson.positionEasing = settings.positionEasing;
        orbit.enabled = false;
    }
    else {
        firstperson.enabled = false;
        var ray = new THREE.Ray();
        ray.origin.setFromMatrixPosition(camera.matrixWorld);
        ray.direction
            .set(0, 0, 1)
            .unproject(camera)
            .sub(ray.origin)
            .normalize();
        orbit.target = ray.at(2);
        orbit.enabled = true;
    }
}

//resize
window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

//animate
const animate = function () {
    requestAnimationFrame(animate);
    if (orbit.enabled) orbit.update();
    if (firstperson.enabled) firstperson.update();
    renderer.render(scene, camera);
};

animate();
