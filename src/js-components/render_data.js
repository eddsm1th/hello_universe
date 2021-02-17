	
	const 	use_colours = true,
			use_water = true,
			use_earth = false,

			base_colour = 'maroon',
			flat_colour = 'deeppink',
			flat_colour_height_cutoff = .25,
			flat_colour_angle_cutoff = 0,

			water_shallow_colour = parseInt( 0x00FFF0 ),
			water_deep_colour = parseInt( 0x000D61 ),
			water_colour_range = water_shallow_colour - water_deep_colour;
			
	export const render_data = ( grid_data, final_freq_count, layer_options, above_options, below_options ) => {
		const 	loader = new THREE.TextureLoader(),
				scene = new THREE.Scene(),
				camera = new THREE.PerspectiveCamera( 100, window.innerWidth / window.innerHeight, .1, 6000 ),
				renderer = new THREE.WebGLRenderer(),
				sun = new THREE.HemisphereLight( 0xffffff, 0x000000, 0.2 ),
				directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );

		renderer.setSize( window.innerWidth, window.innerHeight );
		document.body.appendChild( renderer.domElement );
		camera.position.z = sun.position.z = directionalLight.position.z = layer_options.radius * 2; // make camera position more relative to window and readius

		plot_points( grid_data, final_freq_count, layer_options, scene, above_options, below_options )

		scene.add( sun, directionalLight );

		function animate() {
			requestAnimationFrame( animate );
			renderer.render( scene, camera );
		} animate();

		apply_spaceship_controls( camera );

		return grid_data;
	}

	const plot_points = ( grid_data, final_freq_count, layer_options, scene, above_options, below_options ) => {
		const 	geometry = new THREE.Geometry(),
				material = ( use_colours ? new THREE.MeshLambertMaterial( {
					vertexColors: THREE.FaceColors,
					side: THREE.DoubleSide,
				} ) : new THREE.MeshBasicMaterial( {
					color: 0x00ff00,
					wireframe: true,
				} ) ),
				water_geometry = new THREE.Geometry(),
				water_material = new THREE.MeshStandardMaterial( {
					vertexColors: THREE.FaceColors,
					roughness: .3,
					transparent: true,
					opacity: 1,
					side: THREE.DoubleSide,
				} ),
				flat_colour_cutoff_value = above_options.base_amp * flat_colour_height_cutoff;


		grid_data.forEach( ( { data } ) => {
			data.flat().forEach( item => {
				if ( use_earth ) geometry.vertices.push( new THREE.Vector3( item.z, item.x, item.y ) );
				if ( use_water ) water_geometry.vertices.push( new THREE.Vector3( item.base_z, item.base_x, item.base_y ) );
			} );

			for ( let i = 1; i < data.length; i ++ ) {
				for ( let j = 0; j < data[ i ].length - 1; j ++ ) {
					const points = {
						'oo' : data[ i ][ j ],
						'oi' : data[ i - 1 ][ j ],
						'io' : data[ i ][ j + 1 ],
						'ii' : data[ i - 1 ][ j + 1 ],
					};

					add_face_to_goemetry( points.ii, points.io, points.oo, flat_colour_cutoff_value, geometry, water_geometry, below_options );
					add_face_to_goemetry( points.ii, points.oo, points.oi, flat_colour_cutoff_value, geometry, water_geometry, below_options );	
				}
			}
 		} );

		if ( use_earth ) {
			geometry.computeFaceNormals();
			scene.add( new THREE.Mesh( geometry, material ) );
		}

		if ( use_water ) {
			water_geometry.computeVertexNormals();
			scene.add( new THREE.Mesh( water_geometry, water_material ) );
		}
	}

	const get_water_colour_by_depth = depth => intToRGB( parseInt( water_shallow_colour - ( water_colour_range * depth ) ) );

	// collaborated with stack overflow for this one
	const intToRGB = i => {
	    var c = ( i & 0x00FFFFFF ).toString(16).toUpperCase();

	    return "00000".substring(0, 6 - c.length) + c;
	}

	const add_face_to_goemetry = ( a, b, c, flat_colour_cutoff_value, geometry, water_geometry, below_options ) => {
		if ( use_earth && ( a.amp_value > 0 || b.amp_value > 0 || c.amp_value > 0 ) ) {
			geometry.faces.push( new THREE.Face3( a.index, b.index, c.index ) );
			geometry.faces[ geometry.faces.length - 1 ].color = new THREE.Color( get_colour_by_height( c, b, a, flat_colour_cutoff_value ) );
		}

		if ( use_water && ( a.amp_value < 0 || b.amp_value < 0 || c.amp_value < 0 ) ) {
			const 	min_val = Math.min.apply( Math, [ a.amp_value, b.amp_value, c.amp_value ] ),
					depth = parseFloat( ( min_val / ( below_options.base_amp * -1 ) ).toFixed( 2 ) );

			water_geometry.faces.push( new THREE.Face3( a.index, b.index, c.index ) );
			water_geometry.faces[ water_geometry.faces.length - 1 ].color = new THREE.Color( '#' + get_water_colour_by_depth( depth ) );
		}
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
	const get_colour_by_height = ( a, b, c, flat_colour_cutoff_value ) => {
		const 	average_height = ( ( a.amp_value + b.amp_value + c.amp_value ) / 3 );

		if ( average_height < 0 || average_height > flat_colour_cutoff_value ) {
			return base_colour;
		} else {
			const height_diff = Math.max.apply( Math, [ a.amp_value, b.amp_value, c.amp_value ] ) - Math.min.apply( Math, [ a.amp_value, b.amp_value, c.amp_value ] );

			return height_diff > 10 ? base_colour : flat_colour;
		}
	}
