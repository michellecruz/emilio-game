import React, { Component } from 'react';
import * as THREE from 'three';
import { HorizontalBlurShader } from 'three/examples/jsm/shaders/HorizontalBlurShader.js';
import { VerticalBlurShader } from 'three/examples/jsm/shaders/VerticalBlurShader.js';

import firebase from './firebase.js';

let container, start;
let camera, scene, renderer, canvas;
let geometry, texture, textureOpen, material, mesh;

let geometryKibble, textureKibble, materialKibble, meshKibble;
let spheres = [];

let kibbleIDs = [],
    kibbleID,
    treatIDs = [],
    treatID;

let geometryTreat, textureTreat, materialTreat, meshTreat;

let radius = 100,
    raycaster,
    intersects,
    intersectsTreat,
    ghost,
    goal,
    temp,
    axis,
    axisTreat,
    velocity = 1.4;

let isTwirling = false,
    timeTwirling = 0,
    isEating = false,
    isJumping = false,
    timeJumping = 0,
    superPug = false,
    gameEnded = false,
    isTopFive = false;

let pause = false,
    isMobile = false;

// Shadow Variables
let shadowGroup,
    renderTarget,
    renderTargetBlur,
    shadowCamera,
    cameraHelper,
    depthMaterial,
    horizontalBlurMaterial,
    verticalBlurMaterial,
    plane,
    blurPlane,
    fillPlane,
    PLANE_WIDTH = window.innerWidth * 4,
    PLANE_HEIGHT = window.innerHeight * 4,
    CAMERA_HEIGHT = 500;


class EmilioGame extends Component {
  state = {
    timeElapsed: 0,
    width: window.innerWidth,
    height: window.innerHeight,
    shadow: {
      blur: 3.5,
      darkness: 1,
      opacity: 1,
    },
    plane: {
      color: '#ffffff',
      opacity: 1,
    },
    emilio: {
      isEating: false,
      isTwirling: null,
      position: {
        x: -700,
        y: 500,
        z: 0,
      },
      rotation: {
        x: 0, //-0.1,
        y: 6.5, //6.6,
        z: 0, //-1.2,
      },
    },
    kibbleEaten: 0,
    totalKibble: spheres.length,
    playerName: '',
    topPlayers: [],
  }


