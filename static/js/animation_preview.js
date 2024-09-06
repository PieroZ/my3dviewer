import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js';

class Website3DDemo {
  constructor() {
    this._Initialize();
  }

  _Initialize() {
    this._threejs = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    this._threejs.shadowMap.enabled = true;
    this._threejs.shadowMap.type = THREE.PCFSoftShadowMap;
    this._threejs.physicallyCorrectLights = true;
    this._threejs.toneMapping = THREE.ACESFilmicToneMapping;
    this._threejs.outputEncoding = THREE.sRGBEncoding;

    const modelDiv = document.getElementById('model');
    modelDiv.appendChild(this._threejs.domElement);

    this._threejs.setSize(window.innerWidth, window.innerHeight);
    window.addEventListener('resize', () => this._OnWindowResize(), false);

    const fov = 60;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 0.1;
    const far = 150000.0;
    this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this._camera.position.set(323, 1, 410);

    this._scene = new THREE.Scene();

    let light = new THREE.DirectionalLight(0xFFFFFF);
    light.position.set(20, 100, 10);
    light.target.position.set(0, 0, 0);
    light.castShadow = true;
    light.shadow.bias = -0.001;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 500.0;
    light.shadow.camera.left = 100;
    light.shadow.camera.right = -100;
    light.shadow.camera.top = 100;
    light.shadow.camera.bottom = -100;
    this._scene.add(light);

    let ambientLightIntensity = 1;
    this._ambientLight = new THREE.AmbientLight(0xFFFFFF, ambientLightIntensity);
    this._scene.add(this._ambientLight);

    this._controls = new OrbitControls(this._camera, this._threejs.domElement);
    this._controls.target.set(0, 1, 0); // Center the model
    this._controls.update();

    this._mixers = [];
    this._previousRAF = null;

    this._LoadGLTFModelAndPlay('/static/animations/darci01/0/darci01.gltf', new THREE.Vector3(0, 0, 0));

    this._RAF();
  }

  _LoadGLTFModelAndPlay(modelFile, offset) {
    const loader = new GLTFLoader();

    console.log('trying to load :', modelFile);
    loader.load(modelFile, (gltf) => {

      console.log('trying to load :', modelFile);
      this._ClearScene();

      const model = gltf.scene;
      model.scale.set(1, 1, 1);
      model.position.copy(offset);
      model.traverse((c) => {
        c.castShadow = true;
        if (c.isMesh) {
            c.userData.originalMaterial = c.material;
        }
      });

      this._scene.add(model);

      const mixer = new THREE.AnimationMixer(model);
      mixer.timeScale = parseFloat(document.getElementById('speed-slider').value); // Set initial animation speed
      this._mixers.push(mixer);

      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
      });
    });
  }

  _ClearScene() {
    // Clear previous model and mixers
    this._scene.children = this._scene.children.filter(child => !(child.isMesh || child.isGroup));
    this._mixers = [];
  }

  _OnWindowResize() {
    this._camera.aspect = window.innerWidth / window.innerHeight;
    this._camera.updateProjectionMatrix();
    this._threejs.setSize(window.innerWidth, window.innerHeight);
  }

  _Step(timeElapsed) {
    const timeElapsedS = timeElapsed * 0.001;
    if (this._mixers) {
      this._mixers.forEach((m) => m.update(timeElapsedS));
    }
  }

  _RAF() {
    requestAnimationFrame((t) => {
      if (this._previousRAF === null) {
        this._previousRAF = t;
      }

      this._RAF();

      this._threejs.render(this._scene, this._camera);
      this._Step(t - this._previousRAF);
      this._previousRAF = t;
    });
  }

  _ToggleHighlight() {
    this._scene.traverse((c) => {
        if (c.isMesh) {
            if (c.material === c.userData.originalMaterial) {
                // Apply a highlight material
                c.material = new THREE.MeshBasicMaterial({
                    color: 0xff0000, // Highlight color (red)
                    wireframe: true, // Highlight with wireframe
                });
            } else {
                // Revert to the original material
                c.material = c.userData.originalMaterial;
            }
        }
    });
  }

  updateAnimationSpeed(speed) {
    this._mixers.forEach((mixer) => {
      mixer.timeScale = speed;
    });
  }
}

let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
  _APP = new Website3DDemo();
});

document.getElementById('toggle-highlight').addEventListener('click', function () {
    _APP._ToggleHighlight();
});

document.getElementById('animation').addEventListener('change', function () {
  const selectedAnimation = this.value;
  console.log('Selected animation:', selectedAnimation);

  _APP._LoadGLTFModelAndPlay(`/static/animations/${selectedAnimation}/0/${selectedAnimation}.gltf`, new THREE.Vector3(0, 0, 0));
});

document.getElementById('light-slider').addEventListener('input', function () {
    updateAmbientLight(this.value);
});

document.getElementById('subcategory').addEventListener('change', function () {
    const selectedCategory = document.getElementById('animation').value;
    const selectedSubcategory = this.value;
    const selectedModel = `${selectedCategory}/${selectedSubcategory}/${selectedCategory}.gltf`;
    console.log('Selected model path:', selectedModel);

    _APP._LoadGLTFModelAndPlay(`/static/animations/${selectedModel}`, new THREE.Vector3(0, 0, 0));
});

document.getElementById('speed-slider').addEventListener('input', function () {
    const speed = parseFloat(this.value);
    document.getElementById('speed-value').textContent = speed + 'x';
    _APP.updateAnimationSpeed(speed);
});

function updateAmbientLight(value) {
    _APP._ambientLight.intensity = parseFloat(value);
    document.getElementById('light-value').textContent = value;
}
