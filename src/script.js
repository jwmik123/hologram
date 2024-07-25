import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";
import GUI from "lil-gui";

import holoVertexShader from "./shaders/holographic/vertex.glsl";
import holoFragmentShader from "./shaders/holographic/fragment.glsl";
import holoBeamVertexShader from "./shaders/hologramBeam/vertex.glsl";
import holoBeamFragmentShader from "./shaders/hologramBeam/fragment.glsl";

/**
 * Base
 */
// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Models
 */
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");

const textureLoader = new THREE.TextureLoader();
const gltfLoader = new GLTFLoader();
// gltfLoader.setDRACOLoader(dracoLoader);

let mixer = null;

/**
 * Material
 */
const materialObject = {};
materialObject.color = "#70c1ff";

gui.addColor(materialObject, "color").onChange(() => {
  material.uniforms.uColor.value.set(materialObject.color);
});

const material = new THREE.ShaderMaterial({
  vertexShader: holoVertexShader,
  fragmentShader: holoFragmentShader,
  uniforms: {
    uTime: { value: 0 },
    uColor: new THREE.Uniform(new THREE.Color(materialObject.color)),
  },
  transparent: true,
  side: THREE.DoubleSide,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
});

let watch = null;
gltfLoader.load("./models/watch.gltf", (gltf) => {
  watch = gltf.scene;
  watch.traverse((child) => {
    if (child.isMesh) child.material = material;
  });
  watch.position.set(0, 1, 0);
  watch.rotation.z = Math.PI * 1.5;
  watch.rotation.x = Math.PI * 0.5;
  watch.scale.set(20, 20, 20);
  scene.add(watch);
});

const perlinTexture = textureLoader.load("./perlin.png");
perlinTexture.wrapS = THREE.RepeatWrapping;
perlinTexture.wrapT = THREE.RepeatWrapping;

const geometry = new THREE.PlaneGeometry(1, 3, 32, 64);
const coneMaterial = new THREE.ShaderMaterial({
  vertexShader: holoBeamVertexShader,
  fragmentShader: holoBeamFragmentShader,
  uniforms: {
    uTime: { value: 0 },
    uPerlinTexture: new THREE.Uniform(perlinTexture),
    uTaper: { value: 0.5 },
    uRadius: { value: 1.0 },
  },
  transparent: true,
  depthWrite: false,
  side: THREE.DoubleSide,
});

// Platform
const circleGeometry = new THREE.CylinderGeometry(1, 1, 0.2);
const circleMaterial = new THREE.MeshStandardMaterial({
  side: THREE.DoubleSide,
  metalness: 0.6,
  roughness: 1,
  emissive: 0x70c1ff,
  transparent: false,
});
circleMaterial.emissive = new THREE.Color(0x70c1ff);
const circle = new THREE.Mesh(circleGeometry, circleMaterial);
circle.position.set(0, 0, 0);
scene.add(circle);

const cylinderGeometry = new THREE.CylinderGeometry(1, 1, 1);
const cylinderMaterial = new THREE.MeshStandardMaterial({
  side: THREE.DoubleSide,
  color: 0x202020,
  metalness: 0.6,
  roughness: 1,
  transparent: false,
});

const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
cylinder.position.set(0, -0.6, 0);
scene.add(cylinder);

gui.addColor(circleMaterial, "emissive").onChange(() => {
  circleMaterial.emissive = new THREE.Color(circleMaterial.emissive);
});

// Floor
const floorGeometry = new THREE.PlaneGeometry(10, 10);
const floorMaterial = new THREE.MeshStandardMaterial({
  color: 0x70c1ff,
  metalness: 1.0,
  roughness: 0.1,
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.position.set(0, -0.1, 0);
floor.rotation.x = Math.PI * -0.5;
// scene.add(floor);
const reflector = new Reflector(floorGeometry, {
  clipBias: 0.003,
  // metalness: 0.6,
  textureWidth: window.innerWidth * window.devicePixelRatio,
  textureHeight: window.innerHeight * window.devicePixelRatio,
  color: 0x889999,
  recursion: 1,
});
reflector.position.set(0, -1, 0);
reflector.rotation.x = Math.PI * -0.5;
scene.add(reflector);

// Environment
const sphereGeometry = new THREE.SphereGeometry(10, 32, 32);
const sphereMaterial = new THREE.MeshStandardMaterial({
  color: 0x202020,
  metalness: 0.6,
  roughness: 0.1,
  side: THREE.DoubleSide,
});
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.position.set(0, 0, 0);
scene.add(sphere);

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  composer.setSize(sizes.width, sizes.height);
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(2, 1, 2);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 1, 0);
controls.enableDamping = true;

/**
 * Renderer
 */
const rendererParameters = {};
rendererParameters.clearColor = "#0c0f1d";

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setClearColor(rendererParameters.clearColor);
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

gui.addColor(rendererParameters, "clearColor").onChange(() => {
  renderer.setClearColor(rendererParameters.clearColor);
});

/**
 * Postprocessing
 */
const effectComposer = new EffectComposer(renderer);
effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
effectComposer.setSize(sizes.width, sizes.height);

// renderpass
const renderPass = new RenderPass(scene, camera);
effectComposer.addPass(renderPass);

//bloompass
const bloomParameters = {};
bloomParameters.threshold = 1.0;
bloomParameters.strength = 0.5;
bloomParameters.radius = 0.9;
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(sizes.width, sizes.height),
  bloomParameters.strength,
  bloomParameters.radius,
  bloomParameters.threshold
);
effectComposer.addPass(bloomPass);

// Debug Postprocessing
gui
  .add(bloomParameters, "threshold")
  .min(0)
  .max(1)
  .step(0.001)
  .onChange(() => {
    bloomPass.threshold = bloomParameters.threshold;
  });
gui
  .add(bloomParameters, "strength")
  .min(0)
  .max(3)
  .step(0.001)
  .onChange(() => {
    bloomPass.strength = bloomParameters.strength;
  });
gui
  .add(bloomParameters, "radius")
  .min(0)
  .max(1)
  .step(0.001)
  .onChange(() => {
    bloomPass.radius = bloomParameters.radius;
  });

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  if (mixer) {
    mixer.update(deltaTime);
  }

  // Update materials
  material.uniforms.uTime.value = elapsedTime;
  coneMaterial.uniforms.uTime.value = elapsedTime;

  if (watch) {
    watch.rotation.x = elapsedTime * 0.1;
    watch.rotation.y = elapsedTime * 0.2;
  }

  // Update controls
  controls.update();

  // Render
  // renderer.render(scene, camera);

  // Render postprocessing
  effectComposer.render();

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
