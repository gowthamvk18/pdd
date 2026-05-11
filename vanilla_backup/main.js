import * as THREE from 'three';

// --- Three.js Background Network ---
const canvas = document.querySelector('#bg-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 150;

// Particles (Nodes)
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 250;
const posArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i++) {
    // Spread particles over a large volume
    posArray[i] = (Math.random() - 0.5) * 400;
}
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

const particleMaterial = new THREE.PointsMaterial({
    size: 2,
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
});

const particlesMesh = new THREE.Points(particlesGeometry, particleMaterial);
scene.add(particlesMesh);

// Lines (Connections)
const lineMaterial = new THREE.LineBasicMaterial({
    color: 0xbd00ff,
    transparent: true,
    opacity: 0.15,
    blending: THREE.AdditiveBlending
});

// We will compute lines dynamically or just statically for a nice effect
// Let's connect particles that are close to each other
const linesGeometry = new THREE.BufferGeometry();
const linePositions = [];

for(let i = 0; i < particlesCount; i++) {
    for(let j = i + 1; j < particlesCount; j++) {
        const x1 = posArray[i*3];
        const y1 = posArray[i*3+1];
        const z1 = posArray[i*3+2];
        
        const x2 = posArray[j*3];
        const y2 = posArray[j*3+1];
        const z2 = posArray[j*3+2];
        
        const dist = Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2) + Math.pow(z1-z2, 2));
        
        // Connect if distance is less than 45
        if(dist < 45) {
            linePositions.push(x1, y1, z1);
            linePositions.push(x2, y2, z2);
        }
    }
}

linesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
const linesMesh = new THREE.LineSegments(linesGeometry, lineMaterial);
scene.add(linesMesh);

// Mouse interaction
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
});

// Animation Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Rotate entire scene slowly
    particlesMesh.rotation.y = elapsedTime * 0.05;
    particlesMesh.rotation.x = elapsedTime * 0.02;
    linesMesh.rotation.y = elapsedTime * 0.05;
    linesMesh.rotation.x = elapsedTime * 0.02;

    // Smooth mouse follow
    targetX = mouseX * 0.05;
    targetY = mouseY * 0.05;
    
    camera.position.x += (targetX - camera.position.x) * 0.02;
    camera.position.y += (-targetY - camera.position.y) * 0.02;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
}
animate();

// Resize Handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});


// --- Vanilla JS UI Interactions ---

// 3D Tilt Effect for Feature Cards
const cards = document.querySelectorAll('.tilt-effect');

cards.forEach(card => {
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left; // x position within the element
        const y = e.clientY - rect.top;  // y position within the element
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -10; // Max 10 deg rotation
        const rotateY = ((x - centerX) / centerX) * 10;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) translateY(0)`;
    });
});
