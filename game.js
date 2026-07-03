// =============================================================
// City Empire: Modern Metropolis
// Single-file Three.js city builder
// =============================================================
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// -------------------- CONFIG --------------------
const GRID = 40;          // grid size NxN
const TILE = 2;           // world units per tile
const HALF = (GRID * TILE) / 2;

const BUILDINGS = {
  road:        { name:'Road',          icon:'🛣️', cost:50,   cat:'road',     color:0x5a6070, h:0.05, size:1 },
  res_low:     { name:'Low Density',   icon:'🏠', cost:200,  cat:'res',      color:0xffdd88, accent:0xdd8800, h:1.2, jobs:0, homes:4, power:1, water:1, tax:8, size:1 },
  res_med:     { name:'Med Density',   icon:'🏘️', cost:600,  cat:'res',      color:0xff8fab, accent:0xcc2255, h:2.6, homes:12, power:3, water:3, tax:22, size:2 },
  res_high:    { name:'High Density',  icon:'🏢', cost:1800, cat:'res',      color:0x88ccff, accent:0x1155aa, h:5.0, homes:40, power:8, water:8, tax:75, size:2 },
  com_shop:    { name:'Shop',          icon:'🏪', cost:300,  cat:'com',      color:0x55ddcc, accent:0x117766, h:1.4, jobs:6, power:2, water:1, tax:25, size:1 },
  com_mall:    { name:'Mall',          icon:'🏬', cost:1500, cat:'com',      color:0x55aaff, accent:0x1144bb, h:2.2, jobs:25, power:6, water:3, tax:90, size:3 },
  ind_factory: { name:'Factory',       icon:'🏭', cost:800,  cat:'ind',      color:0xffaa44, accent:0xaa5500, h:1.6, jobs:20, power:6, water:4, tax:60, pollution:5, size:2 },
  ind_office:  { name:'Office',        icon:'🏛️', cost:1200, cat:'com',      color:0xaa88ff, accent:0x5522aa, h:4.2, jobs:30, power:5, water:2, tax:110, size:2 },
  bank:        { name:'Bank',          icon:'🏦', cost:2500, cat:'com',      color:0xffd700, accent:0x996600, h:3.5, jobs:40, power:4, water:2, tax:200, size:2 },
  gas_station: { name:'Gas Station',   icon:'⛽', cost:500,  cat:'com',      color:0xffee55, accent:0xdd8800, h:1.0, jobs:4, power:2, water:1, tax:40, size:1 },
  skyscraper:  { name:'Skyscraper A',  icon:'🌆', cost:8000, cat:'com',      color:0x6655ff, accent:0x221188, h:10.0, jobs:120, homes:60, power:20, water:12, tax:400, unlock:'metro', size:2 },
  skyscraper2: { name:'Skyscraper B',  icon:'🏙️', cost:10000,cat:'com',      color:0x00ccff, accent:0x004466, h:13.0, jobs:150, homes:80, power:25, water:15, tax:500, unlock:'metro', size:2 },
  skyscraper3: { name:'Skyscraper C',  icon:'🌇', cost:18000,cat:'com',      color:0xff6600, accent:0x882200, h:16.0, jobs:200, homes:100, power:35, water:20, tax:800, unlock:'big', size:3 },
  power_coal:  { name:'Coal Plant',    icon:'⚡', cost:1500, cat:'util',     color:0x99aabb, accent:0x445566, h:1.8, powerGen:80, pollution:8, size:3 },
  power_solar: { name:'Solar Farm',    icon:'☀️', cost:2200, cat:'util',     color:0xffee33, h:0.3, powerGen:50, size:3 },
  power_wind:  { name:'Wind Farm',     icon:'💨', cost:2000, cat:'util',     color:0xddeeff, h:5.0, powerGen:60, size:2 },
  water_tile:  { name:'Lake / River',  icon:'🌊', cost:80,   cat:'util',     color:0x2299ff, h:0.05, size:1, isWater:true },
  water_pump:  { name:'Water Pump',    icon:'💧', cost:900,  cat:'util',     color:0x44bbff, accent:0x1166aa, h:1.0, waterGen:80, size:1 },
  park:        { name:'Park',          icon:'🌳', cost:200,  cat:'public',   color:0x44cc55, h:0.2, happy:5, size:1 },
  school:      { name:'School',        icon:'🏫', cost:1200, cat:'public',   color:0xff6655, accent:0xaa2200, h:1.6, happy:3, edu:1, size:2 },
  hospital:    { name:'Hospital',      icon:'🏥', cost:2000, cat:'public',   color:0xffffff, accent:0xff3344, h:2.4, happy:4, size:2 },
  police:      { name:'Police',        icon:'🚓', cost:900,  cat:'public',   color:0x4477ff, accent:0xffdd00, h:1.4, happy:2, size:1 },
  fire:        { name:'Fire Station',  icon:'🚒', cost:900,  cat:'public',   color:0xff4422, accent:0xffdd00, h:1.4, happy:2, size:1 },
  railway:     { name:'Railway',       icon:'🚂', cost:80,   cat:'transit',  color:0x555566, h:0.08, size:1 },
  bus_stop:    { name:'Bus Stop',      icon:'🚌', cost:300,  cat:'transit',  color:0xffcc22, accent:0x885500, h:0.5, happy:2, size:1 },
  metro:       { name:'Metro Station', icon:'🚇', cost:5000, cat:'transit',  color:0xbb55ff, accent:0x660099, h:2.2, happy:6, unlock:'metro', size:2 },
  airport:     { name:'Airport',       icon:'✈️', cost:15000,cat:'transit',  color:0xddeeff, accent:0x445566, h:1.0, happy:8, tax:200, unlock:'big', size:4 },
  bulldoze:    { name:'Bulldoze',      icon:'💥', cost:0,    cat:'tool',     color:0xef4444, size:1 }
};

const CATEGORIES = [
  { id:'road',    icon:'🛣️', name:'Roads',     items:['road','railway'] },
  { id:'res',     icon:'🏘️', name:'Housing',   items:['res_low','res_med','res_high'] },
  { id:'com',     icon:'🏬', name:'Commerce',  items:['com_shop','com_mall','ind_office','bank','gas_station','skyscraper','skyscraper2','skyscraper3'] },
  { id:'ind',     icon:'🏭', name:'Industry',  items:['ind_factory'] },
  { id:'util',    icon:'⚡', name:'Utilities', items:['power_coal','power_solar','power_wind','water_tile','water_pump'] },
  { id:'public',  icon:'🌳', name:'Public',    items:['park','school','hospital','police','fire'] },
  { id:'transit', icon:'🚌', name:'Transit',   items:['bus_stop','metro','airport'] },
  { id:'tool',    icon:'🛠️', name:'Tools',     items:['bulldoze'] }
];

const FIRST_NAMES = ['Agus','Budi','Citra','Dewi','Eko','Fitri','Gita','Hadi','Indra','Joko','Kartika','Lina','Made','Nia','Oka','Putri','Rina','Sari','Tono','Udin','Vina','Wahyu','Yuli','Zaki'];
const LAST_NAMES = ['Pratama','Wijaya','Sari','Susanto','Rahman','Hidayat','Saputra','Putra','Lestari','Anggraini'];
const JOBS = ['Programmer','Teacher','Doctor','Engineer','Designer','Manager','Worker','Driver','Chef','Artist'];
const EDUS = ['SD','SMP','SMA','Sarjana','Master'];

// -------------------- STATE --------------------
const state = {
  running: false,
  paused: false,
  speed: 1,             // 0=pause, 1, 2, 3
  day: 1,
  money: 320000,
  population: 0,
  happiness: 70,
  pollution: 0,
  traffic: 0,
  weather: 'sunny',
  season: 'dry',
  income: 0,
  expense: 0,
  level: 1,
  // grid: {type, rotation, mesh}
  grid: [],
  buildings: [],     // {x,y,type,mesh}
  citizens: [],
  vehicles: [],
  pedestrians: [],
  selected: null,    // selected building tool key
  placeRotation: 0,  // 0/1/2/3 = 0°/90°/180°/270° (steps of Math.PI/2)
  pending: null,     // {gx, gz} — awaiting confirm click after first click
  selectedBuilding: null, // building selected for info panel
  minimapMode: 'normal',
  notifications: [],
  power: { gen:0, demand:0 },
  water: { gen:0, demand:0 },
  jobs: { offered:0, taken:0 },
  homes: 0,
  treeCount: 0,
  tickSinceLastDay: 0,
  constructions: [],   // [{gx, gz, key, mesh, scaffMesh, progress, duration, rotation}]
  destructions: [],    // [{mesh, particles, t}]
};

for (let i=0;i<GRID;i++){
  state.grid[i] = [];
  for (let j=0;j<GRID;j++) state.grid[i][j] = { type:null, mesh:null, rotation:0 };
}

// -------------------- UTILS --------------------
const rand = (a,b)=>a+Math.random()*(b-a);
const randInt = (a,b)=>Math.floor(rand(a,b+1));
const choice = arr=>arr[Math.floor(Math.random()*arr.length)];
const fmtMoney = n => (n>=1000?(n/1000).toFixed(n>=10000?0:1)+'k':n.toFixed(0));
const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));

// -------------------- THREE.JS SETUP --------------------
const canvas = document.getElementById('game-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias:true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

// (no post-processing needed — TheoTown style uses direct render)

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 100, 240);

// Camera - isometric-ish perspective
const camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 500);
const camTarget = new THREE.Vector3(0, 0, 0);
let camDist = 60;
let camAngle = Math.PI / 4;
let camPitch = Math.PI / 4;

function updateCamera(){
  camera.position.x = camTarget.x + Math.cos(camAngle) * Math.cos(camPitch) * camDist;
  camera.position.z = camTarget.z + Math.sin(camAngle) * Math.cos(camPitch) * camDist;
  camera.position.y = camTarget.y + Math.sin(camPitch) * camDist;
  camera.lookAt(camTarget);
}
updateCamera();

// Lighting
const ambient = new THREE.AmbientLight(0xffffff, 1.05);
scene.add(ambient);
const sun = new THREE.DirectionalLight(0xfff5cc, 1.6);
sun.position.set(50, 90, 40);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -60;
sun.shadow.camera.right = 60;
sun.shadow.camera.top = 60;
sun.shadow.camera.bottom = -60;
sun.shadow.camera.near = 0.5;
sun.shadow.camera.far = 200;
scene.add(sun);

const hemi = new THREE.HemisphereLight(0xd4eeff, 0x88cc66, 0.6);
scene.add(hemi);

// ---- Procedural Grass Ground (no external assets, lightweight) ----
// 1. Canvas texture: 128×128 green noise — baked once, zero per-frame cost
function makeGrassTexture(){
  const S = 128;
  const cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const ctx = cv.getContext('2d');
  // Base fill
  ctx.fillStyle = '#5cb85c';
  ctx.fillRect(0, 0, S, S);
  // Random dark/light grass flecks
  const greens = ['#4cae4c','#5cb85c','#6ec96e','#3d9a3d','#72c272','#449944','#7dd87d','#3a8a3a'];
  for (let i = 0; i < 1400; i++){
    const x = Math.random()*S, y = Math.random()*S;
    const w = Math.random()*3+1, h = Math.random()*4+2;
    ctx.fillStyle = greens[Math.floor(Math.random()*greens.length)];
    ctx.globalAlpha = 0.55 + Math.random()*0.45;
    ctx.fillRect(x, y, w, h);
  }
  // Subtle dirt patches
  for (let i = 0; i < 80; i++){
    const x = Math.random()*S, y = Math.random()*S;
    ctx.fillStyle = `rgba(${120+Math.random()*30|0},${90+Math.random()*20|0},${50+Math.random()*20|0},0.18)`;
    ctx.beginPath();
    ctx.ellipse(x, y, Math.random()*5+2, Math.random()*4+2, 0, 0, Math.PI*2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(20, 20);   // tile across the grid
  return tex;
}

const grassTex = makeGrassTexture();

// 2. Base ground plane — raycast target + textured surface
const groundGeo = new THREE.PlaneGeometry(GRID*TILE, GRID*TILE, 1, 1);
const groundMat = new THREE.MeshLambertMaterial({ map: grassTex, polygonOffset: true, polygonOffsetFactor: 4, polygonOffsetUnits: 4 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI/2;
ground.receiveShadow = true;
scene.add(ground);

// 3. Instanced grass blades — 2000 tiny quads using InstancedMesh (1 draw call)
(function spawnGrassBlades(){
  const BLADE_COUNT = 2000;
  const bladeGeo = new THREE.PlaneGeometry(0.06, 0.18);
  // Tilt blades upward from ground
  bladeGeo.rotateX(-Math.PI/2);
  // Shift pivot to base of blade
  bladeGeo.translate(0, 0.09, 0);
  // Two crossed quads per blade for volume (merge into one buffer)
  const bladeGeo2 = bladeGeo.clone();
  bladeGeo2.rotateY(Math.PI/2);
  const merged = THREE.BufferGeometryUtils
    ? THREE.BufferGeometryUtils.mergeGeometries([bladeGeo, bladeGeo2])
    : bladeGeo;

  const bladeMat = new THREE.MeshLambertMaterial({
    color: 0x4cae4c, side: THREE.DoubleSide,
    alphaTest: 0.1
  });
  const iMesh = new THREE.InstancedMesh(merged || bladeGeo, bladeMat, BLADE_COUNT);
  iMesh.receiveShadow = false;
  iMesh.castShadow = false;

  const dummy = new THREE.Object3D();
  const TOTAL = GRID * TILE;
  for (let i = 0; i < BLADE_COUNT; i++){
    const tx = (Math.random()-0.5)*TOTAL;
    const tz = (Math.random()-0.5)*TOTAL;
    // Skip center (city area) — thin density near 0,0
    const dist = Math.sqrt(tx*tx+tz*tz);
    if (dist < 4) { iMesh.setMatrixAt(i, new THREE.Matrix4()); continue; }
    dummy.position.set(tx, 0, tz);
    dummy.rotation.y = Math.random()*Math.PI*2;
    const s = 0.7 + Math.random()*0.7;
    dummy.scale.set(s, s + Math.random()*0.5, s);
    dummy.updateMatrix();
    iMesh.setMatrixAt(i, dummy.matrix);
  }
  iMesh.instanceMatrix.needsUpdate = true;
  iMesh.position.y = 0.001;
  scene.add(iMesh);
})();

// Grid lines
const gridHelper = new THREE.GridHelper(GRID*TILE, GRID, 0x000000, 0x000000);
gridHelper.material.opacity = 0.10;
gridHelper.material.transparent = true;
gridHelper.position.y = 0.02;
scene.add(gridHelper);

// Decorative trees — loaded from model/tree/*.glb, placed randomly
const gltfLoader = new GLTFLoader();
const TREE_PATHS = [
  { path: './model/tree/small_pine.glb', targetH: 0.30 },
];
const TREE_TEMPLATES = [];
let treesLoaded = false;

function loadTreeModels(){
  let pending = TREE_PATHS.length;
  for (const entry of TREE_PATHS){
    const { path, targetH } = entry;
    gltfLoader.load(path, (gltf) => {
      const root = gltf.scene;
      for (let pass = 0; pass < 2; pass++){
        const box = new THREE.Box3().setFromObject(root);
        const size = box.getSize(new THREE.Vector3());
        if (size.y < 0.001) break;
        root.scale.multiplyScalar(targetH / size.y);
      }
      const box2 = new THREE.Box3().setFromObject(root);
      root.position.y -= box2.min.y;
      const center = box2.getCenter(new THREE.Vector3());
      root.position.x -= center.x;
      root.position.z -= center.z;
      root.traverse(o => { if (o.isMesh){ o.castShadow = true; o.receiveShadow = true; }});
      const finalH = new THREE.Box3().setFromObject(root).getSize(new THREE.Vector3()).y;
      console.log(`[tree] loaded ${path} — final height ${finalH.toFixed(2)}`);
      TREE_TEMPLATES.push(root);
      if (--pending === 0){ treesLoaded = true; /* auto-spawn disabled */ }
    }, undefined, (err) => {
      console.warn(`[tree] failed: ${path}`, err);
      if (--pending === 0){ treesLoaded = true; }
    });
  }
}

function makeTreeMesh(){
  if (TREE_TEMPLATES.length === 0){
    // procedural fallback
    const g = new THREE.Group();
    const scale = rand(0.5, 0.9);
    const leafMat = mat(choice([0x27ae60,0x2ecc71,0x16a085,0x3aaa5a,0x145a32]));
    const trunkMat = mat(0x7a4a20);
    const cone1 = new THREE.Mesh(new THREE.ConeGeometry(0.42*scale, 0.9*scale, 7), leafMat);
    cone1.position.y = 0.75*scale; cone1.castShadow = true;
    const cone2 = new THREE.Mesh(new THREE.ConeGeometry(0.3*scale, 0.7*scale, 7), leafMat);
    cone2.position.y = 1.1*scale; cone2.castShadow = true;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.07*scale, 0.1*scale, 0.55*scale, 5), trunkMat);
    trunk.position.y = 0.27*scale;
    g.add(cone1); g.add(cone2); g.add(trunk);
    return g;
  }
  const tpl = choice(TREE_TEMPLATES);
  const clone = tpl.clone(true);
  // Random scale variation (0.8 – 1.2×)
  const s = rand(0.8, 1.2);
  clone.scale.setScalar(s);
  // Random Y rotation
  clone.rotation.y = rand(0, Math.PI * 2);
  return clone;
}

function spawnDecorativeTrees(){
  const treeGroup = new THREE.Group();
  for (let i = 0; i < 90; i++){
    const tx = rand(-HALF+1, HALF-1);
    const tz = rand(-HALF+1, HALF-1);
    if (Math.abs(tx) < 6 && Math.abs(tz) < 6) continue;
    const g = makeTreeMesh();
    g.position.set(tx, 0, tz);
    g.userData.tree = true;
    treeGroup.add(g);
  }
  scene.add(treeGroup);
  state.treeGroup = treeGroup;
}

// Called once GLB templates are ready — replace procedural trees with GLB
function respawnDecorativeTrees(){
  if (state.treeGroup){
    scene.remove(state.treeGroup);
    state.treeGroup.traverse(o => { if (o.isMesh && o.geometry) o.geometry.dispose(); });
  }
  spawnDecorativeTrees();
}

// spawnDecorativeTrees() disabled — trees placed manually in-game

// Cloud particles — load from GLB model
const cloudGroup = new THREE.Group();
let cloudTemplate = null;

// Load fluffy cloud model
gltfLoader.load('./model/fluffy_cloud.glb', (gltf) => {
  cloudTemplate = gltf.scene;
  // Scale and setup cloud template
  const box = new THREE.Box3().setFromObject(cloudTemplate);
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  if (maxDim > 0.001) {
    cloudTemplate.scale.setScalar(4.0 / maxDim); // Scale to ~4 units
  }
  // Center the cloud
  const box2 = new THREE.Box3().setFromObject(cloudTemplate);
  const center = box2.getCenter(new THREE.Vector3());
  cloudTemplate.position.x -= center.x;
  cloudTemplate.position.y -= center.y;
  cloudTemplate.position.z -= center.z;
  
  // Setup materials for cloud meshes
  cloudTemplate.traverse(obj => {
    if (obj.isMesh) {
      if (obj.material) {
        obj.material = obj.material.clone();
        obj.material.transparent = true;
        obj.material.opacity = 0.85;
      }
      obj.castShadow = false;
      obj.receiveShadow = false;
    }
  });
  
  // Create initial clouds using the template
  for (let i = 0; i < 14; i++) {
    const c = cloudTemplate.clone();
    c.position.set(rand(-HALF, HALF), rand(22, 40), rand(-HALF, HALF));
    c.scale.multiplyScalar(rand(0.8, 2.0));
    c.rotation.y = rand(0, Math.PI * 2);
    cloudGroup.add(c);
  }
}, undefined, (err) => {
  console.warn('Failed to load cloud model, using fallback spheres', err);
  // Fallback to procedural clouds if GLB fails
  const cloudGeo = new THREE.SphereGeometry(2, 8, 6);
  const cloudMat = new THREE.MeshBasicMaterial({ color:0xffffff, transparent:true, opacity:0.82 });
  for (let i=0;i<14;i++){
    const c = new THREE.Mesh(cloudGeo, cloudMat);
    c.position.set(rand(-HALF, HALF), rand(22, 40), rand(-HALF, HALF));
    c.scale.set(rand(1,2.5), rand(0.5,1), rand(1,2.5));
    cloudGroup.add(c);
  }
});

scene.add(cloudGroup);

// Highlight cursor
const cursorGeo = new THREE.BoxGeometry(TILE, 0.05, TILE);
const cursorMat = new THREE.MeshBasicMaterial({ color:0xffdd00, transparent:true, opacity:0.45 });
const cursorMesh = new THREE.Mesh(cursorGeo, cursorMat);
cursorMesh.position.y = 0.05;
cursorMesh.visible = false;
scene.add(cursorMesh);

// Ghost preview for pending placement (semi-transparent real mesh)
let ghostMesh = null;
function clearGhost(){
  if (ghostMesh){
    scene.remove(ghostMesh);
    ghostMesh.traverse(o=>{ if (o.isMesh && o.geometry) o.geometry.dispose(); });
    ghostMesh = null;
  }
}
function spawnGhost(key, gx, gz){
  clearGhost();
  ghostMesh = makeBuildingMesh(key);
  if (!ghostMesh) return;
  const size = getSize(key);
  if (size > 1 && !ghostMesh.userData.glb) ghostMesh.scale.set(size, 1, size);
  const wp = footprintCenterWorld(gx, gz, size);
  ghostMesh.position.set(wp.x, 0, wp.z);
  ghostMesh.rotation.y = state.placeRotation * Math.PI / 2;
  // make all materials transparent + red tint
  ghostMesh.traverse(o=>{
    if (o.isMesh && o.material){
      const m = o.material.clone();
      m.transparent = true;
      m.opacity = 0.6;
      if (m.color) m.color = new THREE.Color(0xff4444);
      o.material = m;
      o.castShadow = false;
      o.receiveShadow = false;
    }
  });
  scene.add(ghostMesh);
}

// -------------------- COORD HELPERS --------------------
function gridToWorld(gx, gz){
  return { x: gx*TILE - HALF + TILE/2, z: gz*TILE - HALF + TILE/2 };
}
function worldToGrid(wx, wz){
  return {
    x: Math.floor((wx + HALF) / TILE),
    z: Math.floor((wz + HALF) / TILE)
  };
}
function inBounds(gx,gz){ return gx>=0 && gx<GRID && gz>=0 && gz<GRID; }

// ===================== AUDIO SYSTEM =====================
// Audio system with external music files for menu and gameplay
const Audio = (() => {
  let ctx = null;
  let masterGain = null;
  let musicGain  = null;
  let sfxGain    = null;
  let ambGain    = null;
  let musicPlaying = false;
  let ambientNodes = [];
  let currentMusic = null; // Current HTMLAudioElement
  let currentMusicType = null; // 'menu' or 'gameplay'

  // Preload music - use HTMLAudioElement to avoid name conflict
  const menuMusic = new window.Audio();
  menuMusic.src = 'music/main-menu.mp3';
  menuMusic.loop = true;
  menuMusic.volume = 0.35;
  
  const gameplayMusic = new window.Audio();
  gameplayMusic.src = 'music/gameplay.mp3';
  gameplayMusic.loop = true;
  gameplayMusic.volume = 0.35;

  function getCtx(){
    if (!ctx){
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = ctx.createGain(); masterGain.gain.value = 0.6;
      musicGain  = ctx.createGain(); musicGain.gain.value  = 0.35;
      sfxGain    = ctx.createGain(); sfxGain.gain.value    = 0.7;
      ambGain    = ctx.createGain(); ambGain.gain.value    = 0.15;
      musicGain.connect(masterGain);
      sfxGain.connect(masterGain);
      ambGain.connect(masterGain);
      masterGain.connect(ctx.destination);
    }
    return ctx;
  }

  // --- Helpers ---
  function osc(freq, type, dur, gainVal, dest, startTime, detune=0){
    const c = getCtx();
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type; o.frequency.value = freq; o.detune.value = detune;
    g.gain.setValueAtTime(gainVal, startTime);
    g.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);
    o.connect(g); g.connect(dest);
    o.start(startTime); o.stop(startTime + dur + 0.05);
  }

  function noise(dur, gainVal, dest, startTime, filterFreq=800){
    const c = getCtx();
    const bufSize = c.sampleRate * Math.min(dur, 1);
    const buf = c.createBuffer(1, bufSize, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i=0;i<bufSize;i++) data[i] = Math.random()*2-1;
    const src = c.createBufferSource();
    src.buffer = buf;
    const filt = c.createBiquadFilter();
    filt.type='lowpass'; filt.frequency.value=filterFreq;
    const g = c.createGain();
    g.gain.setValueAtTime(gainVal, startTime);
    g.gain.exponentialRampToValueAtTime(0.0001, startTime+dur);
    src.connect(filt); filt.connect(g); g.connect(dest);
    src.start(startTime); src.stop(startTime+dur+0.05);
  }

  // --- Music playback from external files ---
  function playMenuMusic(){
    stopAllMusic();
    currentMusic = menuMusic;
    currentMusicType = 'menu';
    const promise = menuMusic.play();
    if (promise !== undefined) {
      promise.catch(err => console.log('Menu music autoplay blocked'));
    }
    musicPlaying = true;
  }

  function playGameplayMusic(){
    stopAllMusic();
    currentMusic = gameplayMusic;
    currentMusicType = 'gameplay';
    const promise = gameplayMusic.play();
    if (promise !== undefined) {
      promise.catch(err => console.log('Gameplay music autoplay blocked'));
    }
    musicPlaying = true;
  }

  function stopAllMusic(){
    menuMusic.pause();
    menuMusic.currentTime = 0;
    gameplayMusic.pause();
    gameplayMusic.currentTime = 0;
    currentMusic = null;
    musicPlaying = false;
  }

  function startMusic(){
    if (musicPlaying) return;
    // Default to menu music
    playMenuMusic();
  }

  function stopMusic(){ 
    stopAllMusic();
  }

  // --- Ambient city sounds (traffic hum, wind) ---
  function startAmbient(){
    const c = getCtx();
    // Low traffic hum
    const hum = c.createOscillator();
    hum.type = 'sawtooth'; hum.frequency.value = 55;
    const humGain = c.createGain(); humGain.gain.value = 0.04;
    const humFilt = c.createBiquadFilter(); humFilt.type='lowpass'; humFilt.frequency.value=120;
    hum.connect(humFilt); humFilt.connect(humGain); humGain.connect(ambGain);
    hum.start();
    ambientNodes.push(hum);

    // Wind noise
    const windBuf = c.createBuffer(1, c.sampleRate*2, c.sampleRate);
    const wd = windBuf.getChannelData(0);
    for(let i=0;i<wd.length;i++) wd[i]=Math.random()*2-1;
    const wind = c.createBufferSource(); wind.buffer=windBuf; wind.loop=true;
    const wFilt = c.createBiquadFilter(); wFilt.type='bandpass'; wFilt.frequency.value=400; wFilt.Q.value=0.5;
    const wGain = c.createGain(); wGain.gain.value=0.06;
    wind.connect(wFilt); wFilt.connect(wGain); wGain.connect(ambGain);
    wind.start();
    ambientNodes.push(wind);
  }

  // --- SFX ---
  function playPlace(){
    const c = getCtx(); const t = c.currentTime;
    osc(520, 'sine', 0.08, 0.4, sfxGain, t);
    osc(780, 'sine', 0.06, 0.3, sfxGain, t+0.05);
    osc(1040,'sine', 0.05, 0.2, sfxGain, t+0.10);
  }
  function playBulldoze(){
    const c = getCtx(); const t = c.currentTime;
    noise(0.18, 0.5, sfxGain, t, 300);
    osc(80, 'sawtooth', 0.2, 0.3, sfxGain, t);
  }
  function playError(){
    const c = getCtx(); const t = c.currentTime;
    osc(220, 'square', 0.1, 0.3, sfxGain, t);
    osc(180, 'square', 0.1, 0.3, sfxGain, t+0.12);
  }
  function playNotify(type='info'){
    const c = getCtx(); const t = c.currentTime;
    if (type==='danger'){
      osc(440,'square',0.08,0.3,sfxGain,t);
      osc(330,'square',0.08,0.3,sfxGain,t+0.1);
    } else if (type==='success'){
      osc(523,'sine',0.07,0.25,sfxGain,t);
      osc(659,'sine',0.07,0.25,sfxGain,t+0.08);
      osc(784,'sine',0.07,0.25,sfxGain,t+0.16);
    } else {
      osc(660,'sine',0.06,0.2,sfxGain,t);
      osc(880,'sine',0.05,0.15,sfxGain,t+0.07);
    }
  }
  function playClick(){
    const c = getCtx(); const t = c.currentTime;
    noise(0.04, 0.3, sfxGain, t, 2000);
  }
  function playLevelUp(){
    const c = getCtx(); const t = c.currentTime;
    [523,659,784,1047].forEach((f,i)=>osc(f,'sine',0.25,0.3,sfxGain,t+i*0.12));
  }
  function playRotate(){
    const c = getCtx(); const t = c.currentTime;
    osc(880,'sine',0.05,0.15,sfxGain,t);
  }

  // Volume controls
  function setMusicVol(v){ 
    if (currentMusic) currentMusic.volume = v;
  }
  function setSfxVol(v)  { getCtx(); sfxGain.gain.value   = v; }
  function setMasterVol(v){ getCtx(); masterGain.gain.value = v; }

  // Boot: start on first user interaction
  function init(){
    playMenuMusic(); // Start with menu music
    startAmbient();
  }

  return { init, startMusic, stopMusic, playMenuMusic, playGameplayMusic, stopAllMusic,
           playPlace, playBulldoze, playError,
           playNotify, playClick, playLevelUp, playRotate,
           setMusicVol, setSfxVol, setMasterVol };
})();

// -------------------- BUILDING MESH FACTORY --------------------
// TheoTown style: MeshLambertMaterial — lightweight, flat-diffuse, bright
const MAT_CACHE = new Map();

// -------------------- GLB MODEL LOADER --------------------
// Map building key -> { path, targetTiles (so we can scale to fit the footprint) }
const GLB_MODELS = {
  res_low:      { path: './model/low_density.glb' },
  res_med:      { path: './model/med_density.glb' },
  res_high:     { path: './model/high_density.glb' },
  road:         { path: './model/road/road.glb' },
  com_shop:     { path: './model/commerce/shop.glb' },
  com_mall:     { path: './model/commerce/mall.glb',        scaleBoost: 1.5 },
  ind_office:   { path: './model/commerce/office.glb',      scaleBoost: 1.6 },
  skyscraper:   { path: './model/commerce/skyscrapper.glb', scaleBoost: 2.0 },
  ind_factory:  { path: './model/industry/factory.glb',     scaleBoost: 1.4 },
  school:       { path: './model/public/school.glb',        scaleBoost: 2.6 },
  hospital:     { path: './model/public/hospital.glb',      scaleBoost: 2.2 },
  police:       { path: './model/public/police.glb',        scaleBoost: 3.8 },
  fire:         { path: './model/public/fire_station.glb',  scaleBoost: 3.8 },
  power_coal:   { path: './model/utilities/coal_plant.glb', scaleBoost: 1.1 },
  power_solar:  { path: './model/utilities/solar_plant.glb',scaleBoost: 1.8 },
  water_pump:   { path: './model/utilities/water_pump.glb', scaleBoost: 0.6 },
  water_tile:   { path: './model/utilities/water_animation.glb', scaleBoost: 1.0 },
  bus_stop:     { path: './model/transit/bus_station.glb',  scaleBoost: 1.4 },
  metro:        { path: './model/transit/metro_station.glb',scaleBoost: 1.6 },
  airport:      { path: './model/transit/airport.glb',      scaleBoost: 2.2 },
};
// -------------------- CAR GLB LOADER --------------------
const CAR_PATHS = [
  { path: './model/car/car1.glb', rotY: Math.PI / 2 },
  { path: './model/car/car2.glb', rotY: Math.PI / 2 },
  { path: './model/car/car3.glb', rotY: Math.PI / 2 },
  { path: './model/car/car4.glb', rotY: -Math.PI / 2 },
];
const CAR_TEMPLATES = [];

function loadCarModels(){
  let pending = CAR_PATHS.length;
  for (const entry of CAR_PATHS){
    const { path, rotY } = entry;
    gltfLoader.load(path, (gltf) => {
      const root = gltf.scene;
      // Normalize size: longest XZ dimension → 0.88 world units
      for (let pass = 0; pass < 2; pass++){
        const box = new THREE.Box3().setFromObject(root);
        const size = box.getSize(new THREE.Vector3());
        const maxXZ = Math.max(size.x, size.z);
        if (maxXZ < 0.001) break;
        root.scale.multiplyScalar(0.88 / maxXZ);
      }
      // Sit on y=0, center on XZ
      const box2 = new THREE.Box3().setFromObject(root);
      const center = box2.getCenter(new THREE.Vector3());
      root.position.x -= center.x;
      root.position.z -= center.z;
      root.position.y -= box2.min.y;
      root.traverse(o => { if (o.isMesh){ o.castShadow = true; o.receiveShadow = true; }});

      // Orientation corrector: most GLB cars face +Z, but dirToYaw() expects front=+X.
      // Inner corrector rotates -PI/2 so a +Z model aligns to +X.
      const corrector = new THREE.Group();
      corrector.rotation.y = rotY;
      corrector.add(root);
      // Outer wrapper is what receives mesh.rotation.y = dirToYaw(...)
      const wrapper = new THREE.Group();
      wrapper.add(corrector);

      const sz = new THREE.Box3().setFromObject(wrapper).getSize(new THREE.Vector3());
      console.log(`[car] loaded ${path} — ${sz.x.toFixed(2)}×${sz.z.toFixed(2)}×${sz.y.toFixed(2)}`);
      CAR_TEMPLATES.push(wrapper);
      pending--;
    }, undefined, (err) => {
      console.warn(`[car] failed: ${path}`, err);
      pending--;
    });
  }
}

const GLB_CACHE = new Map();
const GLB_PENDING = new Map();
// Now safe to call — gltfLoader and MAT_CACHE are both initialized
loadTreeModels();
loadCarModels();
// Preload water animation model
loadGLBTemplate('water_tile').catch(err => console.warn('Water animation model not loaded:', err));
// decorative trees disabled — trees placed manually in-game

function loadGLBTemplate(key){
  if (GLB_CACHE.has(key)) return Promise.resolve(GLB_CACHE.get(key));
  if (GLB_PENDING.has(key)) return GLB_PENDING.get(key);
  const cfg = GLB_MODELS[key];
  if (!cfg) return Promise.reject(new Error('no model for '+key));
  const p = new Promise((resolve, reject) => {
    gltfLoader.load(cfg.path, (gltf)=>{
      const tpl = gltf.scene;
      const def = BUILDINGS[key];
      const size = (def && def.size) || 1;
      const targetFootprint = TILE * size;

      // Store animation clips if available
      if (gltf.animations && gltf.animations.length > 0) {
        tpl.userData.animations = gltf.animations;
      }

      const box = new THREE.Box3().setFromObject(tpl);
      const dims = box.getSize(new THREE.Vector3());

      if (key === 'road'){
        // Roads must fill TILE×TILE exactly (no gaps) — scale each axis independently
        const sx = dims.x > 0.001 ? targetFootprint / dims.x : 1;
        const sz = dims.z > 0.001 ? targetFootprint / dims.z : 1;
        const sy = Math.max(sx, sz); // keep Y proportional to largest XZ scale
        tpl.scale.set(sx, sy, sz);
      } else {
        // Buildings: uniform scale to fit the larger XZ dimension, with optional boost
        const maxXZ = Math.max(dims.x, dims.z) || 1;
        const boost = cfg.scaleBoost || 1;
        tpl.scale.setScalar((targetFootprint / maxXZ) * boost);
      }

      // Re-center after scaling: sit on Y=0, centered on XZ origin
      const box2 = new THREE.Box3().setFromObject(tpl);
      const center = box2.getCenter(new THREE.Vector3());
      tpl.position.x -= center.x;
      tpl.position.z -= center.z;
      tpl.position.y -= box2.min.y;
      tpl.traverse(o=>{ if (o.isMesh){ o.castShadow=true; o.receiveShadow=true; }});
      GLB_CACHE.set(key, tpl);
      resolve(tpl);
    }, undefined, (err)=>{
      console.warn('Failed to load GLB', cfg.path, err);
      reject(err);
    });
  });
  GLB_PENDING.set(key, p);
  return p;
}

// Build a group for a GLB-backed building. Returns a Group immediately;
// the actual model is added asynchronously when the GLB finishes loading.
// The GLB is baked to TILE*size dimensions, so we mark the group so placeBuilding
// SKIPS its usual non-uniform scale.set(size,1,size).
function makeGLBBuilding(key, b){
  const g = new THREE.Group();
  g.userData.glb = true;
  const def = BUILDINGS[key];
  const sz = (def && def.size) || 1;
  const isRoad = key === 'road';

  // Placeholder — skip for roads (they're flat, placeholder pokes through ground)
  if (!isRoad){
    const placeholder = new THREE.Mesh(
      new THREE.BoxGeometry(TILE*sz*0.6, (b.h||1), TILE*sz*0.6),
      mat(b.color || 0x888888)
    );
    placeholder.position.y = (b.h||1)/2;
    placeholder.castShadow = true;
    placeholder.receiveShadow = true;
    placeholder.userData.isPlaceholder = true;
    g.add(placeholder);
  }

  loadGLBTemplate(key).then(tpl=>{
    const clone = tpl.clone(true);
    // Roads: lift slightly to avoid z-fighting with grass ground
    if (isRoad) clone.position.y = 0.003;
    clone.traverse(o=>{
      if (o.isMesh){
        o.castShadow = true;
        o.receiveShadow = true;
        // Roads sit on ground — push them forward in depth to avoid z-fight
        if (isRoad){
          o.material = o.material.clone();
          o.material.polygonOffset = true;
          o.material.polygonOffsetFactor = -2;
          o.material.polygonOffsetUnits  = -2;
        }
      }
    });
    g.add(clone);
    // Remove placeholder
    const ph = g.children.find(c => c.userData.isPlaceholder);
    if (ph){ g.remove(ph); ph.geometry.dispose(); }
  }).catch(()=>{ /* keep placeholder on failure */ });
  return g;
}

function mat(color, opts={}){
  const key = color + '_' + (opts.side||0);
  if (MAT_CACHE.has(key)) return MAT_CACHE.get(key);
  const m = new THREE.MeshLambertMaterial({
    color,
    side: opts.side===2 ? THREE.DoubleSide : THREE.FrontSide
  });
  MAT_CACHE.set(key, m);
  return m;
}
function emissiveMat(color, intensity=0.6){
  const m = new THREE.MeshLambertMaterial({ color });
  m.emissive = new THREE.Color(color);
  m.emissiveIntensity = Math.min(intensity, 1);
  return m;
}
function glassMat(color=0xaaddff, opacity=0.55){
  return new THREE.MeshLambertMaterial({
    color, transparent:true, opacity, side:THREE.DoubleSide
  });
}
// No outlines needed in TheoTown style
function applyOutlines(){ /* no-op */ }

function addMesh(group, geo, mat_, x, y, z, rx=0, ry=0, rz=0){
  const m = new THREE.Mesh(geo, mat_);
  m.position.set(x, y, z);
  m.rotation.set(rx, ry, rz);
  m.castShadow = true;
  m.receiveShadow = true;
  group.add(m);
  return m;
}
function addBox(group, w, h, d, x, y, z, material){ return addMesh(group, new THREE.BoxGeometry(w,h,d), material, x,y,z); }
function addCyl(group, rt, rb, h, segs, material, x, y, z, rx=0, ry=0, rz=0){ return addMesh(group, new THREE.CylinderGeometry(rt,rb,h,segs), material, x,y,z,rx,ry,rz); }
function addSphere(group, r, segs, material, x, y, z){ return addMesh(group, new THREE.SphereGeometry(r,segs,segs), material, x,y,z); }
function addCone(group, r, h, segs, material, x, y, z){ return addMesh(group, new THREE.ConeGeometry(r,h,segs), material, x,y,z); }

// Extruded triangle (gable roof) along Z
function gableRoof(group, width, height, depth, x, y, z, material){
  const shape = new THREE.Shape();
  const hw = width/2;
  shape.moveTo(-hw, 0); shape.lineTo(hw, 0); shape.lineTo(0, height); shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled:false });
  geo.translate(0, 0, -depth/2);
  addMesh(group, geo, material, x, y, z);
}