  // Form - Changing input
  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    });
  }


  // Form - Submit
  handleSubmit = (e) => {
    e.preventDefault();
    const playersRef = firebase.database().ref('players');
    const player = {
      name: this.state.playerName ? this.state.playerName : 'Anonymous',
      score: this.state.kibbleEaten,
      time: firebase.database.ServerValue.TIMESTAMP,
    }
    playersRef.push(player);
    this.setState({
      playerName: ''
    });
  }


  // Form - Click, start screen
  handleClick = () => {
    document.querySelector('.form').classList.add('fade-out');
    document.querySelector('.leaderboard').classList.add('fade-in');

    let mainContainer = document.querySelector('.container'),
        game = document.querySelector('.game')

    mainContainer.removeChild(game)
  }


  // Refresh Page - TODO: Make component rerender
  handleRefresh = () => {
    window.location.reload();
  }

  init = () => {
    let emilioCanvas = document.querySelector('.emiliocanvas');

    // Load textures.
    texture = new THREE.TextureLoader().load( 'img/060420-emilio-0.jpg' );
    textureOpen = new THREE.TextureLoader().load( 'img/060420-emilio-1.jpg' );
    textureKibble = new THREE.TextureLoader().load( 'img/kibble.jpg' );
    textureTreat = new THREE.TextureLoader().load( 'img/treat.png' );
    
    // Set up the initial scene
    camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.set( 0, 400, 2000 );

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xffffff )

    // Draw Emilio shape & texture
    geometry = new THREE.SphereBufferGeometry( radius, 32, 32 );
    material = new THREE.MeshBasicMaterial( { map: texture } );
    material.side = THREE.DoubleSide;
    mesh = new THREE.Mesh( geometry, material );
    mesh.name = "Emilio";

    // Add a ghost for the camera to follow.
    ghost = new THREE.Mesh( );
    ghost.visible = false
    goal = new THREE.Object3D();
    ghost.add( goal );
    temp = new THREE.Vector3();
    goal.position.set( 0, 0, 2000 );

    // Set Emilio's initial position
    mesh.position.x = this.state.emilio.position.x
    mesh.position.y = this.state.emilio.position.y
    mesh.position.z = this.state.emilio.position.z

    // Emilio's initial rotation
    mesh.rotation.x = this.state.emilio.rotation.x
    mesh.rotation.y = this.state.emilio.rotation.y
    mesh.rotation.z = this.state.emilio.rotation.z

    // Add Emilio to the scene
    scene.add(mesh);
    scene.add(ghost);
  
    // Add the shadow!
    this.addShadow();

    // Scatter the treats!
    this.addKibble();
    
    raycaster = new THREE.Raycaster();

    // Draw the canvas.
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( this.state.width, this.state.height );

    // Replace div in the dom with new canvas.
    container.replaceChild( renderer.domElement, emilioCanvas );
    canvas = renderer.getContext('2d').canvas;

    // Set width and height states to canvas width/height.
    // Best not to keep calling window.InnerWidth/Height.
    this.setState({
      width: canvas.clientWidth,
      height: canvas.clientHeight,
    })
  }


  animate = () => {
    // This creates the animation.
    start = requestAnimationFrame(this.animate);

    // Count seconds.
    this.setState({
      timeElapsed: this.state.timeElapsed + 1
    })

    // Make Emilio faster after he passes x kibbles
    if (this.state.kibbleEaten >= 15 &&
        this.state.kibbleEaten <= 100) {
      mesh.position.x += 30;
      velocity = 1.8
    } else if (this.state.kibbleEaten > 100 &&
        this.state.kibbleEaten <= 700) {
      mesh.position.x += 40;
      velocity = 2.2
    } else if (this.state.kibbleEaten > 700) {
      mesh.position.x += 60;
      velocity = 2.6
    } else {
      mesh.position.x += 20;
    }

    // Ghost & Plane follows Emilio.
    ghost.position.x = mesh.position.x;
    ghost.position.y = mesh.position.y;
    shadowGroup.position.x = mesh.position.x;

    // If Emilio is in the air, move faster while falling to the ground.
    if (superPug) {
      if (mesh.scale.x < 3.5) {
        mesh.scale.set(
          mesh.scale.x + 0.1,
          mesh.scale.y + 0.1,
          mesh.scale.z + 0.1
        );
      } else {
        mesh.scale.set(
          3.5,
          3.5,
          3.5
        );
      }

      if (mesh.position.y > 250) {
        if (!isJumping) {
          mesh.position.y -= 10
        }
      } else {
        mesh.position.y = 250;
      }
    } else {
      if (mesh.position.y > 10) {
        if (!isJumping) {
          mesh.position.y -= 10
        }
      } else {
        mesh.position.y = 0;
      }
    }

    // Rotate Emilio based on his direction
    axis = new THREE.Vector3();
    axis.set( mesh.position.x, mesh.position.y, 0 ).normalize();
    axis.cross( THREE.Object3D.DefaultUp );
    if (!gameEnded) {
      mesh.rotateOnAxis( axis, -0.05*velocity );
    }

    axisTreat = new THREE.Vector3();
    axisTreat.set( -0.5, -0.5, 0 ).normalize();
    axisTreat.cross( THREE.Object3D.DefaultUp );
    meshTreat.rotateOnAxis( axisTreat, -0.005*velocity );


    // Have the camera follow Emilio.
    temp.setFromMatrixPosition(goal.matrixWorld);
    camera.position.lerp(temp, 0.8);
    camera.lookAt( ghost.position );
    camera.updateProjectionMatrix();


    // SHADOW
    // remove the background
    let initialBackground = scene.background;
    scene.background = null;

    // force the depthMaterial to everything
    cameraHelper.visible = false;
    scene.overrideMaterial = depthMaterial;

    // render to the render target to get the depths
    renderer.setRenderTarget( renderTarget );
    renderer.render( scene, shadowCamera );

    // and reset the override material
    scene.overrideMaterial = null;
    cameraHelper.visible = true;

    this.blurShadow( this.state.shadow.blur );

    // a second pass to reduce the artifacts
    // (0.4 is the minimum blur amout so that the artifacts are gone)
    this.blurShadow( this.state.shadow.blur * 0.4 );

    // reset and render the normal scene
    renderer.setRenderTarget( null );
    scene.background = initialBackground;

    // If Emilio is on the ground and is not eating,
    // close his mouth.
    if (!isEating) {
      mesh.material.map = texture;
    }

    // Start tracking if Emilio is eating kibble.
    this.eatKibble();

    // If Emilio is jumping, run this function. 
    if (isJumping) {
      this.jump();
    }

    // This function contains logic for Emilio turning around.
    if (isTwirling) {
      timeTwirling += 1;
    } else {
      timeTwirling = 0;
    }
    this.twirl();

    // If Emilio is eating, run this function.
    if (isEating) {
      this.eat();
    }

    if (mesh.position.x >= 165000) {
      this.endGame();
    }

    // Render the screen.
    renderer.render( scene, camera );
    camera.updateProjectionMatrix();
  }


  addShadow = () => {
    // the container, if you need to move the plane just move this
    shadowGroup = new THREE.Group();
    shadowGroup.position.y = -radius;

    scene.add( shadowGroup );

    // the render target that will show the shadows in the plane texture
    renderTarget = new THREE.WebGLRenderTarget( 512, 512 );
    renderTarget.texture.generateMipmaps = false;

    // the render target that we will use to blur the first render target
    renderTargetBlur = new THREE.WebGLRenderTarget( 512, 512 );
    renderTargetBlur.texture.generateMipmaps = false;

    // make a plane and make it face up
    let planeGeometry = new THREE.PlaneBufferGeometry( PLANE_WIDTH, PLANE_HEIGHT ).rotateX( Math.PI / 2 );
    let planeMaterial = new THREE.MeshBasicMaterial({
      map: renderTarget.texture,
      opacity: this.state.shadow.opacity,
      transparent: true,
    });

    plane = new THREE.Mesh( planeGeometry, planeMaterial );
    shadowGroup.add( plane );
    // the y from the texture is flipped!
    plane.scale.y = -1;

    // the plane onto which to blur the texture
    blurPlane = new THREE.Mesh( planeGeometry );
    blurPlane.visible = false;
    shadowGroup.add( blurPlane );

    // the plane with the color of the ground
    planeMaterial = new THREE.MeshBasicMaterial( {
      color: this.state.plane.color,
      opacity: this.state.plane.opacity,
      transparent: true,
    } );

    fillPlane = new THREE.Mesh( planeGeometry, planeMaterial );
    fillPlane.rotateX( Math.PI/2 );
    shadowGroup.add( fillPlane );

    // the camera to render the depth material from
    shadowCamera = new THREE.OrthographicCamera( - PLANE_WIDTH / 2, PLANE_WIDTH / 2, PLANE_HEIGHT / 2, - PLANE_HEIGHT / 2, 0, CAMERA_HEIGHT );
    shadowCamera.rotation.x = Math.PI / 2; // get the camera to look up
    shadowGroup.add( shadowCamera );

    cameraHelper = new THREE.CameraHelper( shadowCamera );

    // like MeshDepthMaterial, but goes from black to transparent
    depthMaterial = new THREE.MeshDepthMaterial();
    depthMaterial.userData.darkness = { value: this.state.shadow.darkness };
    depthMaterial.onBeforeCompile = function ( shader ) {
      shader.uniforms.darkness = depthMaterial.userData.darkness;
      shader.fragmentShader = `
        uniform float darkness;
        ${shader.fragmentShader.replace(
      'gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );',
      'gl_FragColor = vec4( vec3( 0.0 ), ( 1.0 - fragCoordZ ) * darkness );'
    )}
    `;
    };
    depthMaterial.depthTest = false;
    depthMaterial.depthWrite = false;

    horizontalBlurMaterial = new THREE.ShaderMaterial( HorizontalBlurShader );
    horizontalBlurMaterial.depthTest = false;

    verticalBlurMaterial = new THREE.ShaderMaterial( VerticalBlurShader );
    verticalBlurMaterial.depthTest = false;
  }


  blurShadow = (amount) => {
    blurPlane.visible = true;

    // blur horizontally and draw in the renderTargetBlur
    blurPlane.material = horizontalBlurMaterial;
    blurPlane.material.uniforms.tDiffuse.value = renderTarget.texture;
    horizontalBlurMaterial.uniforms.h.value = amount * 1 / this.state.width*2; //256

    renderer.setRenderTarget( renderTargetBlur );
    renderer.render( blurPlane, shadowCamera );

    // blur vertically and draw in the main renderTarget
    blurPlane.material = verticalBlurMaterial;
    blurPlane.material.uniforms.tDiffuse.value = renderTargetBlur.texture;
    verticalBlurMaterial.uniforms.v.value = amount * 1 / this.state.height*2; //256

    renderer.setRenderTarget( renderTarget );
    renderer.render( blurPlane, shadowCamera );

    blurPlane.visible = false;
  }


  addKibble = () => {
    // new THREE.BoxBufferGeometry( radius*2, radius*2, radius*2 );
    geometryKibble = new THREE.CylinderBufferGeometry( radius, radius, radius*2, radius*2 ) //new THREE.SphereBufferGeometry( radius, 32, 32 );
    materialKibble = new THREE.MeshBasicMaterial( { map: textureKibble } );
    materialKibble.side = THREE.DoubleSide;


    // Scatter kibble in specific patterns.
    // Be sure not to go beyond the available area.

    // First trail.
    for (let i = 0; i < 5; i ++) {
      meshKibble = new THREE.Mesh( geometryKibble, materialKibble );
      meshKibble.rotation.x = mesh.rotation.x
      meshKibble.rotation.y = mesh.rotation.y
      meshKibble.rotation.z = mesh.rotation.z
      meshKibble.position.x = 100 + 400 * i
      meshKibble.position.y = 0;
      meshKibble.scale.set(
        meshKibble.scale.x = meshKibble.scale.x * 0.8,
        meshKibble.scale.y = meshKibble.scale.y * 0.8,
        meshKibble.scale.z = meshKibble.scale.z * 0.8,
      )
      meshKibble.name = 'Kibble'
      scene.add( meshKibble );
      spheres.push( meshKibble );
    }

    // First set of waves.
    for (let i = 0; i < 50; i ++) {
      meshKibble = new THREE.Mesh( geometryKibble, materialKibble );
      meshKibble.rotation.x = mesh.rotation.x
      meshKibble.rotation.y = mesh.rotation.y
      meshKibble.rotation.z = mesh.rotation.z
      meshKibble.position.x = 2100 + 300 * i
      meshKibble.position.y = Math.abs(Math.sin(0.25 * i) * (1000 - 0) + 0);
      meshKibble.scale.set(
        meshKibble.scale.x = meshKibble.scale.x * 0.8,
        meshKibble.scale.y = meshKibble.scale.y * 0.8,
        meshKibble.scale.z = meshKibble.scale.z * 0.8,
      )
      meshKibble.name = 'Kibble'
      scene.add( meshKibble );
      spheres.push( meshKibble );
    }

    // First diagonal line pointing up.
    for (let i = 0; i < 10; i ++) {
      meshKibble = new THREE.Mesh( geometryKibble, materialKibble );
      meshKibble.rotation.x = mesh.rotation.x
      meshKibble.rotation.y = mesh.rotation.y
      meshKibble.rotation.z = mesh.rotation.z
      meshKibble.position.x = 17200 + i * 400;
      meshKibble.position.y = 400 + 100 * i;
      meshKibble.scale.set(
        meshKibble.scale.x = meshKibble.scale.x * 0.8,
        meshKibble.scale.y = meshKibble.scale.y * 0.8,
        meshKibble.scale.z = meshKibble.scale.z * 0.8,
      )
      meshKibble.name = 'Kibble'
      scene.add( meshKibble );
      spheres.push( meshKibble );
    }
    
    // Second diagonal line pointing up.
    for (let i = 0; i < 10; i ++) {
      meshKibble = new THREE.Mesh( geometryKibble, materialKibble );
      meshKibble.rotation.x = mesh.rotation.x
      meshKibble.rotation.y = mesh.rotation.y
      meshKibble.rotation.z = mesh.rotation.z
      meshKibble.position.x = 21600 + i * 400;
      meshKibble.position.y = 850 + 100 * i;
      meshKibble.scale.set(
        meshKibble.scale.x = meshKibble.scale.x * 0.8,
        meshKibble.scale.y = meshKibble.scale.y * 0.8,
        meshKibble.scale.z = meshKibble.scale.z * 0.8,
      )
      meshKibble.name = 'Kibble'
      scene.add( meshKibble );
      spheres.push( meshKibble );
    }

    // Long straight line.
    for (let i = 0; i < 50; i ++) {
      meshKibble = new THREE.Mesh( geometryKibble, materialKibble );
      meshKibble.rotation.x = mesh.rotation.x
      meshKibble.rotation.y = mesh.rotation.y
      meshKibble.rotation.z = mesh.rotation.z
      meshKibble.position.x = 26000 + 300 * i
      meshKibble.position.y = 1850;
      meshKibble.scale.set(
        meshKibble.scale.x = meshKibble.scale.x * 0.8,
        meshKibble.scale.y = meshKibble.scale.y * 0.8,
        meshKibble.scale.z = meshKibble.scale.z * 0.8,
      )
      meshKibble.name = 'Kibble'
      scene.add( meshKibble );
      spheres.push( meshKibble );
    }

    // Diagonal line pointing down.
    for (let i = 0; i < 11; i ++) {
      meshKibble = new THREE.Mesh( geometryKibble, materialKibble );
      meshKibble.rotation.x = mesh.rotation.x
      meshKibble.rotation.y = mesh.rotation.y
      meshKibble.rotation.z = mesh.rotation.z
      meshKibble.position.x = 41000 + i * 400;
      meshKibble.position.y = 1850 - 100 * i;
      meshKibble.scale.set(
        meshKibble.scale.x = meshKibble.scale.x * 0.8,
        meshKibble.scale.y = meshKibble.scale.y * 0.8,
        meshKibble.scale.z = meshKibble.scale.z * 0.8,
      )
      meshKibble.name = 'Kibble'
      scene.add( meshKibble );
      spheres.push( meshKibble );
    }

    // Second set of waves.
    for (let i = 0; i < 100; i ++) {
      meshKibble = new THREE.Mesh( geometryKibble, materialKibble );
      meshKibble.rotation.x = mesh.rotation.x
      meshKibble.rotation.y = mesh.rotation.y
      meshKibble.rotation.z = mesh.rotation.z
      meshKibble.position.x = 45600 + 400 * i
      meshKibble.position.y = Math.abs(Math.sin(0.25 * i) * (1000 - 500) + 500);
      meshKibble.scale.set(
        meshKibble.scale.x = meshKibble.scale.x * 0.8,
        meshKibble.scale.y = meshKibble.scale.y * 0.8,
        meshKibble.scale.z = meshKibble.scale.z * 0.8,
      )
      meshKibble.name = 'Kibble'
      scene.add( meshKibble );
      spheres.push( meshKibble );
    }

    // SOMEWHERE HERE ADD SOMETHING TO MAKE EMILIO HUGE.
    geometryTreat = new THREE.BoxBufferGeometry( radius*5, radius*5, radius*5 );
    materialTreat = new THREE.MeshBasicMaterial( { map: textureTreat, transparent: true, } );
    materialTreat.side = THREE.DoubleSide;
    meshTreat = new THREE.Mesh( geometryTreat, materialTreat );
    meshTreat.position.x = 85495;
    meshTreat.position.y = Math.random() * (1700 - 500) + 500;
    meshTreat.scale.set(
      meshTreat.scale.x = meshTreat.scale.x * 0.8,
      meshTreat.scale.y = meshTreat.scale.y * 0.8,
      meshTreat.scale.z = meshTreat.scale.z * 0.8,
    )
    meshTreat.name = 'Treat'
    scene.add( meshTreat );

    // 1/3 Stacks of kibble.
    for (let i = 0; i < 20; i ++) {
      meshKibble = new THREE.Mesh( geometryKibble, materialKibble );
      meshKibble.rotation.x = mesh.rotation.x
      meshKibble.rotation.y = mesh.rotation.y
      meshKibble.rotation.z = mesh.rotation.z
      meshKibble.position.x = 86000 + 200 * i
      meshKibble.position.y = 100;
      meshKibble.scale.set(
        meshKibble.scale.x = meshKibble.scale.x * 0.8,
        meshKibble.scale.y = meshKibble.scale.y * 0.8,
        meshKibble.scale.z = meshKibble.scale.z * 0.8,
      )
      meshKibble.name = 'Kibble'
      scene.add( meshKibble );
      spheres.push( meshKibble );
    }

    // 2/3 Stacks of kibble.
    for (let i = 0; i < 20; i ++) {
      meshKibble = new THREE.Mesh( geometryKibble, materialKibble );
      meshKibble.rotation.x = mesh.rotation.x
      meshKibble.rotation.y = mesh.rotation.y
      meshKibble.rotation.z = mesh.rotation.z
      meshKibble.position.x = 86000 + 200 * i
      meshKibble.position.y = 350;
      meshKibble.scale.set(
        meshKibble.scale.x = meshKibble.scale.x * 0.8,
        meshKibble.scale.y = meshKibble.scale.y * 0.8,
        meshKibble.scale.z = meshKibble.scale.z * 0.8,
      )
      meshKibble.name = 'Kibble'
      scene.add( meshKibble );
      spheres.push( meshKibble );
    }

    // 3/3 Stacks of kibble.
    for (let i = 0; i < 20; i ++) {
      meshKibble = new THREE.Mesh( geometryKibble, materialKibble );
      meshKibble.rotation.x = mesh.rotation.x
      meshKibble.rotation.y = mesh.rotation.y
      meshKibble.rotation.z = mesh.rotation.z
      meshKibble.position.x = 86000 + 200 * i
      meshKibble.position.y = 600;
      meshKibble.scale.set(
        meshKibble.scale.x = meshKibble.scale.x * 0.8,
        meshKibble.scale.y = meshKibble.scale.y * 0.8,
        meshKibble.scale.z = meshKibble.scale.z * 0.8,
      )
      meshKibble.name = 'Kibble'
      scene.add( meshKibble );
      spheres.push( meshKibble );
    }

    // Third set of waves.
    for (let i = 0; i < 80; i ++) {
      meshKibble = new THREE.Mesh( geometryKibble, materialKibble );
      meshKibble.rotation.x = mesh.rotation.x
      meshKibble.rotation.y = mesh.rotation.y
      meshKibble.rotation.z = mesh.rotation.z
      meshKibble.position.x = 90400 + 400 * i
      meshKibble.position.y = Math.abs(Math.sin(0.15 * i) * (600 - 0) + 0);
      meshKibble.scale.set(
        meshKibble.scale.x = meshKibble.scale.x * 0.8,
        meshKibble.scale.y = meshKibble.scale.y * 0.8,
        meshKibble.scale.z = meshKibble.scale.z * 0.8,
      )
      meshKibble.name = 'Kibble'
      scene.add( meshKibble );
      spheres.push( meshKibble );
    }

    // RANDOM!!!
    for (var i = 0; i < 224; i ++) {
      meshKibble = new THREE.Mesh( geometryKibble, materialKibble );
      meshKibble.rotation.x = mesh.rotation.x
      meshKibble.rotation.y = mesh.rotation.y
      meshKibble.rotation.z = mesh.rotation.z
      meshKibble.position.x = Math.random() * (160000 - 122800) + 122800;
      meshKibble.position.y = Math.random() * (400 - 200) + 200;
      meshKibble.scale.set(
        meshKibble.scale.x = meshKibble.scale.x * 0.8,
        meshKibble.scale.y = meshKibble.scale.y * 0.8,
        meshKibble.scale.z = meshKibble.scale.z * 0.8,
      )
      meshKibble.name = 'Kibble'
      scene.add( meshKibble );
      spheres.push( meshKibble );
    }

    this.setState({
      totalKibble: spheres.length,
    })
  }
  

  eatKibble = () => {
    // Use Raycaster to detect intersections.
    if (superPug) {
      raycaster.set(
        new THREE.Vector3(mesh.position.x, mesh.position.y-250, 0), // origin
        new THREE.Vector3(0, 250, 0).normalize(), // direction
      )
    } else {
      raycaster.set(
        mesh.position, // origin
        new THREE.Vector3(-1, 1, 0), // direction
      )
    }

    mesh.geometry.computeBoundingSphere();

    intersects = raycaster.intersectObjects( spheres );
    isEating = false

    if (intersects.length > 0) {
      isEating = true

      kibbleID = intersects[0].object.uuid
      if (!kibbleIDs.includes(kibbleID)) {
        kibbleIDs.push( kibbleID )

        this.setState({
          emilio: {
            isEating: true
          },
          kibbleEaten: this.state.kibbleEaten + 1,
        })
      }
    } else {
      isEating = false
      this.setState({
        emilio: {
          isEating: false
        }
      })
    }

    intersectsTreat = raycaster.intersectObject( meshTreat );
    if (intersectsTreat.length > 0) {
      treatID = intersectsTreat[0].object.uuid

      if (!treatIDs.includes(treatID)) {
        treatIDs.push( treatID )

        intersectsTreat[0].object.visible = false;
        this.setState({
          kibbleEaten: this.state.kibbleEaten + 50,
        })

        superPug = true
      }
    }

    for ( let i = 0; i < intersects.length; i++ ) {
      if (intersects.length > 0) {
        if (intersects[i].object.name === 'Kibble') {
          intersects[i].object.visible = false;
        }
      }
    }
  }


  eat = () => {
    if (!isTwirling) {
      mesh.rotation.x = -0.2
      mesh.rotation.y = 6.5
      mesh.rotation.z = -1.2
    }

    mesh.material.map = textureOpen
  }


  twirl = () => {
    switch (isTwirling) {
      case true:
        mesh.rotation.z = -1.2;
        mesh.rotation.x = -0.1;
        mesh.rotation.y = timeTwirling;

        if (mesh.rotation.y >= 34) {
          mesh.rotation.y = 34.4
        }
        break
      case false:
        mesh.rotation.x = 0;
        mesh.rotation.y = 6.5
        break
      default:
        return
    }
  }


  jump = () => {
    timeJumping += timeJumping + 1;
    
    if (timeJumping <= 150) {
      if (mesh.position.y < 4000) {
        mesh.position.y += 30 + Math.sin(timeJumping)*2;
      }
    } else {
      isJumping = false;
      timeJumping = 0;
    }
  }


  rotateCamera = () => {
    if (this.state.width < this.state.height) {
      camera.up = new THREE.Vector3(-1,0,0);
      goal.position.set( 0, 0, 3000 );
      camera.updateProjectionMatrix();

      document.body.classList.add('mobile');

      isMobile = true;
    }
  }


  endGame = () => {
    superPug = true
    gameEnded = true
    mesh.position.x = 165000

    let topFive = [].concat(this.state.topPlayers)
          .sort((a, b) => b.score - a.score)
          .slice(0, 5)
          .map((player, i) => {
            if (this.state.kibbleEaten >= player.score) {
              isTopFive = true
            }
          })

    if (topFive.length === 0) {
      isTopFive = true
    }

    for (let i = 0; i > 10; i++) {
      cancelAnimationFrame(start)
    }
  }


  componentDidMount() {
    container = document.querySelector('.game');

    this.init();
    this.animate();
    this.rotateCamera();

    document.addEventListener('keydown', event => {
      //  Jump
      if (event.keyCode === 32) {
        isJumping = true;
      }

      // Tail
      if (event.keyCode === 84) {
        switch (isTwirling) {
          case false:
            isTwirling = true
            break
          case true:
            isTwirling = false
            break
          default:
            return;
        }
      }

      // ArrowLeft -- Pause
      if (event.keyCode === 37) {
        let currentPos = mesh.position.x
        mesh.position.lerp(
          new THREE.Vector3(
            currentPos-20000,
            mesh.position.y,
            0
          ),
        0.1)
      }

      // ArrowRight -- Go
      if (event.keyCode === 39) {
        let currentPos = mesh.position.x
        mesh.position.lerp(
          new THREE.Vector3(
            currentPos+20000,
            mesh.position.y,
            0
          ),
        0.1)
      }
      
      if (event.keyCode === 80) {
        pause = pause ? false : true;
        if (pause) {
          cancelAnimationFrame(start)
        } else {
          requestAnimationFrame(this.animate)
        }
      }
    });

    window.addEventListener('touchstart', () => {
      isJumping = true
    });

    const playersRef = firebase.database().ref('players');
    playersRef.on('value', (snapshot) => {
      let players = snapshot.val();
      let newState = [];
      for (let player in players) {
        newState.push({
          id: player,
          name: players[player].name,
          score: players[player].score,
          time: players[player].time
        });
      }
      this.setState({
        topPlayers: newState
      });
    });
  }


  render() {
    return (
      <div className="container">
        {isTopFive && (
        <div className="form">
            <div className="form-wrapper">
              <h1>
                WH<span className="butt-container"><img src="img/butt.png" className="image image-butt"/></span>A

                <span className="form-score">
                  { this.state.kibbleEaten }!
                </span>
              </h1>

              <h2>You made it onto<br/>Emilio's leaderboard</h2>

              <form onSubmit={this.handleSubmit}>
                <input type="text" maxLength="12" name="playerName" placeholder="Type your name" autoComplete="off" onChange={this.handleChange} value={this.state.playerName} />
                <button onClick={this.handleClick}>Submit</button>
              </form>
            </div>
          </div>
        )}

        {gameEnded && (
        <div className={!isTopFive ? "leaderboard fade-in" : "leaderboard"}>
          <div className="leaderboard-wrapper">
            <h1>T<span className="butt-container"><img src="img/butt.png" className="image image-butt"/></span>P PLAYERS</h1>
            {[].concat(this.state.topPlayers)
            .sort((a, b) => b.time - a.time)
            .sort((a, b) => b.score - a.score)
            .slice(0, 5)
            .map((player, i) => 
              <div className="player" key={i}>
                <div className="player-name">
                  <h2>{player.name}</h2>
                </div>
                <div className="player-score">
                  <h2>{player.score}</h2>
                </div>
              </div>
            )}
            <button onClick={this.handleRefresh}>Play Again</button>
          </div>
        </div>
        )}

        <div className="game">
          {/* {isMobile && (
          <div className="pause">Pause</div>
          )} */}

          <div className="note">
            <span className="desktop">press the spacebar</span>
            <span className="mobile-div">tap to jump</span>
          </div>

          <div id="count" className={`${this.state.emilio.isEating ? 'active' : ''}`}>
            { this.state.kibbleEaten } / { this.state.totalKibble }
          </div>

          <div className="emiliocanvas"></div>
        </div>
      </div>
    );
  }
}


export default EmilioGame;
