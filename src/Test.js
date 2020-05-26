import React, { Component } from 'react';
import * as THREE from 'three';

let camera, scene, renderer, raycaster;
let geometry, texture, textureOpen, material, mesh;
let geometryKibble, textureKibble, materialKibble, meshKibble;
let INTERSECTED;

class Test extends Component {
  state = {
    emilio: {
      x: -14,
      y: 32,
      z: 1,
    }
  }
  
  init = () => {
    camera = new THREE.PerspectiveCamera( 1, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.set( 0, 0, 1000 );
  
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xffffff );

    geometry = new THREE.SphereBufferGeometry( 5, 64, 32 );
    texture = new THREE.TextureLoader().load( 'img/milio3.jpg' );
    textureOpen = new THREE.TextureLoader().load( 'img/milio3-open.jpg' );
    material = new THREE.MeshBasicMaterial( { map: texture } );

    mesh = new THREE.Mesh( geometry, material );
    mesh.rotation.x = 0.2;
    mesh.rotation.y = 6.6;
    mesh.rotation.z = 5;
    mesh.position.z = this.state.emilio.z;
    mesh.position.y = this.state.emilio.y;
    mesh.position.x = this.state.emilio.x;

    mesh.material.map.needsUpdate = true;
  
    scene.add( mesh );
    this.kibble();


    raycaster = new THREE.Raycaster()
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );  
    this.refs.canvas.appendChild( renderer.domElement );
  }

  kibble = () => {
    geometryKibble = new THREE.SphereBufferGeometry( 0.6, 230, 100 );
    textureKibble = new THREE.TextureLoader().load( 'img/kibble.png' );
    materialKibble = new THREE.MeshBasicMaterial( { map: textureKibble, transparent: true } );
    meshKibble = new THREE.Mesh( geometryKibble, materialKibble );
    meshKibble.rotation.y = 10
    meshKibble.position.y = -4
    meshKibble.position.x = 10
    meshKibble.position.z = 10
    scene.add( meshKibble );
  }

  animate = () => {
    requestAnimationFrame( this.animate );

    if (mesh.position.y > -3) {
      mesh.position.y -= 0.3;
    } else {
      mesh.material.map = texture;
    }
    mesh.position.x += 0.03;
    mesh.rotation.z -= 0.005 * -mesh.position.y;
    if (mesh.position.x > 0) {
      camera.position.x += 0.03;
    }
    renderer.render( scene, camera );
    
    

    raycaster.setFromCamera( scene, camera );
    let intersects = raycaster.intersectObjects( scene.children );
    // console.log(intersects);
    if ( intersects.length > 0 ) {
      if ( INTERSECTED !== intersects[ 0 ].object ) {
        if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
        INTERSECTED = intersects[ 0 ].object;
        INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
        INTERSECTED.material.emissive.setHex( 0xff0000 );
      }
    } else {
      if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
      INTERSECTED = null;
    }
  }

  changePosition = () => {
    // mesh.position.y += 4 * -(mesh.position.x * 0.1);
    mesh.position.x += 1;
    
    if (mesh.position.x > 0) {
      camera.position.x += 1;
    }
    
    if (mesh.position.x < 0) {
      mesh.rotation.z += 0.5 * -mesh.position.y;
    }


    if (mesh.position.y > -3) {
      mesh.position.y += 4 * (mesh.position.y * 1.3);
    }

    if (mesh.position.y < -3) {
      mesh.position.y += 4;
    }
    console.log(mesh.position.y)


    
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
      this.changePosition() : null
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
