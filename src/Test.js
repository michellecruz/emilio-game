import React, { Component } from 'react';
import * as THREE from 'three';

let camera, scene, renderer, canvas;
let geometry, texture, textureOpen, material, mesh;
let geometryKibble, textureKibble, materialKibble;
let meshKibble, meshKibble2, meshKibble3, meshKibble4, meshKibble5, meshKibble6;

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
    // Load textures.
    texture = new THREE.TextureLoader().load( 'img/milio4.jpg' );
    textureOpen = new THREE.TextureLoader().load( 'img/milio4-open.jpg' );
    
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
    this.kibble();

    // Draw the canvas and append to the dom
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( this.state.width, this.state.height );

    let container = document.querySelector('.container'),
        emilioCanvas = document.querySelector('.emiliocanvas');
        
    container.replaceChild( renderer.domElement, emilioCanvas );

    canvas = renderer.getContext('2d').canvas;

    this.setState({
      width: canvas.clientWidth,
      height: canvas.clientHeight,
    })
  }

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
    } else {
      mesh.rotation.z -= 0.05
    }

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

  componentDidMount() {
    this.init();
    this.animate();

    document.addEventListener('keydown', event => {
      console.log(mesh.rotation.y)
      if (event.keyCode === 32) {
        requestAnimationFrame(this.changePosition);
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
        <div id="count" className={`${this.state.emilio.isEating ? 'active' : 'inactive'}`}>{ this.state.kibbleEaten }</div>
        <div className="emiliocanvas"></div>
      </div>
    );
  }
}

export default Test;
