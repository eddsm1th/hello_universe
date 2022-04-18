const radian = Math.PI / 180;

export function generate_point_data ( layer_options, final_freq_count ) {
	let sides = [ {}, {}, {}, {}, {}, {} ];

	for ( let layer_index = 0; layer_index < layer_options.base_layers; layer_index ++ ) {
		const 	amount_to_skip = Math.pow( layer_options.freq_diff, ( layer_options.base_layers - layer_index ) - 1 ),
				amp_multiplier = 1 / Math.pow( layer_options.amp_diff, layer_index ),
				step_distance_multiplier = Math.pow( layer_options.freq_diff, ( layer_options.base_layers - 1 ) );

		for ( let side_index = 0; side_index < 2; side_index ++ ) { // build top and bottom panels ready to inject into wrapping panel
			sides[ side_index ][ 'layer_' + layer_index ] = generate_mesh( layer_options, amount_to_skip, final_freq_count, final_freq_count, layer_index, amp_multiplier, step_distance_multiplier );
		}

		const 	top_as_appendable = build_appendable_data( [ ...sides[ 0 ][ 'layer_' + layer_index ] ] ),
				bottom_as_appendable = build_appendable_data( [ ...sides[ 1 ][ 'layer_' + layer_index ] ] ),
				placeholder_wrapping_panel = generate_mesh( layer_options, amount_to_skip, final_freq_count, ( ( ( final_freq_count - 1 ) * 4 ) + amount_to_skip ), layer_index, amp_multiplier, step_distance_multiplier, top_as_appendable, bottom_as_appendable, true );

		for ( let i = 0; i < 4; i ++ ) {
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
			bottom = [ ...data[ data.length - 1 ] ].reverse(),
			left = data.map( ( row, index ) => [ 0, data.length - 1 ].indexOf( index ) == -1 ? row[ 0 ] : null ).filter( i => i ).reverse();

	return [ ...top, ...right, ...bottom, ...left, ...top ];
}

const build_panel = ( object, side_index, tert_coord_position, sub_index, angle_increment, radius ) => {
	object[ [ 'y', 'y', 'z', 'x', 'z', 'x' ][ side_index ] ] = radius * [ 1, -1, -1, 1, 1, -1 ][ side_index ];
	object[ [ 'x', 'x', 'x', 'z', 'x', 'z' ][ side_index ] ] = ( Math.tan( degree_in_radians( -45 + ( angle_increment * sub_index ) ) ) * radius ) * [ 1, 1, 1, 1, -1, -1 ][ side_index ];
	object[ [ 'z', 'z', 'y', 'y', 'y', 'y' ][ side_index ] ] = tert_coord_position * [ 1, 1, -1, -1, -1, -1 ][ side_index ];

	return object;
}

const degree_in_radians = angle => angle * radian;

// Generate panel layer mesh
const generate_mesh = ( layer_options, amount_to_skip, row_count, column_count, layer_index, amp_multiplier, step_distance_multiplier, prefix_data = null, suffix_data = null, loop = false ) => {
	let mesh = new Array( row_count );

	if ( prefix_data ) mesh[ 0 ] = prefix_data;
	if ( suffix_data ) mesh[ mesh.length - 1 ] = suffix_data;

	for ( let i = 0; i < row_count; i += amount_to_skip ) { // Loop through rows
		if ( !mesh[ i ] ) {
			let mesh_row = new Array( column_count ).fill( 0 );

			for ( let j = 0; j < column_count; j += amount_to_skip ) { // loop through single row
				mesh_row[ j ] = ( loop && j == column_count - amount_to_skip ) ? mesh_row[ 0 ] : generate_point_amp( amp_multiplier, layer_index );
				
				if ( j != 0 && amount_to_skip != 1 ) backfill_points( mesh_row, amount_to_skip, j ); // backfill skipped points in row
			}

			mesh[ i ] = mesh_row;
		}

		if ( i != 0 && amount_to_skip != 1 ) { // create fill layer for skipped rows
			const 	previous_layer = mesh[ i - amount_to_skip ],
					current_layer = mesh[ i ];

			for ( let z = 0; z < amount_to_skip - 1; z ++ ) {
				mesh[ i - ( ( amount_to_skip - 1 - z ) ) ] = create_fill_layer( z + 1, previous_layer, current_layer, column_count, step_distance_multiplier );
			} 
		}
	}

	return mesh;
}

const backfill_points = ( mesh_row, amount_to_skip, anchor ) => {
	const 	previous_point = mesh_row[ anchor - amount_to_skip ],
			current_point = mesh_row[ anchor ],
			geometry_step = ( previous_point.geometry - current_point.geometry ) / amount_to_skip,
			terrain_step = ( previous_point.terrain - current_point.terrain ) / amount_to_skip;

	for ( let z = 0; z < amount_to_skip - 1; z ++ ) {
		const	backfill_index = anchor - ( ( amount_to_skip - 1 - z ) ),
				backfill_multiplier = amount_to_skip - 1 - z;

		mesh_row[ backfill_index ] = {
			geometry: ( current_point.geometry + ( geometry_step * backfill_multiplier ) ),
			terrain: ( current_point.terrain + ( terrain_step * backfill_multiplier ) ),
		};
	}
}

// Get an amplitude base on current generation stage
const generate_point_amp = ( amp_multiplier, layer_index ) => {
	let geometry_data = ( ( Math.random() - .5 ) * 2 ) * amp_multiplier 
	let terrain_data = Math.random();

	if ( layer_index != 0 ) {
		terrain_data = ( ( terrain_data - .5 ) * amp_multiplier ) * 2;
	} else {
		if ( terrain_data < .5 ) {
			terrain_data = 0;
		} else {
			terrain_data = ( terrain_data * 2 ) - 1;
		}
	}

	return {
		geometry : geometry_data,
		terrain: terrain_data,
	};
};

// Creates missing rows
const create_fill_layer = ( steps, previous_array, next_array, final_freq_count, step_distance_multiplier ) => {
	return new Array( final_freq_count ).fill().map( ( i, index ) => {
		const 	geometry_diff = ( next_array[ index ].geometry - previous_array[ index ].geometry ) * -1,
				terrain_diff = ( next_array[ index ].terrain - previous_array[ index ].terrain ) * -1,
				geometry_distance = geometry_diff / step_distance_multiplier,
				terrain_distance = terrain_diff / step_distance_multiplier;
		
		return {
			geometry: previous_array[ index ].geometry - ( geometry_distance * steps ),
			terrain: previous_array[ index ].terrain - ( terrain_distance * steps ),
		}
	} );
}

// Add all layer amp values
const get_total_amp = ( layer_options, side, index, sub_index ) => {
	const key = side[ 'layer_0' ][ index ][ sub_index ].geometry < 0 ? 'geometry' : 'terrain';

	let placeholder_amp = 0;

	for ( let i = 0; i < layer_options.base_layers; i ++ ) {
		placeholder_amp += side[ 'layer_' + i ][ index ][ sub_index ][ key ]
	}

	return placeholder_amp;
}