// Sloped hip roof (4 sided pyramid-ish using CylinderGeometry with 4 sides)
function hipRoof(group, w, d, h, x, y, z, material){
  const geo = new THREE.CylinderGeometry(0, Math.hypot(w,d)/2, h, 4, 1);
  geo.rotateY(Math.atan2(d,w)-Math.PI/4);
  addMesh(group, geo, material, x, y, z);
}

// Window helper (glass pane + frame + sill)
function addWindow(group, x, y, z, ww, wh, thick, facing='front'){
  const pane = new THREE.Mesh(new THREE.BoxGeometry(
    facing==='front'||facing==='back' ? ww : thick,
    wh,
    facing==='left'||facing==='right' ? ww : thick
  ), glassMat(0xbae6fd, 0.65));
  pane.position.set(x, y, z);
  group.add(pane);
  // frame
  const fw = 0.02, fmat = mat(0x52525b, {r:0.6});
  if (facing==='front'||facing==='back'){
    addBox(group, ww+fw*2, fw, thick*2, x, y+wh/2, z, fmat);
    addBox(group, ww+fw*2, fw, thick*2, x, y-wh/2, z, fmat);
    addBox(group, fw, wh+fw*2, thick*2, x-ww/2, y, z, fmat);
    addBox(group, fw, wh+fw*2, thick*2, x+ww/2, y, z, fmat);
    // sill
    addBox(group, ww+0.08, 0.03, 0.07, x, y-wh/2-0.02, z+0.04, mat(0xd4d4d8));
  } else {
    addBox(group, thick*2, fw, ww+fw*2, x, y+wh/2, z, fmat);
    addBox(group, thick*2, fw, ww+fw*2, x, y-wh/2, z, fmat);
    addBox(group, thick*2, wh+fw*2, fw, x, y, z-ww/2, fmat);
    addBox(group, thick*2, wh+fw*2, fw, x, y, z+ww/2, fmat);
  }
}

// ===================== ROAD =====================
function makeRoad(){
  const g = new THREE.Group();
  // asphalt base
  addBox(g, TILE, 0.05, TILE, 0, 0.025, 0, mat(0x1c1f25, {r:0.95}));
  // colored sidewalk tiles each side (warm tan)
  addBox(g, TILE, 0.06, 0.2, 0, 0.03,  TILE/2-0.1, mat(0xe8c97a, {r:0.7}));
  addBox(g, TILE, 0.06, 0.2, 0, 0.03, -TILE/2+0.1, mat(0xe8c97a, {r:0.7}));
  // curb stone edge
  addBox(g, TILE, 0.08, 0.07, 0, 0.04,  TILE/2-0.035, mat(0xc0c0a0));
  addBox(g, TILE, 0.08, 0.07, 0, 0.04, -TILE/2+0.035, mat(0xc0c0a0));
  // lane lines (white dashes)
  for (const z of [-0.45, -0.15, 0.15, 0.45]){
    addBox(g, 0.05, 0.01, 0.22, 0, 0.056, z, mat(0xffffff, {r:0.4}));
  }
  // center double yellow
  addBox(g, 0.05, 0.01, TILE, -0.1, 0.056, 0, mat(0xfde047, {r:0.4}));
  addBox(g, 0.05, 0.01, TILE,  0.1, 0.056, 0, mat(0xfde047, {r:0.4}));
  g.userData.line = g.children[1];
  return g;
}

// ===================== HOUSE (Low Density) =====================
function makeHouse(b){
  const g = new THREE.Group();
  const W = 1.3, D = 1.3, BODY = 1.1, EAVE = 0.12;
  // ground / base
  addBox(g, W+0.2, 0.12, D+0.2, 0, 0.06, 0, mat(0x6b7280, {r:0.9}));
  // body with 2 colours (render front wall darker for contrast)
  addBox(g, W, BODY, D, 0, 0.12+BODY/2, 0, mat(b.color, {r:0.85}));
  // exterior plaster lines (horizontal band)
  addBox(g, W+0.02, 0.06, D+0.02, 0, 0.12+BODY*0.45, 0, mat(b.accent, {r:0.8}));
  // GABLE ROOF via ExtrudeGeometry — triangle extruded along D axis
  const roofH = 0.65, roofBase = 0.12+BODY;
  gableRoof(g, W+EAVE*2, roofH, D+EAVE*2, 0, roofBase, 0, mat(b.accent, {r:0.65}));
  // gable end walls (fill triangle above body)
  gableRoof(g, W, roofH*(W/(W+EAVE*2)), 0.04, 0, roofBase,  D/2+0.02, mat(b.color, {r:0.9, side:2}));
  gableRoof(g, W, roofH*(W/(W+EAVE*2)), 0.04, 0, roofBase, -D/2-0.02, mat(b.color, {r:0.9, side:2}));
  // ridge cap
  addBox(g, 0.1, 0.05, D+EAVE*2+0.05, 0, roofBase+roofH+0.025, 0, mat(b.accent, {r:0.6}));
  // chimney
  addBox(g, 0.18, 0.7, 0.18, W*0.28, roofBase+roofH*0.35, -D*0.15, mat(0x92400e, {r:0.9}));
  addBox(g, 0.24, 0.05, 0.24, W*0.28, roofBase+roofH*0.35+0.38, -D*0.15, mat(0x52525b));
  // front door
  addBox(g, 0.3, 0.65, 0.05, 0.1, 0.12+0.325, D/2+0.025, mat(b.accent));
  addCyl(g, 0.025, 0.025, 0.04, 8, mat(0xfde047), 0.22, 0.12+0.34, D/2+0.05, 0,0,Math.PI/2);
  // door trim arch
  const archGeo = new THREE.TorusGeometry(0.155, 0.025, 6, 16, Math.PI);
  addMesh(g, archGeo, mat(b.accent), 0.1, 0.12+0.66, D/2+0.025, 0, 0, 0);
  // step
  addBox(g, 0.55, 0.06, 0.2, 0.1, 0.09, D/2+0.12, mat(0xa8a29e));
  // windows front
  addWindow(g, -0.42, 0.12+BODY*0.65, D/2+0.026, 0.32, 0.34, 0.025, 'front');
  addWindow(g, 0.52+0.05, 0.12+BODY*0.65, D/2+0.026, 0.28, 0.32, 0.025, 'front');
  // windows back
  addWindow(g, -0.3, 0.12+BODY*0.65, -D/2-0.026, 0.3, 0.3, 0.025, 'back');
  addWindow(g,  0.3, 0.12+BODY*0.65, -D/2-0.026, 0.3, 0.3, 0.025, 'back');
  // side window
  addWindow(g, W/2+0.026, 0.12+BODY*0.65, 0, 0.28, 0.3, 0.025, 'right');
  addWindow(g, -W/2-0.026, 0.12+BODY*0.65, 0, 0.28, 0.3, 0.025, 'left');
  // garden path
  addBox(g, 0.25, 0.02, 0.55, 0.1, 0.13, D/2+0.28, mat(0xd4d4d8, {r:0.85}));
  // hedge
  for (const x of [-W*0.4, W*0.4]){
    addBox(g, 0.25, 0.22, 0.22, x, 0.18, D/2+0.2, mat(0x16a34a, {r:0.9}));
  }
  // corner flowers
  addSphere(g, 0.08, 6, emissiveMat(0xf9a8d4, 0.3), -W*0.4, 0.38, D/2+0.2);
  addSphere(g, 0.08, 6, emissiveMat(0xfef08a, 0.3), W*0.4, 0.38, D/2+0.2);
  return g;
}

// ===================== APARTMENT (Med Density) =====================
function makeApartment(b){
  const g = new THREE.Group();
  const W = 1.6, D = 1.6, H = b.h;
  const floors = Math.max(3, Math.round(H/0.75));
  const fh = H / floors;
  // base
  addBox(g, W+0.15, 0.12, D+0.15, 0, 0.06, 0, mat(0x52525b));
  // main body
  addBox(g, W, H, D, 0, 0.12+H/2, 0, mat(b.color, {r:0.72}));
  // floor band + balconies per floor
  for (let f=1; f<floors; f++){
    const fy = 0.12 + f*fh;
    addBox(g, W+0.04, 0.05, D+0.04, 0, fy+0.025, 0, mat(b.accent, {r:0.7}));
    // balcony on front face
    const bw = W*0.65;
    addBox(g, bw, 0.05, 0.22, 0, fy+0.06, D/2+0.11, mat(0xfafafa, {r:0.5}));
    // balcony rail (thin bars)
    for (let i=-1; i<=1; i++){
      addBox(g, 0.025, 0.2, 0.025, i*(bw*0.42), fy+0.17, D/2+0.21, mat(0x9ca3af));
    }
    addBox(g, bw+0.04, 0.025, 0.025, 0, fy+0.27, D/2+0.21, mat(0x9ca3af));
    // windows back
    addWindow(g, -W*0.28, fy+fh*0.55, -D/2-0.026, 0.3, fh*0.45, 0.025, 'back');
    addWindow(g,  W*0.28, fy+fh*0.55, -D/2-0.026, 0.3, fh*0.45, 0.025, 'back');
    // windows sides
    addWindow(g,  W/2+0.026, fy+fh*0.55, 0, 0.3, fh*0.45, 0.025, 'right');
    addWindow(g, -W/2-0.026, fy+fh*0.55, 0, 0.3, fh*0.45, 0.025, 'left');
  }
  // top floor windows (front)
  addWindow(g, -W*0.28, 0.12+H-fh*0.45, D/2+0.026, 0.3, fh*0.45, 0.025, 'front');
  addWindow(g,  W*0.28, 0.12+H-fh*0.45, D/2+0.026, 0.3, fh*0.45, 0.025, 'front');
  // entrance canopy
  addBox(g, W*0.7, 0.06, 0.35, 0, 0.12+fh*0.9, D/2+0.175, mat(b.accent));
  addBox(g, 0.05, fh*0.9, 0.05, -W*0.3, 0.12+fh*0.45, D/2+0.33, mat(b.accent));
  addBox(g, 0.05, fh*0.9, 0.05,  W*0.3, 0.12+fh*0.45, D/2+0.33, mat(b.accent));
  // door
  addBox(g, 0.4, fh*0.75, 0.05, 0, 0.12+fh*0.375, D/2+0.026, glassMat(0x111827, 0.85));
  // roof parapet
  addBox(g, W+0.1, 0.18, D+0.1, 0, 0.12+H+0.09, 0, mat(b.accent, {r:0.6}));
  // rooftop tank
  addCyl(g, 0.22, 0.22, 0.4, 12, mat(0x9ca3af), -W*0.3, 0.12+H+0.38, D*0.3);
  addCyl(g, 0.24, 0.24, 0.04, 12, mat(0x71717a), -W*0.3, 0.12+H+0.6, D*0.3);
  return g;
}

// ===================== TOWER BLOCK (High Density) =====================
function makeTowerBlock(b){
  const g = new THREE.Group();
  const W = 1.75, D = 1.75, H = b.h;
  const floors = Math.round(H/0.65);
  const fh = H/floors;
  // podium
  addBox(g, W+0.3, 1.0, D+0.3, 0, 0.5, 0, mat(b.accent, {r:0.6, m:0.1}));
  addBox(g, W, H, D, 0, 1.0+H/2, 0, mat(b.color, {r:0.45, m:0.2}));
  // continuous glass facade
  for (let f=0; f<floors; f++){
    const fy = 1.0 + f*fh + fh*0.15;
    const gh = fh*0.7;
    // front / back glass strips
    const glm = glassMat(0x7dd3fc, 0.55);
    addBox(g, W-0.04, gh, 0.04, 0, fy+gh/2, D/2, glm);
    addBox(g, W-0.04, gh, 0.04, 0, fy+gh/2, -D/2, glm);
    addBox(g, 0.04, gh, D-0.04, W/2, fy+gh/2, 0, glm);
    addBox(g, 0.04, gh, D-0.04, -W/2, fy+gh/2, 0, glm);
  }
  // vertical pilasters
  const pm = mat(b.accent, {r:0.5, m:0.15});
  for (const [px, pz] of [[-W/2,0],[W/2,0],[0,-D/2],[0,D/2]]){
    addBox(g, px===0?W*0.08:0.08, H, px===0?0.08:D*0.08, px*(1+0.04/W), 1.0+H/2, pz*(1+0.04/D), pm);
  }
  // roof crown
  addBox(g, W+0.1, 0.25, D+0.1, 0, 1.0+H+0.125, 0, mat(0x1f2937));
  addBox(g, W*0.55, 0.4, D*0.55, 0, 1.0+H+0.45, 0, mat(b.accent, {r:0.4, m:0.2}));
  // mechanical penthouse
  addBox(g, W*0.4, 0.5, D*0.4, 0, 1.0+H+0.9, 0, mat(0x374151));
  // water tanks
  addCyl(g, 0.18, 0.18, 0.45, 10, mat(0x9ca3af), W*0.4, 1.0+H+0.48, D*0.3);
  addCyl(g, 0.18, 0.18, 0.45, 10, mat(0x9ca3af), -W*0.4, 1.0+H+0.48, -D*0.3);
  return g;
}

