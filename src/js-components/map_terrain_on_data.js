
	export const map_terrain_on_data = ( data, { layers, amp_diff, amp_bias } ) => {
		for ( let i = 0; i < layers; i ++ ) {
			const point_diff = Math.pow( 2, ( layers - ( i ) ) - 1  );

			for ( let layer_index = 0; layer_index < data.length; layer_index += point_diff ) {
				const 	current_layer = data[ layer_index ],
						points_per_side = ( current_layer.length / 4 );

				let point_layer_offset = point_diff;

				for ( let point_index = 0; point_index < current_layer.length; point_index += point_diff ) {
					const 	amp_value = generate_amp( amp_diff, amp_bias, i ),
							current_point = data[ layer_index ][ point_index ];

					if ( i == 0 ) {
						current_point.amp_value = current_point.base_average = amp_value;
					} else {
						if ( point_index % points_per_side == 0 ) { // corner peices
							point_layer_offset -= point_diff;

							if ( current_point.amp_value ) {
								current_point.amp_value += amp_value;
							} else {
								const 	previous_reference_point = infinite_array_reference( data[ layer_index - point_diff ], point_index + point_layer_offset ),
										next_reference_point = infinite_array_reference( data[ layer_index + point_diff ], point_index + point_layer_offset ),
										reference_point_array = [ previous_reference_point ],
										reference_average_height = reference_point_array.map( ref => ref[ 'layer_' + ( i - 1 ) + '_amp' ] || 0 ).reduce( ( a, b ) => a + b, 0 ) / reference_point_array.length;

								current_point.amp_value = ( reference_average_height + amp_value );
								current_point.base_average = reference_average_height;
							}
						} else {
							if ( current_point.amp_value ) {
								current_point.amp_value += amp_value;
							} else {
								const 	previous_reference_point = infinite_array_reference( data[ layer_index - point_diff ], point_index - point_diff + point_layer_offset ),
										next_reference_point = infinite_array_reference( data[ layer_index - point_diff ], point_index + point_layer_offset ),

										previous_lateral_reference_point = infinite_array_reference( data[ layer_index ], point_index - point_diff ),
										next_lateral_reference_point = infinite_array_reference( data[ layer_index ], point_index + point_diff ),

										reference_point_array = [ previous_reference_point, next_reference_point, previous_lateral_reference_point, next_lateral_reference_point ],
										reference_average_height = reference_point_array.map( ref => ref.base_average || 0 ).reduce( ( a, b ) => a + b, 0 ) / reference_point_array.length;

								current_point.amp_value = ( reference_average_height + amp_value );
								current_point.base_average = reference_average_height;
							}
						}
					}

					current_point[ 'layer_' + i + '_amp' ] = amp_value;
				}
			}
		} 

		return data;
	}

	const infinite_array_reference = ( array, index ) => array[ index - ( Math.floor( index / array.length ) * array.length ) ];

	const generate_amp = ( amp_diff, amp_bias, i ) => {
		const 	amp_multiplier = 1 / Math.pow( amp_diff, i ),
				amp_value = ( amp_bias == 0 ? Math.random() : get_amp_bias( Math.random(), amp_diff ) ) * 2 - 1;

		// return 60 * amp_multiplier;
		return ( amp_value * amp_multiplier ) * 20;
	}

	const get_amp_bias = ( x, amp_bias ) => {
		const k = Math.pow( 1 - amp_bias / 100, 3 );

		return ( x * k ) / ( x * k - x + 1 ); 
	}