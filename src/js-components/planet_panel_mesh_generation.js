export function generate_point_data ( layer_options, final_freq_count, sides_to_render ) {
	let sides = [];

	for ( let i = 0; i < layer_options.base_layers; i ++ ) {
		const amount_to_skip = Math.pow( layer_options.freq_diff, ( layer_options.base_layers - ( i ) ) - 1  );

		for ( let j = 0; j < sides_to_render; j ++ ) {
			if ( i == 0 ) sides.push( {} );

			const injection_data = get_injection_data( j )

			sides[ j ][ 'layer_' + i ] = generate_mesh( layer_options, amount_to_skip, final_freq_count, i, injection_data, sides, j );
		}
	}

	const step = ( ( layer_options.radius * 2 ) / ( final_freq_count - 1 ) );

	sides.forEach( ( side ) => {
		side[ 'data' ] = side.layer_0.map( ( item, index ) => {
			return item.map( ( sub_item, sub_index ) => {
				return {
					'amp_value' : get_total_amp( layer_options, side, index, sub_index ),
					'y' : layer_options.radius,
					'x' : ( step * sub_index ) - layer_options.radius,
					'z' : ( step * index ) - layer_options.radius,
					'index' : sub_index + ( index * final_freq_count ), 
				}
			} );
		} );
	} );

	return sides;			
}

// Get data to know how to stitch
const get_injection_data = ( side_index ) => {
	switch ( side_index ) {
		case 0 :
		case 1 :
			return null;
		case 2 : // front
			return [ [ 2, 0 ], null, [ 0, 1 ], null ]; // where [ 1, 1 ] means the first face from the first panel
		case 3 : // left
			return [ null, [ 3, 0 ], [ 3, 2, true ], [ 3, 1, true ] ];
		case 4 : // right
			return [ null, [ 1, 1, true ], [ 1, 2 ], [ 1, 0 ] ];
		case 5 : // back
			return [ [ 2, 1 ], [ 0, 4, true ], [ 0, 0 ], [ 0, 3 ] ];
		default :
			console.error( 'Something fucked up...' );
			return;
	}
}

// Get entire row for stitching
const get_spliced_data = ( data, side_index, is_negative ) => {
	switch ( side_index ) {
		case 0 :
			return data[ 0 ];
		case 1 :
			return data.map( ( item ) => item[ item.length - 1 ] );
		case 2 :
			return data[ data.length - 1 ];
		case 3 :
			const arr = data.map( ( item ) => item[ 0 ] );

			return ( is_negative ? arr.reverse() : arr );
	}
}

// Get single point for stitching
const get_row_spliced_data = ( data, side_index, current_row_index, is_negative ) => {
	switch ( side_index ) {
		case 0 :
			return data[ 0 ][ ( is_negative ? data[ 0 ].length - 1 - current_row_index : current_row_index ) ];
		case 1 :
			return data[ ( is_negative ? data.length - 1 - current_row_index : current_row_index ) ][ data[ 0 ].length - 1 ];
		case 2 :
			return data[ data.length - 1 ][ ( is_negative ? data[ 0 ].length - current_row_index : current_row_index ) ];
		case 3 :
			return data[ is_negative ? data.length - 1 - current_row_index : current_row_index ][ 0 ];
	}
}

