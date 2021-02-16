
/*
	TODO:
		- custom planet generation controls
			- (Re)Generate // (Re)Colour
			- planet specific colours
			- move water controls into their own panel

		- colour blending
		- better dragging controls

		- gravity???

	PHASE_002:
		// better interfacearound it
			// solar system -> planets -> moons
			// names
		// octagonal planet base
		// according planet generator
		// seperate above and below water level controls
		// colours
			// base colour
			// flat colour
			// height overrides
			// water colour
		// gravity
		// moons
		// atmosphere

		?_// temperature based on distance to center ?_//
			// lightens::darkens colours

		// looking to the sky to see other peoples solar systems
			// your grid is a little grid inside a huge grid

	*/

import { generate_point_data } from './generate_point_data.js';
import { render_data } from './render_data.js';
import { map_data_onto_sphere } from './map_data_onto_sphere.js';

// Master planet creator
export const create_celestial_body_base = ( grid_data, layer_options, above_options, below_options ) => {
	const final_freq_count = get_final_frequency_count( layer_options );

	grid_data = generate_point_data( layer_options, final_freq_count );
	grid_data = apply_terrain_to_celestial_body( grid_data, layer_options, above_options, below_options );
	grid_data = map_data_onto_sphere( grid_data, layer_options, final_freq_count );

	// console.log( 'Min Value:\t\t' + Math.min.apply( Math, [ ...grid_data ].map( i => i.data.flat() ).flat().map( i => i.amp_value ) ) );
	// console.log( 'Max Value:\t\t' + Math.max.apply( Math, [ ...grid_data ].map( i => i.data.flat() ).flat().map( i => i.amp_value ) ) );

	render_data( grid_data, final_freq_count, layer_options, above_options );

	return grid_data;
}

const apply_terrain_to_celestial_body = ( grid_data, layer_options, above_options, below_options ) => {
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

const get_final_frequency_count = ( { base_freq, base_layers, freq_diff } ) => {
	let base = base_freq,
		base_gap = ( ( base_freq - 1 ) * ( freq_diff - 1 ) );

	for ( let i = 0; i < base_layers - 1; i ++ ) {
		base += base_gap;

		base_gap *= freq_diff;
	}

	return base;
}

