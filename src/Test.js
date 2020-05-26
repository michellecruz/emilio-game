import React, { Component } from 'react';
import * as THREE from 'three';

let camera, scene, renderer;
let geometry, texture, textureOpen, material, mesh;
let geometryKibble, textureKibble, materialKibble, meshKibble;
let meshKibble2, meshKibble3, meshKibble4, meshKibble5, meshKibble6;
let count, emilioEats;

class Test extends Component {
  state = {
    kibbleEaten: 0,
    isEating: false,
  }

  init = () => {
    camera = new THREE.PerspectiveCamera( 1.8, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.set( 0, 5, 1000 );
  
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xffffff );

    geometry = new THREE.SphereBufferGeometry( 4.5, 32, 32 );
    texture = new THREE.TextureLoader().load( 'img/milio3.jpg' );
    textureOpen = new THREE.TextureLoader().load( 'img/milio3-open.jpg' );
    material = new THREE.MeshBasicMaterial( { map: texture } );

    mesh = new THREE.Mesh( geometry, material );

    mesh.position.x = -32
    mesh.position.y = 26
    mesh.position.z = 1

    mesh.rotation.x = 0.2;
    mesh.rotation.y = 6.6;
    mesh.rotation.z = 5;
    mesh.material.map.needsUpdate = true;
  
    this.kibble();
    scene.add( mesh );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );  
    this.refs.canvas.appendChild( renderer.domElement );

    count = document.querySelector('.count');
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
    requestAnimationFrame( this.animate );

    mesh.position.x += 0.2;

    if (mesh.position.y > 0) {
      mesh.position.y -= 0.2;
      mesh.position.x += 0.3;

      if (mesh.position.x < 0) {
        mesh.rotation.z -= 0.05 * -mesh.position.y;
      } else {
        mesh.rotation.z -= 0.01 * -mesh.position.y;
      }
    } else {
      mesh.rotation.z -= 0.05
    }

    if (mesh.position.x > 0) {
      camera.position.x = mesh.position.x;
    }

    renderer.render( scene, camera );

    this.eatKibble(meshKibble5, mesh);
    this.eatKibble(meshKibble4, mesh);
    this.eatKibble(meshKibble3, mesh);
    this.eatKibble(meshKibble2, mesh);
    this.eatKibble(meshKibble, mesh);

    if (mesh.position.y <= 0 && !this.state.isEating) {
      mesh.material.map = texture;
    }
  }

  eatKibble = (sphereOne, sphereTwo) => {
    emilioEats = this.spheresIntersect(
      sphereOne.geometry.boundingSphere,
      sphereOne.position,
      sphereTwo.geometry.boundingSphere,
      sphereTwo.position,
    );

    if (emilioEats) {
      this.setState({
        isEating: true
      })
    } else {
      this.setState({
        isEating: false
      })
    }

    this.emilioEating(sphereOne, sphereTwo);
  }

  emilioEating = (sphereOne, sphereTwo) => {
    console.log(sphereOne.layers.mask)

    if (this.state.isEating) {
      sphereOne.visible = false;
      sphereTwo.scale.set(sphereTwo.scale.x + 0.02, sphereTwo.scale.y + 0.02, sphereTwo.scale.z + 0.02);
      sphereTwo.rotation.z = -1.5;
  
      this.setState({
        kibbleEaten: this.state.kibbleEaten+1,
      })

      count.classList.add('active');

      requestAnimationFrame( 
        function(){
          if (sphereTwo.material.map === texture) {
            setTimeout(function(){
              sphereTwo.material.map = textureOpen
            }, 50);
          } else  {
            setTimeout(function(){
              sphereTwo.material.map = texture
            }, 50);
          }
        }
      );
    } else {
      if (count.classList.contains('active')) {
        count.classList.remove('active');
      }
    }
  }

  changePosition = () => {
    mesh.position.y += 5;
    if (mesh.position.y > 0) {
      mesh.position.y += 2 * -(mesh.position.y * 0.01);
      mesh.material.map = textureOpen;
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

    document.addEventListener("keydown", e =>
      e.keyCode === 32 ?
      requestAnimationFrame(this.changePosition) : null
    );

    window.addEventListener("touchstart", this.changePosition);
  }

  render() {
    return (
      <div>
        <div className="note">press the spacebar or tap to jump</div>
        <div className="count">{ this.state.kibbleEaten }</div>
        <div ref="canvas"></div>
      </div>
    );
  }
}

export default Test;