// ===================== SHOP =====================
function makeShop(b){
  const g = new THREE.Group();
  const W = 1.7, D = 1.7, H = b.h;
  addBox(g, W+0.1, 0.1, D+0.1, 0, 0.05, 0, mat(0x44403c));
  addBox(g, W, H, D, 0, 0.1+H/2, 0, mat(b.color, {r:0.6}));
  // storefront glass lower half
  addBox(g, W*0.88, H*0.45, 0.04, 0, 0.1+H*0.25, D/2, glassMat(0xbae6fd, 0.7));
  // awning (extruded slope)
  const aw = new THREE.Shape();
  aw.moveTo(-W*0.48,0); aw.lineTo(W*0.48,0); aw.lineTo(W*0.48,-0.25); aw.lineTo(-W*0.48,0.02); aw.closePath();
  const awGeo = new THREE.ExtrudeGeometry(aw, { depth:0.35, bevelEnabled:false });
  awGeo.translate(0,0,-0.35/2);
  const awMesh = new THREE.Mesh(awGeo, mat(b.accent, {r:0.7}));
  awMesh.position.set(0, 0.1+H*0.6, D/2+0.01);
  awMesh.castShadow = true;
  g.add(awMesh);
  // awning stripes
  for (let i=-2;i<=2;i++) addBox(g, 0.04, 0.22, 0.04, i*W*0.16, 0.1+H*0.7, D/2+0.22, mat(0xffffff, {r:0.6}));
  // sign panel
  addBox(g, W*0.75, 0.2, 0.06, 0, 0.1+H*0.82, D/2+0.03, emissiveMat(0xfef08a, 0.6));
  // door
  addBox(g, 0.38, H*0.65, 0.04, 0.4, 0.1+H*0.325, D/2+0.01, glassMat(0x111827, 0.9));
  // flat roof + AC
  addBox(g, W+0.06, 0.08, D+0.06, 0, 0.1+H+0.04, 0, mat(0x292524));
  addBox(g, 0.55, 0.22, 0.38, -0.3, 0.1+H+0.19, 0.2, mat(0xa8a29e));
  addCyl(g, 0.06, 0.07, 0.22, 8, mat(0x78716c), -0.3, 0.1+H+0.41, 0.2, Math.PI/2, 0, 0);
  return g;
}

// ===================== MALL =====================
function makeMall(b){
  const g = new THREE.Group();
  const W = 1.85, D = 1.85, H = b.h;
  addBox(g, W, H, D, 0, H/2, 0, mat(b.color, {r:0.5, m:0.1}));
  // full-height glass curtain wall front & back
  const gm = glassMat(0x7dd3fc, 0.55);
  addBox(g, W-0.05, H*0.85, 0.04, 0, H*0.5, D/2, gm);
  addBox(g, W-0.05, H*0.85, 0.04, 0, H*0.5, -D/2, gm);
  // horizontal mullions
  for (let i=1;i<4;i++) addBox(g, W, 0.04, D+0.04, 0, H*i/4, 0, mat(b.accent, {m:0.2}));
  // vertical mullions front
  for (const x of [-0.7,-0.35,0,0.35,0.7]) addBox(g, 0.04, H*0.85, 0.06, x, H*0.5, D/2, mat(b.accent));
  // entrance canopy
  const cw = W*0.6;
  addBox(g, cw, 0.06, 0.5, 0, H*0.4, D/2+0.25, mat(0xf8fafc));
  addBox(g, 0.05, H*0.4, 0.05, -cw/2+0.05, H*0.2, D/2+0.48, mat(b.accent));
  addBox(g, 0.05, H*0.4, 0.05,  cw/2-0.05, H*0.2, D/2+0.48, mat(b.accent));
  // logo
  addBox(g, W*0.5, 0.22, 0.07, 0, H*0.9, D/2+0.03, emissiveMat(0xffffff, 0.8));
  // curved roof
  addBox(g, W+0.1, 0.18, D+0.1, 0, H+0.09, 0, mat(b.accent));
  // hvac units
  for (const [xo,zo] of [[0.5,0.4],[-0.5,-0.4]]){
    addBox(g, 0.45, 0.28, 0.32, xo, H+0.32, zo, mat(0x9ca3af));
    addCyl(g, 0.07, 0.08, 0.25, 8, mat(0x78716c), xo, H+0.6, zo, Math.PI/2, 0, 0);
  }
  return g;
}

// ===================== OFFICE =====================
function makeOffice(b){
  const g = new THREE.Group();
  const W = 1.6, D = 1.6, H = b.h;
  const floors = Math.round(H/0.65);
  const fh = H/floors;
  // base plaza
  addBox(g, W+0.5, 0.08, D+0.5, 0, 0.04, 0, mat(0x374151, {r:0.7}));
  // column arcade around base
  for (const [cx,cz] of [[-W*0.45,-D*0.45],[-W*0.45,D*0.45],[W*0.45,-D*0.45],[W*0.45,D*0.45]]){
    addCyl(g, 0.06, 0.07, fh*1.5, 10, mat(0xd4d4d8, {r:0.4, m:0.15}), cx, fh*0.75, cz);
  }
  // tower
  addBox(g, W, H, D, 0, 0.08+H/2, 0, mat(b.color, {r:0.3, m:0.35}));
  // continuous glass bands per floor
  for (let f=0; f<floors; f++){
    const fy = 0.08 + f*fh + fh*0.1;
    const gh = fh*0.72;
    const gm = glassMat(0x93c5fd, 0.6);
    addBox(g, W+0.02, gh, 0.04, 0, fy+gh/2, D/2, gm);
    addBox(g, W+0.02, gh, 0.04, 0, fy+gh/2, -D/2, gm);
    addBox(g, 0.04, gh, D+0.02, W/2, fy+gh/2, 0, gm);
    addBox(g, 0.04, gh, D+0.02, -W/2, fy+gh/2, 0, gm);
  }
  // crown
  addBox(g, W*0.8, 0.35, D*0.8, 0, 0.08+H+0.175, 0, mat(b.accent, {r:0.3, m:0.3}));
  // logo band
  addBox(g, W*0.9, 0.18, 0.06, 0, 0.08+H+0.02, D/2, emissiveMat(0x60a5fa, 0.6));
  // antenna
  addCyl(g, 0.025, 0.04, 1.4, 8, mat(0xd4d4d8, {m:0.5}), 0, 0.08+H+0.7, 0);
  addSphere(g, 0.045, 6, emissiveMat(0xef4444, 1.2), 0, 0.08+H+1.42, 0);
  return g;
}

// ===================== SKYSCRAPER =====================
function makeSkyscraper(b){
  const g = new THREE.Group();
  const H = b.h;
  const baseW = 1.8;
  // base podium (3 levels)
  addBox(g, baseW+0.4, 1.2, baseW+0.4, 0, 0.6, 0, mat(b.accent, {r:0.5, m:0.2}));
  addBox(g, baseW+0.1, 0.5, baseW+0.1, 0, 1.45, 0, mat(b.accent, {r:0.5}));
  // columns on podium corners
  for (const [cx,cz] of [[-0.8,-0.8],[-0.8,0.8],[0.8,-0.8],[0.8,0.8]]){
    addCyl(g, 0.07, 0.09, 1.5, 12, mat(0xd4d4d8, {r:0.3, m:0.4}), cx, 0.75, cz);
  }
  // main shaft
  const M1 = baseW, M2 = baseW*0.82, M3 = baseW*0.62;
  const H1 = H*0.45, H2 = H*0.35, H3 = H*0.2;
  addBox(g, M1, H1, M1, 0, 1.7+H1/2, 0, mat(b.color, {r:0.25, m:0.45}));
  addBox(g, M1+0.05, 0.1, M1+0.05, 0, 1.7+H1, 0, mat(b.accent));
  addBox(g, M2, H2, M2, 0, 1.7+H1+H2/2, 0, mat(b.color, {r:0.25, m:0.45}));
  addBox(g, M2+0.05, 0.08, M2+0.05, 0, 1.7+H1+H2, 0, mat(b.accent));
  addBox(g, M3, H3, M3, 0, 1.7+H1+H2+H3/2, 0, mat(b.color, {r:0.25, m:0.45}));
  // glass on all 3 shafts - curtain walls
  const shafts = [[M1,H1,1.7],[M2,H2,1.7+H1],[M3,H3,1.7+H1+H2]];
  const floorsPerShaft = [Math.round(H1/0.6), Math.round(H2/0.55), Math.round(H3/0.5)];
  shafts.forEach(([sw, sh, sy], si)=>{
    const floors = floorsPerShaft[si];
    for (let f=0; f<floors; f++){
      const fy = sy + f*(sh/floors) + sh/floors*0.1;
      const gh = sh/floors*0.72;
      const gm = glassMat(0x60a5fa, 0.55);
      addBox(g, sw-0.04, gh, 0.04, 0, fy+gh/2, sw/2, gm);
      addBox(g, sw-0.04, gh, 0.04, 0, fy+gh/2, -sw/2, gm);
      addBox(g, 0.04, gh, sw-0.04, sw/2, fy+gh/2, 0, gm);
      addBox(g, 0.04, gh, sw-0.04, -sw/2, fy+gh/2, 0, gm);
    }
  });
  // crown pyramid
  const crownY = 1.7+H+0.04;
  const pyGeo = new THREE.ConeGeometry(M3*0.45, 1.8, 4);
  pyGeo.rotateY(Math.PI/4);
  addMesh(g, pyGeo, mat(b.accent, {r:0.3, m:0.5}), 0, crownY+0.9, 0);
  // spire
  addCyl(g, 0.03, 0.06, 2.5, 6, mat(0xd4d4d8, {m:0.6}), 0, crownY+1.8+1.25, 0);
  // beacon
  addSphere(g, 0.06, 6, emissiveMat(0xef4444, 1.5), 0, crownY+1.8+2.55, 0);
  return g;
}

// ===================== FACTORY =====================
function makeFactory(b){
  const g = new THREE.Group();
  const W = 1.85, D = 1.85, H = b.h;
  // ground slab
  addBox(g, W+0.3, 0.08, D+0.3, 0, 0.04, 0, mat(0x374151));
  // main shed
  addBox(g, W, H*0.65, D, 0, H*0.325, 0, mat(b.color, {r:0.8}));
  // sawtooth roof (3 x north-light sections)
  const sm = mat(b.accent, {r:0.65});
  const glm2 = glassMat(0xbae6fd, 0.5);
  for (let i=-1; i<=1; i++){
    const ox = i*(W/3.3);
    const sw = W/3.2, sd = D+0.04;
    gableRoof(g, sw, H*0.3, sd, ox, H*0.65, 0, sm);
    // glazed north light
    addBox(g, sw*0.4, H*0.25, 0.04, ox+sw*0.25, H*0.65+H*0.12, sd/2, glm2);
  }
  // wall detail - horizontal rib
  addBox(g, W+0.02, 0.06, D+0.02, 0, H*0.35, 0, mat(b.accent));
  // loading dock
  addBox(g, 0.65, H*0.6, 0.06, 0, H*0.3, D/2, mat(0x27272a));
  addBox(g, 0.65+0.1, 0.05, 0.3, 0, H*0.6+0.025, D/2+0.15, mat(b.accent)); // dock canopy
  // chimney stacks
  const sm2 = mat(0x52525b);
  addCyl(g, 0.1, 0.13, 1.8, 10, sm2, W*0.32, H*0.65+0.9, -D*0.3);
  addCyl(g, 0.09, 0.11, 1.5, 10, sm2, W*0.15, H*0.65+0.75, -D*0.15);
  // chimney caps
  addCyl(g, 0.13, 0.13, 0.08, 10, mat(0x374151), W*0.32, H*0.65+1.84, -D*0.3);
  addCyl(g, 0.12, 0.12, 0.08, 10, mat(0x374151), W*0.15, H*0.65+1.59, -D*0.15);
  // warning light on stacks
  addSphere(g, 0.05, 6, emissiveMat(0xef4444, 1.2), W*0.32, H*0.65+1.95, -D*0.3);
  // ventilation fans on roof
  for (const [rx,rz] of [[W*0.35, D*0.3],[-W*0.35,-D*0.25]]){
    addCyl(g, 0.14, 0.14, 0.08, 8, mat(0x78716c), rx, H*0.65+0.05, rz);
    addCyl(g, 0.12, 0.12, 0.2, 8, mat(0x9ca3af), rx, H*0.65+0.18, rz);
  }
  return g;
}

// ===================== COAL PLANT =====================
function makeCoalPlant(b){
  const g = new THREE.Group();
  const W = 1.85, D = 1.85, H = b.h;
  // boiler house
  addBox(g, W*0.8, H, D*0.6, -W*0.1, H/2, -D*0.15, mat(b.color, {r:0.8}));
  // large cooling towers (hyperboloid-ish: wide base, narrow waist, wider top)
  const twrMat = mat(0xd4d4d8, {r:0.85});
  function coolingTower(x, z, rBot=0.42, rMid=0.28, rTop=0.36, h=1.8){
    const pts = [];
    const segs = 10;
    for (let i=0;i<=segs;i++){
      const t = i/segs;
      // hyperboloid radius
      const r = rBot + (rMid-rBot)*Math.sin(t*Math.PI)*2.2 + (rTop-rBot)*t;
      pts.push(new THREE.Vector2(Math.max(0.05, r), t*h - h/2));
    }
    const geo = new THREE.LatheGeometry(pts, 20);
    addMesh(g, geo, twrMat, x, H*0.5+h/2, z);
    // rim
    addCyl(g, rTop+0.02, rTop+0.02, 0.08, 20, mat(0x9ca3af), x, H*0.5+h+0.04, z);
  }
  coolingTower(-W*0.25, D*0.3, 0.42, 0.27, 0.36, H*1.2);
  coolingTower( W*0.25, D*0.3, 0.42, 0.27, 0.36, H*1.2);
  // tall smokestack
  addCyl(g, 0.1, 0.14, H*1.4, 12, mat(0x27272a), W*0.38, H*0.7, -D*0.3);
  addCyl(g, 0.13, 0.13, 0.1, 12, mat(0xdc2626), W*0.38, H*1.4+0.05, -D*0.3);
  addSphere(g, 0.05, 6, emissiveMat(0xef4444, 1.5), W*0.38, H*1.4+0.14, -D*0.3);
  // coal yard (dark ground)
  addBox(g, W*0.6, 0.04, D*0.5, W*0.28, 0.02, D*0.1, mat(0x18181b, {r:0.95}));
  return g;
}

// ===================== SOLAR FARM =====================
function makeSolar(b){
  const g = new THREE.Group();
  addBox(g, TILE*0.96, 0.04, TILE*0.96, 0, 0.02, 0, mat(0x1c1917, {r:0.95}));
  const pm = mat(0x1e3a8a, {r:0.2, m:0.6});
  const frameMat = mat(0x71717a, {r:0.5, m:0.3});
  for (let r=-1; r<=1; r++){
    for (let c=-1; c<=1; c++){
      const ox = c*0.6, oz = r*0.6;
      // tilt mount
      addBox(g, 0.05, 0.28, 0.05, ox-0.12, 0.14, oz+0.15, mat(0x52525b));
      addBox(g, 0.05, 0.22, 0.05, ox+0.12, 0.11, oz+0.15, mat(0x52525b));
      // panel cross-beam
      addBox(g, 0.45, 0.025, 0.025, ox, 0.27, oz, frameMat);
      addBox(g, 0.025, 0.025, 0.62, ox, 0.27, oz, frameMat);
      // panel face
      const panel = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.025, 0.58), pm);
      panel.position.set(ox, 0.3, oz);
      panel.rotation.x = -0.42;
      panel.castShadow = true;
      g.add(panel);
      // cell grid (just faint blue lines)
      for (let ci=-1;ci<=1;ci++){
        addBox(g, 0.44, 0.026, 0.008, ox, 0.3+ci*0.001, oz+ci*0.14, mat(0x1d4ed8));
      }
    }
  }
  // junction box
  addBox(g, 0.2, 0.1, 0.14, 0.5, 0.08, -0.5, mat(0x374151));
  return g;
}

// ===================== WIND TURBINE =====================
function makeWind(b){
  const g = new THREE.Group();
  const tH = b.h;
  // base foundation
  addCyl(g, 0.28, 0.32, 0.2, 10, mat(0x9ca3af), 0, 0.1, 0);
  // tower (tapered cylinder)
  addCyl(g, 0.065, 0.12, tH, 14, mat(0xf3f4f6, {r:0.35, m:0.45}), 0, tH/2, 0);
  // nacelle
  const nacBox = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.2, 0.55), mat(0xe5e7eb, {r:0.3, m:0.3}));
  nacBox.position.set(0, tH+0.1, 0.08);
  nacBox.castShadow = true;
  g.add(nacBox);
  // nacelle dome (front)
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8, 0, Math.PI), mat(0xd4d4d8, {r:0.3, m:0.4}));
  dome.rotation.y = Math.PI/2;
  dome.position.set(0, tH+0.1, 0.36);
  g.add(dome);
  // hub
  const hubG = new THREE.Group();
  addCyl(hubG, 0.07, 0.07, 0.12, 10, mat(0xfafafa), 0, 0, 0, Math.PI/2, 0, 0);
  // 3 blades — each is a tapered box with slight twist feel
  for (let i=0; i<3; i++){
    const bladeGroup = new THREE.Group();
    // blade body - tapered from root to tip
    const bGeo = new THREE.BoxGeometry(0.05, 1.7, 0.12);
    // taper via position trick: use different scales
    const blade = new THREE.Mesh(bGeo, mat(0xfafafa, {r:0.25}));
    blade.position.y = 0.85;
    blade.castShadow = true;
    bladeGroup.add(blade);
    // narrower tip cap
    addBox(bladeGroup, 0.03, 0.15, 0.06, 0, 1.75, 0, mat(0xe5e7eb));
    bladeGroup.rotation.z = (i * Math.PI*2)/3;
    hubG.add(bladeGroup);
  }
  hubG.position.set(0, tH+0.1, 0.38);
  g.add(hubG);
  g.userData.blades = hubG;
  return g;
}

// ===================== WATER PUMP =====================
function makeWaterPump(b){
  const g = new THREE.Group();
  const W = 1.6, D = 1.6;
  // pad
  addBox(g, W+0.2, 0.08, D+0.2, 0, 0.04, 0, mat(0x374151));
  // pump house
  addBox(g, W*0.55, 0.8, D*0.55, -W*0.2, 0.48, -D*0.2, mat(b.color, {r:0.7}));
  // pitched roof on pump house
  gableRoof(g, W*0.58, 0.3, D*0.58, -W*0.2, 0.88, -D*0.2, mat(b.accent, {r:0.65}));
  // main water tank (large cylinder)
  addCyl(g, 0.52, 0.52, 1.1, 18, mat(0x3b82f6, {r:0.35, m:0.4}), W*0.22, 0.63, D*0.22);
  // tank dome top
  addSphere(g, 0.53, 14, mat(0x2563eb, {r:0.3, m:0.45}), W*0.22, 1.22, D*0.22);
  // tank band
  addCyl(g, 0.54, 0.54, 0.05, 18, mat(b.accent), W*0.22, 0.6, D*0.22);
  // pipes
  addCyl(g, 0.045, 0.045, 0.7, 8, mat(0x9ca3af), -W*0.1, 0.35, D*0.22, 0, 0, Math.PI/6);
  addCyl(g, 0.045, 0.045, 0.5, 8, mat(0x9ca3af), W*0.22, 0.25, -D*0.1, Math.PI/2, 0, 0);
  // valve wheels
  addCyl(g, 0.1, 0.1, 0.015, 8, mat(0x374151), 0, 0.42, D*0.3, Math.PI/2, 0, 0);
  return g;
}

// ===================== WATER TILES & ANIMATION =====================
const waterMaterials = [];
let waterTime = 0;

function makeWaterTile(){
  const g = new THREE.Group();
  
  // Try to load GLB model for water
  const waterModel = GLB_CACHE.get('water_tile');
  if (waterModel) {
    const model = waterModel.clone();
    model.position.y = 0; // Ensure it sits on ground
    g.add(model);
    
    // Store reference to the model for merging
    g.userData.waterModel = model;
    
    // Play GLB animations if available
    if (waterModel.userData.animations && waterModel.userData.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(model);
      waterModel.userData.animations.forEach(clip => {
        const action = mixer.clipAction(clip);
        action.play();
      });
      // Store mixer for updates in game loop
      g.userData.mixer = mixer;
    }
    
    // Optionally mark meshes for additional shader animation (disabled for now since we use GLB animation)
    // model.traverse(obj => {
    //   if (obj.isMesh) {
    //     obj.userData.waterAnim = true;
    //     obj.userData.waterPhase = Math.random() * 6;
    //     obj.userData.waterBaseY = obj.position.y;
    //   }
    // });
  } else {
    // Fallback to procedural water if model not loaded yet
    const baseBox = addBox(g, TILE*0.98, 0.04, TILE*0.98, 0, 0.02, 0, mat(0x0d4a8a));
    const surfBox = addBox(g, TILE*0.98, 0.04, TILE*0.98, 0, 0.06, 0, mat(0x1a7acc));
    const surfaceMesh = g.children[g.children.length - 1];
    if (surfaceMesh && surfaceMesh.material){
      surfaceMesh.userData.waterAnim = true;
      surfaceMesh.userData.waterPhase = Math.random() * 6;
      surfaceMesh.userData.waterBaseY = 0.06;
      surfaceMesh.material = surfaceMesh.material.clone();
      surfaceMesh.material.transparent = true;
      surfaceMesh.material.opacity = 0.88;
    }
  }
  
  // NO SHORE FRAMES - just the model
  g.userData.isWater = true;
  return g;
}

function updateWaterMerge(gx, gz){
  // Water merging DISABLED for GLB model water tiles (keep normal size)
  const isWaterAt = (x, z) => inBounds(x, z) && (state.grid[x][z].type === 'water_tile');
  
  const updateTile = (x, z) => {
    if (!inBounds(x, z)) return;
    const cell = state.grid[x][z];
    if (!cell.mesh) return;
  };
  
  updateTile(gx, gz);
  updateTile(gx-1, gz); updateTile(gx+1, gz);
  updateTile(gx, gz-1); updateTile(gx, gz+1);
}

function updateWaterAnimation(dt){
  waterTime += dt;
  const t = waterTime;
  scene.traverse(function(obj){
    if (obj.isMesh && obj.userData.waterAnim){
      const ph = obj.userData.waterPhase || 0;
      const by = obj.userData.waterBaseY || 0.04;
      obj.position.y = by + Math.sin(t * 1.1 + ph) * 0.008;
      if (obj.material && obj.material.color){
        const hue = 0.58 + Math.sin(t * 0.5 + ph) * 0.02;
        obj.material.color.setHSL(hue, 0.65, 0.42 + Math.sin(t * 0.8 + ph) * 0.05);
      }
    }
  });
}

// Update animation mixers for GLB water tiles
function updateWaterMixers(dt){
  state.grid.forEach(col => {
    col.forEach(cell => {
      if (cell && cell.mesh && cell.mesh.userData.mixer) {
        cell.mesh.userData.mixer.update(dt);
      }
    });
  });
}


// ===================== BANK =====================
function makeBank(b){
  const g = new THREE.Group();
  const W = TILE*1.85, D = TILE*1.85, H = b.h||3.5;
  const glassMat_ = new THREE.MeshLambertMaterial({ color:0xaaddff, transparent:true, opacity:0.55 });
  // Base podium
  addBox(g, W, 0.3, D, 0, 0.15, 0, mat(0xd4af37));
  // Main tower
  addBox(g, W*0.72, H, W*0.72, 0, H/2, 0, mat(0xffd700));
  // Glass curtain walls
  addBox(g, W*0.73, H*0.9, 0.04, 0, H*0.5, W*0.36, glassMat_);
  addBox(g, W*0.73, H*0.9, 0.04, 0, H*0.5,-W*0.36, glassMat_);
  addBox(g, 0.04, H*0.9, W*0.73, W*0.36, H*0.5, 0, glassMat_);
  addBox(g, 0.04, H*0.9, W*0.73,-W*0.36, H*0.5, 0, glassMat_);
  // Columns at entrance
  for (const cx of [-W*0.22, 0, W*0.22]){
    addCyl(g, 0.07, 0.07, H*0.45, 8, mat(0xf0d060), cx, H*0.225, D*0.36);
  }
  // Roof ornament
  addBox(g, W*0.18, H*0.15, W*0.18, 0, H+H*0.075, 0, mat(0xd4af37));
  addCyl(g, 0.04, 0, H*0.2, 4, mat(0xd4af37), 0, H+H*0.22, 0);
  // 🏦 sign slab
  addBox(g, W*0.3, 0.12, 0.04, 0, H*0.3, D*0.365, mat(0x222222));
  return g;
}

// ===================== GAS STATION =====================
function makeGasStation(b){
  const g = new THREE.Group();
  const W = TILE * 0.9;
  addBox(g, W, 0.05, W, 0, 0.025, 0, mat(0xddccaa));
  addBox(g, W * 0.95, 0.10, W * 0.6, 0, 1.10, -W * 0.1, mat(0xee3333));
  addBox(g, W * 0.95, 0.06, W * 0.6, 0, 1.16, -W * 0.1, mat(0xffffff));
  for (const cx of [-W * 0.3, W * 0.3]){
    addCyl(g, 0.04, 0.04, 1.1, 6, mat(0xaaaaaa), cx, 0.55, W * 0.05);
  }
  addBox(g, W * 0.42, 0.70, W * 0.48, W * 0.22, 0.35, W * 0.22, mat(0xffffff));
  addBox(g, W * 0.42, 0.08, W * 0.48, W * 0.22, 0.74, W * 0.22, mat(0xee3333));
  for (const px of [-W * 0.15, W * 0.15]){
    addBox(g, 0.12, 0.50, 0.18, px, 0.25, -W * 0.05, mat(0x22aa44));
    addBox(g, 0.14, 0.08, 0.20, px, 0.52, -W * 0.05, mat(0x111111));
    addCyl(g, 0.015, 0.015, 0.3, 5, mat(0x333333), px + 0.07, 0.38, -W * 0.05, 0, 0, Math.PI / 2);
  }
  addCyl(g, 0.03, 0.03, 1.4, 6, mat(0x888888), -W * 0.34, 0.70, W * 0.28);
  addBox(g, 0.28, 0.20, 0.04, -W * 0.34, 1.50, W * 0.28 + 0.02, mat(0xffdd00));
  return g;
}

