import React, { Component } from 'react';
import * as THREE from 'three';

import { HorizontalBlurShader } from 'three/examples/jsm/shaders/HorizontalBlurShader.js';
import { VerticalBlurShader } from 'three/examples/jsm/shaders/VerticalBlurShader.js';

let camera, scene, renderer, canvas;
let geometry, texture, textureOpen, material, mesh;
let ghost;
let geometryKibble, textureKibble, materialKibble, meshKibble, meshKibbleFixed;
let spheres = [],
    maxKibbleX,
    maxKibbleY;

let radius = 100,
    raycaster,
    intersects,
    goal,
    temp,
    axis;

let isTwirling = false,
    timeTwirling = 0,
    isEating = false,
    isJumping = false,
    timeJumping = 0;

// Shadow Classes
let shadowGroup, renderTarget, renderTargetBlur, shadowCamera, cameraHelper, depthMaterial, horizontalBlurMaterial, verticalBlurMaterial;
let plane, blurPlane, fillPlane;

const PLANE_WIDTH = window.innerWidth * 4;
const PLANE_HEIGHT = window.innerHeight * 4;
const CAMERA_HEIGHT = 100;
      


class Test extends Component {
  state = {
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
    kibbleEaten: 0,
    emilio: {
      isEating: false,
      isTwirling: false,
      position: {
        x: -700,
        y: 500,
        z: 0,
      },
      rotation: {
        x: -0.1, //-0.1,
        y: 6.6, //6.6,
        z: 0, //-1.2,
      },
    }
  }


  init = () => {
    let container = document.querySelector( '.container'),
        emilioCanvas = document.querySelector('.emiliocanvas');

    // Load textures.
    texture = new THREE.TextureLoader().load( 'img/emilio-0-new.jpg' );
    textureOpen = new THREE.TextureLoader().load( 'img/emilio-1-new.jpg' );
    textureKibble = new THREE.TextureLoader().load( 'img/kibble.png' );
    
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
    material.wireframe = true;

    // Add a ghost for the camera to follow.
    ghost = new THREE.Mesh( );
    ghost.visible = false
    goal = new THREE.Object3D();
    ghost.add( goal );
    temp = new THREE.Vector3();
    goal.position.set( 0, 400, 2000 );

    // Set Emilio's initial position
    mesh.position.x = this.state.emilio.position.x
    mesh.position.y = this.state.emilio.position.y
    mesh.position.z = this.state.emilio.position.z

    // Emilio's initial rotation
    mesh.rotation.x = this.state.emilio.rotation.x
    mesh.rotation.y = this.state.emilio.rotation.y
    mesh.rotation.z = this.state.emilio.rotation.z

    // Needed in order to update Emilio's texture
    mesh.material.map.needsUpdate = true;

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
    horizontalBlurMaterial.uniforms.h.value = amount * 1 / 256; //256

    renderer.setRenderTarget( renderTargetBlur );
    renderer.render( blurPlane, shadowCamera );

    // blur vertically and draw in the main renderTarget
    blurPlane.material = verticalBlurMaterial;
    blurPlane.material.uniforms.tDiffuse.value = renderTargetBlur.texture;
    verticalBlurMaterial.uniforms.v.value = amount * 1 / 256; //256

    renderer.setRenderTarget( renderTarget );
    renderer.render( blurPlane, shadowCamera );

    blurPlane.visible = false;
  }


  addKibble = () => {
    geometryKibble = new THREE.BoxBufferGeometry( radius*2, radius*2, radius*2 );//new THREE.SphereBufferGeometry( radius, 32, 32 );
    materialKibble = new THREE.MeshBasicMaterial( { map: textureKibble, transparent: true } );
    materialKibble.side = THREE.DoubleSide;
    // materialKibble.wireframe = true

    // Place the first piece of kibble
    meshKibbleFixed = new THREE.Mesh( geometryKibble, materialKibble );
    meshKibbleFixed.position.x = maxKibbleX //100
    meshKibbleFixed.position.y = maxKibbleY //50
    meshKibbleFixed.name = 'Kibble'

    scene.add( meshKibbleFixed );
    spheres.push( meshKibbleFixed );

    // Scatter 100 pieces of kibble in random positions
    // Be sure not to go beyond the available area.
    maxKibbleX = (80000 - 2000)
    maxKibbleY = (800 - 0)
    for (var i = 0; i < 100; i ++) {
      meshKibble = new THREE.Mesh( geometryKibble, materialKibble );

      meshKibble.position.x = Math.random() * maxKibbleX + 2000;
      meshKibble.position.y = Math.random() * maxKibbleY + 0;
      meshKibble.name = 'Kibble'

      scene.add( meshKibble );
      spheres.push( meshKibble );
    }
  }


