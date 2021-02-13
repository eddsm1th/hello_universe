export function generate_point_data ( layer_options, final_freq_count, sides_to_render = 6 ) {
	let sides = [];

	for ( let layer_index = 0; layer_index < layer_options.base_layers; layer_index ++ ) {
		const amount_to_skip = Math.pow( layer_options.freq_diff, ( layer_options.base_layers - layer_index ) - 1 );

		for ( let side_index = 0; side_index < sides_to_render; side_index ++ ) {
			if ( layer_index == 0 ) sides.push( {} );

			sides[ side_index ][ 'layer_' + layer_index ] = generate_mesh( layer_options, amount_to_skip, final_freq_count, layer_index );
		}
	}

	const 	step = ( ( layer_options.radius * 2 ) / ( final_freq_count - 1 ) ),
			angle_increment = ( 90 / ( final_freq_count - 1 ) ),
			side_total_point_count = ( ( final_freq_count * final_freq_count ) - 0 );

	// rotation_values = [
	// 	[ 0, 0, 0 ],
	// 	[ 1.5708 * 2, 0, 0 ],
	// 	[ 1.5708, 0, 0 ],
	// 	[ 0, 0, 1.5708 ],
	// 	[ 0, 0, -1.5708 ],
	// 	[ -1.5708, 0, 0 ],
	// ];

	let pancake_stack = true;

	sides.forEach( ( side, side_index ) => {
		side[ 'data' ] = side.layer_0.map( ( item, index ) => {
			return item.map( ( sub_item, sub_index ) => {
				return {
					'amp_value' : get_total_amp( layer_options, side, index, sub_index ),
					'index' : ( ( sub_index + ( index * final_freq_count ) ) + ( side_total_point_count * side_index ) ),

					// rewrite this to map onto proper sphere position

					'y' : pancake_stack
							? layer_options.radius - ( ( layer_options.radius / 2.5 ) * side_index )
							: layer_options.radius,
					'x' : Math.tan( degree_in_radians( -45 + ( angle_increment * sub_index ) ) ) * layer_options.radius,
					'z' : Math.tan( degree_in_radians( -45 + ( angle_increment * index ) ) ) * layer_options.radius,
				}
			} );
		} );
	} );

	return sides;
}

const degree_in_radians = angle => angle * ( Math.PI / 180 );

// Generate panel layer mesh
const generate_mesh = ( layer_options, amount_to_skip, final_freq_count, layer_index ) => {
	let mesh = new Array( final_freq_count );

	for ( let i = 0; i < final_freq_count; i += amount_to_skip ) { // Loop through rows
		let mesh_row = new Array( final_freq_count ).fill( 0 );

		for ( let j = 0; j < final_freq_count; j += amount_to_skip ) { // loop through single row
			mesh_row[ j ] = generate_point_amp( layer_options, layer_index );

			if ( j != 0 && amount_to_skip != 1 ) { // backfill skipped points in row
				const 	previous_point = mesh_row[ j - amount_to_skip ],
						current_point = mesh_row[ j ],
						step = ( previous_point - current_point ) / amount_to_skip;

				for ( let z = 0; z < amount_to_skip - 1; z ++ ) {
					mesh_row[ j - ( ( amount_to_skip - 1 - z ) ) ] = ( current_point + ( step * ( amount_to_skip - 1 - z ) ) );
				}
			}
		}

		mesh[ i ] = mesh_row;

		if ( i != 0 && amount_to_skip != 1 ) { // create fill layer for skipped rows
			const 	previous_layer = mesh[ i - amount_to_skip ],
					current_layer = mesh[ i ];

			for ( let z = 0; z < amount_to_skip - 1; z ++ ) {
				mesh[ i - ( ( amount_to_skip - 1 - z ) ) ] = create_fill_layer( z + 1, previous_layer, current_layer, final_freq_count, layer_options, [  ] );
			} 
		}
	}

	return mesh;
}

// Get an amplitude base on current generation stage
const generate_point_amp = ( layer_options, i ) => {
	const 	amp_multiplier = ( layer_options.base_amp * ( 1 / Math.pow( layer_options.amp_diff, i ) ) ),
			pre_amp = ( layer_options.amp_bias == 0 ? Math.random() : get_amp_bias( Math.random(), layer_options ) ) * amp_multiplier - ( amp_multiplier / 2 );

	return pre_amp;
}

// i stole this from a youtube video. it makes the amp more bias towards lower or higher values
const get_amp_bias = ( x, layer_options ) => {
	const k = Math.pow( 1 - layer_options.amp_bias / 100, 3 );

	return ( x * k ) / ( x * k - x + 1 ); 
}

// Creates missing rows
const create_fill_layer = ( steps, previous_array, next_array, final_freq_count, layer_options ) => {
	return new Array( final_freq_count ).fill().map( ( i, index ) => {
		const 	y_distance_in_points = ( next_array[ index ] - previous_array[ index ] ) * -1,
				step_distance = y_distance_in_points / ( Math.pow( layer_options.freq_diff, ( layer_options.base_layers - 1 ) ) );
		
		return previous_array[ index ] - ( step_distance * steps );
	} );
}

// Add all layer amp values
const get_total_amp = ( layer_options, side, index, sub_index ) => {
	let placeholder_amp = 0;

	for ( let i = 0; i < layer_options.base_layers; i ++ ) {
		placeholder_amp += side[ 'layer_' + i ][ index ][ sub_index ];
	}

	return placeholder_amp;
}