// ===================== SKYSCRAPER B =====================
function makeSkyscraper2(b){
  const g = new THREE.Group();
  const W = TILE*1.85, H = b.h||13;
  const gMat = new THREE.MeshLambertMaterial({ color:0x00ccff, transparent:true, opacity:0.55 });
  // Stepped tower
  addBox(g, W*0.9, H*0.45, W*0.9, 0, H*0.225, 0, mat(0x0088bb));
  addBox(g, W*0.7, H*0.3,  W*0.7, 0, H*0.6, 0,   mat(0x00aadd));
  addBox(g, W*0.5, H*0.2,  W*0.5, 0, H*0.8, 0,   mat(0x00ccff));
  addBox(g, W*0.25,H*0.08, W*0.25, 0,H*0.94, 0,  mat(0x00eeff));
  // Glass facade panels (6 vertical strips)
  for (let fi=0;fi<4;fi++){
    const fy = H*(0.05 + fi*0.22);
    addBox(g, W*0.88, H*0.18, 0.05, 0, fy, W*0.45, gMat);
    addBox(g, W*0.88, H*0.18, 0.05, 0, fy,-W*0.45, gMat);
    addBox(g, 0.05, H*0.18, W*0.88, W*0.45, fy, 0, gMat);
    addBox(g, 0.05, H*0.18, W*0.88,-W*0.45, fy, 0, gMat);
  }
  // Antenna
  addCyl(g, 0.03, 0, H*0.15, 6, mat(0xffffff), 0, H+H*0.075, 0);
  // Helipad circle on top
  addCyl(g, W*0.15, W*0.15, 0.06, 16, mat(0x334455), 0, H, 0);
  addCyl(g, W*0.08, W*0.08, 0.08, 16, mat(0xffaa00), 0, H+0.04, 0);
  return g;
}

// ===================== SKYSCRAPER C =====================
function makeSkyscraper3(b){
  const g = new THREE.Group();
  const W = TILE*2.8, H = b.h||16;
  const gMat = new THREE.MeshLambertMaterial({ color:0xff8844, transparent:true, opacity:0.5 });
  // Twisted look — 3 rotated blocks
  for (let i=0;i<8;i++){
    const rot = i*0.08;
    const w = W*(0.85 - i*0.05);
    const yBot = H*(i/8);
    const yH   = H*(1.2/8);
    const seg = new THREE.Group();
    addBox(seg, w, yH, w, 0, yH/2, 0, mat(0xcc5500 - i*0x100500));
    seg.position.y = yBot;
    seg.rotation.y = rot;
    g.add(seg);
  }
  // Outer glass skin
  addBox(g, W*0.88, H, 0.05,  0,H/2,  W*0.44, gMat);
  addBox(g, W*0.88, H, 0.05,  0,H/2, -W*0.44, gMat);
  addBox(g, 0.05, H, W*0.88,  W*0.44,H/2, 0, gMat);
  addBox(g, 0.05, H, W*0.88, -W*0.44,H/2, 0, gMat);
  // Spire
  addCyl(g, 0.05, 0, H*0.18, 6, mat(0xffaa44), 0, H+H*0.09, 0);
  addCyl(g, 0.12, 0.12, 0.15, 8, mat(0xff6600), 0, H, 0);
  return g;
}

// ===================== RAILWAY =====================
function makeRailway(){
  const g = new THREE.Group();
  const S = TILE * 0.98;
  // Ballast (gravel bed)
  addBox(g, S, 0.07, S, 0, 0.035, 0, mat(0x888880));
  // Sleepers (cross ties)
  const sleeperMat_ = mat(0x5a3a1a);
  const nSleepers = 5;
  for (let i=0; i<nSleepers; i++){
    const zPos = -S*0.4 + (i/(nSleepers-1))*S*0.8;
    addBox(g, S*0.9, 0.06, 0.15, 0, 0.09, zPos, sleeperMat_);
  }
  // Rails
  const railMat_ = mat(0xc0c0c0, {r:0.3, m:0.6});
  addBox(g, 0.06, 0.06, S*0.95, -S*0.22, 0.12, 0, railMat_);
  addBox(g, 0.06, 0.06, S*0.95,  S*0.22, 0.12, 0, railMat_);
  g.userData.isRailway = true;
  return g;
}

// ===================== PARK =====================
function makePark(b){
  const g = new THREE.Group();
  // base
  addBox(g, TILE*0.96, 0.06, TILE*0.96, 0, 0.03, 0, mat(0x4d7c3f, {r:0.95}));
  // paved paths
  addBox(g, TILE*0.96, 0.07, 0.22, 0, 0.065, 0, mat(0xd6d3d1, {r:0.7}));
  addBox(g, 0.22, 0.07, TILE*0.96, 0, 0.065, 0, mat(0xd6d3d1, {r:0.7}));
  // fountain in center
  addCyl(g, 0.32, 0.35, 0.12, 16, mat(0x94a3b8, {r:0.4}), 0, 0.09, 0);
  addCyl(g, 0.1, 0.1, 0.28, 10, mat(0x94a3b8, {r:0.5}), 0, 0.27, 0);
  addSphere(g, 0.07, 8, emissiveMat(0xbae6fd, 0.6), 0, 0.57, 0);
  // water in fountain
  addCyl(g, 0.3, 0.3, 0.02, 16, glassMat(0x60a5fa, 0.8), 0, 0.07, 0);
  // trees — use GLB if loaded, else procedural
  function parkTree(x, z){
    const t = makeTreeMesh();
    t.scale.multiplyScalar(rand(0.55, 0.75)); // fit inside park tile
    t.position.set(x, 0, z);
    g.add(t);
  }
  parkTree(-0.7, -0.7);
  parkTree( 0.7,  0.7);
  parkTree(-0.7,  0.7);
  parkTree( 0.7, -0.7);
  // benches
  function bench(x, z, ry=0){
    const bm = mat(0x92400e, {r:0.7});
    const sm = mat(0x52525b);
    const bg = new THREE.Group();
    addBox(bg, 0.5, 0.04, 0.14, 0, 0.22, 0, bm);     // seat
    addBox(bg, 0.5, 0.08, 0.04, 0, 0.3, 0.09, bm);   // backrest
    addBox(bg, 0.04, 0.22, 0.04, -0.2, 0.11, 0, sm);  // left leg
    addBox(bg, 0.04, 0.22, 0.04,  0.2, 0.11, 0, sm);  // right leg
    bg.position.set(x, 0.06, z);
    bg.rotation.y = ry;
    g.add(bg);
  }
  bench( 0.55, 0,  Math.PI/2);
  bench(-0.55, 0,  Math.PI/2);
  bench(0,  0.55, 0);
  bench(0, -0.55, 0);
  // lamp posts
  function lamp(x, z){
    addCyl(g, 0.025, 0.03, 1.0, 6, mat(0x404040), x, 0.56, z);
    addBox(g, 0.04, 0.04, 0.2, x, 1.09, z+0.08, mat(0x404040));
    addSphere(g, 0.07, 6, emissiveMat(0xfef9c3, 1.0), x, 1.12, z+0.18);
  }
  lamp( 0.7, -0.1); lamp(-0.7, 0.1);
  return g;
}

// ===================== SCHOOL =====================
function makeSchool(b){
  const g = new THREE.Group();
  const W = 1.75, D = 1.65, H = b.h;
  const floors = Math.max(2, Math.round(H/0.9));
  const fh = H/floors;
  // base
  addBox(g, W+0.15, 0.1, D+0.15, 0, 0.05, 0, mat(0x9ca3af, {r:0.8}));
  // main building
  addBox(g, W, H, D, 0, 0.1+H/2, 0, mat(b.color, {r:0.75}));
  // hip roof
  hipRoof(g, W, D, 0.55, 0, 0.1+H+0.275, 0, mat(b.accent, {r:0.6}));
  // eaves
  addBox(g, W+0.15, 0.06, D+0.15, 0, 0.1+H+0.03, 0, mat(b.accent));
  // floor separator bands
  for (let f=1; f<floors; f++) addBox(g, W+0.02, 0.06, D+0.02, 0, 0.1+f*fh, 0, mat(0x9ca3af));
  // columns + entrance
  addBox(g, 0.08, H*0.55, 0.08, -0.35, 0.1+H*0.275, D/2+0.08, mat(0xd4d4d8, {m:0.15}));
  addBox(g, 0.08, H*0.55, 0.08,  0.35, 0.1+H*0.275, D/2+0.08, mat(0xd4d4d8, {m:0.15}));
  addBox(g, 0.9, 0.07, 0.3, 0, 0.1+H*0.55+0.035, D/2+0.15, mat(0xd4d4d8));
  // door
  addBox(g, 0.38, H*0.55, 0.05, 0, 0.1+H*0.275, D/2+0.025, glassMat(0x111827, 0.9));
  // steps
  for (let s=0;s<3;s++) addBox(g, 0.9, 0.06, 0.18, 0, s*0.06+0.09, D/2+0.18+s*0.18, mat(0xd4d4d8));
  // windows per floor
  for (let f=0; f<floors; f++){
    const wy = 0.1 + f*fh + fh*0.55;
    for (const wx of [-W*0.38,-W*0.15,W*0.15,W*0.38]){
      addWindow(g, wx, wy, D/2+0.026, 0.28, fh*0.5, 0.025, 'front');
      addWindow(g, wx, wy, -D/2-0.026, 0.28, fh*0.5, 0.025, 'back');
    }
  }
  // flag pole
  addCyl(g, 0.015, 0.02, 1.6, 6, mat(0x9ca3af, {m:0.5}), W/2-0.1, 0.1+H+0.35+0.55, -D/2+0.1);
  addBox(g, 0.35, 0.2, 0.015, W/2-0.1+0.18, 0.1+H+0.35+1.15, -D/2+0.1, mat(0xef4444));
  return g;
}

// ===================== HOSPITAL =====================
function makeHospital(b){
  const g = new THREE.Group();
  const W = 1.8, D = 1.8, H = b.h;
  const floors = Math.round(H/0.75);
  const fh = H/floors;
  // base
  addBox(g, W+0.2, 0.1, D+0.2, 0, 0.05, 0, mat(0x9ca3af));
  // main tower
  addBox(g, W, H, D, 0, 0.1+H/2, 0, mat(b.color, {r:0.6}));
  // floor separators
  for (let f=1;f<floors;f++) addBox(g, W+0.02, 0.05, D+0.02, 0, 0.1+f*fh, 0, mat(0xd4d4d8));
  // windows
  for (let f=0;f<floors;f++){
    const wy = 0.1 + f*fh + fh*0.55;
    for (const wx of [-W*0.35, 0, W*0.35]){
      addWindow(g, wx, wy, D/2+0.026, 0.28, fh*0.55, 0.025, 'front');
      addWindow(g, wx, wy, -D/2-0.026, 0.28, fh*0.55, 0.025, 'back');
    }
    addWindow(g, 0, wy, W/2+0.026, 0.28, fh*0.55, 0.025, 'right');
    addWindow(g, 0, wy, -W/2-0.026, 0.28, fh*0.55, 0.025, 'left');
  }
  // entrance wing (lower)
  addBox(g, W*0.55, H*0.3, D*0.22, 0, 0.1+H*0.15, D/2+D*0.11, mat(b.color, {r:0.6}));
  addBox(g, W*0.55, 0.05, D*0.22+0.04, 0, 0.1+H*0.3+0.025, D/2+D*0.11, mat(0xd4d4d8));
  // big red cross on top (emissive)
  const crossMat = emissiveMat(0xef4444, 0.8);
  addBox(g, 0.65, 0.12, 0.06, 0, 0.1+H*0.82, D/2+0.031, crossMat);
  addBox(g, 0.12, 0.65, 0.06, 0, 0.1+H*0.82, D/2+0.031, crossMat);
  // helipad roof
  addBox(g, W+0.1, 0.1, D+0.1, 0, 0.1+H+0.05, 0, mat(0x374151));
  addCyl(g, 0.55, 0.55, 0.04, 20, mat(0xfafafa, {r:0.5}), 0, 0.1+H+0.12, 0);
  addBox(g, 0.1, 0.05, 0.7, 0, 0.1+H+0.15, 0, crossMat);
  addBox(g, 0.7, 0.05, 0.1, 0, 0.1+H+0.15, 0, crossMat);
  return g;
}

// ===================== POLICE =====================
function makePolice(b){
  const g = new THREE.Group();
  const W = 1.65, D = 1.5, H = b.h;
  addBox(g, W+0.15, 0.1, D+0.15, 0, 0.05, 0, mat(0x374151));
  addBox(g, W, H, D, 0, 0.1+H/2, 0, mat(b.color, {r:0.65}));
  // facade pilasters
  addBox(g, 0.1, H, 0.12, -W/2+0.07, 0.1+H/2, D/2, mat(0xd4d4d8));
  addBox(g, 0.1, H, 0.12,  W/2-0.07, 0.1+H/2, D/2, mat(0xd4d4d8));
  addBox(g, W+0.02, 0.08, D+0.02, 0, 0.1+H*0.4, 0, mat(0xd4d4d8));
  // roof parapet
  addBox(g, W+0.06, 0.18, D+0.06, 0, 0.1+H+0.09, 0, mat(b.accent));
  // entrance columns
  addCyl(g, 0.055, 0.065, H*0.55, 12, mat(0xd4d4d8, {m:0.15}), -0.3, 0.1+H*0.275, D/2+0.06);
  addCyl(g, 0.055, 0.065, H*0.55, 12, mat(0xd4d4d8, {m:0.15}),  0.3, 0.1+H*0.275, D/2+0.06);
  addBox(g, 0.8, 0.07, 0.25, 0, 0.1+H*0.56, D/2+0.12, mat(0xd4d4d8));
  // door
  addBox(g, 0.38, H*0.52, 0.05, 0, 0.1+H*0.26, D/2+0.025, glassMat(0x1e40af, 0.85));
  // badge sign
  addBox(g, 0.6, 0.2, 0.06, 0, 0.1+H*0.82, D/2+0.031, emissiveMat(b.accent, 0.7));
  // windows
  const floors = 2;
  for (const wx of [-W*0.35, W*0.35]){
    addWindow(g, wx, 0.1+H*0.7, D/2+0.026, 0.28, H*0.25, 0.025, 'front');
    addWindow(g, wx, 0.1+H*0.25, D/2+0.026, 0.28, H*0.28, 0.025, 'front');
  }
  // rooftop beacon
  addCyl(g, 0.04, 0.04, 0.3, 8, mat(0x374151), 0, 0.1+H+0.33, 0);
  addSphere(g, 0.07, 8, emissiveMat(0x3b82f6, 1.5), 0, 0.1+H+0.52, 0);
  return g;
}

// ===================== FIRE STATION =====================
function makeFire(b){
  const g = new THREE.Group();
  const W = 1.8, D = 1.6, H = b.h;
  addBox(g, W+0.15, 0.1, D+0.15, 0, 0.05, 0, mat(0x374151));
  addBox(g, W, H, D, 0, 0.1+H/2, 0, mat(b.color, {r:0.65}));
  // large garage bay doors (front face, lower half)
  const dh = H*0.7, dw = W*0.75;
  addBox(g, dw, dh, 0.05, -W*0.05, 0.1+dh/2, D/2, mat(0xfafafa, {r:0.5}));
  // horizontal door panels
  for (let p=0; p<5; p++) addBox(g, dw, 0.03, 0.055, -W*0.05, 0.1+dh/5*(p+0.5), D/2+0.005, mat(0xd4d4d8));
  // red stripe on door
  addBox(g, dw+0.02, 0.08, 0.06, -W*0.05, 0.1+dh*0.35, D/2, mat(b.accent));
  // roof parapet
  addBox(g, W+0.08, 0.2, D+0.08, 0, 0.1+H+0.1, 0, mat(b.accent));
  // bell tower
  const btX = W*0.38, btZ = -D*0.35;
  addBox(g, 0.4, H*0.55, 0.4, btX, 0.1+H+H*0.275, btZ, mat(b.color));
  addBox(g, 0.45, 0.06, 0.45, btX, 0.1+H+H*0.55+0.03, btZ, mat(b.accent));
  // bell
  addSphere(g, 0.08, 8, mat(0xfde047, {m:0.7}), btX, 0.1+H+H*0.5, btZ);
  // windows
  addWindow(g, W*0.38, 0.1+H*0.8, D/2+0.026, 0.25, H*0.22, 0.025, 'front');
  addWindow(g, -W*0.4, 0.1+H*0.8, D/2+0.026, 0.2, H*0.22, 0.025, 'front');
  // hose reel side
  addCyl(g, 0.1, 0.1, 0.06, 10, mat(0xd4d4d8), -W/2-0.05, 0.38, D*0.1, 0,0,Math.PI/2);
  return g;
}

// ===================== BUS STOP =====================
function makeBusStop(b){
  const g = new THREE.Group();
  // pad
  addBox(g, 1.1, 0.04, 0.55, 0, 0.02, 0, mat(0xa8a29e, {r:0.85}));
  // 4 pillars
  const pm = mat(0x374151, {r:0.4, m:0.2});
  for (const [px,pz] of [[-0.48,0.22],[-0.48,-0.22],[0.48,0.22],[0.48,-0.22]]){
    addCyl(g, 0.025, 0.028, 0.7, 8, pm, px, 0.39, pz);
  }
  // back wall (glass)
  addBox(g, 1.0, 0.6, 0.04, 0, 0.38, -0.22, glassMat(0xbae6fd, 0.45));
  // bench inside
  addBox(g, 0.7, 0.05, 0.16, 0, 0.32, 0, mat(0x92400e, {r:0.6}));
  addBox(g, 0.05, 0.24, 0.04, -0.3, 0.22, -0.05, mat(0x52525b));
  addBox(g, 0.05, 0.24, 0.04,  0.3, 0.22, -0.05, mat(0x52525b));
  // roof panel
  addBox(g, 1.1, 0.04, 0.58, 0, 0.72, 0, mat(b.color, {r:0.4}));
  // roof border
  addBox(g, 1.14, 0.03, 0.62, 0, 0.72+0.035, 0, mat(b.accent));
  // sign board on pillar
  addBox(g, 0.22, 0.18, 0.04, 0.5, 0.55, 0.23, emissiveMat(b.color, 0.55));
  addBox(g, 0.2, 0.04, 0.05, 0.5, 0.42, 0.23, mat(b.accent));
  return g;
}

// ===================== METRO STATION =====================
function makeMetro(b){
  const g = new THREE.Group();
  const W = 1.8, D = 1.8, H = b.h;
  // platform base
  addBox(g, W+0.2, 0.12, D+0.2, 0, 0.06, 0, mat(0x374151));
  addBox(g, W, H*0.45, D, 0, 0.12+H*0.225, 0, mat(b.color, {r:0.5, m:0.1}));
  // glazed barrel vault roof
  const vaultMat = glassMat(0x93c5fd, 0.45);
  const vaultFrame = mat(b.accent, {r:0.4, m:0.3});
  // vault arch ribs (8 arches)
  for (let i=0; i<8; i++){
    const archGeo = new THREE.TorusGeometry(H*0.42, 0.025, 6, 24, Math.PI);
    const rib = new THREE.Mesh(archGeo, vaultFrame);
    rib.position.set(0, 0.12+H*0.45, -D/2+i*D/7);
    rib.rotation.y = Math.PI/2;
    g.add(rib);
  }
  addBox(g, W*0.95, H*0.42*2, 0.04, 0, 0.12+H*0.45+H*0.42, -D/2, vaultMat);
  addBox(g, W*0.95, H*0.42*2, 0.04, 0, 0.12+H*0.45+H*0.42,  D/2, vaultMat);
  addBox(g, 0.04, H*0.42*2, D, W/2, 0.12+H*0.45+H*0.42, 0, vaultMat);
  addBox(g, 0.04, H*0.42*2, D, -W/2, 0.12+H*0.45+H*0.42, 0, vaultMat);
  // entrance canopy
  addBox(g, W*0.5, 0.07, 0.45, 0, 0.12+H*0.4, D/2+0.225, mat(b.accent));
  addCyl(g, 0.04, 0.05, H*0.45, 10, mat(b.accent), -W*0.22, 0.12+H*0.225, D/2+0.42);
  addCyl(g, 0.04, 0.05, H*0.45, 10, mat(b.accent),  W*0.22, 0.12+H*0.225, D/2+0.42);
  // M sign (emissive)
  addBox(g, 0.45, 0.38, 0.06, 0, 0.12+H*0.28, D/2+0.43, emissiveMat(0xa78bfa, 0.9));
  addBox(g, 0.5, 0.42, 0.04, 0, 0.12+H*0.28, D/2+0.44, mat(0x2e1065));
  // floor windows
  addWindow(g, -W*0.3, 0.12+H*0.25, D/2+0.01, 0.3, H*0.3, 0.025, 'front');
  addWindow(g,  W*0.3, 0.12+H*0.25, D/2+0.01, 0.3, H*0.3, 0.025, 'front');
  return g;
}

// ===================== AIRPORT =====================
function makeAirport(b){
  const g = new THREE.Group();
  const TW = TILE*0.97, TD = TILE*0.97;
  // tarmac
  addBox(g, TW, 0.04, TD, 0, 0.02, 0, mat(0x27272a, {r:0.9}));
  // runway
  addBox(g, 0.22, 0.045, TD*0.95, 0, 0.042, 0, mat(0x3f3f46, {r:0.8}));
  for (let i=-3;i<=3;i++) addBox(g, 0.08, 0.046, 0.2, 0, 0.043, i*0.35, mat(0xfafafa));
  // terminal building
  addBox(g, TW*0.78, 0.7, TD*0.32, -TW*0.04, 0.04+0.35, -TD*0.3, mat(b.color, {r:0.5, m:0.1}));
  // terminal glass front
  addBox(g, TW*0.76, 0.58, 0.04, -TW*0.04, 0.04+0.33, -TD*0.3+TD*0.16+0.02, glassMat(0xbae6fd, 0.55));
  // terminal roof
  addBox(g, TW*0.82, 0.06, TD*0.36, -TW*0.04, 0.04+0.73, -TD*0.3, mat(b.accent));
  // boarding bridges
  for (const bx of [-TW*0.28, TW*0.2]){
    addBox(g, 0.12, 0.22, 0.55, bx, 0.04+0.22, -TD*0.1, mat(0x9ca3af));
    addBox(g, 0.22, 0.22, 0.04, bx, 0.04+0.22, -TD*0.07, mat(0x71717a));
  }
  // control tower
  addCyl(g, 0.09, 0.12, 1.3, 10, mat(b.accent), TW*0.38, 0.04+0.65, -TD*0.3);
  addCyl(g, 0.22, 0.2, 0.18, 14, glassMat(0x60a5fa, 0.65), TW*0.38, 0.04+1.39, -TD*0.3);
  addCyl(g, 0.23, 0.23, 0.04, 14, mat(0x374151), TW*0.38, 0.04+1.5, -TD*0.3);
  // parked plane
  const plane = new THREE.Group();
  addBox(plane, 1.05, 0.1, 0.2, 0, 0.05, 0, mat(0xfafafa, {r:0.3, m:0.3})); // fuselage
  addBox(plane, 0.18, 0.06, 0.8, 0, 0.05, 0, mat(0xfafafa, {r:0.3}));         // wings
  addBox(plane, 0.14, 0.12, 0.08, -0.48, 0.1, 0, mat(0xef4444));              // tail fin
  // engine nacelles
  addCyl(plane, 0.055, 0.05, 0.2, 8, mat(0xa8a29e), 0.18, 0.03, 0.25, Math.PI/2,0,0);
  addCyl(plane, 0.055, 0.05, 0.2, 8, mat(0xa8a29e), -0.18, 0.03, 0.25, Math.PI/2,0,0);
  // windows row
  for (let wi=-2;wi<=2;wi++) addSphere(plane, 0.025, 4, glassMat(0xbae6fd, 0.7), wi*0.15, 0.1, 0.1);
  plane.position.set(0.1, 0.04, TD*0.2);
  plane.rotation.y = 0.4;
  g.add(plane);
  return g;
}

function makeBuildingMesh(key){
  const b = BUILDINGS[key];
  if (!b) return null;
  let g;
  switch(key){
    case 'road':        g = makeGLBBuilding('road', b); break;
    case 'railway':     g = makeRailway(); break;
    case 'water_tile':  g = makeWaterTile(); break;
    case 'res_low':     g = makeGLBBuilding('res_low', b); break;
    case 'res_med':     g = makeGLBBuilding('res_med', b); break;
    case 'res_high':    g = makeGLBBuilding('res_high', b); break;
    case 'com_shop':    g = makeGLBBuilding('com_shop', b); break;
    case 'com_mall':    g = makeGLBBuilding('com_mall', b); break;
    case 'ind_office':  g = makeGLBBuilding('ind_office', b); break;
    case 'skyscraper':  g = makeGLBBuilding('skyscraper', b); break;
    case 'skyscraper2': g = makeSkyscraper2(b); break;
    case 'skyscraper3': g = makeSkyscraper3(b); break;
    case 'bank':        g = makeBank(b); break;
    case 'gas_station': g = makeGasStation(b); break;
    case 'ind_factory': g = makeGLBBuilding('ind_factory', b); break;
    case 'power_coal':  g = makeGLBBuilding('power_coal', b); break;
    case 'power_solar': g = makeGLBBuilding('power_solar', b); break;
    case 'power_wind':  g = makeWind(b); break;
    case 'water_pump':  g = makeGLBBuilding('water_pump', b); break;
    case 'park':        g = makePark(b); break;
    case 'school':      g = makeGLBBuilding('school', b); break;
    case 'hospital':    g = makeGLBBuilding('hospital', b); break;
    case 'police':      g = makeGLBBuilding('police', b); break;
    case 'fire':        g = makeGLBBuilding('fire', b); break;
    case 'bus_stop':    g = makeGLBBuilding('bus_stop', b); break;
    case 'metro':       g = makeGLBBuilding('metro', b); break;
    case 'airport':     g = makeGLBBuilding('airport', b); break;
    default: {
      g = new THREE.Group();
      addBox(g, TILE*0.8, b.h, TILE*0.8, 0, b.h/2, 0, mat(b.color));
    }
  }
  if (key !== 'road') applyOutlines(g, 0.055);
  return g;
}

// -------------------- PLACEMENT --------------------
function getSize(key){ return (BUILDINGS[key] && BUILDINGS[key].size) || 1; }

// Centre-of-footprint world position for a building anchored at top-left (gx, gz) of size N
function footprintCenterWorld(gx, gz, size){
  return {
    x: gx*TILE - HALF + (TILE*size)/2,
    z: gz*TILE - HALF + (TILE*size)/2
  };
}

function canPlaceAt(key, gx, gz){
  if (!inBounds(gx,gz)) return false;
  if (key === 'bulldoze') return state.grid[gx][gz].type != null;
  const size = getSize(key);
  // all tiles in footprint must be in-bounds and empty
  for (let dx=0; dx<size; dx++){
    for (let dz=0; dz<size; dz++){
      const nx = gx+dx, nz = gz+dz;
      if (!inBounds(nx, nz)) return false;
      if (state.grid[nx][nz].type != null) return false;
    }
  }
  // Water pump must be adjacent to water tile
  if (key === 'water_pump' && !nearWater(gx, gz, size)){
    return false;
  }
  return true;
}

// -------------------- CONSTRUCTION & DESTRUCTION ANIMATIONS --------------------

// Build duration in real seconds: size1=60s, size2=120s, size3=180s, size4=300s
function buildDuration(size){ return [0, 60, 120, 180, 300][Math.min(size, 4)]; }

