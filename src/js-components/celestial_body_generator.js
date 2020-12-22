	
	import { map_points_onto_sphere } from './map_points_onto_sphere.js';
	import { create_base_point_data } from './create_base_point_data.js';
	import { render_data } from './render_data.js';

	export const create_celestial_body = ( layer_options = {}, data ) => {
		layer_options = { ...get_celestial_body_defaults(), ...layer_options };
		layer_options.final_frequency_count = get_final_frequency_count( layer_options );

		data = create_base_point_data( layer_options );

		// terrain_generation goes here

		data = map_points_onto_sphere( data, layer_options );		

		render_data( data );

		return {
			'layer_optons' : layer_options,
			'data' : data,
		};
	}

	const get_celestial_body_defaults = () => ( {
		'base_frequency' : 12,
		'layers' : 1,
		'radius' : 600,
		'amp_bias' : 0,
	} )

	const get_final_frequency_count = ( { base_frequency, layers } ) => layers == 1 ? base_frequency : ( base_frequency * ( Math.pow( 2, layers ) ) / 2 - ( new Array( layers ).fill().map( ( i, index ) => Math.floor( Math.pow( 2, ( index - 1 ) ) ) ).reduce( ( a, b ) => a + b ) ) );
