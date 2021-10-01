export const apply_terrain_to_celestial_body = ( grid_data, layer_options, above_options, below_options ) => {
	const 	max_amp = new Array( layer_options.base_layers ).fill().map( ( i, index ) => 1 / Math.pow( layer_options.freq_diff, index ) ).reduce( ( a, b ) => a + b ),
			above_bias_var = Math.pow( 1 - above_options.amp_bias / 100, 3 ),
			below_bias_var = Math.pow( 1 - below_options.amp_bias / 100, 3 );

	for ( let i = 0, i_ = grid_data.length; i < i_; i ++ ) {
		const panel = grid_data[ i ].data;

		for ( let j = 0, j_ = panel.length; j < j_; j ++ ) {
			const row = panel[ j ];

			for ( let x = 0, x_ = row.length; x < x_; x ++ ) {
				const 	point = row[ x ],
						is_above = point.amp_value > 0;

				point.amp_value = get_amp_bias( point.amp_value /= max_amp, ( is_above ? above_bias_var : below_bias_var ), is_above ? 1 : -1 ) * ( is_above ? above_options.base_amp : below_options.base_amp );
			}
		}
	}

	return grid_data;
}

// i stole this from a youtube video. it makes the amp more bias towards lower or higher values
const get_amp_bias = ( x, bias_var, polarity ) => {
	x *= polarity;

	return ( x * bias_var ) / ( x * bias_var - x + 1 ) * polarity; 
}