function makeScaffoldMesh(key){
  const b = BUILDINGS[key];
  const size = getSize(key);
  const w = size * TILE * 0.9;
  const h = Math.max(0.4, (b.h || 1) * 0.5);
  const g = new THREE.Group();

  // Wooden frame — orange/yellow scaffold poles
  const poleMat = new THREE.MeshLambertMaterial({ color: 0xffaa33 });
  const planMat = new THREE.MeshLambertMaterial({ color: 0xccaa66, transparent: true, opacity: 0.7 });

  // Vertical poles at corners
  const poleGeo = new THREE.CylinderGeometry(0.04, 0.04, h, 5);
  const offsets = [[-w/2,-w/2],[w/2,-w/2],[-w/2,w/2],[w/2,w/2]];
  offsets.forEach(([ox,oz])=>{
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.set(ox, h/2, oz);
    g.add(pole);
  });

  // Horizontal planks at intervals
  const levels = Math.max(1, Math.floor(h/0.5));
  for (let i=1; i<=levels; i++){
    const y = (i/levels)*h;
    const plankGeo = new THREE.BoxGeometry(w, 0.05, 0.08);
    [-w/2, w/2].forEach(oz=>{
      const plank = new THREE.Mesh(plankGeo, planMat);
      plank.position.set(0, y, oz);
      g.add(plank);
    });
    const plankGeo2 = new THREE.BoxGeometry(0.08, 0.05, w);
    [-w/2, w/2].forEach(ox=>{
      const plank = new THREE.Mesh(plankGeo2, planMat);
      plank.position.set(ox, y, 0);
      g.add(plank);
    });
  }

  // Tarp / wrap — semi-transparent blue-green panel
  const tarpGeo = new THREE.BoxGeometry(w, h, w);
  const tarpMat = new THREE.MeshLambertMaterial({ color: 0x44aacc, transparent: true, opacity: 0.22, side: THREE.DoubleSide });
  const tarp = new THREE.Mesh(tarpGeo, tarpMat);
  tarp.position.y = h/2;
  g.add(tarp);

  // 🚧 sign sprite
  const signGeo = new THREE.PlaneGeometry(0.5, 0.3);
  const signMat = new THREE.MeshBasicMaterial({ color: 0xffdd00, side: THREE.DoubleSide });
  const sign = new THREE.Mesh(signGeo, signMat);
  sign.position.set(0, h * 0.3, w/2 + 0.05);
  g.add(sign);

  g.userData.scaff = true;
  return g;
}

// Spawn debris particles for destruction
function spawnDestruction(mesh, onDone){
  if (!mesh) { if(onDone) onDone(); return; }
  const pos = new THREE.Vector3();
  mesh.getWorldPosition(pos);

  const count = 24;
  const geo = new THREE.BoxGeometry(0.15, 0.15, 0.15);
  const mats = [0xaa7744, 0x887766, 0xcc9933, 0x665544].map(c =>
    new THREE.MeshLambertMaterial({ color: c })
  );

  const particles = [];
  for (let i=0; i<count; i++){
    const m = new THREE.Mesh(geo, mats[i % mats.length]);
    m.position.copy(pos);
    m.position.x += rand(-1.5, 1.5);
    m.position.y += rand(0.2, 2.0);
    m.position.z += rand(-1.5, 1.5);
    m.userData.vel = new THREE.Vector3(rand(-3,3), rand(3,7), rand(-3,3));
    m.userData.rot = new THREE.Vector3(rand(-4,4), rand(-4,4), rand(-4,4));
    scene.add(m);
    particles.push(m);
  }

  // Shake + shrink the original mesh before removing
  let t = 0;
  const entry = { mesh, particles, t, onDone };
  state.destructions.push(entry);

  // Remove original mesh immediately (hidden under particles)
  scene.remove(mesh);
}

function updateDestructions(dt){
  for (let i = state.destructions.length-1; i >= 0; i--){
    const d = state.destructions[i];
    d.t += dt;
    const gravity = 9.8;
    for (const p of d.particles){
      p.userData.vel.y -= gravity * dt;
      p.position.addScaledVector(p.userData.vel, dt);
      p.rotation.x += p.userData.rot.x * dt;
      p.rotation.y += p.userData.rot.y * dt;
      p.rotation.z += p.userData.rot.z * dt;
      // fade out scale
      const s = Math.max(0, 1 - d.t/1.8);
      p.scale.setScalar(s);
    }
    if (d.t > 1.8){
      for (const p of d.particles){ scene.remove(p); p.geometry.dispose(); }
      if (d.onDone) d.onDone();
      state.destructions.splice(i, 1);
    }
  }
}

function updateConstructions(dt){
  const mult = state.speed || 1;
  for (let i = state.constructions.length-1; i >= 0; i--){
    const c = state.constructions[i];
    c.progress += dt * mult;
    const pct = Math.min(1, c.progress / c.duration);

    // Rise-up effect: building mesh scales from 0 → 1 on Y as progress goes 0.6→1.0
    if (c.mesh && pct > 0.6){
      const riseT = (pct - 0.6) / 0.4;
      c.mesh.scale.y = riseT;
      c.mesh.position.y = -c.meshBaseH * (1 - riseT) * 0.5;
    }

    if (pct >= 1){
      // Construction complete — remove scaffold, finalize building
      if (c.scaffMesh){ scene.remove(c.scaffMesh); }
      if (c.mesh){
        c.mesh.scale.y = 1;
        c.mesh.position.y = 0;
      }

      // Register in buildings & grid
      const b = BUILDINGS[c.key];
      const size = getSize(c.key);
      state.buildings.push({ x: c.gx, z: c.gz, type: c.key, mesh: c.mesh });
      for (let dx=0; dx<size; dx++){
        for (let dz=0; dz<size; dz++){
          const nx = c.gx+dx, nz = c.gz+dz;
          if (inBounds(nx,nz)) state.grid[nx][nz] = {
            type: c.key, mesh: (dx===0&&dz===0) ? c.mesh : null,
            rotation: c.rotation, origin: { gx:c.gx, gz:c.gz }
          };
        }
      }
      if (c.key === 'road') updateRoadOrientations(c.gx, c.gz);
      recalcStats();
      notify(`${b.name} complete!`, `Construction finished at (${c.gx},${c.gz}).`, 'success');
      state.constructions.splice(i, 1);
    }
  }
}

function placeBuilding(key, gx, gz){
  if (!canPlaceAt(key, gx, gz)){
    if (key === 'water_pump'){
      notify('Water Pump needs water!', 'Place a Lake/River or Irrigation tile adjacent first.', 'warn');
      Audio.playError();
    }
    return false;
  }
  const b = BUILDINGS[key];
  if (state.money < b.cost) {
    notify('Insufficient funds', `Need $${b.cost.toLocaleString()} to build ${b.name}.`, 'danger');
    Audio.playError();
    return false;
  }
  const size = getSize(key);
  const wp = footprintCenterWorld(gx, gz, size);
  const rotation = state.placeRotation;

  // Instant-place types: road, railway, water tiles
  const instantKeys = ['road','railway','water_tile'];
  if (instantKeys.includes(key)){
    const mesh = makeBuildingMesh(key);
    if (!mesh) return false;
    mesh.position.set(wp.x, 0, wp.z);
    mesh.rotation.y = rotation * Math.PI / 2;
    scene.add(mesh);
    for (let dx=0; dx<size; dx++){
      for (let dz=0; dz<size; dz++){
        const nx=gx+dx, nz=gz+dz;
        state.grid[nx][nz] = { type:key, mesh:(dx===0&&dz===0)?mesh:null, rotation, origin:{gx,gz} };
      }
    }
    state.money -= b.cost;
    state.buildings.push({ x:gx, z:gz, type:key, mesh });
    if (key === 'road') updateRoadOrientations(gx, gz);
    if (key === 'railway') updateRailwayOrientations(gx, gz);
    if (key === 'water_tile') updateWaterMerge(gx, gz);
    Audio.playPlace();
    recalcStats();
    return true;
  }

  // Mark tiles as under construction immediately (prevent double-placement)
  for (let dx=0; dx<size; dx++){
    for (let dz=0; dz<size; dz++){
      const nx=gx+dx, nz=gz+dz;
      if (inBounds(nx,nz)) state.grid[nx][nz] = { type:key, mesh:null, rotation, origin:{gx,gz}, underConstruction:true };
    }
  }

  state.money -= b.cost;
  Audio.playPlace();

  // Scaffold mesh shown immediately
  const scaffMesh = makeScaffoldMesh(key);
  scaffMesh.position.set(wp.x, 0, wp.z);
  scaffMesh.rotation.y = rotation * Math.PI / 2;
  scene.add(scaffMesh);

  // Real building mesh — hidden (scale.y=0) until construction progresses
  const mesh = makeBuildingMesh(key);
  let meshBaseH = 1;
  if (mesh){
    if (size > 1 && !mesh.userData.glb) mesh.scale.set(size, 1, size);
    mesh.scale.y = 0;
    mesh.position.set(wp.x, 0, wp.z);
    mesh.rotation.y = rotation * Math.PI / 2;
    scene.add(mesh);
    // estimate base height for rise effect
    meshBaseH = b.h || 1;
  }

  state.constructions.push({
    gx, gz, key, mesh, scaffMesh,
    progress: 0,
    duration: buildDuration(size),
    rotation,
    meshBaseH,
  });

  recalcStats();
  notify(`${b.name} under construction`, `Will be ready in ~${Math.round(buildDuration(size)/60)} min${size>1?' (large building)':''}.`, 'info');
  return true;
}

function bulldoze(gx, gz){
  if (!inBounds(gx,gz)) return false;
  const cell = state.grid[gx][gz];
  if (!cell.type) return false;

  // Cancel any in-progress construction first
  const cIdx = state.constructions.findIndex(c => c.gx===gx && c.gz===gz);
  if (cIdx !== -1){
    const c = state.constructions[cIdx];
    if (c.scaffMesh) scene.remove(c.scaffMesh);
    if (c.mesh) scene.remove(c.mesh);
    state.constructions.splice(cIdx, 1);
  }

  // find origin tile (multi-tile buildings)
  const og = cell.origin || { gx, gz };
  const originCell = state.grid[og.gx][og.gz];
  const key = originCell.type;
  const size = getSize(key);

  // Destruction animation
  if (originCell.mesh && key !== 'road'){
    spawnDestruction(originCell.mesh);
  } else if (originCell.mesh){
    scene.remove(originCell.mesh);
    originCell.mesh.traverse(o=>{ if (o.isMesh && o.geometry){ o.geometry.dispose(); }});
  }

  state.buildings = state.buildings.filter(b=>!(b.x===og.gx && b.z===og.gz));
  // clear all occupied tiles
  for (let dx=0; dx<size; dx++){
    for (let dz=0; dz<size; dz++){
      const nx = og.gx+dx, nz = og.gz+dz;
      if (inBounds(nx,nz)) state.grid[nx][nz] = { type:null, mesh:null, rotation:0 };
    }
  }
  // Restore water shores for neighbors when water is bulldozed
  if (key === 'water_tile'){
    [[1,0],[-1,0],[0,1],[0,-1]].forEach(([ddx,ddz]) => {
      const nx = og.gx+ddx, nz = og.gz+ddz;
      if (inBounds(nx,nz)) updateWaterMerge(nx, nz);
    });
  }
  recalcStats();
  Audio.playBulldoze();
  return true;
}

function updateRoadOrientations(gx, gz){
  const neighbors = (x,z)=>({
    n: inBounds(x,z-1) && state.grid[x][z-1].type==='road',
    s: inBounds(x,z+1) && state.grid[x][z+1].type==='road',
    e: inBounds(x+1,z) && state.grid[x+1][z].type==='road',
    w: inBounds(x-1,z) && state.grid[x-1][z].type==='road'
  });
  const orient = (x,z)=>{
    const c = state.grid[x][z];
    if (c.type!=='road' || !c.mesh) return;
    const n = neighbors(x,z);
    const horizontal = (n.e||n.w) && !(n.n||n.s);
    // GLB road: rotate 90° for horizontal orientation
    c.mesh.rotation.y = horizontal ? Math.PI/2 : 0;
    // Legacy line support (procedural fallback)
    if (c.mesh.userData.line){
      c.mesh.userData.line.rotation.z = horizontal ? Math.PI/2 : 0;
    }
  };
  orient(gx,gz);
  [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dz])=>orient(gx+dx, gz+dz));
}

function updateRailwayOrientations(gx, gz){
  const isRail = (x,z) => inBounds(x,z) && state.grid[x][z].type==='railway';
  const orient = (x,z)=>{
    const c = state.grid[x][z];
    if (c.type!=='railway' || !c.mesh) return;
    const n = isRail(x,z-1), s = isRail(x,z+1), e = isRail(x+1,z), w = isRail(x-1,z);
    const horizontal = (e||w) && !(n||s);
    c.mesh.rotation.y = horizontal ? Math.PI/2 : 0;
  };
  orient(gx,gz);
  [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dz])=>orient(gx+dx, gz+dz));
}

// Check if any tile adjacent to footprint has water (water_tile)
function nearWater(gx, gz, size=1){
  for (let i=0; i<size; i++){
    const checks = [
      [gx-1,gz+i],[gx+size,gz+i],[gx+i,gz-1],[gx+i,gz+size]
    ];
    for (const [nx,nz] of checks){
      if (inBounds(nx,nz)){
        const t = state.grid[nx][nz].type;
        if (t==='water_tile') return true;
      }
    }
  }
  return false;
}

// Connection check: is tile adjacent to a road?
function nearRoad(gx, gz, size=1){
  // check all tiles bordering the footprint
  for (let i=0; i<size; i++){
    const checks = [
      [gx-1, gz+i], [gx+size, gz+i],   // left/right edges
      [gx+i, gz-1], [gx+i, gz+size],   // top/bottom edges
    ];
    for (const [nx,nz] of checks){
      if (inBounds(nx,nz) && state.grid[nx][nz].type==='road') return true;
    }
  }
  return false;
}

// -------------------- CITIZENS --------------------
function createCitizen(homeBuilding){
  const c = {
    id: Math.random().toString(36).slice(2,9),
    name: `${choice(FIRST_NAMES)} ${choice(LAST_NAMES)}`,
    age: randInt(18, 65),
    job: choice(JOBS),
    edu: choice(EDUS),
    happy: randInt(60, 90),
    health: randInt(70, 100),
    home: homeBuilding
  };
  return c;
}

// -------------------- VEHICLES --------------------

// ===================== TRAIN SYSTEM =====================
const TRAIN_COLORS = [0xffffff, 0x0055cc, 0xcc2200, 0x33aa44];

function makeTrain(){
  const g = new THREE.Group();
  const bodyCol = choice(TRAIN_COLORS);
  const accentCol = 0x111122;
  const nCars = randInt(3, 5);
  const carLen = 1.1;
  const carGap = 0.05;
  const totalLen = nCars * carLen + (nCars - 1) * carGap;
  let xOff = -totalLen / 2 + carLen / 2;

  for (let ci = 0; ci < nCars; ci++){
    const car = new THREE.Group();
    // Body
    addBox(car, carLen, 0.28, 0.38, 0, 0.22, 0, mat(bodyCol));
    // Nose/tail slope for first and last car
    if (ci === 0){
      addBox(car, 0.18, 0.18, 0.36, carLen*0.5 - 0.06, 0.16, 0, mat(bodyCol));
      addBox(car, 0.04, 0.04, 0.36, carLen*0.5 + 0.08, 0.08, 0, mat(0xffcc00));
    }
    if (ci === nCars - 1){
      addBox(car, 0.18, 0.18, 0.36, -carLen*0.5 + 0.06, 0.16, 0, mat(bodyCol));
    }
    // Stripe
    addBox(car, carLen, 0.04, 0.40, 0, 0.28, 0, mat(0x0033aa));
    // Windows row
    const nWin = 3;
    for (let wi = 0; wi < nWin; wi++){
      const wx = -carLen*0.25 + wi * (carLen*0.25);
      addBox(car, 0.16, 0.1, 0.02, wx, 0.25, 0.20, mat(0x88ccff));
      addBox(car, 0.16, 0.1, 0.02, wx, 0.25, -0.20, mat(0x88ccff));
    }
    // Undercarriage
    addBox(car, carLen*0.9, 0.07, 0.42, 0, 0.07, 0, mat(accentCol));
    // Wheels (4 per car)
    for (const wx of [-carLen*0.35, carLen*0.35]){
      for (const wz of [-0.22, 0.22]){
        addCyl(car, 0.07, 0.07, 0.06, 8, mat(0x333344), wx, 0.06, wz, 0, 0, Math.PI/2);
      }
    }
    car.position.x = xOff;
    g.add(car);
    xOff += carLen + carGap;
  }
  g.scale.setScalar(0.72);
  g.userData.isTrain = true;
  return g;
}

function spawnTrain(){
  const rails = state.buildings.filter(b => b.type === 'railway');
  if (rails.length < 3) return;
  const start = choice(rails);
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  const valid = dirs.filter(([dx,dz]) => {
    const nx = start.x+dx, nz = start.z+dz;
    return inBounds(nx,nz) && state.grid[nx][nz].type === 'railway';
  });
  if (!valid.length) return;
  const [dx, dz] = choice(valid);
  const wp = gridToWorld(start.x, start.z);
  const mesh = makeTrain();
  mesh.position.set(wp.x, 0.06, wp.z);
  mesh.rotation.y = dirToYaw(dx, dz);
  scene.add(mesh);
  const nextWP = gridToWorld(start.x + dx, start.z + dz);
  state.vehicles.push({
    mesh, gx: start.x, gz: start.z, dx, dz,
    tx: nextWP.x, tz: nextWP.z,
    ngx: start.x + dx, ngz: start.z + dz,
    speed: rand(4.0, 6.0), life: rand(30, 60),
    targetYaw: dirToYaw(dx, dz),
    isTrain: true
  });
}

function pickNextDirectionTrain(v){
  const forward = [v.dx, v.dz];
  const right   = [-v.dz, v.dx];
  const left    = [v.dz, -v.dx];
  const opts = [];
  for (const [dx,dz] of [forward, right, left]){
    const nx = v.ngx+dx, nz = v.ngz+dz;
    if (inBounds(nx,nz) && state.grid[nx][nz].type === 'railway'){
      const w = (dx===v.dx && dz===v.dz) ? 5 : 1;
      for (let i=0;i<w;i++) opts.push([dx,dz]);
    }
  }
  return opts.length ? choice(opts) : null;
}

function makeCar(){
  if (CAR_TEMPLATES.length > 0){
    const tpl = choice(CAR_TEMPLATES);
    return tpl.clone(true);
  }
  // ---- Procedural fallback ----
  const g = new THREE.Group();
  const bodyColor2 = choice([0xff3333,0x3399ff,0xffcc00,0xffffff,0x33cc66,0xff6600,0xcc33ff,0x00ccff,0xff9900,0x66dd00]);
  const bodyMat = new THREE.MeshLambertMaterial({ color: bodyColor2 });
  const darkMat  = mat(0x222233);
  const glassMt  = glassMat(0xaaddff, 0.55);
  const chromeMat = mat(0xddddee);

  // --- Sedan body using extruded side profile ---
  const profile = new THREE.Shape();
  profile.moveTo(-0.44, 0.04);           // rear bottom
  profile.lineTo( 0.44, 0.04);           // front bottom
  profile.lineTo( 0.46, 0.16);           // front bumper curve
  profile.lineTo( 0.42, 0.21);           // hood start
  profile.lineTo( 0.28, 0.23);           // hood flat
  profile.lineTo( 0.20, 0.34);           // windshield base
  profile.lineTo( 0.10, 0.43);           // windshield top
  profile.lineTo(-0.10, 0.44);           // roof flat
  profile.lineTo(-0.22, 0.42);           // rear window top
  profile.lineTo(-0.38, 0.29);           // trunk line
  profile.lineTo(-0.46, 0.16);           // rear bumper
  profile.lineTo(-0.44, 0.04);
  const extGeo = new THREE.ExtrudeGeometry(profile, { depth:0.32, bevelEnabled:true, bevelThickness:0.018, bevelSize:0.018, bevelSegments:3 });
  extGeo.translate(0, 0, -0.16);
  const body = new THREE.Mesh(extGeo, bodyMat);
  body.castShadow = true;
  g.add(body);

  // underbody
  addBox(g, 0.88, 0.04, 0.3, 0, 0.06, 0, darkMat);

  // bumper bars
  addBox(g, 0.35, 0.07, 0.35, 0.42, 0.12, 0, chromeMat);
  addBox(g, 0.35, 0.07, 0.35, -0.42, 0.12, 0, chromeMat);

  // front windshield glass
  const wsFront = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.18), glassMt);
  wsFront.position.set(0.15, 0.385, 0);
  wsFront.rotation.set(0, Math.PI/2, -0.7);
  g.add(wsFront);
  // rear windshield glass
  const wsRear = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.15), glassMt);
  wsRear.position.set(-0.3, 0.36, 0);
  wsRear.rotation.set(0, Math.PI/2, 0.65);
  g.add(wsRear);
  // side windows (2 per side)
  for (const zs of [0.155, -0.155]){
    const sw1 = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.1), glassMt);
    sw1.position.set(0.06, 0.39, zs); sw1.rotation.y = zs > 0 ? -Math.PI/2 : Math.PI/2;
    g.add(sw1);
    const sw2 = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.1), glassMt);
    sw2.position.set(-0.16, 0.38, zs); sw2.rotation.y = zs > 0 ? -Math.PI/2 : Math.PI/2;
    g.add(sw2);
  }

  // wheels with hubcap
  const wheelMat = mat(0x111122);
  const hubcapMat = mat(0xddddee);
  const spokeMat  = mat(0x999aaa);
  function wheel(x, z){
    const wg = new THREE.Group();
    // tyre
    addCyl(wg, 0.095, 0.095, 0.075, 16, wheelMat, 0, 0, 0, 0, 0, Math.PI/2);
    // wheel disc
    addCyl(wg, 0.072, 0.072, 0.076, 16, hubcapMat, 0, 0, 0, 0, 0, Math.PI/2);
    // 5 spokes
    for (let i=0;i<5;i++){
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.077, 0.014, 0.08), spokeMat);
      spoke.rotation.z = i*Math.PI/5*2;
      spoke.position.x = Math.cos(i*Math.PI/5*2)*0.032;
      spoke.position.y = Math.sin(i*Math.PI/5*2)*0.032;
      spoke.position.z = 0.038;
      wg.add(spoke);
    }
    // hub cap center
    addCyl(wg, 0.022, 0.022, 0.082, 8, emissiveMat(bodyColor2, 0.15), 0, 0, 0, 0, 0, Math.PI/2);
    wg.position.set(x, 0.1, z);
    wg.castShadow = true;
    g.add(wg);
  }
  wheel( 0.28,  0.165); wheel( 0.28, -0.165);
  wheel(-0.27,  0.165); wheel(-0.27, -0.165);

  // headlights
  addSphere(g, 0.035, 6, emissiveMat(0xfef9c3, 1.0), 0.44, 0.22,  0.1);
  addSphere(g, 0.035, 6, emissiveMat(0xfef9c3, 1.0), 0.44, 0.22, -0.1);
  // tail lights
  addBox(g, 0.025, 0.04, 0.08, -0.45, 0.22,  0.1, emissiveMat(0xef4444, 0.8));
  addBox(g, 0.025, 0.04, 0.08, -0.45, 0.22, -0.1, emissiveMat(0xef4444, 0.8));
  // side mirrors
  addBox(g, 0.025, 0.035, 0.04, 0.22, 0.32,  0.175, darkMat);
  addBox(g, 0.025, 0.035, 0.04, 0.22, 0.32, -0.175, darkMat);
  // door handles
  addBox(g, 0.035, 0.025, 0.025, 0.04, 0.26,  0.162, chromeMat);
  addBox(g, 0.035, 0.025, 0.025, 0.04, 0.26, -0.162, chromeMat);
  addBox(g, 0.035, 0.025, 0.025, -0.18, 0.26,  0.162, chromeMat);
  addBox(g, 0.035, 0.025, 0.025, -0.18, 0.26, -0.162, chromeMat);
  applyOutlines(g, 0.06);
  return g;
}

// -------------------- PEDESTRIAN (detailed procedural) --------------------
// Realistic procedural humans with varied ethnicities, body types, clothing, hair, accessories,
// and activities (walking, jogging, on phone, with backpack, umbrella, child, elderly).
// Built using capsules/cylinders/spheres rather than boxes for smoother bodies.

// Ethnicity skin tones (Fitzpatrick-inspired range)
const SKIN_TONES = [
  0xfde7d3, // very fair
  0xf6d2b4, // fair
  0xe5b18a, // light
  0xd4a373, // medium
  0xc68e63, // tan
  0xa56a3e, // brown
  0x8a4f2a, // dark brown
  0x5c3a1e, // very dark
];
// Hair colors per ethnicity range
const HAIR_COLORS = [
  0x1a0e08, 0x2b1810, 0x3d2418, 0x5a3825, 0x8a5a2e,
  0xb8865a, 0xd4a574, 0xe8c87a, 0xf0d878, 0x4a2818,
  0x666666, 0x999999, 0xcccccc, 0xeeeeee,            // greys / whites for elderly
  0xa01e1e, 0xc04020,                                 // red / auburn
];
const SHIRT_COLORS = [
  0xe63946,0x3a86ff,0x06d6a0,0xffb703,0x8338ec,0xfb5607,
  0x00afb9,0xef476f,0x118ab2,0xf3722c,0x9b5de5,0xf15bb5,
  0x4cc9f0,0xff006e,0x83b692,0xff9b54,0x7fb069,0xb56576,
];
const PANT_COLORS = [0x2c3e50,0x34495e,0x1a252f,0x6c757d,0x4a5859,0x5e3023,0x3d3635,0x1b3b1f];
const SHOE_COLORS = [0x1a1a1a,0x2c1810,0x5a3825,0x4a4a4a,0xffffff,0x8b0000];

// Activity types — wider variety
const ACTIVITIES = [
  'walk','walk','walk','walk','walk',
  'jog',
  'phone',
  'backpack',
  'umbrella',
  'briefcase',
  'shopping',
  'shoulder_bag',
  'child',
  'elderly',
  'dog_walker',
  'cyclist',
  'tourist',         // camera + cap
  'coffee',          // holding coffee cup
  'ice_cream',       // holding ice cream
  'headphones',      // wearing headphones
  'jog_headphones',  // jogging with headphones
  'photographer',    // raising camera to eye
  'skater',          // on a skateboard
  'businessman',     // briefcase + suit colors
  'tourist',         // duplicated -> more common
];

