
	export const create_base_point_data = layer_options => {
		const data = map_flat_data_to_octahedron( get_flat_array( layer_options ), layer_options );

		// and on the 8th day, i ctrl+c ctrl+v the hemisphere to make the bottom half of the sphere
		return [ ...data, ...data.reverse().slice( 1, data.length ).map( layer => layer.map( ( layer_item ) => ( { ...layer_item, ...{ y: layer_item.y * -1 } } ) ) ) ]
	}

	const map_flat_data_to_octahedron = ( flat_array, { radius, final_frequency_count } ) => {
		const layer_angle_increment = ( 90 / ( final_frequency_count - 1 ) );
			
		return flat_array.map( ( layer, index ) => { 	
			const 	layer_traversal_radians = degree_in_radians( -45 + ( layer_angle_increment * index ) ),
					points_per_side = Math.ceil( ( layer.length / 4 ) ),
					angle_increment = 90 / points_per_side,
					cumulative_traversial_distance = ( ( Math.tan( layer_traversal_radians ) * radius ) + radius ) / 2,
					stepped_side_array = new Array( points_per_side ).fill().map( ( item, stepped_side_index ) => {
						const index_traversal_radians = degree_in_radians( -45 + ( angle_increment * stepped_side_index ) );

						return Math.tan( index_traversal_radians ) * cumulative_traversial_distance
					} ),
					reverse_stepped_side_array = stepped_side_array.map( stepped_side_val => stepped_side_val * -1 ),
					start_value = new Array( points_per_side ).fill( cumulative_traversial_distance ),
					end_value = start_value.map( value => value *= -1 ),
					x_layer_data = [ stepped_side_array, start_value, reverse_stepped_side_array, end_value ].flat(),
					z_layer_data = [ start_value, reverse_stepped_side_array, end_value, stepped_side_array ].flat();

			return layer.map( ( layer_item, sub_index ) => ( {
				'x' : x_layer_data[ sub_index ],
				'y' : cumulative_traversial_distance * -1 + radius,
				'z' : z_layer_data[ sub_index ],
				'amp_value' : 0,
			} ) );
		} );
	}

	const degree_in_radians = angle => angle * ( Math.PI / 180 );

	const get_flat_array = ( { final_frequency_count } ) => [ [ {} ], ...new Array( final_frequency_count - 1 ).fill().map( ( layer, index ) => new Array( 4 * ( index + 1 ) ).fill( {} ) ) ];
