
	export const create_celestial_body = ( layer_options = {} ) => {
		layer_options = { ...get_celestial_body_defaults(), ...layer_options };
		layer_options.final_frequency_count = get_final_frequency_count( layer_options );

		// move to own file
		const 	flat_data = get_flat_array( layer_options ),
				octahedron_data = map_flat_data_to_octahedron( flat_data, layer_options ),
				hemispherical_data = map_octahedron_data_to_hemisphere( octahedron_data, layer_options ),
				spherical_data = [ ...hemispherical_data, ...hemispherical_data.slice( 0, hemispherical_data.length - 1 ).reverse().map( layer => layer.map( ( layer_item ) => ( { ...layer_item, ...{ y: layer_item.y * -1 } } ) ) ) ];

		const 	scene = new THREE.Scene(),
				camera = new THREE.PerspectiveCamera( 100, window.innerWidth / window.innerHeight, .1, 1000 ),
				renderer = new THREE.WebGLRenderer();

				renderer.setSize( window.innerWidth, window.innerHeight );
		document.body.appendChild( renderer.domElement );

		camera.position.z = 800; // make this more relative to planet size and window

		spherical_data.flat().forEach( ( item ) => {
			const geometry = new THREE.SphereGeometry( 5, 1, 1 );
			const material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
			const sphere = new THREE.Mesh( geometry, material );
			sphere.position.x = item.x;
			sphere.position.y = item.y;
			sphere.position.z = item.z;
			scene.add( sphere );
		} );

		apply_drag_controls( scene );

		function animate() {
				requestAnimationFrame( animate );
				renderer.render( scene, camera );
		}
		animate();

		return spherical_data;
	}

	const apply_drag_controls = ( scene ) => {
		let click_coords = {
			'x' : null,
			'y' : null,
		},
		can_drag = false;

		document.addEventListener( 'mousedown', ( event ) => {
			can_drag = true;

			click_coords = {
				'x' : event.clientX,
				'y' : event.clientY,
			};
		} );

		document.addEventListener( 'mouseup', ( event ) => can_drag = false );

		document.addEventListener( 'mousemove', ( event ) => {
			if ( can_drag ) {
				scene.rotation.y += ( ( click_coords.x - event.clientX ) / 400 );
				scene.rotation.x += ( ( click_coords.y - event.clientY ) / 400 );

				click_coords = {
					'x' : event.clientX,
					'y' : event.clientY,
				};
			} 
		} );
	}

	const get_celestial_body_defaults = () => {
		return {
			'base_frequency' : 10,
			'layers' : 1,
			'radius' : 600,
			'amp_bias' : 0,
		};
	}

	const map_octahedron_data_to_hemisphere = ( octahedron_data, { radius } ) => {
		const octahedron_data_to_calculate = [ ...octahedron_data ].slice( 1 ).map( layer => layer.slice( 0, layer.length / 4 ) );

		octahedron_data_to_calculate.forEach( ( layer, index ) => {
			const 	points_per_side = layer.length,
					current_layer = octahedron_data[ index + 1 ];

			layer.forEach( ( { x, y, z }, sub_index ) => {
				const 	xzy_length_to_center = Math.sqrt( ( y * y ) + ( x * x ) + ( z * z ) ),
						coords_multiplier = ( ( radius * .75 ) / xzy_length_to_center );

				[
					current_layer[ sub_index ],
					current_layer[ sub_index + points_per_side ],
					current_layer[ sub_index + ( points_per_side * 2 ) ],
					current_layer[ sub_index + ( points_per_side * 3 ) ],
				].forEach( inst => {
					inst.y *= coords_multiplier;
					inst.x *= coords_multiplier; 
					inst.z *= coords_multiplier; 
				})
			} );
		} );

		return octahedron_data;
	}

	const map_flat_data_to_octahedron = ( flat_array, { radius, final_frequency_count } ) => {
		const step_size = ( ( radius * .75 ) / ( final_frequency_count - 1 ) );

		return flat_array.map( ( layer, index ) => {
			const 	points_per_side = Math.ceil( ( layer.length / 4 ) ),
					layer_offset = ( ( step_size / 2 ) * index ),

					stepped_side_array = new Array( points_per_side ).fill( null ).map( ( item, stepped_side_index ) => ( ( stepped_side_index * step_size ) - layer_offset ) ),
					reverse_stepped_side_array = stepped_side_array.map( stepped_side_val => stepped_side_val * -1 ),

					start_value = new Array( points_per_side ).fill( layer_offset * -1 ),
					end_value = start_value.map( end_val => end_val *= -1 ),

					x_layer_data = [ stepped_side_array, end_value, reverse_stepped_side_array, start_value ].flat(),
					z_layer_data = [ end_value, reverse_stepped_side_array, start_value, stepped_side_array ].flat();

			// needs rethinking
			return layer.map( ( layer_item, sub_index ) => {
				return {
					'x' : x_layer_data[ sub_index ],
					'y' : ( ( step_size * index ) - ( radius * .75 ) ),
					'z' : z_layer_data[ sub_index ],
				};
			} );
		} );
	}

	const get_flat_array = ( { final_frequency_count } ) => {
		return [ [ {} ], ...new Array( final_frequency_count - 1 ).fill().map( ( layer, index ) => new Array( 4 * ( index + 1 ) ).fill( {} ) ) ];
	}

	const get_final_frequency_count = ( { base_frequency, layers } ) => {
		return base_frequency * layers; // write this properly so it can use muiltiple layers
	}