// Pre-built shared geometries (cache for performance)
// Proportions tuned to ~7.5 heads tall (realistic adult anatomy).
// Final group scaled down at end of makePedestrian() to fit world (~0.55m tall adult).
const _PED_GEO = {
  head:      new THREE.SphereGeometry(0.075, 14, 12),
  jaw:       new THREE.SphereGeometry(0.07, 12, 8, 0, Math.PI*2, Math.PI/2.2, Math.PI/2),
  torsoUp:   new THREE.CylinderGeometry(0.08, 0.095, 0.20, 12),   // chest (wider top)
  torsoDown: new THREE.CylinderGeometry(0.095, 0.075, 0.14, 12),  // abdomen (taper to waist)
  hips:      new THREE.CylinderGeometry(0.075, 0.085, 0.08, 12),
  neck:      new THREE.CylinderGeometry(0.028, 0.032, 0.05, 8),
  shoulder:  new THREE.SphereGeometry(0.045, 8, 6),
  upperArm:  new THREE.CylinderGeometry(0.032, 0.028, 0.20, 8),
  forearm:   new THREE.CylinderGeometry(0.028, 0.022, 0.19, 8),
  hand:      new THREE.SphereGeometry(0.032, 8, 6),
  thigh:     new THREE.CylinderGeometry(0.05, 0.04, 0.28, 10),
  shin:      new THREE.CylinderGeometry(0.038, 0.028, 0.26, 8),
  knee:      new THREE.SphereGeometry(0.042, 8, 6),
  foot:      new THREE.BoxGeometry(0.07, 0.035, 0.13),
  hair1:     new THREE.SphereGeometry(0.082, 14, 10),
  hair2:     new THREE.SphereGeometry(0.085, 14, 10, 0, Math.PI*2, 0, Math.PI/2.3),
  bun:       new THREE.SphereGeometry(0.055, 10, 8),
  cap:       new THREE.CylinderGeometry(0.085, 0.085, 0.035, 12),
  capBrim:   new THREE.BoxGeometry(0.14, 0.012, 0.07),
  fedora:    new THREE.CylinderGeometry(0.078, 0.082, 0.08, 12),
  fedoraBrim:new THREE.CylinderGeometry(0.13, 0.13, 0.012, 16),
  hijab:     new THREE.SphereGeometry(0.105, 14, 12, 0, Math.PI*2, 0, Math.PI/1.5),
  glasses:   new THREE.TorusGeometry(0.018, 0.004, 6, 12),
  briefcase: new THREE.BoxGeometry(0.07, 0.09, 0.035),
  bag:       new THREE.BoxGeometry(0.075, 0.095, 0.045),
  backpack:  new THREE.BoxGeometry(0.115, 0.16, 0.06),
  shoulderBag: new THREE.BoxGeometry(0.10, 0.08, 0.04),
  phone:     new THREE.BoxGeometry(0.022, 0.042, 0.006),
  camera:    new THREE.BoxGeometry(0.06, 0.04, 0.035),
  cameraLens:new THREE.CylinderGeometry(0.015, 0.018, 0.025, 10),
  coffeeCup: new THREE.CylinderGeometry(0.018, 0.014, 0.05, 10),
  coffeeLid: new THREE.CylinderGeometry(0.02, 0.02, 0.008, 10),
  iceCream:  new THREE.ConeGeometry(0.018, 0.045, 8),
  iceCreamScoop: new THREE.SphereGeometry(0.02, 8, 6),
  headphones:new THREE.TorusGeometry(0.08, 0.012, 6, 16, Math.PI),
  headphonePad: new THREE.SphereGeometry(0.022, 8, 6),
  umbrellaShaft: new THREE.CylinderGeometry(0.004, 0.004, 0.40, 6),
  umbrellaCanopy: new THREE.ConeGeometry(0.15, 0.075, 14, 1, true),
  cane:      new THREE.CylinderGeometry(0.007, 0.007, 0.38, 6),
  // Dog (for dog walker)
  dogBody:   new THREE.CylinderGeometry(0.04, 0.04, 0.12, 8),
  dogHead:   new THREE.SphereGeometry(0.04, 8, 6),
  dogLeg:    new THREE.CylinderGeometry(0.012, 0.012, 0.07, 6),
  dogTail:   new THREE.CylinderGeometry(0.008, 0.005, 0.05, 6),
  dogEar:    new THREE.ConeGeometry(0.018, 0.03, 6),
  // Bicycle
  bikeWheel: new THREE.TorusGeometry(0.095, 0.012, 8, 16),
  bikeFrame: new THREE.CylinderGeometry(0.008, 0.008, 0.22, 6),
  // Skateboard
  skateDeck: new THREE.BoxGeometry(0.06, 0.012, 0.22),
  skateWheel:new THREE.CylinderGeometry(0.015, 0.015, 0.012, 8),
};

function pickHairStyle(){
  return choice(['short','short','short','medium','medium','long','long','bun','bald','cap','fedora','hijab']);
}

function buildHair(g, style, hairColor, headY, skinMat){
  const hairMat = mat(hairColor);
  if (style === 'bald') return;
  if (style === 'hijab') {
    const hijabMat = mat(choice([0x8b4789,0x5e60ce,0xff006e,0x3a86ff,0xffba08,0x06d6a0,0x222222,0xf2f2f2]));
    const h = new THREE.Mesh(_PED_GEO.hijab, hijabMat);
    h.position.y = headY - 0.005;
    g.add(h);
    const drape = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.085, 0.12, 10), hijabMat);
    drape.position.y = headY - 0.10;
    g.add(drape);
    return;
  }
  if (style === 'cap') {
    const cap = new THREE.Mesh(_PED_GEO.cap, hairMat);
    cap.position.y = headY + 0.035;
    g.add(cap);
    const brim = new THREE.Mesh(_PED_GEO.capBrim, hairMat);
    brim.position.set(0, headY + 0.04, 0.07);
    g.add(brim);
    return;
  }
  if (style === 'fedora') {
    const hatMat = mat(choice([0x2c1810,0x1a1a1a,0x3d2418,0x5a3825]));
    const crown = new THREE.Mesh(_PED_GEO.fedora, hatMat);
    crown.position.y = headY + 0.06;
    g.add(crown);
    const brim = new THREE.Mesh(_PED_GEO.fedoraBrim, hatMat);
    brim.position.y = headY + 0.025;
    g.add(brim);
    return;
  }
  if (style === 'short') {
    const top = new THREE.Mesh(_PED_GEO.hair2, hairMat);
    top.position.y = headY + 0.005;
    g.add(top);
    return;
  }
  if (style === 'medium') {
    const top = new THREE.Mesh(_PED_GEO.hair1, hairMat);
    top.position.y = headY - 0.01;
    top.scale.set(1.05, 0.95, 1.1);
    g.add(top);
    return;
  }
  if (style === 'long') {
    const top = new THREE.Mesh(_PED_GEO.hair1, hairMat);
    top.position.y = headY - 0.01;
    top.scale.set(1.05, 1, 1.15);
    g.add(top);
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.022, 0.20, 8), hairMat);
    tail.position.set(0, headY - 0.13, -0.07);
    g.add(tail);
    return;
  }
  if (style === 'bun') {
    const top = new THREE.Mesh(_PED_GEO.hair2, hairMat);
    top.position.y = headY + 0.005;
    g.add(top);
    const bun = new THREE.Mesh(_PED_GEO.bun, hairMat);
    bun.position.set(0, headY + 0.07, -0.04);
    g.add(bun);
    return;
  }
}

function maybeAddFacialHair(g, headY, hairColor){
  if (Math.random() < 0.25){
    const beardMat = mat(hairColor);
    const beard = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8, 0, Math.PI*2, Math.PI/2.5, Math.PI/2.5), beardMat);
    beard.position.set(0, headY - 0.05, 0.04);
    beard.scale.set(1, 0.85, 0.9);
    g.add(beard);
  }
  if (Math.random() < 0.18){
    // glasses
    const glassMatBlk = mat(0x111111);
    const lensL = new THREE.Mesh(_PED_GEO.glasses, glassMatBlk);
    lensL.position.set(-0.03, headY + 0.005, 0.08);
    lensL.rotation.y = 0;
    g.add(lensL);
    const lensR = new THREE.Mesh(_PED_GEO.glasses, glassMatBlk);
    lensR.position.set(0.03, headY + 0.005, 0.08);
    g.add(lensR);
    // bridge
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.003, 0.003), glassMatBlk);
    bridge.position.set(0, headY + 0.007, 0.085);
    g.add(bridge);
  }
}

function addAccessoryForActivity(parts, activity){
  const { g, rightHand, leftHand, torso, headG } = parts;

  if (activity === 'phone' || activity === 'businessman' && Math.random() < 0.4){
    const phone = new THREE.Mesh(_PED_GEO.phone, mat(0x000000));
    phone.position.set(0.012, -0.018, 0.004);
    rightHand.add(phone);
    parts._holdingRight = true;
  }
  if (activity === 'briefcase' || activity === 'businessman'){
    const bc = new THREE.Mesh(_PED_GEO.briefcase, mat(choice([0x3d2418,0x1a1a1a,0x5a3825])));
    bc.position.set(0.012, -0.05, 0);
    rightHand.add(bc);
    // handle
    const h = new THREE.Mesh(new THREE.TorusGeometry(0.02, 0.004, 6, 10, Math.PI), mat(0x1a1a1a));
    h.position.set(0.012, -0.005, 0);
    h.rotation.set(Math.PI/2, 0, 0);
    rightHand.add(h);
    parts._holdingRight = true;
  }
  if (activity === 'shopping'){
    const bagColor = choice([0xff006e,0x06d6a0,0xffb703,0x3a86ff,0xef476f,0xffffff]);
    const bag = new THREE.Mesh(_PED_GEO.bag, mat(bagColor));
    bag.position.set(0.018, -0.06, 0);
    rightHand.add(bag);
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.004, 6, 12, Math.PI), mat(bagColor));
    handle.position.set(0.018, -0.012, 0);
    handle.rotation.x = Math.PI/2;
    rightHand.add(handle);
    parts._holdingRight = true;
    // Sometimes carry a second bag in left hand
    if (Math.random() < 0.5){
      const bag2 = bag.clone(); leftHand.add(bag2);
      const h2 = handle.clone(); leftHand.add(h2);
      parts._holdingLeft = true;
    }
  }
  if (activity === 'shoulder_bag'){
    const sbColor = choice([0x8b4789,0x3a86ff,0xef476f,0x2c1810,0x06d6a0]);
    const sb = new THREE.Mesh(_PED_GEO.shoulderBag, mat(sbColor));
    sb.position.set(0.12, -0.02, 0.02);
    torso.add(sb);
    const strap = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.22, 0.012), mat(sbColor));
    strap.position.set(0.06, 0.08, 0.02);
    strap.rotation.z = -0.3;
    torso.add(strap);
  }
  if (activity === 'umbrella'){
    const um = new THREE.Group();
    const shaft = new THREE.Mesh(_PED_GEO.umbrellaShaft, mat(0x2c1810));
    shaft.position.y = 0.14;
    um.add(shaft);
    const canopy = new THREE.Mesh(_PED_GEO.umbrellaCanopy, mat(choice([0xef476f,0x3a86ff,0x06d6a0,0xffb703,0x000000,0xff006e,0xffffff]), {side:2}));
    canopy.position.y = 0.36;
    um.add(canopy);
    rightHand.add(um);
    parts._holdingRight = true;
  }
  if (activity === 'backpack' || activity === 'tourist'){
    const bp = new THREE.Mesh(_PED_GEO.backpack, mat(choice([0x1d3557,0x6a040f,0x2d6a4f,0x3d348b,0x000000,0xef476f])));
    bp.position.set(0, 0, -0.075);
    torso.add(bp);
    const sL = new THREE.Mesh(new THREE.BoxGeometry(0.013, 0.18, 0.018), mat(0x1a1a1a));
    sL.position.set(-0.055, 0.05, -0.035);
    torso.add(sL);
    const sR = sL.clone(); sR.position.x = 0.055;
    torso.add(sR);
  }
  if (activity === 'tourist' || activity === 'photographer'){
    const camBody = new THREE.Mesh(_PED_GEO.camera, mat(0x111111));
    const lens = new THREE.Mesh(_PED_GEO.cameraLens, mat(0x222222));
    if (activity === 'photographer'){
      // raised to eye
      const cg = new THREE.Group();
      cg.add(camBody);
      lens.rotation.x = Math.PI/2;
      lens.position.z = 0.03;
      cg.add(lens);
      cg.position.set(0, -0.02, 0.01);
      rightHand.add(cg);
      parts._holdingRight = true;
    } else {
      // hanging around neck
      camBody.position.set(0, -0.13, 0.10);
      torso.add(camBody);
      lens.rotation.x = Math.PI/2;
      lens.position.set(0, -0.13, 0.13);
      torso.add(lens);
      const strap1 = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.12, 0.004), mat(0x1a1a1a));
      strap1.position.set(-0.04, -0.05, 0.08); strap1.rotation.z = -0.3;
      torso.add(strap1);
      const strap2 = strap1.clone(); strap2.position.x = 0.04; strap2.rotation.z = 0.3;
      torso.add(strap2);
    }
  }
  if (activity === 'coffee'){
    const cup = new THREE.Mesh(_PED_GEO.coffeeCup, mat(0xffffff));
    cup.position.set(0.012, -0.02, 0);
    rightHand.add(cup);
    const lid = new THREE.Mesh(_PED_GEO.coffeeLid, mat(0x8b4513));
    lid.position.set(0.012, 0.005, 0);
    rightHand.add(lid);
    parts._holdingRight = true;
  }
  if (activity === 'ice_cream'){
    const cone = new THREE.Mesh(_PED_GEO.iceCream, mat(0xd2a679));
    cone.position.set(0.012, -0.005, 0);
    rightHand.add(cone);
    const scoop = new THREE.Mesh(_PED_GEO.iceCreamScoop, mat(choice([0xff69b4,0xfff5b8,0x6b3410,0x90ee90])));
    scoop.position.set(0.012, 0.022, 0);
    rightHand.add(scoop);
    parts._holdingRight = true;
  }
  if (activity === 'headphones' || activity === 'jog_headphones'){
    const hp = new THREE.Mesh(_PED_GEO.headphones, mat(choice([0x111111,0xef476f,0x3a86ff,0xffffff])));
    hp.rotation.x = Math.PI/2;
    hp.position.y = 0.06;
    headG.add(hp);
    const padL = new THREE.Mesh(_PED_GEO.headphonePad, mat(0x111111));
    padL.position.set(-0.078, 0, 0);
    headG.add(padL);
    const padR = padL.clone(); padR.position.x = 0.078;
    headG.add(padR);
  }
  if (activity === 'dog_walker'){
    // dog companion as separate Object placed by updater; tag mesh
    parts._needsDog = true;
    // leash held in right hand
    const leash = new THREE.Mesh(new THREE.CylinderGeometry(0.002, 0.002, 0.18, 4), mat(0xff006e));
    leash.position.set(0.012, -0.09, 0.04);
    leash.rotation.x = 0.4;
    rightHand.add(leash);
    parts._holdingRight = true;
  }
  if (activity === 'cyclist'){
    parts._needsBike = true;
  }
  if (activity === 'skater'){
    parts._needsSkate = true;
  }
  if (activity === 'elderly'){
    const cane = new THREE.Mesh(_PED_GEO.cane, mat(0x3d2418));
    cane.position.set(0.025, -0.18, 0);
    rightHand.add(cane);
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.012, 0.005, 6, 8, Math.PI), mat(0x3d2418));
    handle.position.set(0.025, 0.01, 0);
    handle.rotation.set(0, 0, Math.PI/2);
    rightHand.add(handle);
    parts._holdingRight = true;
  }
}

function buildDog(){
  const d = new THREE.Group();
  const fur = mat(choice([0xc8a472,0xe8d5a3,0x4a3520,0xf5f5f5,0x1a1a1a,0xb8865a]));
  const body = new THREE.Mesh(_PED_GEO.dogBody, fur);
  body.rotation.z = Math.PI/2;
  body.position.y = 0.07;
  d.add(body);
  const head = new THREE.Mesh(_PED_GEO.dogHead, fur);
  head.position.set(0.08, 0.09, 0);
  d.add(head);
  const earL = new THREE.Mesh(_PED_GEO.dogEar, fur);
  earL.position.set(0.08, 0.13, -0.025);
  earL.rotation.x = 0.4;
  d.add(earL);
  const earR = earL.clone(); earR.position.z = 0.025; earR.rotation.x = -0.4;
  d.add(earR);
  const tail = new THREE.Mesh(_PED_GEO.dogTail, fur);
  tail.position.set(-0.08, 0.10, 0);
  tail.rotation.z = -0.6;
  d.add(tail);
  for (const [x,z] of [[0.05,-0.03],[0.05,0.03],[-0.05,-0.03],[-0.05,0.03]]){
    const leg = new THREE.Mesh(_PED_GEO.dogLeg, fur);
    leg.position.set(x, 0.03, z);
    d.add(leg);
  }
  d.traverse(o=>{ if(o.isMesh) o.castShadow=true; });
  return d;
}

function buildBike(){
  const b = new THREE.Group();
  const frameMat = mat(choice([0xef476f,0x3a86ff,0x06d6a0,0xffb703,0x111111,0xffffff]));
  const wheelMat = mat(0x111111);
  const wf = new THREE.Mesh(_PED_GEO.bikeWheel, wheelMat);
  wf.rotation.y = Math.PI/2; wf.position.set(0.13, 0.095, 0);
  b.add(wf);
  const wr = wf.clone(); wr.position.x = -0.13;
  b.add(wr);
  // frame bars
  const bar1 = new THREE.Mesh(_PED_GEO.bikeFrame, frameMat);
  bar1.rotation.z = Math.PI/3; bar1.position.set(0.04, 0.13, 0);
  b.add(bar1);
  const bar2 = new THREE.Mesh(_PED_GEO.bikeFrame, frameMat);
  bar2.rotation.z = -Math.PI/3; bar2.position.set(-0.04, 0.13, 0);
  b.add(bar2);
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.015, 0.025), mat(0x111111));
  seat.position.set(-0.07, 0.18, 0);
  b.add(seat);
  const handlebar = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.10, 6), frameMat);
  handlebar.rotation.x = Math.PI/2;
  handlebar.position.set(0.10, 0.20, 0);
  b.add(handlebar);
  b.traverse(o=>{ if(o.isMesh) o.castShadow=true; });
  return b;
}

function buildSkateboard(){
  const s = new THREE.Group();
  const deck = new THREE.Mesh(_PED_GEO.skateDeck, mat(choice([0xef476f,0x3a86ff,0x06d6a0,0xffb703,0x111111])));
  deck.position.y = 0.03;
  s.add(deck);
  for (const [x,z] of [[-0.025,-0.085],[0.025,-0.085],[-0.025,0.085],[0.025,0.085]]){
    const w = new THREE.Mesh(_PED_GEO.skateWheel, mat(0xffffff));
    w.rotation.z = Math.PI/2;
    w.position.set(x, 0.015, z);
    s.add(w);
  }
  s.traverse(o=>{ if(o.isMesh) o.castShadow=true; });
  return s;
}

function makePedestrian(activityPool){
  const g = new THREE.Group();
  const pool = activityPool || ACTIVITIES;
  const activity = choice(pool);
  const isChild   = activity === 'child';
  const isElderly = activity === 'elderly';
  const isJog     = activity === 'jog' || activity === 'jog_headphones';

  // Body size variation — base proportions are realistic 7.5-head adult.
  // Final scale (applied at end) brings them down to ~0.55m world units.
  const heightMul = isChild ? rand(0.62, 0.72) : (isElderly ? rand(0.92, 0.98) : rand(0.96, 1.05));
  const widthMul  = isChild ? 0.80 : rand(0.90, 1.10);
  // Apply body proportions
  g.scale.set(widthMul, heightMul, widthMul);

  // Ethnicity / skin
  const skinIdx = randInt(0, SKIN_TONES.length - 1);
  const skinColor = SKIN_TONES[skinIdx];
  const skinMat = mat(skinColor);

  // Hair color
  let hairColor;
  if (isElderly && Math.random() < 0.75) {
    hairColor = choice([0x999999, 0xcccccc, 0xeeeeee, 0xbbbbbb, 0xffffff]);
  } else {
    const palette = HAIR_COLORS.slice(0, Math.max(6, skinIdx + 4));
    hairColor = choice(palette);
  }

  // Clothing — businessmen wear muted suit tones; joggers wear bright athletic
  let shirtPalette = SHIRT_COLORS;
  let pantPalette  = PANT_COLORS;
  if (activity === 'businessman') {
    shirtPalette = [0xffffff, 0xe8eef2, 0xd6e4f0, 0xc4d4e8];
    pantPalette  = [0x1a252f, 0x2c3e50, 0x111111, 0x3d3635];
  } else if (isJog) {
    shirtPalette = [0xff006e, 0x06d6a0, 0xfb5607, 0x3a86ff, 0xffb703, 0xef476f];
  }
  const shirtColor = mat(choice(shirtPalette));
  const pantColor  = mat(choice(pantPalette));
  const shoeColor  = mat(choice(SHOE_COLORS));

  // ---- Body assembly (origin at feet, Y up) ----
  // Anatomical landmarks (in local units; total ~1.0 before scale)
  const ankleY = 0.035;
  const kneeY  = 0.30;
  const hipY   = 0.56;
  const chestY = 0.78;
  const shoulderY = 0.86;
  const neckY  = 0.92;
  const headY  = 1.02;

  // Legs (group pivots at hip)
  function buildLeg(side){
    const leg = new THREE.Group();
    leg.position.set(side * 0.045, hipY, 0);
    const thigh = new THREE.Mesh(_PED_GEO.thigh, pantColor);
    thigh.position.y = -0.14;
    leg.add(thigh);
    const knee = new THREE.Mesh(_PED_GEO.knee, pantColor);
    knee.position.y = -0.27;
    leg.add(knee);
    const shin = new THREE.Mesh(_PED_GEO.shin, pantColor);
    shin.position.y = -0.40;
    leg.add(shin);
    const foot = new THREE.Mesh(_PED_GEO.foot, shoeColor);
    foot.position.set(0, -0.535, 0.025);
    leg.add(foot);
    return leg;
  }
  const leftLeg  = buildLeg(-1);
  const rightLeg = buildLeg(1);
  g.add(leftLeg); g.add(rightLeg);

  // Torso group
  const torso = new THREE.Group();
  torso.position.set(0, hipY, 0);
  const hips = new THREE.Mesh(_PED_GEO.hips, pantColor);
  hips.position.y = 0.04;
  torso.add(hips);
  const tDown = new THREE.Mesh(_PED_GEO.torsoDown, shirtColor);
  tDown.position.y = 0.15;
  torso.add(tDown);
  const tUp = new THREE.Mesh(_PED_GEO.torsoUp, shirtColor);
  tUp.position.y = 0.32;
  torso.add(tUp);
  // Shoulder caps
  const shL = new THREE.Mesh(_PED_GEO.shoulder, shirtColor);
  shL.position.set(-0.095, 0.40, 0); torso.add(shL);
  const shR = shL.clone(); shR.position.x = 0.095; torso.add(shR);
  g.add(torso);

  // Neck
  const neck = new THREE.Mesh(_PED_GEO.neck, skinMat);
  neck.position.y = neckY;
  g.add(neck);

  // Head (as group so we can attach headphones / hats)
  const headG = new THREE.Group();
  headG.position.y = headY;
  const head = new THREE.Mesh(_PED_GEO.head, skinMat);
  headG.add(head);
  const jaw = new THREE.Mesh(_PED_GEO.jaw, skinMat);
  jaw.position.y = -0.02;
  headG.add(jaw);
  // Ears
  const earL = new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 5), skinMat);
  earL.position.set(-0.072, 0.005, 0); earL.scale.set(0.6, 1, 1);
  headG.add(earL);
  const earR = earL.clone(); earR.position.x = 0.072;
  headG.add(earR);
  // Eyes
  const eyeMat = mat(0x111111);
  const eyeWhiteMat = mat(0xffffff);
  const eyeWL = new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 5), eyeWhiteMat);
  eyeWL.position.set(-0.025, 0.005, 0.066); eyeWL.scale.set(1, 0.7, 0.5);
  headG.add(eyeWL);
  const eyeWR = eyeWL.clone(); eyeWR.position.x = 0.025; headG.add(eyeWR);
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.006, 6, 5), eyeMat);
  eyeL.position.set(-0.025, 0.005, 0.072);
  headG.add(eyeL);
  const eyeR = eyeL.clone(); eyeR.position.x = 0.025;
  headG.add(eyeR);
  // Tiny mouth line (slightly darker than skin)
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.004, 0.003), mat(0x6b3a1d));
  mouth.position.set(0, -0.025, 0.07);
  headG.add(mouth);
  g.add(headG);

  // Hair / hijab / cap — built around local headY=0 since headG is at headY
  // We'll just append into headG at local coordinates (offset 0)
  buildHair(headG, pickHairStyle.call(null) || 'short', hairColor, 0, skinMat);
  // Actually need to pick once and use again for facial-hair gate
  // ----- Patch: pick hair style explicitly -----

  // Facial hair / glasses
  // (we apply on headG with local headY=0)
  // simple inline reuse:
  if (Math.random() < 0.20 && !isChild){
    const beardMat = mat(hairColor);
    const beard = new THREE.Mesh(new THREE.SphereGeometry(0.058, 10, 8, 0, Math.PI*2, Math.PI/2.4, Math.PI/2.4), beardMat);
    beard.position.set(0, -0.04, 0.03);
    beard.scale.set(1, 0.8, 0.9);
    headG.add(beard);
  }
  if (Math.random() < 0.20){
    const glassMatBlk = mat(0x111111);
    const lensL = new THREE.Mesh(_PED_GEO.glasses, glassMatBlk);
    lensL.position.set(-0.025, 0.005, 0.068);
    headG.add(lensL);
    const lensR = new THREE.Mesh(_PED_GEO.glasses, glassMatBlk);
    lensR.position.set(0.025, 0.005, 0.068);
    headG.add(lensR);
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.003, 0.003), glassMatBlk);
    bridge.position.set(0, 0.007, 0.072);
    headG.add(bridge);
  }

  // Arms (pivot at shoulder, point down)
  function buildArm(side){
    const arm = new THREE.Group();
    arm.position.set(side * 0.105, shoulderY, 0);
    const upper = new THREE.Mesh(_PED_GEO.upperArm, shirtColor);
    upper.position.y = -0.10;
    arm.add(upper);
    const fore = new THREE.Mesh(_PED_GEO.forearm, skinMat);
    fore.position.y = -0.30;
    arm.add(fore);
    const hand = new THREE.Mesh(_PED_GEO.hand, skinMat);
    hand.position.y = -0.40;
    arm.add(hand);
    arm.userData.hand = hand;
    return arm;
  }
  const leftArm  = buildArm(-1);
  const rightArm = buildArm(1);
  g.add(leftArm); g.add(rightArm);

  // Accessories
  const accessoryParts = {
    g, rightHand: rightArm.userData.hand, leftHand: leftArm.userData.hand,
    torso, headG,
    _holdingRight: false, _holdingLeft: false,
    _needsDog: false, _needsBike: false, _needsSkate: false
  };
  addAccessoryForActivity(accessoryParts, activity);

  // Activity pose adjustments
  if (activity === 'phone'){
    rightArm.rotation.x = -1.3;
    rightArm.rotation.z = -0.4;
  }
  if (activity === 'umbrella'){
    rightArm.rotation.x = -1.4;
  }
  if (activity === 'photographer'){
    rightArm.rotation.x = -1.5;
    leftArm.rotation.x  = -1.3;
    leftArm.rotation.z  =  0.3;
    accessoryParts._holdingLeft = true;
  }
  if (activity === 'coffee' || activity === 'ice_cream'){
    rightArm.rotation.x = -0.6;
  }
  if (activity === 'jog' || activity === 'jog_headphones'){
    g.rotation.x = 0.10;
  }
  if (isElderly){
    g.rotation.x = 0.10;
  }

  // Dog / bike / skate companions attach to outer wrapper so they translate with ped
  // We'll wrap the ped in another group and attach extras at world-relative offsets.
  const outer = new THREE.Group();
  outer.add(g);
  if (accessoryParts._needsDog){
    const dog = buildDog();
    dog.position.set(0.18, 0, 0.05);
    outer.add(dog);
    outer.userData.dog = dog;
  }
  if (accessoryParts._needsBike){
    const bike = buildBike();
    bike.position.set(0, 0, 0);
    outer.add(bike);
    // ped sits on bike — raise feet so they "stand" on pedals
    g.position.y = 0.08;
    // bend legs slightly
    leftLeg.rotation.x =  0.3;
    rightLeg.rotation.x = -0.3;
    // hands on handlebar
    leftArm.rotation.x  = -1.2; leftArm.rotation.z  =  0.4;
    rightArm.rotation.x = -1.2; rightArm.rotation.z = -0.4;
    accessoryParts._holdingLeft = true;
    accessoryParts._holdingRight = true;
    outer.userData.bike = bike;
  }
  if (accessoryParts._needsSkate){
    const skate = buildSkateboard();
    outer.add(skate);
    outer.userData.skate = skate;
  }

  // Speed
  let speedMul = 1.0;
  if (activity === 'jog' || activity === 'jog_headphones') speedMul = 1.9;
  else if (activity === 'cyclist') speedMul = 2.6;
  else if (activity === 'skater')  speedMul = 2.2;
  else if (activity === 'elderly') speedMul = 0.5;
  else if (activity === 'child')   speedMul = rand(0.7, 1.4);
  else if (activity === 'phone')   speedMul = 0.7;
  else if (activity === 'tourist') speedMul = 0.7;
  else if (activity === 'photographer') speedMul = 0.4;
  else if (activity === 'dog_walker')   speedMul = 0.75;
  else if (activity === 'ice_cream')    speedMul = 0.65;
  else if (activity === 'coffee')       speedMul = 0.85;

  // Stash refs on OUTER for animator
  outer.userData.inner = g;
  outer.userData.activity = activity;
  outer.userData.speedMul = speedMul;
  outer.userData.leftLeg  = leftLeg;
  outer.userData.rightLeg = rightLeg;
  outer.userData.leftArm  = leftArm;
  outer.userData.rightArm = rightArm;
  outer.userData.headG    = headG;
  outer.userData.armSwingLockedL = accessoryParts._holdingLeft;
  outer.userData.armSwingLockedR = accessoryParts._holdingRight
    || activity === 'phone' || activity === 'umbrella' || activity === 'briefcase'
    || activity === 'shopping' || activity === 'elderly' || activity === 'coffee'
    || activity === 'ice_cream' || activity === 'photographer' || activity === 'dog_walker'
    || activity === 'businessman';
  outer.userData.legAnim  = !(activity === 'cyclist'); // cyclist legs handled separately
  outer.userData.cyclist  = activity === 'cyclist';

  g.traverse(o => { if (o.isMesh){ o.castShadow = true; o.receiveShadow = true; }});

  // FINAL SCALE — bring whole outer down so adult ~0.55m world units (was ~1.0).
  outer.scale.setScalar(0.55);
  return outer;
}