  animate = () => {
    // This creates the animation.
    requestAnimationFrame(this.animate);

    // Emilio moves left by 10x every ~16.7 milliseconds.
    mesh.position.x += 20;

    ghost.position.x = mesh.position.x;
    ghost.position.y = mesh.position.y;

    shadowGroup.position.x = mesh.position.x;

    // Make Emilio continue to get smaller up until minimum scale.
    // if (mesh.scale.x > 0.2) {
    //   mesh.scale.set(
    //     mesh.scale.x -= 0.0005,
    //     mesh.scale.y -= 0.0005,
    //     mesh.scale.z -= 0.0005
    //   );
    // }

    // Gravity
    // If Emilio is in the air, move faster while falling to the ground.
    if (mesh.position.y > 10) {
      mesh.position.x += 1 * (mesh.position.y * 0.05) * Math.sin(1);
      mesh.position.y -= 10 * Math.sin(1);

      if (!isEating) {
        mesh.material.map = textureOpen;
      }
    } else {
      mesh.position.y = 0;
    }

    // Rotate Emilio based on his direction
    axis = new THREE.Vector3();
    // Axis orthogonal to forward vector
    axis.set( mesh.position.x, mesh.position.y, 0 ).normalize();
    axis.cross( THREE.Object3D.DefaultUp );
    mesh.rotateOnAxis( axis, -0.05 );


    // Have the camera follow Emilio.
    temp.setFromMatrixPosition(goal.matrixWorld);
    camera.position.lerp(temp, 0.04);
    camera.lookAt( ghost.position );
    // camera.lookAt( ghost.position.x, ghost.position.y, spheres[1].position.z );
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
    if (mesh.position.y <= 0 && !isEating) {
      mesh.material.map = texture;
    }

    // Start tracking if Emilio is eating kibble.
    for (var i = 0; i < spheres.length; i ++) {
      // spheres[i].rotation.x = 0
      // spheres[i].rotation.y = 0
      // spheres[i].rotation.y = mesh.rotation.y
      // spheres[i].position.y = 120
      // spheres[i].position.z = 100

      // mesh.position.z = 100
    }
    this.eatKibble();

    // If Emilio is jumping, run this function. 
    if (isJumping) {
      this.jump();
    }

    // If Emilio is twirling, run this function.
    if (isTwirling) {
      this.twirl();
    }

    if (isEating) {
      // this.eat();
    }

    // Render the screen.
    renderer.render( scene, camera );
    camera.updateProjectionMatrix();
  }


  eatKibble = () => {
    // Use Raycaster to detect intersections.
    raycaster.set(
      mesh.position,
      new THREE.Vector3(-1, 1, 0),
    )

    intersects = raycaster.intersectObjects( spheres );
    
    for ( let i = 0; i < intersects.length; i++ ) {
      if (intersects.length > 0) {
        if (intersects[i].object.name === 'Kibble') {
          isEating = true;
          intersects[i].object.visible = false;
          // mesh.scale.set(mesh.scale.x + 0.01, mesh.scale.y + 0.01, mesh.scale.z + 0.01);

          this.setState({
            emilio: {
              isEating: true
            },
            kibbleEaten: this.state.kibbleEaten + 1,
          })
        }
      } else {
        isEating = false;

        this.setState({
          emilio: {
            isEating: false
          }
        })
      }
    }
  }


  eat = () => {
    mesh.rotation.x = -0.2
    mesh.rotation.y = 6.5
    mesh.rotation.z = -1.2

    requestAnimationFrame(() => {
      if (mesh.material.map === texture) {
        setTimeout(() => {
          mesh.material.map = textureOpen

          if (mesh.material.map === textureOpen) {
            setTimeout(() => {
              mesh.material.map = texture
            }, 60);
          }
        }, 60);
      } else {
        setTimeout(() => {
          mesh.material.map = texture
        }, 60);
      }
    });
  }


  twirl = () => {
    timeTwirling += 1;
    // mesh.rotation.y = 0

    if (timeTwirling < 110) {
      if (timeTwirling < 30) {
        mesh.rotation.z = -1.2;
        mesh.rotation.x = -0.1;

        let max = 30;
        for (let i = 0; i < max; i++) {
          mesh.rotation.y += 1;
        }

      } else if (timeTwirling >= 30 && timeTwirling < 70) {
        // mesh.rotateOnAxis( axis, 0.9 );
        if (timeTwirling >= 35 && timeTwirling < 40) {
          mesh.material.map = textureOpen
        } else if (timeTwirling >= 45 && timeTwirling < 50) {
          mesh.material.map = texture
        } else if (timeTwirling >= 50 && timeTwirling < 55) {
          mesh.material.map = textureOpen
        } else if (timeTwirling >= 55 && timeTwirling < 60) {
          mesh.material.map = texture
        } else if (timeTwirling >= 60 && timeTwirling < 65) {
          mesh.material.map = textureOpen
        } else {
          mesh.material.map = texture
        }

      } else if (timeTwirling >= 70 && timeTwirling < 110) {
        // mesh.rotation.y -= 1;

        if (mesh.rotation.y <= 6.6) {
          isTwirling = false;
          timeTwirling = 0;
        }
      }
    }
  }


  jump = () => {
    timeJumping += timeJumping + 1;

    if (timeJumping <= 150) {
      if (mesh.position.y < 4000) {
        mesh.position.y += 30;
      }
    } else {
      isJumping = false;
      timeJumping = 0;
    }
  }


  rotateCamera = () => {
    if (this.state.width < this.state.height) {
      camera.up = new THREE.Vector3(-1,0,0);
      camera.updateProjectionMatrix();

      document.body.classList.add('mobile');
    }
  }


  componentDidMount() {
    this.init();
    this.animate();
    this.rotateCamera();

    document.addEventListener('keydown', event => {
      if (event.keyCode === 32) {
        isJumping = true;
      }

      if (event.keyCode === 84) {
        isTwirling = true;
      }
    });

    window.addEventListener('touchstart', () => {
      isJumping = true
    });
  }


  render() {
    return (
      <div className="container">
        <div className="note">press the spacebar or tap to jump</div>
        <div id="count" className={`${this.state.emilio.isEating ? 'active' : ''}`}>{ this.state.kibbleEaten }</div>
        <div className="emiliocanvas"></div>
      </div>
    );
  }
}


export default Test;
