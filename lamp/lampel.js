var lampel = function(window, lampjs, parent, geom) {
	// Global we will be using
	var camera, scene, renderer, controls;
	var material, meshes = [];	
	
	function bgeom(material, V1, T1, a) {
		// Build the geometry
		let indices = []
		let vertices = []
		for(let i = 0; i < V1.length; i++) {
			vertices.push(V1[i][0],V1[i][1],V1[i][2])
		}
		for(let i = 0; i < T1.length; i++) {
			indices.push(T1[i][0],T1[i][1],T1[i][2])
		}
		geometry = new THREE.BufferGeometry();
		geometry.setIndex( indices );
		geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
		mesh = new THREE.Mesh( geometry, material );
		mesh.rotation.z = a

//mesh.castShadow = true;
//mesh.receiveShadow = true;
		meshes.push(mesh)
		return mesh
	}
	
	function creategeom(desc, scene, material) {
		let g = lampjs.GenerateMesh(desc)
		console.log("radius height length", g.Radius, g.Height, g.Length)
		for(var i = 0; i < g.No; i++) {
			scene.add(bgeom(material, g.V1, g.T1, g.A*(2*i)))
			scene.add(bgeom(material, g.V2, g.T2, g.A*(2*i+1)))
		}
	}
	
	function init() {
		camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 10000 );
		camera.position.x = 2000;
		camera.up.set( 0, 0, 1 );
		controls = new THREE.OrbitControls( camera, parent);
		controls.update();
		
		scene = new THREE.Scene();
		scene.background = new THREE.Color(0xffffff);
		material =  new THREE.MeshPhongMaterial( 
			{ 
				color: 0x9c9c9c,
				specular: 0x343434,
				shininess: 31,
				flatShading: true 
			} 
		)
		material.side = THREE.DoubleSide
	

		var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.325 );
		directionalLight.position.x = 100
		directionalLight.position.y = 20
		directionalLight.position.z = 100
		directionalLight.castShadow = true;
		scene.add( directionalLight );
	
		// Add a reflected light from the ground
		var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.125 );
		directionalLight.position.x = 0
		directionalLight.position.y = 0
		directionalLight.position.z = -100
		directionalLight.castShadow = true;
		scene.add( directionalLight );

		// And a reflection from the back
		var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.105 );
		directionalLight.position.x = -100
		directionalLight.position.y = -40
		directionalLight.position.z = 0
		directionalLight.castShadow = true;
		scene.add( directionalLight );



		var light = new THREE.AmbientLight( 0x808080 ); // soft white light
		scene.add( light );

		var light = new THREE.PointLight( 0x333333, 1, 100 );
		light.position.set( 0, 0, 0 );
		scene.add( light );


		renderer = new THREE.WebGLRenderer( { antialias: true } );
		renderer.setSize( window.innerWidth/10, window.innerHeight/10 );
		parent.appendChild( renderer.domElement );

		// Try to enable shadow catching
		renderer.shadowMap.enabled = true;
		renderer.shadowMapSoft = true;

		renderer.shadowCameraNear = 3;
		renderer.shadowCameraFar = camera.far;
		renderer.shadowCameraFov = 50;

		renderer.shadowMapBias = 0.0039;
		renderer.shadowMapDarkness = 0.5;
		renderer.shadowMapWidth = 1024;
		renderer.shadowMapHeight = 1024;

		window.addEventListener('resize', resize) 
	}
	
	function setGeometry(geom) {
		// Remove all the meshes we had from before since we are setting new
		meshes.map(el => scene.remove(el))
		meshes = []
		// Build the new geometry
		creategeom(geom, scene, material)
	}

	function animate() {
		// Read the camera movement by the user
		controls.update();
		// TODO: Dop not render all the time, only if something changed to not drain battery
		renderer.render( scene, camera );
		// Wait for the screen to be ready to do the next one
		requestAnimationFrame( animate );
	}
	
	function resize(e) {
		let h = parent.clientHeight;
		let w = parent.clientWidth;
		renderer.setSize( w, h );
		camera.aspect = w/h
		camera.updateProjectionMatrix();
	}

	function remove() {
		window.removeEventListener('resize', resize)
	}

	// Initiate all
	init();
	// Set the initial geometry
	setGeometry(geom)
	// Start the animation loop
	animate();
	// Set up all the sizing
	resize();

	return {
		// Update the geometry that should be drawn
		setGeometry: setGeometry,
		// Remove the element and remove all listeners etc. Please note
		// that the parent element will not be removed
		remove: remove,
	}
}

