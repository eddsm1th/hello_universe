	
	import { create_base_point_data } from './create_base_point_data.js';
	import { map_terrain_on_data } from './map_terrain_on_data.js';
	import { map_points_onto_sphere } from './map_points_onto_sphere.js';
	import { render_data } from './render_data.js';

	export const create_celestial_body = ( layer_options = {}, data ) => {
		layer_options = { ...get_celestial_body_defaults(), ...layer_options };
		layer_options.final_frequency_count = get_final_frequency_count( layer_options );

		data = create_base_point_data( layer_options );
		data = map_terrain_on_data( data, layer_options );
		data = map_points_onto_sphere( data, layer_options );

		const theoretical_max_amp = 78.75;		

		render_data( data );
		console.log( data );
		console.log( 'Theoretical Max Amp: ' + theoretical_max_amp );
		console.log( 'Max Amp: ' + Math.max( ...data.flat().map( i => i.amp_value ) ) );
		console.log( 'Min Amp: ' + Math.min( ...data.flat().map( i => i.amp_value ) ) );
		console.log( 'Data Item Count: ' + data.flat().length );

		[ ...data.flat() ].forEach( data_item => { if ( data_item.amp_value != theoretical_max_amp && data_item.y >= 0 ) { console.log( data_item ) } } );

		return {
			'layer_optons' : layer_options,
			'data' : data,
		};
	}

	const get_celestial_body_defaults = () => ( {
		'base_frequency' : 2,
		'layers' : 3,
		'radius' : 600,
		'amp_bias' : 0,
		'amp_diff' : 4,
	} )

	const get_final_frequency_count = ( { base_frequency, layers } ) => layers == 1 ? base_frequency : ( base_frequency * ( Math.pow( 2, layers ) ) / 2 - ( new Array( layers ).fill().map( ( i, index ) => Math.floor( Math.pow( 2, ( index - 1 ) ) ) ).reduce( ( a, b ) => a + b ) ) );
