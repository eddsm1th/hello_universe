
	export const create_celestial_body = ( layer_options = {} ) => {
		layer_options = { ...get_celestial_body_defaults(), ...layer_options };
		layer_options.final_frequency_count = get_final_frequency_count( layer_options );

		// move to own file
		const 	flat_data = get_flat_array( layer_options ),
				octahedron_data = map_flat_data_to_octahedron( flat_data, layer_options ),
				hemispherical_data = map_octahedron_data_to_hemisphere( octahedron_data, layer_options ),
				spherical_data = [ ...hemispherical_data, ...hemispherical_data.slice( 0, hemispherical_data.length - 1 ).reverse().map( layer => layer.map( ( layer_item ) => ( { ...layer_item, ...{ y: layer_item.y * -1 } } ) ) ) ];

		return spherical_data;
	}

	const get_celestial_body_defaults = () => {
		return {
			'base_frequency' : 4,
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
				const xzy_length_to_center = Math.sqrt( ( y * y ) + ( x * x ) + ( z * z ) );

				[
					current_layer[ sub_index ],
					current_layer[ sub_index + points_per_side ],
					current_layer[ sub_index + ( points_per_side * 2 ) ],
					current_layer[ sub_index + ( points_per_side * 3 ) ],
				].forEach( ( { x, y, z }, coords_multiplier = radius / xzy_length_to_center ) => [ x, y, z ].forEach( coord => coord *= coords_multiplier ) );
			} );
		} );

		return octahedron_data;
	}

	const map_flat_data_to_octahedron = ( flat_array, { radius, final_frequency_count } ) => {
		const step_size = ( radius / ( final_frequency_count - 1 ) );

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
					'y' : ( ( step_size * index ) - radius ),
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