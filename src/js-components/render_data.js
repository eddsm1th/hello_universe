	
	const 	wireframe = false,

			use_water = true,
			use_earth = true,

			low_alt_colour = [ Math.random()*255, Math.random()*255, Math.random()*255 ],
			high_alt_colour = [ Math.random()*255, Math.random()*255, Math.random()*255 ],

			water_shallow_colour = [ Math.random()*255, Math.random()*255, Math.random()*255 ],
			water_deep_colour = [ Math.random()*255, Math.random()*255, Math.random()*255 ];
			
	export const render_data = ( grid_data, final_freq_count, layer_options, above_options, below_options ) => {
		const 	loader = new THREE.TextureLoader(),
				scene = new THREE.Scene(),
				camera = new THREE.PerspectiveCamera( 80, window.innerWidth / window.innerHeight, .1, 6000 ),
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
				material = ( !wireframe ? new THREE.MeshLambertMaterial( {
					vertexColors: THREE.FaceColors,
					side: THREE.DoubleSide,
				} ) : new THREE.MeshBasicMaterial( {
					color: 0x00ff00,
					wireframe: true,
				} ) ),
				water_geometry = new THREE.Geometry(),
				water_material = ( !wireframe ? new THREE.MeshStandardMaterial( {
					vertexColors: THREE.VertexColors,
					roughness: .3,
					transparent: true,
					opacity: .8,
					side: THREE.DoubleSide,
				} ) : new THREE.MeshBasicMaterial( {
					color: 0xff0000,
					wireframe: true,
				} ) );

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

					add_face_to_goemetry( points.ii, points.io, points.oo, geometry, water_geometry, above_options, below_options );
					add_face_to_goemetry( points.ii, points.oo, points.oi, geometry, water_geometry, above_options, below_options );	
				}
			}
 		} );

		if ( use_earth ) {
			geometry.computeVertexNormals();
			scene.add( new THREE.Mesh( geometry, material ) );
		}

		if ( use_water ) {
			water_geometry.computeVertexNormals();
			scene.add( new THREE.Mesh( water_geometry, water_material ) );
		}
	}

	const get_water_colour_by_depth = ( depth, low = water_shallow_colour, high = water_deep_colour ) => {
		const new_values = [];

		for ( let i = 0; i < 3; i ++ ) {
			const new_val = parseInt( low[ i ] - ( ( low[ i ] - high[ i ] ) * depth ) );
			new_values.push( new_val < 0 ? 0 : new_val );
		}

		return 'rgb( ' + new_values.join() + ' )';
	};

	const add_face_to_goemetry = ( a, b, c, geometry, water_geometry, above_options, below_options ) => {
		if ( use_earth ) {
			let face = new THREE.Face3( a.index, b.index, c.index );

			[ a, b, c ].forEach( ( item, index ) => {
				const depth = parseFloat( ( item.amp_value / ( above_options.base_amp ) ).toFixed( 2 ) );

				face.vertexColors[ index ] = new THREE.Color( get_water_colour_by_depth( depth, low_alt_colour, high_alt_colour ) );
			} );

			geometry.faces.push( face );
		}

		if ( use_water && ( a.amp_value < 0 || b.amp_value < 0 || c.amp_value < 0 ) ) {
			let face = new THREE.Face3( a.index, b.index, c.index );

			[ a, b, c ].forEach( ( item, index ) => {
				const depth = parseFloat( ( item.amp_value / ( below_options.base_amp * -1 ) ).toFixed( 2 ) );

				face.vertexColors[ index ] = new THREE.Color( get_water_colour_by_depth( depth ) );
			} );

			water_geometry.faces.push( face );
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
