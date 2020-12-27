
	export const map_terrain_on_data = ( data, { layers, amp_diff, amp_bias } ) => {
		for ( let layer = 0; layer < layers; layer ++ ) {
			const point_diff = Math.pow( 2, ( ( layers - layer ) - 1 ) );

			for ( let layer_index = 0; layer_index < Math.ceil( data.length / 2 ); layer_index += point_diff ) {
				const 	current_layer = data[ layer_index ],
						points_per_side = ( current_layer.length / 4 );

				let point_layer_offset = point_diff;

				for ( let point_index = 0; point_index <= current_layer.length; point_index += point_diff ) {
					const 	amp_value = generate_amp( amp_diff, amp_bias, layer ),
							current_point = infinite_array_reference( data[ layer_index ], point_index ),
							previous_lateral_reference = infinite_array_reference( data[ layer_index ], ( point_index - point_diff ) );

					if ( previous_lateral_reference && point_index != 0 ) {
						const 	triangle_peak_layer_reference = data[ layer_index - point_diff ];

						if ( triangle_peak_layer_reference ) {
							const 	current_point_amp = current_point.amp_value + ( current_point[ 'layer_' + layer ] ? 0 : amp_value ),
									triangle_peak_reference = infinite_array_reference( triangle_peak_layer_reference, ( point_index - point_diff - point_layer_offset ) ),
									lat_diff = previous_lateral_reference.amp_value - current_point_amp,
									lng_diff = triangle_peak_reference.amp_value - current_point_amp,
									lat_step_size = lat_diff / point_diff;

							for ( let fill_layer_index = 0; fill_layer_index < point_diff; fill_layer_index ++ ) {
								const 	to_fill_layer = data[ layer_index - fill_layer_index ],
										weighted_lng_diff = ( lng_diff * ( fill_layer_index / point_diff ) );

								for ( let fill_point_index = 0; fill_point_index < point_diff - fill_layer_index; fill_point_index ++ ) {
									const 	point_index_reference = ~~( point_index - fill_point_index - fill_layer_index + ( fill_layer_index * ( point_layer_offset / points_per_side ) ) ),
											to_fill_point = infinite_array_reference( to_fill_layer, point_index_reference ),
											to_fill_point_amp = ( current_point_amp + ( lat_step_size * fill_point_index ) + weighted_lng_diff );

									if ( point_index != current_layer.length || fill_layer_index != 0 || fill_point_index != 0 ) {
										if ( !to_fill_point ) debugger;

										to_fill_point.amp_value = to_fill_point_amp;

										to_fill_point[ 'layer_' + layer ] = true;
									}
								}	 
							}
						}
					} else {
						current_point.amp_value += amp_value;

						current_point[ 'layer_' + layer ] = true;
					}

					if ( point_index % points_per_side == 0 ) point_layer_offset -= point_diff
				}
			}
		} 

		return data;
	}

	const get_average_from_array = array => array.map( ref => ref.base_average || 0 ).reduce( ( a, b ) => a + b, 0 ) / array.length;

	const infinite_array_reference = ( array = [], index = 0) => array[ index - ( Math.floor( index / array.length ) * array.length ) ];

	const generate_amp = ( amp_diff, amp_bias, i ) => {
		const 	amp_multiplier = 1 / Math.pow( amp_diff, i ),
				amp_value = ( amp_bias == 0 ? Math.random() : get_amp_bias( Math.random(), amp_diff ) ) * 2 - 1;

		return amp_multiplier * 60;

		// return ( amp_value * amp_multiplier ) * 20;
	}

	const get_amp_bias = ( x, amp_bias ) => {
		const k = Math.pow( 1 - amp_bias / 100, 3 );

		return ( x * k ) / ( x * k - x + 1 ); 
	}