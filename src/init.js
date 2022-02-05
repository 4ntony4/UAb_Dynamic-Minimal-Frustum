import * as THREE from 'https://unpkg.com/three@0.124.0/build/three.module.js';

import { OrbitControls } from 'https://unpkg.com/three@0.124.0/examples/jsm/controls/OrbitControls.js';

import { GUI } from 'https://cdn.jsdelivr.net/npm/lil-gui@0.16/+esm';

let camera, scene, renderer;
let cameraPerspective, cameraPerspectiveHelper;
let geometry, material;

let topLeftOver, bottomLeftOver, leftLeftOver, rightLeftOver;

let w = window.innerWidth;
let h = window.innerHeight;
let aspect = w / h;
let halfW, leftOverH, leftOverW;

// meshes
let sphere;

let d = 10;
let R = 7;
let L = 20; // L > R
let A = new THREE.Vector3( 0, 0, d );
let B = new THREE.Vector3( 0, 0,  d + L );

// play animation
let play = true;

// lil-gui
const gui = new GUI();


init();
animate();


function init() {
   
    topLeftOver = document.getElementById( 'topLeftOver' );
    bottomLeftOver = document.getElementById( 'bottomLeftOver' );
    leftLeftOver = document.getElementById( 'leftLeftOver' );
    rightLeftOver = document.getElementById( 'rightLeftOver' );

    // initiate scene
    scene = new THREE.Scene();

    // set camera
    camera = new THREE.PerspectiveCamera( 
        50,
        0.5 * aspect,
        1,
        10000
    );
    camera.position.set( 20, 70, -30 );
    
    // set cameraPerspective
    cameraPerspective = new THREE.PerspectiveCamera(
        calcFov( d, R ),
        1,
        d - R,
        d + R
    );

    cameraPerspectiveHelper = new THREE.CameraHelper( cameraPerspective );
    cameraPerspective.rotateY( Math.PI );
    cameraPerspective.position.set( 0, 0, 0 );
    scene.add( cameraPerspectiveHelper );

    addLights();
    
    sphere = new THREE.Mesh(
        new THREE.SphereGeometry( R , 64 , 32 ),
        new THREE.MeshPhongMaterial( {
            wireframe: true,
            color: 'white'
        } )
    );
    sphere.position.set( 0, 0, d );
    sphere.name = 'wireframedSphere';
    scene.add( sphere );

    drawLine( A, B, 'blue' );

    renderer = new THREE.WebGLRenderer( {antialias: true} );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( w, h );
    document.body.appendChild( renderer.domElement );

    // for seeing both cameras at same time
    renderer.autoClear = false;
    
    new OrbitControls( camera, renderer.domElement );
    
    window.addEventListener( 'resize', onWindowResize );

    setSizes();
    
    camera.lookAt( 0, 0, L / 2 );

    setGUI();
}

function setGUI() {

    const obj = {
        Animate: true,
        d: d,
        R: R,
        L: L
    }

    gui.add( obj, 'Animate' ).onChange( value => {
        if ( !value ) play = false;
        else play = true;
    } );
    
    gui.add( obj, 'd', 1, 40, 1 ).onChange( value => {
        if ( value != d ) { 
            d = value;
            A.z = d;
            B.z = d + L;

            const newLine = scene.getObjectByName( 'pathLine' );
            newLine.geometry = new THREE.BufferGeometry().setFromPoints( [ A, B ] );
        }
    } );

    gui.add( obj, 'R', 1, 40, 1 ).onChange( value => {
        if ( value != R ) {
            R = value;

            sphere.geometry = new THREE.SphereGeometry( R, 64, 32 );
        }
    } );
    
    gui.add( obj, 'L', 1, 40, 1 ).onChange( value => {
        if ( value != L ) { 
            L = value;
            B.z = d + L;

            const newLine = scene.getObjectByName( 'pathLine' );
            newLine.geometry = new THREE.BufferGeometry().setFromPoints( [ A, B ] );
        }
    } );
}
    
function radiansToDegrees( rad ) {
    
    return rad * 180 / Math.PI;
}

