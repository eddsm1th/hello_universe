export function generate_point_data ( layer_options, final_freq_count, sides_to_render = 6 ) {
	let sides = [];

	for ( let layer_index = 0; layer_index < layer_options.base_layers; layer_index ++ ) {
		const 	amount_to_skip = Math.pow( layer_options.freq_diff, ( layer_options.base_layers - layer_index ) - 1 ),
				amp_multiplier = 1 / Math.pow( layer_options.amp_diff, layer_index );

		for ( let side_index = 0; side_index < 2; side_index ++ ) { // build top and bottom panels ready to inject into wrapping panel
			if ( layer_index == 0 ) sides.push( {} );

			sides[ side_index ][ 'layer_' + layer_index ] = generate_mesh( layer_options, amount_to_skip, final_freq_count, final_freq_count, layer_index, amp_multiplier );
		}

		const 	top_as_appendable = build_appendable_data( [ ...sides[ 0 ][ 'layer_' + layer_index ] ] ),
				bottom_as_appendable = build_appendable_data( [ ...sides[ 1 ][ 'layer_' + layer_index ] ] ),
				placeholder_wrapping_panel = generate_mesh( layer_options, amount_to_skip, final_freq_count, ( final_freq_count - 1 ) * 4, layer_index, amp_multiplier, top_as_appendable, bottom_as_appendable, true );

		for ( let i = 0; i < 4; i ++ ) {
			if ( layer_index == 0 ) sides.push( {} );

			sides[ i + 2 ][ 'layer_' + layer_index ] = placeholder_wrapping_panel.map( inst => [ ...inst ].splice( ( final_freq_count - 1 ) * i, final_freq_count ) );
		}
	}

	const 	angle_increment = ( 90 / ( final_freq_count - 1 ) ),
			side_total_point_count = ( ( final_freq_count * final_freq_count ) - 0 );

	sides.forEach( ( side, side_index ) => {
		side[ 'data' ] = side.layer_0.map( ( item, index ) => {
			const tert_coord_position = ( Math.tan( degree_in_radians( -45 + ( angle_increment * index ) ) ) * layer_options.radius );

			return item.map( ( sub_item, sub_index ) => {
				return build_panel( {
					'amp_value' : get_total_amp( layer_options, side, index, sub_index ),
					'index' : ( ( sub_index + ( index * final_freq_count ) ) + ( side_total_point_count * side_index ) )
				}, side_index, tert_coord_position, sub_index, angle_increment, layer_options.radius )
			} );
		} );
	} );

	return sides;
}

const build_appendable_data = data => {
	const 	top = data[ 0 ],
			right = data.map( ( row, index ) => [ 0, data.length - 1 ].indexOf( index ) == -1 ? row[ row.length - 1 ] : null ).filter( i => i ),
			bottom = data[ data.length - 1 ].map( i => i ).reverse(),
			left = data.map( ( row, index ) => [ 0, data.length - 1 ].indexOf( index ) == -1 ? row[ 0 ] : null ).filter( i => i ).reverse();

	return [ ...top, ...right, ...bottom, ...left, ...top ];
}

const build_panel = ( object, side_index, tert_coord_position, sub_index, angle_increment, radius ) => {
	object[ [ 'y', 'y', 'z', 'x', 'z', 'x' ][ side_index ] ] = radius * ( [ 1, 2, 5 ].indexOf( side_index ) != -1 ? -1 : 1 );
	object[ [ 'x', 'x', 'x', 'z', 'x', 'z' ][ side_index ] ] = ( Math.tan( degree_in_radians( -45 + ( angle_increment * sub_index ) ) ) * radius ) * ( [ 4, 5 ].indexOf( side_index ) != -1 ? -1 : 1 );
	object[ [ 'z', 'z', 'y', 'y', 'y', 'y' ][ side_index ] ] = tert_coord_position * ( [ 2, 3, 4, 5 ].indexOf( side_index ) != -1 ? -1 : 1 );

	return object;
}

const degree_in_radians = angle => angle * ( Math.PI / 180 );

// Generate panel layer mesh
const generate_mesh = ( layer_options, amount_to_skip, row_count, column_count, layer_index, amp_multiplier, prefix_data = null, suffix_data = null, loop = false ) => {
	let mesh = new Array( row_count );

	if ( prefix_data ) mesh[ 0 ] = prefix_data;
	if ( suffix_data ) mesh[ mesh.length - 1 ] = suffix_data;

	for ( let i = 0; i < row_count; i += amount_to_skip ) { // Loop through rows
		if ( !mesh[ i ] ) {
			let mesh_row = new Array( column_count + ( loop ? amount_to_skip : 0 ) ).fill( 0 );

			for ( let j = 0; j < column_count; j += amount_to_skip ) { // loop through single row
				mesh_row[ j ] = generate_point_amp( layer_options, amp_multiplier );

				if ( j != 0 && amount_to_skip != 1 ) backfill_points( mesh_row, amount_to_skip, j ); // backfill skipped points in row
			}

			if ( loop ) {
				mesh_row[ mesh_row.length - 1 ] = mesh_row[ 0 ];

				backfill_points( mesh_row, amount_to_skip, mesh_row.length - 1 );
			}

			mesh[ i ] = mesh_row;
		}

		if ( i != 0 && amount_to_skip != 1 ) { // create fill layer for skipped rows
			const 	previous_layer = mesh[ i - amount_to_skip ],
					current_layer = mesh[ i ];

			for ( let z = 0; z < amount_to_skip - 1; z ++ ) {
				mesh[ i - ( ( amount_to_skip - 1 - z ) ) ] = create_fill_layer( z + 1, previous_layer, current_layer, column_count + ( loop ? amount_to_skip : 0 ), layer_options );
			} 
		}
	}

	return mesh;
}

const backfill_points = ( mesh_row, amount_to_skip, anchor ) => {
	const 	previous_point = mesh_row[ anchor - amount_to_skip ],
			current_point = mesh_row[ anchor ],
			step = ( previous_point - current_point ) / amount_to_skip;

	for ( let z = 0; z < amount_to_skip - 1; z ++ ) {
		mesh_row[ anchor - ( ( amount_to_skip - 1 - z ) ) ] = ( current_point + ( step * ( amount_to_skip - 1 - z ) ) );
	}
}

// Get an amplitude base on current generation stage
const generate_point_amp = ( layer_options, amp_multiplier ) => ( ( ( Math.random() * amp_multiplier ) * 2 ) - amp_multiplier );

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