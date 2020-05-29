import React, { Component } from 'react';
import * as THREE from 'three';

let camera, scene, renderer, canvas;
let geometry, texture, textureOpen, material, mesh;
let geometryKibble, textureKibble, materialKibble, meshKibbleFixed, emilioEats;
let spheres = [];

let isTwirling = false,
    timeTwirling = 0,
    isEating = false,
    timeEating = 0;

window.requestAnimationFrame = window.requestAnimationFrame
    || window.mozRequestAnimationFrame
    || window.webkitRequestAnimationFrame
    || window.msRequestAnimationFrame
    || function(f){return setTimeout(f, 1000/60)} // simulate calling code 60 
 
window.cancelAnimationFrame = window.cancelAnimationFrame
    || window.mozCancelAnimationFrame
    || function(requestID){clearTimeout(requestID)} //fall back

    
class Test extends Component {
  state = {
    width: window.innerWidth,
    height: window.innerHeight,
    kibbleEaten: 0,
    emilio: {
      isEating: false,
      isTwirling: false,
      position: {
        x: -25,
        y: 26,
        z: 1,
      },
      rotation: {
        x: 0.2,
        y: 6.6,
        z: 5,
      },
    }
  }

  init = () => {
    let container = document.querySelector('.container'),
        emilioCanvas = document.querySelector('.emiliocanvas');


    // Load textures.
    texture = new THREE.TextureLoader().load( 'img/milio4.jpg' );
    textureOpen = new THREE.TextureLoader().load( 'img/milio4-open.jpg' );
    textureKibble = new THREE.TextureLoader().load( 'img/kibble.png' );
    

    // Set up the initial scene
    camera = new THREE.PerspectiveCamera( 1.8, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.set( 0, 5, 1000 );
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xffffff );


    // Draw Emilio shape & texture
    geometry = new THREE.SphereBufferGeometry( 4.5, 32, 32 );
    material = new THREE.MeshBasicMaterial( { map: texture } );
    mesh = new THREE.Mesh( geometry, material );


    // Emilio's initial position
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
    scene.add( mesh );
  

    // Scatter the treats!
    this.addKibble();


    // Draw the canvas and append to the dom
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( this.state.width, this.state.height );
        
    container.replaceChild( renderer.domElement, emilioCanvas );
    canvas = renderer.getContext('2d').canvas;

    this.setState({
      width: canvas.clientWidth,
      height: canvas.clientHeight,
    })
  }

  addKibble = () => {
    geometryKibble = new THREE.SphereBufferGeometry( 0.4, 32, 32 );
    materialKibble = new THREE.MeshBasicMaterial( { map: textureKibble, transparent: true } );


    // Place the first piece of kibble
    meshKibbleFixed = new THREE.Mesh( geometryKibble, materialKibble );
    meshKibbleFixed.rotation.y = 10
    meshKibbleFixed.position.z = 200
    meshKibbleFixed.position.x = 15
    meshKibbleFixed.position.y = 10


    // Scatter 50 pieces of kibble in random positions
    // Be sure not to go beyond the available area.
    for (var i = 0; i < 50; i ++) {
      let meshKibble = new THREE.Mesh( geometryKibble, materialKibble );

      meshKibble.rotation.y = 10
      meshKibble.position.z = 200;
      meshKibble.position.x = Math.random() * (1500 - 35) + 35;
      meshKibble.position.y = Math.random() * (17 - 0) + 0;
      meshKibble.scale.x = meshKibble.scale.y = meshKibble.scale.z = Math.random() * .5 + 1;
      meshKibble.material.map.needsUpdate = true;

      scene.add( meshKibble );
      spheres.push( meshKibble );
    }

    scene.add( meshKibbleFixed );
  }

