
	export const map_points_onto_sphere = ( data, { radius } ) => {
		const data_to_calculate = [ ...data ].map( layer => layer.slice( 0, Math.ceil( layer.length / 4 ) ) );

		data_to_calculate.forEach( ( layer, index ) => {
			const 	points_per_side = layer.length,
					current_layer = data[ index ];

			layer.forEach( ( { x, y, z, amp_value }, sub_index ) => {
				const 	xzy_length_to_center = Math.sqrt( ( ( y * y ) + ( x * x ) ) + ( z * z ) );	

				[
					current_layer[ sub_index ] || current_layer[ 0 ],
					current_layer[ sub_index + points_per_side ] || {},
					current_layer[ sub_index + ( points_per_side * 2 ) ] || {},
					current_layer[ sub_index + ( points_per_side * 3 ) ] || {},
				].forEach( inst => {
					const coords_multiplier = ( ( radius + inst.amp_value || 0 ) / xzy_length_to_center );

					inst.y *= coords_multiplier;
					inst.x *= coords_multiplier; 
					inst.z *= coords_multiplier; 
				} )
			} );
		} );

		return [ ...data ];
	}