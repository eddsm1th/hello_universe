export const apply_terrain_to_celestial_body = ( grid_data, layer_options, above_options, below_options ) => {
	const max_amp = new Array( layer_options.base_layers ).fill().map( ( i, index ) => 1 / Math.pow( layer_options.freq_diff, index ) ).reduce( ( a, b ) => a + b );

	grid_data.forEach( panel => {
		panel.data.forEach( row => {
			row.forEach( point => {
				const is_above = point.amp_value > 0;

				point.amp_value = get_amp_bias( point.amp_value /= max_amp, ( is_above ? above_options.amp_bias : below_options.amp_bias ), is_above ? 1 : -1 ) * ( is_above ? above_options.base_amp : below_options.base_amp );
			} );
		} );
	} );

	return grid_data;
}

// i stole this from a youtube video. it makes the amp more bias towards lower or higher values
const get_amp_bias = ( x, amp_bias, polarity ) => {
	const k = Math.pow( 1 - amp_bias / 100, 3 );

	x *= polarity;

	return ( x * k ) / ( x * k - x + 1 ) * polarity; 
}