// Generate panel layer mesh
const generate_mesh = ( layer_options, amount_to_skip, final_freq_count, layer_index, injection_data, sides, side_index ) => {
	let mesh = new Array( final_freq_count );

	for ( let i = 0; i < final_freq_count; i += amount_to_skip ) { // Loop through rows
		if ( i == 0 && injection_data && injection_data[ 0 ] ) {
			const cloned_panel_data = sides[ injection_data[ 0 ][ 1 ] ];

			mesh[ i ] = get_spliced_data( cloned_panel_data[ 'layer_' + layer_index ], injection_data[ 0 ][ 0 ], injection_data[ 0 ][ 2 ] );
		} else if ( i == final_freq_count - 1 && injection_data && injection_data[ 2 ] ) {
			const cloned_panel_data = sides[ injection_data[ 2 ][ 1 ] ];

			mesh[ i ] = get_spliced_data( cloned_panel_data[ 'layer_' + layer_index ], injection_data[ 2 ][ 0 ], injection_data[ 2 ][ 2 ] );
		} else {
			let mesh_row = new Array( final_freq_count ).fill( 0 );

			for ( let j = 0; j < final_freq_count; j += amount_to_skip ) { // loop through single row
				if ( j == 0 && injection_data && injection_data[ 3 ] ) {
					const cloned_panel_data = sides[ injection_data[ 3 ][ 1 ] ];

					mesh_row[ j ] = get_row_spliced_data( cloned_panel_data[ 'layer_' + layer_index ], injection_data[ 3 ][ 0 ], i, injection_data[ 3 ][ 2 ] );
				} else if ( j == final_freq_count - 1 && injection_data && injection_data[ 1 ] ) {
					const cloned_panel_data = sides[ injection_data[ 1 ][ 1 ] ];

					mesh_row[ j ] = get_row_spliced_data( cloned_panel_data[ 'layer_' + layer_index ], injection_data[ 1 ][ 0 ], i, injection_data[ 1 ][ 2 ] );
				} else {
					mesh_row[ j ] = generate_point_amp( layer_options, layer_index );
				}

				if ( j != 0 && amount_to_skip != 1 ) {
					const 	previous_point = mesh_row[ j - amount_to_skip ],
							current_point = mesh_row[ j ],
							step = ( previous_point - current_point ) / amount_to_skip;

					for ( let z = 0; z < amount_to_skip - 1; z ++ ) {
						mesh_row[ j - ( ( amount_to_skip - 1 - z ) ) ] = ( current_point + ( step * ( amount_to_skip - 1 - z ) ) );
					}
				}
			}

			mesh[ i ] = mesh_row;
		}

		if ( i != 0 && amount_to_skip != 1 ) {
			const 	previous_layer = mesh[ i - amount_to_skip ],
					current_layer = mesh[ i ];

			for ( let z = 0; z < amount_to_skip - 1; z ++ ) {
				mesh[ i - ( ( amount_to_skip - 1 - z ) ) ] = create_fill_layer( z + 1, previous_layer, current_layer, final_freq_count, layer_options );
			} 
		}
	}

	return mesh;
}

// Get an amplitude base on current generation stage
const generate_point_amp = ( layer_options, i ) => {
	const 	amp_multiplier = ( layer_options.base_amp * ( 1 / Math.pow( layer_options.amp_diff, i ) ) ),
			pre_amp =  get_amp_bias( Math.random(), layer_options ) * amp_multiplier - ( amp_multiplier / 2 );

	return pre_amp;
}

const get_amp_bias = ( x, layer_options ) => {
	const k = Math.pow( 1 - layer_options.amp_bias / 100, 3 );

	return ( x * k ) / ( x * k - x + 1 ); 
}

// Creates missing rows
const create_fill_layer = ( steps, previous_array, next_array, final_freq_count, layer_options ) => {
	const fill_layer = new Array( final_freq_count ).fill().map( ( i, index ) => {
		const 	y_distance_in_points = ( next_array[ index ] - previous_array[ index ] ) * -1,
				step_distance = y_distance_in_points / ( Math.pow( layer_options.freq_diff, ( layer_options.base_layers - 1 ) ) );
		
		return previous_array[ index ] - ( step_distance * steps );
	} );

	return fill_layer;
}

// Add all layer amp values
const get_total_amp = ( layer_options, side, index, sub_index ) => {
	let placeholder_amp = 0;

	for ( let i = 0; i < layer_options.base_layers; i ++ ) {
		placeholder_amp += side[ 'layer_' + i ][ index ][ sub_index ];
	}

	return placeholder_amp;
}