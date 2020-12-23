
	export const map_terrain_on_data = ( data, { layers, amp_diff, amp_bias } ) => {
		for ( let i = 0; i < layers; i ++ ) {
			const point_diff = Math.pow( 2, ( layers - ( i ) ) - 1  );

			for ( let layer_index = point_diff; layer_index < data.length; layer_index += point_diff ) {
				const 	current_layer = data[ layer_index ],
						previous_layer = data[ layer_index - point_diff ],
						points_per_side = Math.ceil( ( current_layer.length / 4 ) );

				let 	point_layer_offset = 1;

				for ( let point_index = 0; point_index < current_layer.length; point_index += point_diff ) {
					for ( let current_point_index = 0; current_point_index < point_diff; current_point_index ++ ) {
						const 	current_point = current_layer[ point_index + current_point_index ] || current_layer[ 0 ],
								amp_value = generate_amp( amp_diff, amp_bias, i );

						if ( point_index % points_per_side == 0 || point_index == 0 ) {
							point_layer_offset -= point_diff;

							if ( i == 0 )console.log( 'SKIP //\tPI_' + point_index + '\tL_' + layer_index + '\t\tP_' + point_index );
						} else {
							current_point.amp_value = current_point.amp_value ? current_point.amp_value += amp_value : amp_value;

							const	corresponsing_point_on_prev_layer = previous_layer[ point_index + current_point_index - point_layer_offset ] || previous_layer[ 0 ],
									step_size = current_point.amp_value - ( corresponsing_point_on_prev_layer.amp_value || 0 ) / ( point_diff - 1 );

							for ( let bw_layer_traversal = 1; bw_layer_traversal < point_diff; bw_layer_traversal ++ ) {
								const 	point_to_fill_amp = data[ layer_index - bw_layer_traversal ][ current_point_index ],
										filled_amp = amp_value - step_size;
								
								point_to_fill_amp.amp_value = point_to_fill_amp.amp_value ? point_to_fill_amp.amp_value += filled_amp : filled_amp;
							} 
						}
					}
				}
			} 
		}

		return data;
	}

	const generate_amp = ( amp_diff, amp_bias, i ) => {
		const 	amp_multiplier = 1 / Math.pow( amp_diff, i ),
				amp_value = ( amp_bias == 0 ? Math.random() : get_amp_bias( Math.random(), amp_diff ) ) * 2 - 1;

		return amp_value * amp_multiplier;
	}

	const get_amp_bias = ( x, amp_bias ) => {
		const k = Math.pow( 1 - amp_bias / 100, 3 );

		return ( x * k ) / ( x * k - x + 1 ); 
	}