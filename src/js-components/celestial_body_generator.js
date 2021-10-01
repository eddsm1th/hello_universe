
/*
	TODO:
		- custom planet generation controls
			- (Re)Generate // (Re)Colour
			- planet specific colours
			- move water controls into their own panel

	PHASE_002:
		// better interfacearound it
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
import { apply_terrain_to_celestial_body } from './apply_terrain_to_celestial_body.js';

// Master planet creator
export const create_celestial_body_base = layer_options => {
	var start = window.performance.now();

	const final_freq_count = get_final_frequency_count( layer_options );
	let grid_data;

	grid_data = generate_point_data( layer_options, final_freq_count );
	grid_data = apply_terrain_to_celestial_body( grid_data, layer_options, layer_options.above, layer_options.below );
	grid_data = map_data_onto_sphere( grid_data, layer_options, final_freq_count );

	render_data( [ ...grid_data ], final_freq_count, layer_options, layer_options.above, layer_options.below );

	var end = window.performance.now();
	console.log(`Execution time: ${end - start} ms`);

	return grid_data;
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
