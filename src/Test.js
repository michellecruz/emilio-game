import React, { Component } from 'react';
import * as THREE from 'three';
import { Sky } from 'three/examples/jsm/objects/Sky.js';

let camera, scene, renderer, canvas;
let geometry, texture, textureOpen, material, mesh;
let geometryKibble, textureKibble, materialKibble, meshKibbleFixed;
let spheres = [];
let radius = 100,
    raycaster,
    intersects,
    cancel,
    sky, sunSphere;

let isTwirling = false,
    timeTwirling = 0,
    isEating = false,
    timeEating = 0,
    isJumping = false,
    timeJumping = 0;

    
class Test extends Component {
  state = {
    width: window.innerWidth,
    height: window.innerHeight,
    kibbleEaten: 0,
    emilio: {
      isEating: false,
      isTwirling: false,
      position: {
        x: -700,
        y: 500,
        z: 100,
      },
      rotation: {
        x: 0, //-0.1,
        y: 6.6, //6.6,
        z: 0, //-1.2,
      },
    }
  }

  init = () => {
    let container = document.querySelector( '.container'),
        emilioCanvas = document.querySelector('.emiliocanvas');

    // Load textures.
    texture = new THREE.TextureLoader().load( 'img/emilio-0.jpg' );
    textureOpen = new THREE.TextureLoader().load( 'img/emilio-1.jpg' );
    textureKibble = new THREE.TextureLoader().load( 'img/kibble.png' );
    
    // Set up the initial scene
    camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.set( 0, 100, 1000 );
    camera.updateProjectionMatrix();

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xffffff );

    // Draw Emilio shape & texture
    geometry = new THREE.SphereBufferGeometry( radius, 32, 32 );
    material = new THREE.MeshBasicMaterial( { map: texture } );
    mesh = new THREE.Mesh( geometry, material );
    mesh.name = "Emilio";

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
  
    // Scatter the treats!
    raycaster = new THREE.Raycaster();
    this.addKibble();

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

  addKibble = () => {
    geometryKibble = new THREE.SphereBufferGeometry( 50, 8, 16 );
    materialKibble = new THREE.MeshBasicMaterial( { map: textureKibble, transparent: true } );

    // Place the first piece of kibble
    meshKibbleFixed = new THREE.Mesh( geometryKibble, materialKibble );
    meshKibbleFixed.position.x = 0 //100
    meshKibbleFixed.position.y = 100 //50
    meshKibbleFixed.position.z = 200
    meshKibbleFixed.name = 'Kibble'

    scene.add( meshKibbleFixed );
    spheres.push( meshKibbleFixed );

    // Scatter 50 pieces of kibble in random positions
    // Be sure not to go beyond the available area.
    for (var i = 0; i < 50; i ++) {
      let meshKibble = new THREE.Mesh( geometryKibble, materialKibble );
            
      meshKibble.position.x = Number((Math.random() * (10000 - 500) + 500).toFixed(0));
      meshKibble.position.y = Number((Math.random() * (500 - 0) + 0).toFixed(0));
      meshKibble.position.z = 200;
      meshKibble.material.map.needsUpdate = true;
      meshKibble.name = 'Kibble'

      spheres.push( meshKibble );
      scene.add( meshKibble );
    }
  }

