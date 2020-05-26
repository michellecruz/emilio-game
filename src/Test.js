import React, { Component } from 'react';
import * as THREE from 'three';

let camera, scene, renderer, raycaster;
let geometry, texture, textureOpen, material, mesh;
let geometryKibble, textureKibble, materialKibble, meshKibble;
let INTERSECTED;

class Test extends Component {
  state = {
    emilio: {
      x: -9,
      y: 9,
    }
  }
  
  init = () => {
    camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.set( 0, 0, 10 );
  
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xffffff );
    scene.add( camera );

    geometry = new THREE.SphereBufferGeometry( 1, 32, 32 );
    texture = new THREE.TextureLoader().load( 'img/milio3.jpg' );
    textureOpen = new THREE.TextureLoader().load( 'img/milio3-open.jpg' );
    material = new THREE.MeshBasicMaterial( { map: texture } );

    mesh = new THREE.Mesh( geometry, material );
    mesh.rotation.x = 0.2;
    mesh.rotation.y = 6.6;
    mesh.rotation.z = 5;
    mesh.position.y = this.state.emilio.y;
    mesh.position.x = this.state.emilio.x;

    mesh.material.map.needsUpdate = true;
  
    scene.add( mesh );
    this.kibble();


    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );  
    this.refs.canvas.appendChild( renderer.domElement );
  }

  kibble = () => {
    geometryKibble = new THREE.SphereBufferGeometry( 1, 32, 32 );
    textureKibble = new THREE.TextureLoader().load( 'img/kibble.png' );
    materialKibble = new THREE.MeshBasicMaterial( { map: textureKibble, color: 0xff0000, transparent: true } );
    meshKibble = new THREE.Mesh( geometryKibble, materialKibble );
    meshKibble.rotation.y = 10

    meshKibble.position.x = 10
    meshKibble.position.y = 0
    meshKibble.position.z = 10
    
    scene.add( meshKibble );
  }

  animate = () => {
    requestAnimationFrame( this.animate );

    if (mesh.position.y > 0) {
      mesh.position.y -= 0.1;
    } else {
      mesh.material.map = texture;
    }

    mesh.position.x += 0.05;

    if (mesh.position.y > 0) {
      mesh.rotation.z -= 0.05 * -mesh.position.y;
    } else {
      mesh.rotation.z -= 0.05
    }
    
    if (mesh.position.x > 0) {
      camera.position.x += 0.05;
    }

    renderer.render( scene, camera );
    


    if (mesh.position.x > 0) {
      raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(meshKibble.position, camera);
      let intersects = raycaster.intersectObjects( scene.children );
      console.log(intersects.length, meshKibble.position, camera.position);
    }

      // if ( intersects.length > 0 ) {
      //   if ( INTERSECTED !== intersects[ 0 ].object ) {
      //     if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
      //     INTERSECTED = intersects[ 0 ].object;
      //     INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
      //     INTERSECTED.material.emissive.setHex( 0xff0000 );
      //   }
      // } else {
      //   if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
      //   INTERSECTED = null;
      // }
  }

  changePosition = () => {
    mesh.position.x += 1;
    mesh.position.y += 4;
    
    if (mesh.position.x > 0) {
      camera.position.x += 1;
    }
    
    if (mesh.position.x < 0) {
      mesh.rotation.z += 0.01 * -mesh.position.x;
    }

    if (mesh.position.y > -3) {
      mesh.position.y += 4 * (mesh.position.y * 0.1);
    }

    mesh.material.map = textureOpen;
  }

  componentDidMount() {
    this.init();
    this.animate();

    document.addEventListener("keydown", e =>
      e.keyCode === 32 ?
      // this.setState({
      //   emilio: {
      //     x: 0,
      //     y: 0.1,
      //   }
      // },
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
