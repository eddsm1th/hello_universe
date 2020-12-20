
	export const create_celestial_body = ( layer_options = {} ) => {
		layer_options = { ...get_celestial_body_defaults(), ...layer_options };
		layer_options.final_frequency_count = get_final_frequency_count( layer_options );

		// move to own file
		const 	flat_data = get_flat_array( layer_options ),
				octahedron_data = map_flat_data_to_octahedron( flat_data, layer_options ),
				hemispherical_data = map_octahedron_data_to_hemisphere( octahedron_data.map( i => i ), layer_options );

		let 	last_index = hemispherical_data.flat()[ hemispherical_data.flat().length - 1 ].index + 1;

		const 	spherical_data = [ ...hemispherical_data, ...hemispherical_data.reverse().slice( 1, hemispherical_data.length ).map( layer => layer.map( ( layer_item ) => {
					return { ...layer_item, ...{ y: layer_item.y * -1, index: ( last_index ++ ) } }
				} ) ) ];

		const array_to_render = spherical_data;

		const 	geometry = new THREE.Geometry(),
				scene = new THREE.Scene(),
				camera = new THREE.PerspectiveCamera( 100, window.innerWidth / window.innerHeight, .1, 1000 ),
				renderer = new THREE.WebGLRenderer();

		renderer.setSize( window.innerWidth, window.innerHeight );
		document.body.appendChild( renderer.domElement );

		camera.position.z = 1200; // make this more relative to planet size and window

		array_to_render.flat().forEach( ( item ) => geometry.vertices.push( new THREE.Vector3( item.x, item.y, item.z ) ) );

		const layers_to_loop_through = Math.ceil( array_to_render.length / 2 );

		for ( let i = 1; i < layers_to_loop_through; i ++ ) {
			const 	current_layer = array_to_render[ i ],
					polar_current_layer = array_to_render[ array_to_render.length - 1 - i ],
					points_per_side = ( current_layer.length / 4 );

			let point_layer_offsets = 1;

			current_layer.forEach( ( layer_item, index ) => {
				if ( index % points_per_side == 0 ) {
					point_layer_offsets -= 1;

					// top down
					geometry.faces.push( new THREE.Face3(
						current_layer[ index ].index,
						array_to_render[ i - 1 ][ index + point_layer_offsets ].index,
						( current_layer[ index + 1 ] || current_layer[ 0 ] ).index
					) );

					// bottom up
					geometry.faces.push( new THREE.Face3(
						polar_current_layer[ index ].index,
						array_to_render[ array_to_render.length - i ][ index + point_layer_offsets ].index,
						( polar_current_layer[ index + 1 ] || polar_current_layer[ 0 ] ).index
					) );
				} else {
					geometry.faces.push( new THREE.Face3(
						current_layer[ index ].index,
						array_to_render[ i - 1 ][ index + point_layer_offsets - 1 ].index,
						( array_to_render[ i - 1 ][ index + point_layer_offsets ] || array_to_render[ i - 1 ][ 0 ] ).index,
					) );
					geometry.faces.push( new THREE.Face3(
						current_layer[ index ].index,
						( array_to_render[ i - 1 ][ index + point_layer_offsets ] || array_to_render[ i - 1 ][ 0 ] ).index,
						( current_layer[ index + 1 ] || current_layer[ 0 ] ).index
					) );


					geometry.faces.push( new THREE.Face3(
						polar_current_layer[ index ].index,
						array_to_render[ array_to_render.length - i ][ index + point_layer_offsets - 1 ].index,
						( array_to_render[ array_to_render.length - i ][ index + point_layer_offsets ] || array_to_render[ array_to_render.length - i ][ 0 ] ).index,
					) );
					geometry.faces.push( new THREE.Face3(
						polar_current_layer[ index ].index,
						( array_to_render[ array_to_render.length - i ][ index + point_layer_offsets ] || array_to_render[ array_to_render.length - i ][ 0 ] ).index,
						( polar_current_layer[ index + 1 ] || polar_current_layer[ 0 ] ).index
					) );
				}
			} );
		}

		const material = new THREE.MeshBasicMaterial( {
			color: 0x00ff00,
			wireframe: true,
			side: THREE.DoubleSide,
		} );
		const terrain = new THREE.Mesh( geometry, material );

		scene.add( terrain );

		apply_drag_controls( scene );

		function animate() {
				requestAnimationFrame( animate );
				renderer.render( scene, camera );
		}
		animate();

		console.log( array_to_render );

		// return spherical_data;
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

	const get_celestial_body_defaults = () => ( {
		'base_frequency' : 8,
		'layers' : 1,
		'radius' : 600,
		'amp_bias' : 0,
	} )

	const map_octahedron_data_to_hemisphere = ( octahedron_data, { radius } ) => {
		// return octahedron_data;

		const octahedron_data_to_calculate = [ ...octahedron_data ].slice( 1 ).map( layer => layer.slice( 0, layer.length / 4 ) );

		octahedron_data_to_calculate.forEach( ( layer, index ) => {
			const 	points_per_side = layer.length,
					current_layer = octahedron_data[ index + 1 ];

			layer.forEach( ( { x, y, z }, sub_index ) => {
				const 	xzy_length_to_center = Math.sqrt( ( y * y ) + ( x * x ) + ( z * z ) ),
						coords_multiplier = ( radius / xzy_length_to_center );

				[
					current_layer[ sub_index ],
					current_layer[ sub_index + points_per_side ],
					current_layer[ sub_index + ( points_per_side * 2 ) ],
					current_layer[ sub_index + ( points_per_side * 3 ) ],
				].forEach( inst => {
					inst.y *= coords_multiplier;
					inst.x *= coords_multiplier; 
					inst.z *= coords_multiplier; 
				} )
			} );
		} );

		return octahedron_data;
	}

	const degree_in_radians = angle => angle * ( Math.PI / 180 );

	const map_flat_data_to_octahedron = ( flat_array, { radius, final_frequency_count } ) => {
		const layer_angle_increment = ( 90 / ( final_frequency_count - 1 ) );

		let cumulative_traversial_distance,
			current_index = 0;
			
		return flat_array.map( ( layer, index ) => { 	
			const 	points_per_side = Math.ceil( ( layer.length / 4 ) ),
					angle_increment = 90 / points_per_side,
					layer_traversial_radians = degree_in_radians( -45 + ( layer_angle_increment * index ) );

			cumulative_traversial_distance = ( ( Math.tan( layer_traversial_radians ) * radius ) + radius ) / 2;
					
			const 	stepped_side_array = new Array( points_per_side ).fill( null ).map( ( item, stepped_side_index ) => {
						const radians = degree_in_radians( -45 + ( angle_increment * stepped_side_index ) );	

						return Math.tan( radians ) * cumulative_traversial_distance;
					} ),
					reverse_stepped_side_array = stepped_side_array.map( stepped_side_val => stepped_side_val * -1 );

			const 	start_value = new Array( points_per_side ).fill( cumulative_traversial_distance * -1 ),
					end_value = start_value.map( end_val => end_val *= -1 );

			const 	x_layer_data = [ stepped_side_array, end_value, reverse_stepped_side_array, start_value ].flat(),
					z_layer_data = [ end_value, reverse_stepped_side_array, start_value, stepped_side_array ].flat();

			return layer.map( ( layer_item, sub_index ) => ( {
				'x' : x_layer_data[ sub_index ],
				'y' : cumulative_traversial_distance * -1 + radius,
				'z' : z_layer_data[ sub_index ],
				'index' : current_index ++, 
			} ) );
		} );
	}

	const get_flat_array = ( { final_frequency_count } ) => [ [ {} ], ...new Array( final_frequency_count - 1 ).fill().map( ( layer, index ) => new Array( 4 * ( index + 1 ) ).fill( {} ) ) ];

	const get_final_frequency_count = ( { base_frequency, layers } ) => {
		let count = base_frequency;

		for ( let i = 1; i < layers; i ++ ) {
			count *= 2;
			count -= 1;
		}

		return count;
	}