function calcFov( d, R ) {
    
    return radiansToDegrees( 2 * Math.asin( R / d ) );
}

// pointA and pointB can be Vector3 or for example an object a = {x, y}
function drawLine( pointA, pointB, color, opacity = 1 ) {

    geometry = new THREE.BufferGeometry().setFromPoints( [ pointA, pointB ] );

    material = new THREE.LineBasicMaterial( {
        color: color,
        transparent: true,
        opacity: opacity
    });

    const line = new THREE.Line( geometry, material );

    line.name = 'pathLine';

    scene.add( line );
}

function addLights() {

    addDirectionalLight( 'white', 0, 0, -d, 0.5 );
    addDirectionalLight( 'white', 0, 0, d, 0.1 );
    addDirectionalLight( 'red', 0, -d, 0 );
    addDirectionalLight( 'green', 0, d, 0 );
    addDirectionalLight( 'blue', -d, 0, 0 );
    addDirectionalLight( 'yellow', d, 0, 0 );
}

function addDirectionalLight( color, px, py, pz, intensity = 1) {
    
    const light = new THREE.DirectionalLight( color, intensity );
    light.position.set( px, py, pz );
    scene.add( light );
}

function setSizes() {
    
    let sphereDiameter, wPercent, hPercent;

    w = window.innerWidth;
    h = window.innerHeight;
    aspect = w / h;
    halfW = w / 2;

    renderer.setSize( window.innerWidth, window.innerHeight );

    camera.aspect = 0.5 * aspect;
    camera.updateProjectionMatrix();

    cameraPerspective.aspect = 1;
    cameraPerspective.updateProjectionMatrix();

    if ( halfW > h ) {

        sphereDiameter = h;
        leftOverH = 0;
        leftOverW = ( halfW - sphereDiameter ) / 2;
        
        wPercent = 100 * leftOverW / w;
        hPercent = 100;
        
        leftLeftOver.style.width = rightLeftOver.style.width = `${wPercent}%`;
        leftLeftOver.style.height = rightLeftOver.style.height = `${hPercent}%`;
        rightLeftOver.style.right = '50%';

        topLeftOver.style.width =
        topLeftOver.style.height =
        bottomLeftOver.style.width =
        bottomLeftOver.style.height = '0%';
    }
    else {

        sphereDiameter = halfW;
        leftOverH = ( h - sphereDiameter ) / 2;
        leftOverW = 0;

        wPercent = 50;
        hPercent = 100 * ( leftOverH / h );

        topLeftOver.style.width = bottomLeftOver.style.width = `${wPercent}%`;
        topLeftOver.style.height = bottomLeftOver.style.height = `${hPercent}%`;

        bottomLeftOver.style.bottom =
        leftLeftOver.style.width =
        leftLeftOver.style.height =
        rightLeftOver.style.width =
        rightLeftOver.style.height = '0%';
    }
}

// Window Resize Event
function onWindowResize() {

    setSizes();
}

function animate() {
    
    requestAnimationFrame( animate );
    
    render();
}

function render() {

    const r = Date.now() * 0.0015;

    if ( play ) {
        sphere.position.z = ( Math.cos( r ) * ( L / 2 ) ) + ( L / 2 ) + d;
        
        cameraPerspective.fov = calcFov ( sphere.position.z, R );
        cameraPerspective.near = sphere.position.z - R;
        cameraPerspective.far = sphere.position.z + R;
        cameraPerspective.updateProjectionMatrix();
        cameraPerspectiveHelper.update();
    }

    if ( halfW > h ) {

        renderer.setViewport(
            leftOverW,
            0,
            h,
            h
        );            
    }
    else {

        renderer.setViewport(
            0,
            leftOverH,
            halfW,
            halfW
        );
    }
    cameraPerspectiveHelper.visible = false;
	renderer.render( scene, cameraPerspective );
    

    renderer.setViewport(
        halfW,
        0,
        halfW,
        h
    );
    cameraPerspectiveHelper.visible = true;
	renderer.render( scene, camera );
}