	
	// Translate data from cube to sphere
	export const map_data_onto_sphere = ( grid_data, layer_options, final_freq_count ) => {
		const 	quadrant_cutoff_index = Math.ceil( final_freq_count / 2 ),
				panel_quadrant_one = [...grid_data[ 0 ][ 'data' ] ].slice( 0, quadrant_cutoff_index ).map( ( item ) => [...item].slice( 0, quadrant_cutoff_index ) );

		panel_quadrant_one.forEach( ( quadrant_row, index ) => {
			quadrant_row.forEach( ( quadrant_row_index, sub_index ) => {
				const 	xz_length_to_center = ( quadrant_row_index.x * quadrant_row_index.x ) + ( quadrant_row_index.z * quadrant_row_index.z ),
						xzy_length_to_center = Math.sqrt( ( quadrant_row_index.y * quadrant_row_index.y ) + xz_length_to_center ),
						mirrored_column_index = final_freq_count - 1 - sub_index,
						mirrored_row_index = final_freq_count - 1 - index;

				grid_data.forEach( grid_data_inst => {
					const data = grid_data_inst[ 'data' ];

					[
						data[ index ][ sub_index ],
						data[ index ][ mirrored_column_index ],
						data[ mirrored_row_index ][ sub_index ],
						data[ mirrored_row_index ][ mirrored_column_index ],
					].forEach( inst => {
						if ( !inst.c2s_mapped ) {
							const coords_multiplier = layer_options.radius / ( xzy_length_to_center - inst.amp_value );

							inst.y *= coords_multiplier;
							inst.x *= coords_multiplier; 
							inst.z *= coords_multiplier; 

							inst[ 'c2s_mapped' ] = true;
						}
					} );
				} );
			} );
		} );

		return grid_data;
	}