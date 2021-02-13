
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
export function create_planet ( layer_options ) {
	const final_freq_count = get_final_frequency_count( layer_options );

	let grid_data;

	grid_data = generate_point_data( layer_options, final_freq_count );
	grid_data = map_data_onto_sphere( grid_data, layer_options, final_freq_count );

	render_data( grid_data, final_freq_count, layer_options );
}

const get_final_frequency_count = ( { base_freq, base_layers } ) => base_layers == 1 ? base_freq : ( base_freq * ( Math.pow( 2, base_layers ) ) / 2 - ( new Array( base_layers ).fill().map( ( i, index ) => Math.floor( Math.pow( 2, ( index - 1 ) ) ) ).reduce( ( a, b ) => a + b ) ) );