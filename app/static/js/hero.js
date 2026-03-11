import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

/* TYPING EFFECT */

const text = "Backend developer • AI integrator";
let i = 0;

function type(){
if(i < text.length){
document.getElementById("typing").textContent += text.charAt(i);
i++;
setTimeout(type,80);
}
}

type();

/* THREE BACKGROUND */

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
75,
window.innerWidth/window.innerHeight,
0.1,
1000
);

camera.position.z = 60;

const renderer = new THREE.WebGLRenderer({
canvas:document.getElementById("bg"),
alpha:true,
antialias:true
});

renderer.setSize(window.innerWidth,window.innerHeight);

const controls = new OrbitControls(camera,renderer.domElement);
controls.enableZoom=false;
controls.enablePan=false;
controls.autoRotate=true;
controls.autoRotateSpeed=0.5;

/* PARTICLES */

const count = window.innerWidth < 768 ? 70 : 140;

const positions = new Float32Array(count*3);

for(let i=0;i<count;i++){

positions[i*3] = (Math.random()-0.5)*120;
positions[i*3+1] = (Math.random()-0.5)*120;
positions[i*3+2] = (Math.random()-0.5)*120;

}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute("position", new THREE.BufferAttribute(positions,3));

const material = new THREE.PointsMaterial({
color:0xffffff,
size:1.5,
transparent:true,
opacity:0.8
});

const points = new THREE.Points(geometry,material);
scene.add(points);

/* LINES */

const lineMaterial = new THREE.LineBasicMaterial({
color:0xffffff,
transparent:true,
opacity:0.2
});

const linePositions = [];

for(let i=0;i<count;i++){
for(let j=i+1;j<count;j++){

const dx = positions[i*3]-positions[j*3];
const dy = positions[i*3+1]-positions[j*3+1];
const dz = positions[i*3+2]-positions[j*3+2];

const dist = Math.sqrt(dx*dx+dy*dy+dz*dz);

if(dist < 25){

linePositions.push(
positions[i*3],positions[i*3+1],positions[i*3+2],
positions[j*3],positions[j*3+1],positions[j*3+2]
);

}

}
}

const lineGeometry = new THREE.BufferGeometry();
lineGeometry.setAttribute(
"position",
new THREE.Float32BufferAttribute(linePositions,3)
);

const lines = new THREE.LineSegments(lineGeometry,lineMaterial);
scene.add(lines);

/* ANIMATION */

function animate(){

requestAnimationFrame(animate);

points.rotation.y += 0.0008;
points.rotation.x += 0.0003;

controls.update();

renderer.render(scene,camera);

}

animate();

/* RESIZE */

window.addEventListener("resize",()=>{

camera.aspect = window.innerWidth/window.innerHeight;
camera.updateProjectionMatrix();

renderer.setSize(window.innerWidth,window.innerHeight);

});