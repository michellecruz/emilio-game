import React, { Component } from 'react';
import * as THREE from 'three';

let camera, scene, renderer, canvas;
let geometry, texture, textureOpen, material, mesh;
<<<<<<< Updated upstream
let geometryKibble, textureKibble, materialKibble;
let meshKibble, meshKibble2, meshKibble3, meshKibble4, meshKibble5, meshKibble6;
=======
let geometryKibble, textureKibble, materialKibble, meshKibbleFixed;
let spheres = [];
let radius = 100,
    raycaster,
    intersects,
    cancel;

let isTwirling = false,
    timeTwirling = 0,
    isEating = false,
    timeEating = 0,
    isJumping = false,
    timeJumping = 0;
>>>>>>> Stashed changes

class Test extends Component {
  state = {
    width: window.innerWidth,
    height: window.innerHeight,
    kibbleEaten: 0,
    emilio: {
      isEating: null,
      isTwirling: false,
      position: {
        x: -700,
        y: 500,
        z: 100,
      },
      rotation: {
        x: 0, //-0.1,
        y: 0, //6.6,
        z: 0, //-1.2,
      },
    }
  }

  init = () => {
<<<<<<< Updated upstream
    // Load textures.
    texture = new THREE.TextureLoader().load( 'img/milio4.jpg' );
    textureOpen = new THREE.TextureLoader().load( 'img/milio4-open.jpg' );
    
    // Set up the initial scene
    camera = new THREE.PerspectiveCamera( 1.8, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.set( 0, 5, 1000 );
=======
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
>>>>>>> Stashed changes

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xffffff );

    // Draw Emilio shape & texture
    geometry = new THREE.SphereBufferGeometry( radius, 32, 32 );
    material = new THREE.MeshBasicMaterial( { map: texture } );
    mesh = new THREE.Mesh( geometry, material );
    mesh.name = "Emilio";

<<<<<<< Updated upstream
    // Emilio's initial position
=======
    // Set Emilio's initial position
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
    this.kibble();

    // Draw the canvas and append to the dom
=======
    raycaster = new THREE.Raycaster();
    this.addKibble();

    // Draw the canvas.
>>>>>>> Stashed changes
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( this.state.width, this.state.height );

<<<<<<< Updated upstream
    let container = document.querySelector('.container'),
        emilioCanvas = document.querySelector('.emiliocanvas');
        
=======
    // Replace div in the dom with new canvas.
>>>>>>> Stashed changes
    container.replaceChild( renderer.domElement, emilioCanvas );

    canvas = renderer.getContext('2d').canvas;

    // Set width and height states to canvas width/height.
    // Best not to keep calling window.InnerWidth/Height.
    this.setState({
      width: canvas.clientWidth,
      height: canvas.clientHeight,
    })
  }

<<<<<<< Updated upstream
  kibble = () => {
    geometryKibble = new THREE.SphereBufferGeometry( 2, 32, 32 );
    textureKibble = new THREE.TextureLoader().load( 'img/kibble.png' );
    materialKibble = new THREE.MeshBasicMaterial( { map: textureKibble, transparent: true } );

    meshKibble = new THREE.Mesh( geometryKibble, materialKibble );
    meshKibble.rotation.y = 10
    meshKibble.position.x = 15
    meshKibble.position.y = 10
    meshKibble.position.z = 8
    scene.add( meshKibble );

    meshKibble2 = new THREE.Mesh( geometryKibble, materialKibble );
    meshKibble2.rotation.y = 10
    meshKibble2.position.x = 85
    meshKibble2.position.y = 15
    meshKibble2.position.z = 8
    scene.add( meshKibble2 );

    meshKibble3 = new THREE.Mesh( geometryKibble, materialKibble );
    meshKibble3.rotation.y = 10
    meshKibble3.position.x = 185
    meshKibble3.position.y = 5
    meshKibble3.position.z = 8
    scene.add( meshKibble3 );

    meshKibble4 = new THREE.Mesh( geometryKibble, materialKibble );
    meshKibble4.rotation.y = 10
    meshKibble4.position.x = 285
    meshKibble4.position.y = 20
    meshKibble4.position.z = 8
    scene.add( meshKibble4 );

    meshKibble5 = new THREE.Mesh( geometryKibble, materialKibble );
    meshKibble5.rotation.y = 10
    meshKibble5.position.x = 330
    meshKibble5.position.y = 8
    meshKibble5.position.z = 8
    scene.add( meshKibble5 );
  }