// Zone-based activity pools
const ZONE_ACTIVITIES = {
  res:     ['walk','walk','walk','child','elderly','dog_walker','backpack','phone','headphones','jog','jog_headphones','ice_cream'],
  com:     ['walk','shopping','shopping','shoulder_bag','tourist','photographer','phone','phone','coffee','umbrella','briefcase','businessman'],
  ind:     ['walk','walk','backpack','phone','coffee','briefcase'],
  office:  ['businessman','businessman','briefcase','phone','backpack','coffee','walk','shoulder_bag'],
  public:  ['walk','jog','dog_walker','child','elderly','ice_cream','tourist','headphones'],
  transit: ['backpack','phone','shoulder_bag','briefcase','walk','coffee'],
  default: ['walk','walk','walk','jog','phone','backpack','umbrella','shopping','briefcase','child','elderly','dog_walker','tourist','coffee','ice_cream','headphones'],
};

function zoneForType(type){
  const def = BUILDINGS[type];
  if (!def) return 'default';
  if (def.cat === 'res') return 'res';
  if (def.cat === 'com') return 'office';
  if (def.cat === 'ind') return 'ind';
  if (def.cat === 'public') return 'public';
  if (def.cat === 'transit') return 'transit';
  return 'default';
}

function spawnPedestrian(){
  // Exclude roads, water tiles, and railway from spawn points
  const allBuildings = state.buildings.filter(b => 
    b.type !== 'road' && 
    b.type !== 'water_tile' && 
    b.type !== 'railway'
  );
  if (allBuildings.length < 1) return;
  const anchor = choice(allBuildings);
  const wp = gridToWorld(anchor.x, anchor.z);
  const side = choice([[-1,0],[1,0],[0,-1],[0,1]]);
  const px = wp.x + side[0] * (TILE*0.5 + rand(0.1, 0.35)) + rand(-0.25,0.25);
  const pz = wp.z + side[1] * (TILE*0.5 + rand(0.1, 0.35)) + rand(-0.25,0.25);
  // Pick activity pool based on anchor zone
  const zone = zoneForType(anchor.type);
  const pool = ZONE_ACTIVITIES[zone] || ZONE_ACTIVITIES.default;
  const mesh = makePedestrian(pool);
  mesh.position.set(px, 0, pz);
  mesh.rotation.y = rand(0, Math.PI*2);
  scene.add(mesh);
  const baseSpeed = rand(0.5, 0.85) * (mesh.userData.speedMul || 1);
  state.pedestrians.push({
    mesh,
    speed: baseSpeed,
    life:  rand(20, 45),
    dir:   rand(0, Math.PI*2),
    changeDirTimer: rand(2, 5),
    bobTimer: rand(0, Math.PI*2),
    activity: mesh.userData.activity
  });
}

function updatePedestrians(dt){
  for (let i = state.pedestrians.length-1; i >= 0; i--){
    const p = state.pedestrians[i];
    p.life -= dt;
    p.changeDirTimer -= dt;
    const ud = p.mesh.userData;
    const animRate = 8 * (ud.speedMul || 1);
    p.bobTimer += dt * animRate;

    if (p.changeDirTimer <= 0){
      p.dir += rand(-1.0, 1.0);
      p.changeDirTimer = rand(2, 5);
    }
    p.mesh.position.x += Math.cos(p.dir) * p.speed * dt;
    p.mesh.position.z += Math.sin(p.dir) * p.speed * dt;

    // Block pedestrians from walking into water tiles
    const pedGX = Math.floor((p.mesh.position.x + HALF) / TILE);
    const pedGZ = Math.floor((p.mesh.position.z + HALF) / TILE);
    if (inBounds(pedGX, pedGZ)){
      const pedTile = state.grid[pedGX][pedGZ].type;
      if (pedTile === 'water_tile'){
        p.mesh.position.x -= Math.cos(p.dir) * p.speed * dt;
        p.mesh.position.z -= Math.sin(p.dir) * p.speed * dt;
        p.dir += Math.PI + rand(-0.5, 0.5);
        p.changeDirTimer = rand(1, 3);
      }
    }

    p.mesh.rotation.y = -p.dir + Math.PI/2;

    const swing = Math.sin(p.bobTimer);
    const legSwing = swing * (ud.cyclist ? 0 : 0.55);
    const armSwing = swing * 0.45;
    if (ud.legAnim && ud.leftLeg)  ud.leftLeg.rotation.x  =  legSwing;
    if (ud.legAnim && ud.rightLeg) ud.rightLeg.rotation.x = -legSwing;
    // Cyclist legs pedal in circles
    if (ud.cyclist){
      if (ud.leftLeg)  ud.leftLeg.rotation.x  =  Math.sin(p.bobTimer*1.5) * 0.6 + 0.3;
      if (ud.rightLeg) ud.rightLeg.rotation.x = -Math.sin(p.bobTimer*1.5) * 0.6 + 0.3;
    }
    if (ud.leftArm  && !ud.armSwingLockedL) ud.leftArm.rotation.x  = -armSwing;
    if (ud.rightArm && !ud.armSwingLockedR) ud.rightArm.rotation.x =  armSwing;
    // Head bobs slightly
    if (ud.headG) ud.headG.rotation.z = Math.sin(p.bobTimer*0.5) * 0.03;
    // Vertical bob (not for cyclist/skater)
    if (!ud.cyclist && ud.activity !== 'skater'){
      if (ud.inner) ud.inner.position.y = Math.abs(Math.sin(p.bobTimer*0.5)) * 0.012;
    }
    // Dog trots behind, tail wagging
    if (ud.dog){
      ud.dog.rotation.y = Math.sin(p.bobTimer*0.5) * 0.1;
      const tail = ud.dog.children.find(c => c.geometry === _PED_GEO.dogTail);
      if (tail) tail.rotation.y = Math.sin(p.bobTimer*2) * 0.4;
    }

    p.mesh.position.x = clamp(p.mesh.position.x, -HALF+0.5, HALF-0.5);
    p.mesh.position.z = clamp(p.mesh.position.z, -HALF+0.5, HALF-0.5);

    if (p.life <= 0){
      scene.remove(p.mesh);
      p.mesh.traverse(o=>{ if(o.isMesh && o.geometry && !Object.values(_PED_GEO).includes(o.geometry)) o.geometry.dispose(); });
      state.pedestrians.splice(i, 1);
    }
  }
}

// Direction helpers — car body front is along local +X axis
function dirToYaw(dx, dz){ return Math.atan2(-dz, dx); }
const LANE_OFFSET = 0.3;
function laneOffset(dx, dz){ return { ox: dz * LANE_OFFSET, oz: -dx * LANE_OFFSET }; }

function spawnVehicle(){
  const roads = state.buildings.filter(b=>b.type==='road');
  if (roads.length < 2) return;
  const start = choice(roads);
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  const valid = dirs.filter(([dx,dz])=>{
    const nx=start.x+dx, nz=start.z+dz;
    return inBounds(nx,nz) && state.grid[nx][nz].type==='road';
  });
  if (!valid.length) return;
  const [dx, dz] = choice(valid);
  const wp = gridToWorld(start.x, start.z);
  const off = laneOffset(dx, dz);
  const mesh = makeCar();
  mesh.position.set(wp.x + off.ox, 0, wp.z + off.oz);
  mesh.rotation.y = dirToYaw(dx, dz);
  scene.add(mesh);
  const nextWP = gridToWorld(start.x + dx, start.z + dz);
  const targetOff = laneOffset(dx, dz);
  state.vehicles.push({
    mesh, gx: start.x, gz: start.z, dx, dz,
    tx: nextWP.x + targetOff.ox, tz: nextWP.z + targetOff.oz,
    ngx: start.x + dx, ngz: start.z + dz,
    speed: rand(2.5, 4.0), life: rand(20, 40),
    targetYaw: dirToYaw(dx, dz)
  });
}

function pickNextDirection(v){
  const forward = [v.dx, v.dz];
  const right   = [-v.dz, v.dx];
  const left    = [v.dz, -v.dx];
  const opts = [];
  for (const [dx,dz] of [forward, right, left]){
    const nx = v.ngx+dx, nz = v.ngz+dz;
    if (inBounds(nx,nz) && state.grid[nx][nz].type==='road'){
      const w = (dx===v.dx&&dz===v.dz) ? 4 : 1;
      for (let i=0;i<w;i++) opts.push([dx,dz]);
    }
  }
  return opts.length ? choice(opts) : null;
}

function updateVehicles(dt){
  for (let i=state.vehicles.length-1; i>=0; i--){
    const v = state.vehicles[i];
    v.life -= dt;
    const dxw = v.tx - v.mesh.position.x;
    const dzw = v.tz - v.mesh.position.z;
    const dist = Math.hypot(dxw, dzw);
    const step = v.speed * dt;
    if (dist <= step + 0.01){
      v.mesh.position.x = v.tx;
      v.mesh.position.z = v.tz;
      v.gx = v.ngx; v.gz = v.ngz;
      const next = v.isTrain ? pickNextDirectionTrain(v) : pickNextDirection(v);
      if (!next){ v.life = 0; }
      else {
        v.dx = next[0]; v.dz = next[1];
        v.ngx = v.gx + v.dx; v.ngz = v.gz + v.dz;
        const wp = gridToWorld(v.ngx, v.ngz);
        if (v.isTrain){
          v.tx = wp.x; v.tz = wp.z;
        } else {
          const off = laneOffset(v.dx, v.dz);
          v.tx = wp.x + off.ox; v.tz = wp.z + off.oz;
        }
        v.targetYaw = dirToYaw(v.dx, v.dz);
      }
    } else {
      v.mesh.position.x += (dxw/dist)*step;
      v.mesh.position.z += (dzw/dist)*step;
    }
    // smooth yaw
    let dy = v.targetYaw - v.mesh.rotation.y;
    while (dy >  Math.PI) dy -= Math.PI*2;
    while (dy < -Math.PI) dy += Math.PI*2;
    v.mesh.rotation.y += dy * Math.min(1, dt*10);
    if (v.life <= 0){
      scene.remove(v.mesh);
      v.mesh.traverse(o=>{ if (o.isMesh && o.geometry) o.geometry.dispose(); });
      state.vehicles.splice(i,1);
    }
  }
}
// -------------------- ECONOMY / TICK --------------------
function recalcStats(){
  let homes=0, jobs=0, power=0, powerGen=0, water=0, waterGen=0, pollution=0, happyBonus=0, tax=0;
  for (const b of state.buildings){
    const def = BUILDINGS[b.type];
    if (def.homes && nearRoad(b.x, b.z, def.size||1)) homes += def.homes;
    if (def.jobs) jobs += def.jobs;
    if (def.power) power += def.power;
    if (def.water) water += def.water;
    if (def.powerGen) powerGen += def.powerGen;
    if (def.waterGen) waterGen += def.waterGen;
    if (def.pollution) pollution += def.pollution;
    if (def.happy) happyBonus += def.happy;
    if (def.tax) tax += def.tax;
  }
  state.homes = homes;
  state.jobs.offered = jobs;
  state.power = { gen: powerGen, demand: power };
  state.water = { gen: waterGen, demand: water };
  state.pollution = pollution;
  state._happyBonus = happyBonus;
  state._taxBase = tax;
}

function gameTick(dt){
  if (state.paused || state.speed===0) return;
  const mult = state.speed;
  state.tickSinceLastDay += dt * mult;

  // every "day" (3 real seconds at 1x)
  if (state.tickSinceLastDay >= 3){
    state.tickSinceLastDay = 0;
    state.day++;

    // population growth toward homes capacity
    const powerOk = state.power.gen >= state.power.demand;
    const waterOk = state.water.gen >= state.water.demand;
    const capacity = state.homes;
    let target = capacity;
    if (!powerOk) target = Math.floor(target*0.5);
    if (!waterOk) target = Math.floor(target*0.5);

    if (state.population < target){
      const grow = Math.max(1, Math.floor((target - state.population)*0.15));
      for (let i=0;i<grow;i++){
        state.citizens.push(createCitizen());
      }
      state.population = state.citizens.length;
    } else if (state.population > target){
      const shrink = Math.max(1, Math.floor((state.population - target)*0.1));
      state.citizens.splice(0, shrink);
      state.population = state.citizens.length;
    }

    // happiness
    let happy = 60 + (state._happyBonus||0) - state.pollution*0.5 - state.traffic*0.3;
    if (!powerOk) happy -= 25;
    if (!waterOk) happy -= 20;
    state.happiness = clamp(Math.round(happy), 0, 100);
    if (state.citizens.length){
      for (const c of state.citizens){
        c.happy = clamp(state.happiness + randInt(-10,10), 0, 100);
      }
    }

    // economy
    const income = Math.round((state._taxBase||0) + state.population*0.6);
    const expense = Math.round(state.buildings.length*2 + state.power.demand*1 + state.water.demand*1);
    state.income = income;
    state.expense = expense;
    state.money += (income - expense);

    // level
    if (state.population >= 100000) state.level = 4;
    else if (state.population >= 10000) state.level = 3;
    else if (state.population >= 1000) state.level = 2;
    else state.level = 1;

    // random notifications
    if (state.day % 12 === 0 && Math.random()<0.6){
      const events = [];
      if (!powerOk) events.push(['Power Shortage','Citizens are complaining about blackouts.','danger']);
      if (!waterOk) events.push(['Water Crisis','Water demand exceeds supply.','danger']);
      if (state.pollution>30) events.push(['Air Pollution','Pollution is harming citizens health.','warn']);
      if (state.happiness>=85) events.push(['Citizens are thrilled!','Your city is a wonderful place.','success']);
      if (state.population>=1000 && state.level===2 && !state._notedLvl2){ events.push(['Town promoted!','Population passed 1,000. Town tier reached.','success']); state._notedLvl2=true; Audio.playLevelUp(); }
      if (state.population>=10000 && state.level===3 && !state._notedLvl3){ events.push(['City promoted!','Population passed 10,000.','success']); state._notedLvl3=true; Audio.playLevelUp(); }
      if (events.length) { const [t,m,k]=choice(events); notify(t,m,k); }
    }

    // disasters (rare)
    if (state.day > 30 && Math.random()<0.02){
      triggerDisaster();
    }
  }

  // vehicle spawn
  if (Math.random() < 0.04*mult && state.vehicles.length < 30){
    spawnVehicle();
  }
  // train spawn
  if (Math.random() < 0.015*mult && state.vehicles.filter(v=>v.isTrain).length < 3){
    spawnTrain();
  }
  updateVehicles(dt * mult);

  // pedestrian spawn (near buildings)
  const maxPeds = Math.min(40, 5 + state.buildings.length);
  if (Math.random() < 0.06*mult && state.pedestrians.length < maxPeds){
    spawnPedestrian();
  }
  updatePedestrians(dt * mult);

  // traffic estimate
  state.traffic = Math.min(100, state.vehicles.length*4 + state.population*0.001);

  // animate windmill
  for (const b of state.buildings){
    if (b.type==='power_wind' && b.mesh.userData.blades){
      b.mesh.userData.blades.rotation.z += dt * mult * 1.5;
    }
  }
  // animate clouds
  cloudGroup.children.forEach(c=>{
    c.position.x += dt * mult * 0.5;
    if (c.position.x > HALF+10) c.position.x = -HALF-10;
  });
}

// -------------------- DISASTERS --------------------
function triggerDisaster(){
  const kinds = ['fire','earthquake','flood'];
  const kind = choice(kinds);
  if (kind==='fire' && state.buildings.length){
    const victim = choice(state.buildings.filter(b=>b.type!=='road'));
    if (victim){
      flashRed(victim.mesh);
      notify('Fire!', `A fire broke out at ${BUILDINGS[victim.type].name}.`, 'danger');
      setTimeout(()=>{
        // spawn destruction before bulldoze clears the mesh
        if (victim.mesh) spawnDestruction(victim.mesh);
        bulldoze(victim.x, victim.z);
      }, 3500);
    }
  } else if (kind==='earthquake'){
    notify('Earthquake!', 'A minor earthquake damaged parts of the city.', 'danger');
    state.money -= 2000;
    // collapse 1-2 random buildings with animation
    const victims = state.buildings.filter(b=>b.type!=='road');
    const count = Math.min(victims.length, randInt(1, 2));
    for (let i=0;i<count;i++){
      const v = victims[randInt(0, victims.length-1)];
      if (v && v.mesh){
        // shake animation
        const origPos = v.mesh.position.clone();
        let st=0;
        const iv2 = setInterval(()=>{
          st+=0.1;
          v.mesh.position.x = origPos.x + Math.sin(st*30)*0.08*(1-st/1.5);
          v.mesh.position.z = origPos.z + Math.cos(st*25)*0.06*(1-st/1.5);
          if (st>1.5){
            clearInterval(iv2);
            spawnDestruction(v.mesh);
            bulldoze(v.x, v.z);
          }
        }, 50);
      }
    }
  } else {
    notify('Flood', 'Heavy rain flooded parts of the city.', 'warn');
    state.happiness = Math.max(0, state.happiness-10);
  }
}
function flashRed(mesh){
  let t = 0;
  const iv = setInterval(()=>{
    t += 0.2;
    mesh.traverse(o=>{ if (o.isMesh) o.material.emissive = new THREE.Color(t%0.4<0.2?0xff0000:0x000000); });
    if (t>3) clearInterval(iv);
  }, 200);
}

// -------------------- INPUT --------------------
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let isDragging = false;
let mouseDownButton = -1;
let lastMouse = { x:0, y:0 };
let isPanning = false;
let isRotating = false;

function getMouseGrid(e){
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((e.clientX-rect.left)/rect.width)*2 - 1;
  mouse.y = -((e.clientY-rect.top)/rect.height)*2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const hit = raycaster.intersectObject(ground);
  if (!hit.length) return null;
  const p = hit[0].point;
  const g = worldToGrid(p.x, p.z);
  if (!inBounds(g.x,g.z)) return null;
  return g;
}

canvas.addEventListener('mousedown', e=>{
  mouseDownButton = e.button;
  lastMouse.x = e.clientX; lastMouse.y = e.clientY;
  if (e.button === 2){
    // Right click: cancel pending placement, otherwise rotate camera
    if (state.pending){
      state.pending = null;
      clearGhost();
      return;
    }
    isRotating = true;
  }
  else if (e.button === 1) isPanning = true;
  else if (e.button === 0){
    if (state.selected){
      const g = getMouseGrid(e);
      if (!g) return;
      const key = state.selected;
      // Roads & bulldoze: instant placement (drag-friendly)
      if (key === 'road' || key === 'bulldoze'){
        isDragging = true;
        applyTool(g.x, g.z);
        return;
      }
      // Two-click confirm mode
      if (!state.pending){
        // First click: mark pending tile (if placeable)
        if (canPlaceAt(key, g.x, g.z)){
          state.pending = { gx:g.x, gz:g.z };
          spawnGhost(key, g.x, g.z);
        }
      } else {
        // Second click: confirm at the pending tile
        const placed = placeBuilding(key, state.pending.gx, state.pending.gz);
        if (placed){
          state.pending = null;
          clearGhost();
        }
      }
    } else {
      const g = getMouseGrid(e);
      if (g) selectBuildingAt(g.x, g.z);
    }
  }
});
window.addEventListener('mouseup', ()=>{
  isDragging = false; isPanning = false; isRotating = false; mouseDownButton = -1;
});
canvas.addEventListener('mousemove', e=>{
  const g = getMouseGrid(e);
  if (state.pending && state.selected){
    // Pending mode: lock cursor to pending tile, show red, tip about R + click to confirm
    const size = getSize(state.selected);
    const wp = footprintCenterWorld(state.pending.gx, state.pending.gz, size);
    cursorMesh.position.x = wp.x;
    cursorMesh.position.z = wp.z;
    cursorMesh.scale.set(size, 1, size);
    cursorMesh.rotation.y = state.placeRotation * Math.PI / 2;
    cursorMesh.material.color.setHex(0xff3344);
    cursorMesh.visible = true;
    const def = BUILDINGS[state.selected];
    const rotDeg = state.placeRotation * 90;
    showCursorTip(e.clientX, e.clientY, `${def.icon} ${def.name} (${size}×${size}) — R: rotate (${rotDeg}°) — click to confirm, right-click to cancel`);
  } else if (g){
    const size = state.selected ? getSize(state.selected) : 1;
    const wp = footprintCenterWorld(g.x, g.z, size);
    cursorMesh.position.x = wp.x;
    cursorMesh.position.z = wp.z;
    cursorMesh.scale.set(size, 1, size);
    cursorMesh.rotation.y = state.placeRotation * Math.PI / 2;
    cursorMesh.visible = !!state.selected;
    if (state.selected){
      const def = BUILDINGS[state.selected];
      const can = canPlaceAt(state.selected, g.x, g.z);
      cursorMesh.material.color.setHex(can ? 0xffdd00 : 0xef4444);
      const isInstant = state.selected==='road' || state.selected==='bulldoze' || state.selected==='railway' || state.selected==='water_tile';
      const tip = isInstant
        ? `${def.icon} ${def.name} — $${def.cost}`
        : `${def.icon} ${def.name} (${size}×${size}) — $${def.cost}  |  click to preview`;
      showCursorTip(e.clientX, e.clientY, tip);
    } else hideCursorTip();
    if (isDragging && state.selected){
      applyTool(g.x, g.z);
    }
  } else {
    cursorMesh.visible = false;
    hideCursorTip();
  }

  const dx = e.clientX - lastMouse.x;
  const dy = e.clientY - lastMouse.y;
  if (isRotating){
    camAngle -= dx * 0.005;
    camPitch = clamp(camPitch - dy*0.005, 0.2, Math.PI/2 - 0.1);
    updateCamera();
  } else if (isPanning){
    const f = camDist * 0.0015;
    camTarget.x -= (dx*Math.cos(camAngle) - dy*Math.sin(camAngle)) * f;
    camTarget.z -= (dx*Math.sin(camAngle) + dy*Math.cos(camAngle)) * f;
    updateCamera();
  }
  lastMouse.x = e.clientX; lastMouse.y = e.clientY;
});
canvas.addEventListener('contextmenu', e=>e.preventDefault());
canvas.addEventListener('wheel', e=>{
  e.preventDefault();
  camDist = clamp(camDist + e.deltaY*0.05, 15, 130);
  updateCamera();
}, { passive:false });

function applyTool(gx, gz){
  if (state.selected === 'bulldoze') bulldoze(gx, gz);
  else placeBuilding(state.selected, gx, gz);
}

function selectBuildingAt(gx, gz){
  const cell = state.grid[gx][gz];
  if (cell.type && cell.type!=='road'){
    const og = cell.origin || { gx, gz };
    state.selectedBuilding = { x:og.gx, z:og.gz, type:cell.type };
    renderInfoPanel();
  } else {
    state.selectedBuilding = null;
    renderInfoPanel();
  }
}

