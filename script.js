import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
70,
window.innerWidth/window.innerHeight,
0.1,
1000
);

camera.position.z = 10;

const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
renderer.setSize(window.innerWidth,window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));

document.body.appendChild(renderer.domElement);


// controles

const controls = new OrbitControls(camera, renderer.domElement);

controls.enableZoom=false;
controls.enablePan=false;
controls.enableDamping=true;
controls.dampingFactor=0.05;

controls.maxPolarAngle=Math.PI*0.6;
controls.minPolarAngle=Math.PI*0.4;


// partículas

const count = 140;

const positions=[];
const velocities=[];

for(let i=0;i<count;i++){

positions.push(
(Math.random()-0.5)*12,
(Math.random()-0.5)*8,
(Math.random()-0.5)*8
);

velocities.push(
(Math.random()-0.5)*0.015,
(Math.random()-0.5)*0.015,
(Math.random()-0.5)*0.01
);

}

const geo=new THREE.BufferGeometry();

geo.setAttribute(
"position",
new THREE.Float32BufferAttribute(positions,3)
);


const particleMat=new THREE.PointsMaterial({

size:0.12,
color:0x8aa4ff,

transparent:true,
opacity:0.8,

blending:THREE.AdditiveBlending,
depthWrite:false

});

const particles=new THREE.Points(geo,particleMat);

scene.add(particles);


// material linhas

const lineMaterial=new THREE.LineBasicMaterial({

vertexColors:true,
transparent:true,
opacity:0.5,
blending:THREE.AdditiveBlending

});


let lines;


function animate(){

requestAnimationFrame(animate);

const pos=geo.attributes.position.array;


// movimento partículas

for(let i=0;i<count;i++){

let i3=i*3;

pos[i3]+=velocities[i*3];
pos[i3+1]+=velocities[i*3+1];
pos[i3+2]+=velocities[i*3+2];

if(pos[i3]>6||pos[i3]<-6) velocities[i*3]*=-1;
if(pos[i3+1]>4||pos[i3+1]<-4) velocities[i*3+1]*=-1;
if(pos[i3+2]>4||pos[i3+2]<-4) velocities[i*3+2]*=-1;

}

geo.attributes.position.needsUpdate=true;


// pulsação

particleMat.size=
0.12 + Math.sin(performance.now()*0.002)*0.02;


// remover linhas antigas

if(lines) scene.remove(lines);


let linePositions=[];
let colors=[];


for(let i=0;i<count;i++){

for(let j=i+1;j<count;j++){

let ix=i*3;
let jx=j*3;

let dx=pos[ix]-pos[jx];
let dy=pos[ix+1]-pos[jx+1];
let dz=pos[ix+2]-pos[jx+2];

let dist=Math.sqrt(dx*dx+dy*dy+dz*dz);

if(dist<1.6){

let alpha = 1-dist/1.6;

linePositions.push(
pos[ix],pos[ix+1],pos[ix+2],
pos[jx],pos[jx+1],pos[jx+2]
);

colors.push(
0.5*alpha,0.6*alpha,1*alpha,
0.5*alpha,0.6*alpha,1*alpha
);

}

}

}


const lineGeo=new THREE.BufferGeometry();

lineGeo.setAttribute(
"position",
new THREE.Float32BufferAttribute(linePositions,3)
);

lineGeo.setAttribute(
"color",
new THREE.Float32BufferAttribute(colors,3)
);


lines=new THREE.LineSegments(lineGeo,lineMaterial);

scene.add(lines);


controls.update();

renderer.render(scene,camera);

}

animate();


// resize

window.addEventListener("resize",()=>{

camera.aspect=window.innerWidth/window.innerHeight;
camera.updateProjectionMatrix();

renderer.setSize(window.innerWidth,window.innerHeight);

});