  animate = () => {
    requestAnimationFrame(this.animate);

    mesh.position.x += 0.2;

    if (mesh.position.y > 0) {
      mesh.position.x += 0.3;
      mesh.position.y -= 0.2;

      mesh.rotation.z += 0.01 * (mesh.position.y * 0.9);
=======
  addKibble = () => {
    geometryKibble = new THREE.SphereBufferGeometry( 30, 8, 30 );
    materialKibble = new THREE.MeshBasicMaterial( { map: textureKibble, transparent: true } );

    // Place the first piece of kibble
    meshKibbleFixed = new THREE.Mesh( geometryKibble, materialKibble );
    meshKibbleFixed.position.x = 0 //100
    meshKibbleFixed.position.y = 100 //50
    meshKibbleFixed.position.z = 0
    meshKibbleFixed.name = 'Kibble'

    scene.add( meshKibbleFixed );
    spheres.push( meshKibbleFixed );

    // Scatter 50 pieces of kibble in random positions
    // Be sure not to go beyond the available area.
    for (var i = 0; i < 60; i ++) {
      let meshKibble = new THREE.Mesh( geometryKibble, materialKibble );
            
      meshKibble.position.x = Number((Math.random() * (9000 - 500) + 500).toFixed(0));
      meshKibble.position.y = Number((Math.random() * (500 - 0) + 0).toFixed(0));
      meshKibble.position.z = mesh.position.z;
      meshKibble.material.map.needsUpdate = true;
      meshKibble.name = 'Kibble'

      scene.add( meshKibble );
    }

  }

  animate = () => {
    // This creates the animation.
    requestAnimationFrame(this.animate);

    // Emilio moves left by 10x every ~16.7 milliseconds.
    mesh.position.x += 10;
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
>>>>>>> Stashed changes
    } else {
      mesh.rotation.z -= 0.1;
      mesh.position.y = 0;
    }

<<<<<<< Updated upstream
    if (mesh.position.x > 0) {
      camera.position.x = mesh.position.x;
    }

    document.addEventListener('keydown', event => {
      if (event.keyCode === 84) {
        mesh.rotation.z = -1.5
        // mesh.rotation.x = -0.01
        mesh.rotation.y = -3.3
        mesh.rotation.y += 0.05
      }
    })

    renderer.render( scene, camera );

    if (mesh.position.y <= 0 && !this.state.emilio.isEating) {
      mesh.material.map = texture;
    }

    this.eatKibble(meshKibble5, mesh);
    this.eatKibble(meshKibble4, mesh);
    this.eatKibble(meshKibble3, mesh);
    this.eatKibble(meshKibble2, mesh);
    this.eatKibble(meshKibble, mesh);
  }

  changePosition = () => {
    mesh.position.y += 5;
    if (mesh.position.y > 0) {
      mesh.position.y += 2 * -(mesh.position.y * 0.01);
      mesh.material.map = textureOpen;
    }
  }

  eatKibble = (sphereOne, sphereTwo) => {
    let emilioEats = this.spheresIntersect(
        sphereOne.geometry.boundingSphere,
        sphereOne.position,
        sphereTwo.geometry.boundingSphere,
        sphereTwo.position,
      );

    if (emilioEats) {
      this.setState({
        emilio: {
          isEating: true
        }
      })
    } else {
      this.setState({
        emilio: {
          isEating: false
        }
      })
    }

    this.emilioEating(sphereOne, sphereTwo);
  }

  emilioEating = (sphereOne, sphereTwo) => {
    if (this.state.emilio.isEating) {
      sphereOne.visible = false;
      sphereTwo.scale.set(sphereTwo.scale.x + 0.01, sphereTwo.scale.y + 0.01, sphereTwo.scale.z + 0.01);
      sphereTwo.rotation.z = -1.5;
  
      this.setState({
        kibbleEaten: this.state.kibbleEaten+1,
      })

      requestAnimationFrame(() => {
          if (sphereTwo.material.map === texture) {
            setTimeout(() => {
              sphereTwo.material.map = textureOpen
              sphereTwo.rotation.z += 0.02;

              if (sphereTwo.material.map === textureOpen) {
                setTimeout(() => {
                  sphereTwo.material.map = texture
                  sphereTwo.rotation.z -= 0.02;
                }, 60);
              }
            }, 60);
          } else {
            setTimeout(() => {
              sphereTwo.material.map = texture
              sphereTwo.rotation.z += 0.02;
            }, 60);
          }
        }
      );
    }
  }

  spheresIntersect = (sphere1, sphere1position, sphere2, sphere2position) => {
    function distanceVector( v1, v2 ) {
        var dx = v1.x - v2.x;
        var dy = v1.y - v2.y;

        return Math.sqrt( dx * dx + dy * dy );
    }
    return distanceVector(sphere1position, sphere2position) <= (sphere1.radius + sphere2.radius)
  }
=======
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

    // Start tracking if Emilio is eating kibble.
    for (var i = 0; i < spheres.length; i ++) {
      this.eatKibble(spheres[i]);
    }

    // If Emilio is jumping, run this function. 
    if (isJumping) {
      this.jump();
    }

    // If Emilio is twirling, run this function.
    if (isTwirling) {
      this.twirl();
    }
  }

  eatKibble = (kibble) => {
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
>>>>>>> Stashed changes

  componentDidMount() {
    this.init();
    this.animate();

    document.addEventListener('keydown', event => {
      console.log(mesh.rotation.y)
      if (event.keyCode === 32) {
<<<<<<< Updated upstream
        requestAnimationFrame(this.changePosition);
=======
        isJumping = true;
      }

      if (event.keyCode === 84) {
        isTwirling = true;
>>>>>>> Stashed changes
      }
      // if (event.keyCode === 84) {
      //   if (mesh.rotation.y !== 0) {
      //     mesh.rotation.z = -1.5
      //   }
      // }
    });

    window.addEventListener('touchstart', this.changePosition);
  }

  render() {
    return (
      <div className="container">
        <div className="note">press the spacebar or tap to jump</div>
<<<<<<< Updated upstream
        <div id="count" className={`${this.state.emilio.isEating ? 'active' : 'inactive'}`}>{ this.state.kibbleEaten }</div>
=======
        <div id="count" className={`${this.state.emilio.isEating ? 'active' : ''}`}>{ this.state.kibbleEaten }</div>
>>>>>>> Stashed changes
        <div className="emiliocanvas"></div>
      </div>
    );
  }
}

export default Test;