// Keyboard
const keys = {};
window.addEventListener('keydown', e=>{
  keys[e.key.toLowerCase()] = true;
  if (e.key === 'Escape') {
    state.selected = null;
    state.placeRotation = 0;
    state.pending = null;
    clearGhost();
    renderConstructionMenu();
    cursorMesh.visible=false;
  }
  if (e.key === '1') setSpeed(1);
  if (e.key === '2') setSpeed(2);
  if (e.key === '3') setSpeed(3);
  if (e.key === '0' || e.key === ' ') { e.preventDefault(); setSpeed(state.speed===0?1:0); }
  if (e.key.toLowerCase()==='b') { state.selected='bulldoze'; state.placeRotation=0; state.pending=null; clearGhost(); renderConstructionMenu(); }
  // R = rotate placement 90° clockwise (works in pending mode too)
  if (e.key.toLowerCase()==='r' && state.selected){
    e.preventDefault();
    state.placeRotation = (state.placeRotation + 1) % 4;
    cursorMesh.rotation.y = state.placeRotation * Math.PI / 2;
    if (ghostMesh) ghostMesh.rotation.y = state.placeRotation * Math.PI / 2;
    Audio.playRotate();
  }
});
window.addEventListener('keyup', e=>{ keys[e.key.toLowerCase()] = false; });

function setSpeed(s){
  state.speed = s;
  state.paused = (s===0);
  renderTopBar();
}

// -------------------- UI --------------------
const uiRoot = document.getElementById('ui-root');

function renderMainMenu(){
  // Start menu music
  Audio.init(); // Initialize audio on menu load
  
  uiRoot.innerHTML = `
  <div id="main-menu">
    <h1>CITY EMPIRE</h1>
    <div class="subtitle">Modern Metropolis</div>
    <div class="menu-buttons">
      <button id="btn-new"><span class="icon">🏗️</span>New Game</button>
      <button id="btn-continue" class="${localStorage.getItem('city-empire-save')?'':'disabled'}"><span class="icon">▶️</span>Continue</button>
      <button id="btn-sandbox"><span class="icon">🧪</span>Sandbox Mode</button>
      <button id="btn-scenario" class="disabled"><span class="icon">🎯</span>Scenario Mode</button>
      <button id="btn-multi" class="disabled"><span class="icon">🌐</span>Multiplayer</button>
      <button id="btn-workshop" class="disabled"><span class="icon">📦</span>Workshop</button>
      <button id="btn-settings" class="disabled"><span class="icon">⚙️</span>Settings</button>
    </div>
    <div class="footer">© CITY EMPIRE — built with Three.js</div>
  </div>`;
  document.getElementById('btn-new').onclick = ()=>startGame(false);
  document.getElementById('btn-sandbox').onclick = ()=>startGame(true);
  const cont = document.getElementById('btn-continue');
  cont.onclick = ()=>{
    if (cont.classList.contains('disabled')) return;
    loadGame(); startGame(false, true);
  };
}

function startGame(sandbox, loaded=false){
  uiRoot.innerHTML = '';
  if (!loaded){
    state.money = sandbox ? 9999999 : 320000;
    state.sandbox = sandbox;
    state.population = 0;
    state.day = 1;
  }
  state.running = true;
  
  // Switch to gameplay music
  Audio.playGameplayMusic();
  
  buildHUD();
  renderConstructionMenu();
  renderTopBar();
  renderInfoPanel();
  renderMinimap();
  notify('Welcome, Mayor!', 'Build roads first, then zone residential to grow population.', 'success');
}

function buildHUD(){
  uiRoot.innerHTML = `
    <div id="top-bar"></div>
    <div id="construction-menu"></div>
    <div id="info-panel"></div>
    <div id="notification-center"></div>
    <div id="mini-map">
      <canvas id="minimap-canvas" width="220" height="180"></canvas>
      <div class="modes">
        <button data-mode="normal" class="active">Normal</button>
        <button data-mode="traffic">Traffic</button>
        <button data-mode="pollution">Pollution</button>
        <button data-mode="power">Power</button>
        <button data-mode="happiness">😀</button>
      </div>
    </div>
    <div id="cursor-info"></div>
    <div id="cheat-box">
      <span id="cheat-label">💬</span>
      <input id="cheat-input" type="text" placeholder="Enter cheat code..." autocomplete="off" spellcheck="false"/>
      <span id="cheat-status"></span>
    </div>
  `;
  document.querySelectorAll('#mini-map .modes button').forEach(b=>{
    b.onclick = ()=>{
      document.querySelectorAll('#mini-map .modes button').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      state.minimapMode = b.dataset.mode;
    };
  });

  // Cheat box
  const cheatInput = document.getElementById('cheat-input');
  const cheatStatus = document.getElementById('cheat-status');

  const CHEATS = {
    'ari ganteng': () => {
      state.cheatUnlockAll = true;
      renderConstructionMenu();
      cheatFeedback('✅ All buildings unlocked!', 'success');
      Audio.playLevelUp();
    },
    'aba fajar': () => {
      const count = state.constructions.length;
      // Force-complete all constructions instantly
      while (state.constructions.length > 0){
        const c = state.constructions[0];
        c.progress = c.duration; // jump to 100%
        // Remove scaffold
        if (c.scaffMesh) scene.remove(c.scaffMesh);
        // Restore mesh to full scale
        if (c.mesh){
          c.mesh.scale.y = 1;
          c.mesh.position.y = 0;
        }
        // Register building & grid
        const size = getSize(c.key);
        state.buildings.push({ x: c.gx, z: c.gz, type: c.key, mesh: c.mesh });
        for (let dx=0; dx<size; dx++){
          for (let dz=0; dz<size; dz++){
            const nx = c.gx+dx, nz = c.gz+dz;
            if (inBounds(nx,nz)) state.grid[nx][nz] = {
              type: c.key, mesh: (dx===0&&dz===0) ? c.mesh : null,
              rotation: c.rotation, origin: { gx:c.gx, gz:c.gz }
            };
          }
        }
        if (c.key === 'road') updateRoadOrientations(c.gx, c.gz);
        state.constructions.splice(0, 1);
      }
      recalcStats();
      cheatFeedback(`⚡ ${count} building${count!==1?'s':''} instantly built!`, 'success');
      Audio.playLevelUp();
    },
    'bro am': () => {
      const targets = state.buildings.filter(b => {
        const size = getSize(b.type);
        return size === 2 || size === 4;
      });
      if (targets.length === 0){
        cheatFeedback('⚠️ No 2×2 or 4×4 buildings found!', 'error');
        return;
      }
      // Stagger destructions for dramatic effect
      targets.forEach((b, i) => {
        setTimeout(() => {
          // Building may have been already removed by a prior iteration
          const cell = state.grid[b.x]?.[b.z];
          if (!cell || !cell.type) return;
          if (b.mesh) spawnDestruction(b.mesh);
          // Clear grid & buildings without triggering bulldoze audio each time
          const size = getSize(b.type);
          state.buildings = state.buildings.filter(bl => !(bl.x===b.x && bl.z===b.z));
          for (let dx=0; dx<size; dx++){
            for (let dz=0; dz<size; dz++){
              const nx = b.x+dx, nz = b.z+dz;
              if (inBounds(nx,nz)) state.grid[nx][nz] = { type:null, mesh:null, rotation:0 };
            }
          }
          recalcStats();
        }, i * 200); // 200ms stagger between each building
      });
      Audio.playBulldoze();
      cheatFeedback(`💥 ${targets.length} building${targets.length!==1?'s':''} destroyed!`, 'success');
    },
    'tambah uang': () => {
      state.money += 999999;
      renderTopBar();
      cheatFeedback('💰 +$999,999 added!', 'success');
      Audio.playNotify('success');
    },
    'naik level': () => {
      state.level = Math.min(4, state.level + 1);
      state.cheatUnlockAll = true;
      renderConstructionMenu();
      cheatFeedback('⬆️ City level increased!', 'success');
      Audio.playLevelUp();
    },
    'bahagia': () => {
      state.happiness = 100;
      renderTopBar();
      cheatFeedback('😄 Happiness maxed!', 'success');
      Audio.playNotify('success');
    },
  };

  function cheatFeedback(msg, type){
    cheatStatus.textContent = msg;
    cheatStatus.className = type;
    setTimeout(()=>{ cheatStatus.textContent = ''; cheatStatus.className = ''; }, 3000);
  }

  cheatInput.addEventListener('keydown', e => {
    // Prevent camera controls from triggering while typing
    e.stopPropagation();
  });
  cheatInput.addEventListener('keyup', e => {
    e.stopPropagation();
    if (e.key === 'Enter'){
      const code = cheatInput.value.trim().toLowerCase();
      if (CHEATS[code]){
        CHEATS[code]();
      } else {
        cheatFeedback('❌ Unknown cheat code', 'error');
        Audio.playError();
      }
      cheatInput.value = '';
    }
  });
}

function renderTopBar(){
  const bar = document.getElementById('top-bar');
  if (!bar) return;
  const money = state.money;
  const moneyClass = money < 0 ? 'bad' : (money < 5000 ? 'warn' : 'good');
  const happyClass = state.happiness < 40 ? 'bad' : state.happiness < 65 ? 'warn' : 'good';
  const trafficClass = state.traffic > 60 ? 'bad' : state.traffic > 30 ? 'warn' : 'good';
  const net = state.income - state.expense;
  bar.innerHTML = `
    <div class="stat ${moneyClass}"><span class="icon">💰</span><div><div class="label">Treasury</div><div class="value">$${money.toLocaleString()}</div></div></div>
    <div class="stat"><span class="icon">📈</span><div><div class="label">Net /day</div><div class="value" style="color:${net>=0?'var(--good)':'var(--bad)'}">${net>=0?'+':''}$${net}</div></div></div>
    <div class="stat"><span class="icon">👥</span><div><div class="label">Population</div><div class="value">${state.population.toLocaleString()}</div></div></div>
    <div class="stat ${happyClass}"><span class="icon">😀</span><div><div class="label">Happiness</div><div class="value">${state.happiness}%</div></div></div>
    <div class="stat ${trafficClass}"><span class="icon">🚗</span><div><div class="label">Traffic</div><div class="value">${Math.round(state.traffic)}%</div></div></div>
    <div class="stat"><span class="icon">🏆</span><div><div class="label">Level</div><div class="value">${['','Village','Town','City','Metropolis'][state.level]}</div></div></div>
    <div class="stat"><span class="icon">📅</span><div><div class="label">Day</div><div class="value">${state.day}</div></div></div>
    <div class="stat"><span class="icon">${state.weather==='sunny'?'☀️':'🌧️'}</span><div><div class="label">Weather</div><div class="value">${state.weather}</div></div></div>
    <div class="spacer"></div>
    <div class="speed-controls">
      <button class="${state.speed===0?'active':''}" data-s="0">⏸</button>
      <button class="${state.speed===1?'active':''}" data-s="1">▶</button>
      <button class="${state.speed===2?'active':''}" data-s="2">▶▶</button>
      <button class="${state.speed===3?'active':''}" data-s="3">▶▶▶</button>
    </div>
    <button class="menu-btn" id="btn-help">❓ Help</button>
    <button class="menu-btn" id="btn-dashboard">📊 Dashboard</button>
    <button class="menu-btn" id="btn-save">💾 Save</button>
    <button class="menu-btn" id="btn-music">🔊 Music</button>
    <button class="menu-btn" id="btn-menu">⋮ Menu</button>
  `;
  bar.querySelectorAll('.speed-controls button').forEach(b=>{
    b.onclick = ()=>setSpeed(parseInt(b.dataset.s));
  });
  document.getElementById('btn-help').onclick = openHelp;
  document.getElementById('btn-dashboard').onclick = openDashboard;
  document.getElementById('btn-save').onclick = ()=>{ saveGame(); notify('Saved','City saved to browser storage.','success'); };
  let _musicOn = true;
  document.getElementById('btn-music').onclick = ()=>{
    _musicOn = !_musicOn;
    Audio.setMusicVol(_musicOn ? 0.35 : 0);
    document.getElementById('btn-music').textContent = _musicOn ? '🔊 Music' : '🔇 Music';
  };
  document.getElementById('btn-menu').onclick = ()=>{ if (confirm('Return to main menu? Unsaved changes will be lost.')) location.reload(); };
}

let currentCategory = 'road';
function renderConstructionMenu(){
  const menu = document.getElementById('construction-menu');
  if (!menu) return;
  const cats = CATEGORIES.map(c=>`<button data-cat="${c.id}" class="${c.id===currentCategory?'active':''}"><span>${c.icon}</span> ${c.name}</button>`).join('');
  const cat = CATEGORIES.find(c=>c.id===currentCategory);
  const items = cat.items.map(k=>{
    const b = BUILDINGS[k];
    const locked = !state.cheatUnlockAll && (b.unlock==='metro' && state.level<3 || b.unlock==='big' && state.level<3);
    return `<div class="item ${state.selected===k?'active':''} ${locked?'locked':''}" data-key="${k}">
      <div class="icon">${b.icon}</div>
      <div class="name">${b.name}</div>
      <div class="cost">${b.cost?'$'+b.cost:''}${b.size>1?` · ${b.size}×${b.size}`:''}${locked?' 🔒':''}</div>
    </div>`;
  }).join('');
  menu.innerHTML = `<div class="categories">${cats}</div><div class="items">${items}</div>`;
  menu.querySelectorAll('.categories button').forEach(b=>{
    b.onclick = ()=>{ currentCategory = b.dataset.cat; renderConstructionMenu(); };
  });
  menu.querySelectorAll('.item').forEach(el=>{
    el.onclick = ()=>{
      if (el.classList.contains('locked')) return;
      state.selected = (state.selected===el.dataset.key) ? null : el.dataset.key;
      state.placeRotation = 0; // reset rotation on new tool
      state.pending = null;
      clearGhost();
      renderConstructionMenu();
    };
  });
}

function renderInfoPanel(){
  const p = document.getElementById('info-panel');
  if (!p) return;
  if (!state.selectedBuilding){
    p.innerHTML = `
      <div class="title">🏙️ City Overview</div>
      <div class="subtitle">Mayor's Dashboard</div>
      <div class="row"><span>⚡ Power</span><span>${state.power.gen} / ${state.power.demand}</span></div>
      <div class="row"><span>💧 Water</span><span>${state.water.gen} / ${state.water.demand}</span></div>
      <div class="row"><span>🏠 Homes</span><span>${state.homes}</span></div>
      <div class="row"><span>💼 Jobs</span><span>${state.jobs.offered}</span></div>
      <div class="row"><span>🌫️ Pollution</span><span>${state.pollution}</span></div>
      <div class="row"><span>📈 Income</span><span style="color:var(--good)">+$${state.income}</span></div>
      <div class="row"><span>📉 Expense</span><span style="color:var(--bad)">-$${state.expense}</span></div>
    `;
    return;
  }
  const b = state.selectedBuilding;
  const def = BUILDINGS[b.type];
  p.innerHTML = `
    <div class="title">${def.icon} ${def.name}</div>
    <div class="subtitle">Tile (${b.x}, ${b.z})</div>
    ${def.homes?`<div class="row"><span>🏠 Homes</span><span>${def.homes}</span></div>`:''}
    ${def.jobs?`<div class="row"><span>💼 Jobs</span><span>${def.jobs}</span></div>`:''}
    ${def.power?`<div class="row"><span>⚡ Power use</span><span>${def.power}</span></div>`:''}
    ${def.powerGen?`<div class="row"><span>⚡ Power gen</span><span>${def.powerGen}</span></div>`:''}
    ${def.water?`<div class="row"><span>💧 Water use</span><span>${def.water}</span></div>`:''}
    ${def.waterGen?`<div class="row"><span>💧 Water gen</span><span>${def.waterGen}</span></div>`:''}
    ${def.pollution?`<div class="row"><span>🌫️ Pollution</span><span>${def.pollution}</span></div>`:''}
    ${def.tax?`<div class="row"><span>💰 Tax /day</span><span>+$${def.tax}</span></div>`:''}
    ${def.happy?`<div class="row"><span>😀 Happiness</span><span>+${def.happy}</span></div>`:''}
    <div class="actions">
      <button onclick="window.__bulldozeSelected()">💥 Demolish</button>
      <button onclick="window.__deselectBuilding()">Close</button>
    </div>
  `;
}
window.__bulldozeSelected = ()=>{
  if (!state.selectedBuilding) return;
  bulldoze(state.selectedBuilding.x, state.selectedBuilding.z);
  state.selectedBuilding = null;
  renderInfoPanel();
};
window.__deselectBuilding = ()=>{ state.selectedBuilding = null; renderInfoPanel(); };

// Notifications
function notify(title, body, kind='info'){
  const id = Math.random().toString(36).slice(2,8);
  state.notifications.unshift({ id, title, body, kind, time: state.day });
  if (state.notifications.length > 8) state.notifications.pop();
  renderNotifications();
  Audio.playNotify(kind);
  setTimeout(()=>{
    state.notifications = state.notifications.filter(n=>n.id!==id);
    renderNotifications();
  }, 8000);
}
function renderNotifications(){
  const nc = document.getElementById('notification-center');
  if (!nc) return;
  nc.innerHTML = state.notifications.map(n=>`
    <div class="notification ${n.kind}" data-id="${n.id}">
      <div class="head">${n.title}<span class="close">×</span></div>
      <div class="body">${n.body}</div>
    </div>
  `).join('');
  nc.querySelectorAll('.notification').forEach(el=>{
    el.onclick = ()=>{
      const id = el.dataset.id;
      state.notifications = state.notifications.filter(n=>n.id!==id);
      renderNotifications();
    };
  });
}

// Minimap
function renderMinimap(){
  const c = document.getElementById('minimap-canvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  const w = c.width, h = c.height;
  ctx.fillStyle = '#0b1320'; ctx.fillRect(0,0,w,h);
  const cellW = w / GRID;
  const cellH = h / GRID;
  for (let i=0;i<GRID;i++){
    for (let j=0;j<GRID;j++){
      const cell = state.grid[i][j];
      let col = null;
      if (state.minimapMode==='normal'){
        if (cell.type){
          col = '#' + BUILDINGS[cell.type].color.toString(16).padStart(6,'0');
        }
      } else if (state.minimapMode==='traffic'){
        if (cell.type==='road') col = '#facc15';
      } else if (state.minimapMode==='pollution'){
        if (cell.type==='ind_factory' || cell.type==='power_coal') col = '#ef4444';
        else if (cell.type) col = '#374151';
      } else if (state.minimapMode==='power'){
        if (cell.type && BUILDINGS[cell.type].powerGen) col = '#facc15';
        else if (cell.type && BUILDINGS[cell.type].power) col = '#60a5fa';
      } else if (state.minimapMode==='happiness'){
        if (cell.type==='park'||cell.type==='school'||cell.type==='hospital') col = '#4ade80';
        else if (cell.type) col = '#475569';
      }
      if (col){
        ctx.fillStyle = col;
        ctx.fillRect(i*cellW, j*cellH, cellW+0.5, cellH+0.5);
      }
    }
  }
  // camera viewport indicator
  const cx = (camTarget.x + HALF)/(GRID*TILE) * w;
  const cz = (camTarget.z + HALF)/(GRID*TILE) * h;
  ctx.strokeStyle = '#4cc9f0';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(cx-12, cz-10, 24, 20);
}

// Dashboard modal
function openDashboard(){
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <h2>📊 City Management Dashboard</h2>
      <div class="sub">Tier: ${['','Village','Town','City','Metropolis'][state.level]} • Day ${state.day}</div>
      <div class="grid">
        <div class="card"><div class="label">👥 Population</div><div class="big">${state.population.toLocaleString()}</div><div class="delta">Capacity ${state.homes}</div></div>
        <div class="card"><div class="label">💰 Treasury</div><div class="big">$${state.money.toLocaleString()}</div><div class="delta">${state.income-state.expense>=0?'+':''}$${state.income-state.expense}/day</div></div>
        <div class="card"><div class="label">😀 Happiness</div><div class="big">${state.happiness}%</div><div class="bar"><div style="width:${state.happiness}%"></div></div></div>
        <div class="card"><div class="label">⚡ Power</div><div class="big">${state.power.gen}/${state.power.demand}</div><div class="bar"><div style="width:${Math.min(100,state.power.demand?state.power.demand/Math.max(state.power.gen,1)*100:0)}%"></div></div></div>
        <div class="card"><div class="label">💧 Water</div><div class="big">${state.water.gen}/${state.water.demand}</div><div class="bar"><div style="width:${Math.min(100,state.water.demand?state.water.demand/Math.max(state.water.gen,1)*100:0)}%"></div></div></div>
        <div class="card"><div class="label">💼 Jobs</div><div class="big">${state.jobs.offered}</div><div class="delta">Workers: ${state.population}</div></div>
        <div class="card"><div class="label">🌫️ Pollution</div><div class="big">${state.pollution}</div><div class="bar"><div style="width:${Math.min(100,state.pollution*2)}%;background:var(--bad)"></div></div></div>
        <div class="card"><div class="label">🚗 Traffic</div><div class="big">${Math.round(state.traffic)}%</div><div class="bar"><div style="width:${state.traffic}%;background:var(--warn)"></div></div></div>
        <div class="card"><div class="label">🏗️ Buildings</div><div class="big">${state.buildings.length}</div></div>
      </div>
      <div class="close-row"><button class="primary" id="close-modal">Close</button></div>
    </div>
  `;
  uiRoot.appendChild(overlay);
  overlay.querySelector('#close-modal').onclick = ()=>uiRoot.removeChild(overlay);
  overlay.onclick = (e)=>{ if (e.target===overlay) uiRoot.removeChild(overlay); };
}

function openHelp(){
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" style="max-width:560px">
      <h2>❓ Controls</h2>
      <div class="sub">Camera & gameplay</div>
      <div style="display:grid;grid-template-columns:auto 1fr;gap:8px 16px;font-size:14px">
        <b>Rotate view</b><span><kbd>Q</kbd> / <kbd>E</kbd> &nbsp; <i>or</i> &nbsp; Right-mouse drag</span>
        <b>Tilt up/down</b><span><kbd>F</kbd> &nbsp; <i>or</i> &nbsp; Right-mouse drag vertical</span>
        <b>Zoom</b><span><kbd>Z</kbd> / <kbd>X</kbd> &nbsp; <i>or</i> &nbsp; Mouse wheel</span>
        <b>Pan</b><span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> / Arrow keys / Middle-mouse drag</span>
        <b>Build</b><span>Pick item → 1st click previews (red) → <kbd>R</kbd> to rotate → 2nd click confirms</span>
        <b>Rotate object</b><span><kbd>R</kbd> &nbsp; — rotate 90° (works in preview mode)</span>
        <b>Cancel preview</b><span>Right-click or <kbd>Esc</kbd></span>
        <b>Roads</b><span>Drag to paint (no preview)</span>
        <b>Bulldoze</b><span>Tools → 💥 &nbsp; <i>or</i> &nbsp; <kbd>B</kbd></span>
        <b>Pause / Speed</b><span><kbd>0</kbd>/<kbd>Space</kbd>, <kbd>1</kbd>, <kbd>2</kbd>, <kbd>3</kbd></span>
        <b>Cancel tool</b><span><kbd>Esc</kbd></span>
      </div>
      <p style="color:var(--text-dim);font-size:12px;margin-top:14px">Tip: if your right mouse button doesn't work, just use <b>Q</b> and <b>E</b> to spin the camera.</p>
      <div class="close-row"><button class="primary" id="close-help">Got it</button></div>
    </div>
  `;
  uiRoot.appendChild(overlay);
  overlay.querySelector('#close-help').onclick = ()=>uiRoot.removeChild(overlay);
  overlay.onclick = (e)=>{ if (e.target===overlay) uiRoot.removeChild(overlay); };
}

// Cursor tip
function showCursorTip(x,y,text){
  const el = document.getElementById('cursor-info');
  if (!el) return;
  el.textContent = text;
  el.style.left = (x+14)+'px';
  el.style.top = (y+14)+'px';
  el.style.display = 'block';
}
function hideCursorTip(){
  const el = document.getElementById('cursor-info');
  if (el) el.style.display = 'none';
}

// -------------------- SAVE / LOAD --------------------
function saveGame(){
  const compact = {
    money: state.money, day: state.day, level: state.level,
    happiness: state.happiness, citizens: state.citizens.length,
    buildings: state.buildings.map(b=>({x:b.x,z:b.z,t:b.type}))
  };
  localStorage.setItem('city-empire-save', JSON.stringify(compact));
}
function loadGame(){
  const raw = localStorage.getItem('city-empire-save');
  if (!raw) return;
  const s = JSON.parse(raw);
  state.money = s.money; state.day = s.day; state.level = s.level||1;
  for (const b of s.buildings){
    placeBuilding(b.t, b.x, b.z);
    // refund cost since we're loading
    state.money += BUILDINGS[b.t].cost;
  }
  recalcStats();
}

// -------------------- MAIN LOOP --------------------
let lastT = performance.now();
let uiTick = 0;
function loop(now){
  const dt = Math.min(0.1, (now - lastT)/1000);
  lastT = now;
  // camera WASD pan + QE rotate + RF pitch
  const speed = camDist * 0.6 * dt;
  if (keys['w']||keys['arrowup']) { camTarget.x -= Math.sin(camAngle)*speed; camTarget.z -= Math.cos(camAngle)*speed; updateCamera(); }
  if (keys['s']||keys['arrowdown']) { camTarget.x += Math.sin(camAngle)*speed; camTarget.z += Math.cos(camAngle)*speed; updateCamera(); }
  if (keys['a']||keys['arrowleft']) { camTarget.x -= Math.cos(camAngle)*speed; camTarget.z += Math.sin(camAngle)*speed; updateCamera(); }
  if (keys['d']||keys['arrowright']) { camTarget.x += Math.cos(camAngle)*speed; camTarget.z -= Math.sin(camAngle)*speed; updateCamera(); }
  if (keys['q']) { camAngle -= 1.5*dt; updateCamera(); }
  if (keys['e']) { camAngle += 1.5*dt; updateCamera(); }
  if (keys['r'] && !state.selected) { camPitch = clamp(camPitch + 1.0*dt, 0.2, Math.PI/2 - 0.1); updateCamera(); }
  if (keys['f']) { camPitch = clamp(camPitch - 1.0*dt, 0.2, Math.PI/2 - 0.1); updateCamera(); }
  if (keys['z']) { camDist = clamp(camDist - 30*dt, 15, 130); updateCamera(); }
  if (keys['x']) { camDist = clamp(camDist + 30*dt, 15, 130); updateCamera(); }
  camTarget.x = clamp(camTarget.x, -HALF, HALF);
  camTarget.z = clamp(camTarget.z, -HALF, HALF);

  if (state.running) gameTick(dt);
  updateConstructions(dt);
  updateDestructions(dt);
  updateWaterAnimation(dt);
  updateWaterMixers(dt);

  uiTick += dt;
  if (uiTick > 0.25){
    uiTick = 0;
    if (state.running){
      renderTopBar();
      renderInfoPanel();
      renderMinimap();
    }
  }

  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}

window.addEventListener('resize', ()=>{
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
});

// -------------------- BOOT --------------------
renderMainMenu();
// pre-warm GLB cache
Object.keys(GLB_MODELS).forEach(k => loadGLBTemplate(k).catch(()=>{}));
requestAnimationFrame(loop);