  animate = () => {
    // This animates the frame.
    requestAnimationFrame(this.animate);


    // Emilio moves left by 0.2x every ~16.7 milliseconds.
    mesh.position.x += 0.2;


    // "Gravity"
    // If Emilio is in the air, move faster while falling to the ground.
    // Give appearance of jumping quickly by rotating Emilio.
    if (mesh.position.y > 0) {
      mesh.position.x += 0.3;
      mesh.position.y -= 0.2;
      mesh.rotation.z += 0.01 * (mesh.position.y * 0.9);
    } else {
      mesh.rotation.z -= 0.05
    }


    // Once Emilio is in the middle of the screen, make the camera follow him.
    // Also once past the middle of the screen, make Emilio continue to get smaller up until
    // a certain point.
    if (mesh.position.x > 0) {
      camera.position.x = mesh.position.x;

      if (mesh.scale.x > 0.2) {
        mesh.scale.set(
          mesh.scale.x -= 0.001,
          mesh.scale.y -= 0.001,
          mesh.scale.z -= 0.001
        );
      }
    }


    // Render the screen.
    renderer.render( scene, camera );


    // Start tracking if emilio is eating kibble.
    this.eatKibble(meshKibbleFixed);
  
    for (var i = 0; i < spheres.length; i ++) {
      this.eatKibble(spheres[i]);
    }


    // If Emilio is on the ground and is not eating,
    // close his mouth.
    if (mesh.position.y <= 0 && !this.state.emilio.isEating) {
      mesh.material.map = texture;
    }


    if (isTwirling) {
      this.twirl();
    }
  }

  eatKibble = (sphereOne) => {
    isEating = this.spheresIntersect(
      sphereOne.geometry.boundingSphere,
      sphereOne.position,
    );

    if (isEating) {
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

    this.emilioEating(sphereOne);
  }

  emilioEating = (sphereOne) => {
    if (isEating) {
      timeEating = timeEating + 1;
      sphereOne.visible = false;
      mesh.scale.set(mesh.scale.x + 0.01, mesh.scale.y + 0.01, mesh.scale.z + 0.01);
      mesh.rotation.z = -1.5;
  
      if (timeEating >= 1 && timeEating < 10) {
        this.setState({
          kibbleEaten: this.state.kibbleEaten + 1,
        })
      } else {
        timeEating = 0;
      }

      // requestAnimationFrame(() => {
      //   if (mesh.material.map === texture) {
      //     setTimeout(() => {
      //       mesh.material.map = textureOpen
      //       mesh.rotation.z += 0.02;

      //       if (mesh.material.map === textureOpen) {
      //         setTimeout(() => {
      //           mesh.material.map = texture
      //           mesh.rotation.z -= 0.02;
      //         }, 60);
      //       }
      //     }, 60);
      //   } else {
      //     setTimeout(() => {
      //       mesh.material.map = texture
      //       mesh.rotation.z += 0.02;
      //     }, 60);
      //   }
      // });
    } else {
      // timeEating = 0;
    }

    console.log(timeEating)
  }

  spheresIntersect = (sphere1, sphere1position) => {
    function distanceVector( v1, v2 ) {
      let dx = v1.x - v2.x;
      let dy = v1.y - v2.y;

      return Math.sqrt( dx * dx + dy * dy );
    }
    return distanceVector(sphere1position, mesh.position) <= (sphere1.radius + mesh.geometry.boundingSphere.radius)
  }

  twirl = () => {
    let shake = false;
    timeTwirling += 1;

    if (timeTwirling < 30) {
      mesh.rotation.y += 0.5;

    } else if (timeTwirling >= 30 && timeTwirling < 60) {
      mesh.rotation.y = 21.6;
      mesh.rotation.x = 0.2;
      mesh.rotation.z = -1.5;

      // if (timeTwirling < 60) {
      //   shake = true;
      //   mesh.rotation.z -= 0.02
      // } else {
      //   shake = false;
      //   mesh.rotation.x += 0.02
      // }

      if (timeTwirling % 10) {
        shake = true;
        mesh.rotation.z += 0.2;
      } else {
        shake = false;
        mesh.rotation.z += 0.2;
      }




    } else if (timeTwirling >= 90 && timeTwirling < 110) {
      mesh.rotation.y -= 1;

      if (mesh.rotation.y <= 6.6) {
        isTwirling = false;
        timeTwirling = 0;
        mesh.rotation.y = 6.6;
      }
    }
  }

  jump = () => {
    mesh.position.y += 5;
    if (mesh.position.y > 0) {
      mesh.position.y += 2 * -(mesh.position.y * 0.01);
      mesh.material.map = textureOpen;
    }
  }

  componentDidMount() {
    this.init();
    this.animate();

    document.addEventListener('keydown', event => {
      if (event.keyCode === 32) {
        this.jump();
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
        <div className="note">press the spacebar or tap to jump {this.state.emilio.isEating ? 'active' : 'inactive'}</div>
        <div id="count" className={`${this.state.emilio.isEating ? 'active' : 'inactive'}`}>{ this.state.kibbleEaten }</div>
        <div className="emiliocanvas"></div>
      </div>
    );
  }
}

export default Test;
