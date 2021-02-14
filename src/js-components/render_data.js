	
	const 	use_colours = true,
			use_water = true,
			colour_threshholds = [
				{
					'threshhold' : 50,
					'colour' : 'forestgreen'
				},
				{
					'threshhold' : 0,
					'colour' : 'khaki'
				},
			];
			
	export const render_data = ( grid_data, final_freq_count, layer_options ) => {
		const 	loader = new THREE.TextureLoader(),
				scene = new THREE.Scene(),
				camera = new THREE.PerspectiveCamera( 100, window.innerWidth / window.innerHeight, .1, 6000 ),
				renderer = new THREE.WebGLRenderer(),
				sun = new THREE.HemisphereLight( 0xffffff, 0x000000, 0.2 ),
				directionalLight = new THREE.DirectionalLight( 0xffffff, 1 ),
				s_geometry = new THREE.SphereGeometry( layer_options.radius, 24, 24 ),
				s_material = new THREE.MeshStandardMaterial( {
					color: 'blue',
					roughness: .3,
					transparent: true,
					opacity: .75,
				} ),
				sphere = new THREE.Mesh( s_geometry, s_material );

		renderer.setSize( window.innerWidth, window.innerHeight );
		document.body.appendChild( renderer.domElement );
		camera.position.z = sun.position.z = directionalLight.position.z = layer_options.radius * 2; // make camera position more relative to window and readius

		plot_points( grid_data, final_freq_count, layer_options, scene )

		use_colours && use_water ? scene.add( sun, directionalLight, sphere ) : scene.add( sun, directionalLight );

		function animate() {
			requestAnimationFrame( animate );
			renderer.render( scene, camera );
		} animate();

		apply_spaceship_controls( camera );

		return grid_data;
	}

	const plot_points = ( grid_data, final_freq_count, layer_options, scene ) => {
		const 	geometry = new THREE.Geometry(),
				material = ( use_colours ? new THREE.MeshLambertMaterial( {
					vertexColors: THREE.FaceColors,
					side: THREE.DoubleSide,
				} ) : new THREE.MeshBasicMaterial( {
					color: 0x00ff00,
					wireframe: true,
				} ) );


		grid_data.forEach( ( { data } ) => {
			data.flat().forEach( item => geometry.vertices.push( new THREE.Vector3( item.z, item.x, item.y ) ) );

			for ( let i = 1; i < data.length; i ++ ) {
				for ( let j = 0; j < data[ i ].length - 1; j ++ ) {
					const points = {
						'oo' : data[ i ][ j ],
						'oi' : data[ i - 1 ][ j ],
						'io' : data[ i ][ j + 1 ],
						'ii' : data[ i - 1 ][ j + 1 ],
					};

					geometry.faces.push( new THREE.Face3( points.ii.index, points.io.index, points.oo.index ) );
					geometry.faces[ geometry.faces.length - 1 ].color = new THREE.Color( get_colour_by_height( points.oo, points.oi, points.ii, layer_options ) );

					geometry.faces.push( new THREE.Face3( points.ii.index, points.oo.index, points.oi.index ) );
					geometry.faces[ geometry.faces.length - 1 ].color = new THREE.Color( get_colour_by_height( points.oo, points.oi, points.ii, layer_options ) );	
				}
			}
 		} );

		geometry.computeFaceNormals();
		scene.add( new THREE.Mesh( geometry, material ) );
	}

	// Adds rotational drag controls
	const apply_spaceship_controls = camera => {
		let click_coords = {
			'x' : null,
			'y' : null,
		},
		can_drag = false,
		speed = 16;

		document.addEventListener( 'mousedown', event => {
			can_drag = true;

			click_coords = {
				'x' : event.clientX,
				'y' : event.clientY,
			};
		} );

		document.addEventListener( 'mouseup', event => can_drag = false );

		document.addEventListener( 'mousemove', event => {
			if ( can_drag ) {
				camera.rotateY( ( click_coords.x - event.clientX ) / 400 );
				camera.rotateX( ( click_coords.y - event.clientY ) / 400 );

				click_coords = {
					'x' : event.clientX,
					'y' : event.clientY,
				};
			} 
		} );

		document.addEventListener( 'keydown', e => {
			switch ( e.keyCode ) {
				case 87 : // W
					camera.translateZ( speed * -1 );
					break;
				case 68 : // D
					camera.translateX( speed );
					break;
				case 83 : // S
					camera.translateZ( speed );
					break;
				case 65 : // A
					camera.translateX( speed * -1 );
					break;
			}
		} );
	}

	// Calculate the colour base on average height of all face points
	const get_colour_by_height = ( a, b, c, layer_options ) => {
		const 	average_height = ( ( a.amp_value + b.amp_value + c.amp_value ) / 3 );

		return average_height > 0 ? colour_threshholds[ 0 ].colour : colour_threshholds[ 1 ].colour;
	}