  animate = () => {
    // This creates the animation.
    requestAnimationFrame(this.animate);

    // Emilio moves left by 10x every ~16.7 milliseconds.
    mesh.position.x += 10;

    // Have the camera follow Emilio.
    camera.position.x = mesh.position.x;
    camera.lookAt(mesh.position.x, mesh.position.y, 0);
    camera.updateProjectionMatrix();

    // "Gravity"
    // If Emilio is in the air, move faster while falling to the ground.
    // Give appearance of jumping quickly by rotating Emilio.
    if (mesh.position.y > 10) {
      mesh.position.x += 1 * (mesh.position.y * 0.05) * Math.sin(1);
      mesh.position.y -= 10 * Math.sin(1);
      mesh.rotation.z += 0.0005 * mesh.position.y;
      mesh.material.map = textureOpen;
    } else {
      mesh.rotation.z -= 0.1;
      mesh.position.y = 0;
    }

    // Also once past the middle of the screen, make Emilio continue to get smaller up until
    // a certain point.
    if (mesh.position.y >= 0) {
      // if (mesh.scale.x > 0.2) {
      //   mesh.scale.set(
      //     mesh.scale.x -= 0.0001,
      //     mesh.scale.y -= 0.0001,
      //     mesh.scale.z -= 0.0001
      //   );
      // }
    }

    // Render the screen.
    renderer.render( scene, camera );

    // If Emilio is on the ground and is not eating,
    // close his mouth.
    if (mesh.position.y <= 0 && !isEating) {
      mesh.material.map = texture;
    }

    let kibble;
    // Start tracking if Emilio is eating kibble.
    for (var i = 0; i < spheres.length; i ++) {
      spheres[i].rotation.x = 0
      spheres[i].rotation.y = 0
      spheres[i].position.z = 150
      // spheres[i].position.y = 0

      mesh.rotation.x = 0
      // mesh.rotation.y = 0
      // mesh.rotation.z = 0
      mesh.position.z = 100
      
      this.eatKibble(spheres[i]);
      kibble = spheres[i];
    }

    // If Emilio is jumping, run this function. 
    if (isJumping) {
      this.jump();
    }

    // If Emilio is twirling, run this function.
    if (isTwirling) {
      this.twirl();
    }

    if (isEating) {
      this.eat();
    }
  }

  // spheresIntersect = (sphere1, sphere1position) => {
  //   function distanceVector( v1, v2 ) {
  //       var dx = v1.x - v2.x;
  //       var dy = v1.y - v2.y;
  //       return Math.sqrt( dx * dx + dy * dy );
  //   }
  //   return distanceVector(sphere1position, mesh.position) <= (sphere1.radius, mesh.geometry.boundingSphere.radius);
  // }

  eatKibble = (kibble) => {
    // isEating = this.spheresIntersect(
    //   kibble.geometry.boundingSphere,
    //   kibble.position,
    // );

    // Use Raycaster to detect intersections.
    raycaster.setFromCamera({
      x: kibble.position.x,
      y: 0
    }, camera)

    intersects = raycaster.intersectObjects( scene.children );

    for ( let i = 0; i < intersects.length; i++ ) {
      if (intersects.length > 1) {
        isEating = true;
        
        if (intersects[i].object.name === 'Kibble') {
          intersects[i].object.visible = false;
          // mesh.position.z = mesh.position.z * 0.1
          // mesh.scale.set(mesh.scale.x + 0.01, mesh.scale.y + 0.01, mesh.scale.z + 0.01);
        }

        this.setState({
          emilio: {
            isEating: true
          },
          kibbleEaten: this.state.kibbleEaten + 1,
        })
      } else {
        isEating = false;
        timeEating = 0;

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

    if (timeTwirling < 110) {
      if (timeTwirling < 30) {
        mesh.rotation.y += 0.5;
      } else if (timeTwirling >= 30 && timeTwirling < 70) {
        mesh.rotation.z = -1.2;
        mesh.rotation.y = 22.1;
        mesh.rotation.x = -0.1;

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
        mesh.rotation.y -= 1;

        if (mesh.rotation.y <= 6.6) {
          isTwirling = false;
          timeTwirling = 0;
          mesh.rotation.y = 6.6;
        }
      }
    }
  }

  jump = () => {
    timeJumping += timeJumping + 1;

    if (timeJumping <= 150) {
      if (mesh.position.y < 500) {
        mesh.position.y += 30;
      }
    } else {
      isJumping = false;
      timeJumping = 0;
    }
  }

  noop = () => {};

  // Creating setTimeOut using requestAnimationFrame
  requestTimeout = (fn, delay, registerCancel) => {
    const start = new Date().getTime();

    const loop = () => {
      const delta = new Date().getTime() - start;

      if (delta >= delay) {
        fn();
        registerCancel(this.noop);
        return;
      }

      const raf = requestAnimationFrame(loop);
      registerCancel(() => cancelAnimationFrame(raf));
    };

    const raf = requestAnimationFrame(loop);
    registerCancel(() => cancelAnimationFrame(raf));
  };

  componentDidMount() {
    this.init();
    this.animate();

    document.addEventListener('keydown', event => {
      if (event.keyCode === 32) {
        isJumping = true;
      }

      if (event.keyCode === 84) {
        isTwirling = true;
      }
    });

    window.addEventListener('touchstart', this.jump);
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
