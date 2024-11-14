import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { DDSLoader} from 'three/addons/loaders/DDSLoader.js';
import { MTLLoader} from 'three/addons/loaders/MTLLoader.js';
import { OBJLoader} from 'three/addons/loaders/OBJLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 640.0 / 480.0, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.z = 5;

var object, texture, objectLoader = false;

function onProgress(xhr) {
} 

function onError() {
}

var manager = new THREE.LoadingManager
manager.addHandler( /\.dds$/i, new DDSLoader() );

var light = new THREE.HemisphereLight(0xffffff, 0x000000);
light.position.set(0, 50, 0);
scene.add(light);

new MTLLoader(manager)
    .setPath('../model/').load('Cordeiro1.mtl', function (materials){
        materials.preload();

        new OBJLoader(manager).setMaterials(materials).setPath('../model').load('/Cordeiro1.obj', function(obj){
            object = obj;

            object.scale.x =0.03;
            object.scale.y =0.03;
            object.scale.z =0.03;

            object.position.y = -1;

            scene.add(object);
            objectLoader=true;
        },onProgress, onError);
    });
function animate() {
  requestAnimationFrame(animate);

  if(objectLoader){
  object.rotation.x +=0.002;
  object.rotation.y +=0.002;
  object.rotation.z +=0.002;
  }

  renderer.render(scene, camera);
}

animate();