import React, { Component } from 'react';
import * as THREE from 'three';

let camera, scene, renderer;
let geometry, texture, textureOpen, material, mesh;
let geometryKibble, textureKibble, materialKibble, meshKibble;

class Test extends Component {

  init = () => {
    camera = new THREE.PerspectiveCamera( 1, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.set( 0, 3, 1000 );
  
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xffffff );

    geometry = new THREE.SphereBufferGeometry( 4.5, 32, 32 );
    texture = new THREE.TextureLoader().load( 'img/milio3.jpg' );
    textureOpen = new THREE.TextureLoader().load( 'img/milio3-open.jpg' );
    material = new THREE.MeshBasicMaterial( { map: texture } );

    mesh = new THREE.Mesh( geometry, material );

    mesh.position.x = -16
    mesh.position.y = 16
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
  }

  kibble = () => {
    geometryKibble = new THREE.SphereBufferGeometry( 1, 32, 32 );
    textureKibble = new THREE.TextureLoader().load( 'img/kibble.png' );
    materialKibble = new THREE.MeshBasicMaterial( { map: textureKibble, transparent: true } );
    meshKibble = new THREE.Mesh( geometryKibble, materialKibble );
    meshKibble.rotation.y = 10

    meshKibble.position.x = 10
    meshKibble.position.y = 10
    meshKibble.position.z = 8
    
    scene.add( meshKibble );



    



  }

  animate = () => {
    requestAnimationFrame( this.animate );

    if (mesh.position.y > 0) {
      mesh.position.y -= 0.2;
      mesh.position.x += 0.1;
    } else {
      mesh.material.map = texture;
    }

    mesh.position.x += 0.05;

    if (mesh.position.y > 0) {
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

    console.log(
      this.spheresIntersect(
        meshKibble.geometry.boundingSphere,
        meshKibble.position,
        mesh.geometry.boundingSphere,
        mesh.position,
      )
    );
  }

  changePosition = () => {
    mesh.position.x += 1;
    mesh.position.y += 4;
    
    if (mesh.position.x > 0) {
      camera.position.x += 1;
    }

    if (mesh.position.y > 0) {
      mesh.position.y += 2 * -(mesh.position.y * 0.01);
    }

    mesh.material.map = textureOpen;
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
      <div ref="canvas"></div>
    );
  }
}

export default Test;
