import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);

let object;
const loader = new GLTFLoader();
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("model").appendChild(renderer.domElement);

camera.position.z = 500;

const topLight = new THREE.DirectionalLight(0xffffff, 1);
topLight.position.set(500, 500, 500);
topLight.castShadow = true;
scene.add(topLight);

let ambientLightIntensity = 1;
const ambientLight = new THREE.AmbientLight(0x333333, ambientLightIntensity);
scene.add(ambientLight);

const controls = new OrbitControls(camera, renderer.domElement);

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

//function loadModel(modelName) {
//    const modelPath = `/static/models/prototype/${modelName}/scene.gltf`;
//    console.log('Loading Model:', modelPath);
//
//    loader.load(
//        modelPath,
//        function (gltf) {
//            if (object) {
//                scene.remove(object);
//            }
//            object = gltf.scene;
//            scene.add(object);
//        },
//        function (xhr) {
//            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
//        },
//        function (error) {
//            console.error(error);
//        }
//    );
//}
//
//document.getElementById('model-select').addEventListener('change', function () {
//    const selectedModel = this.value;
//    console.log('Selected Model:', selectedModel);
//    loadModel(selectedModel);
//});


async function loadModelAndImages(modelName) {
    const modelPath = `/static/models/prototype/${modelName}/scene.gltf`;
    console.log('Loading Model:', modelPath);

    loader.load(
        modelPath,
        function (gltf) {
            if (object) {
                scene.remove(object);
            }
            object = gltf.scene;
            scene.add(object);
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.error(error);
        }
    );

    // Fetch and display PNG files
    try {
        console.log('Loading Model:', modelPath);

        const response = await fetch(`/viewer/model-images/${modelName}/`);
        const data = await response.json();
        const imagesContainer = document.getElementById('model-images');
        imagesContainer.innerHTML = ''; // Clear existing images

        if (data.images && Array.isArray(data.images)) {
            data.images.forEach(image => {
                const img = document.createElement('img');
                img.src = `/static/models/prototype/${modelName}/${image}`;
                img.alt = image;
                img.style.maxWidth = '200px'; // Adjust image size as needed
                img.style.margin = '5px';
                imagesContainer.appendChild(img);
            });
        } else {
            console.error('Invalid image data received:', data);
        }
    } catch (error) {
        console.error('Error fetching model images:', error);
    }
}

document.getElementById('model-select').addEventListener('change', function () {
    const selectedModel = this.value;
    console.log('Selected Model:', selectedModel);
    loadModelAndImages(selectedModel);
});


async function populateDropdown() {
    try {
        const response = await fetch('/viewer/model-names/');
        const data = await response.json();
        const select = document.getElementById('model-select');

        if (data.models && Array.isArray(data.models)) {
            data.models.forEach(model => {
                const option = document.createElement('option');
                option.value = model;
                option.textContent = model;
                select.appendChild(option);
            });
        } else {
            console.error('Invalid model data received:', data);
        }
    } catch (error) {
        console.error('Error fetching model names:', error);
    }
}

populateDropdown();

function updateAmbientLight(value) {
    ambientLight.intensity = parseFloat(value);
    document.getElementById('light-value').textContent = value;
}

document.getElementById('light-slider').addEventListener('input', function () {
    updateAmbientLight(this.value);
});

function animate() {
    requestAnimationFrame(animate);
    if (object && document.getElementById('model-select').value === "eye") {
        object.rotation.y = -3 + mouseX / window.innerWidth * 3;
        object.rotation.x = -1.2 + mouseY * 2.5 / window.innerHeight;
    }
    renderer.render(scene, camera);
}

window.addEventListener("resize", function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

document.onmousemove = (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
};

animate();
