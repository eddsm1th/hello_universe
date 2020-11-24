
/*
	TODO:
		- custom planet generation controls
			- (Re)Generate // (Re)Colour
			- custom variables
			- planet specific colours
		- water level
		- colour blending
		- better dragging controls

		- gravity???
*/

import { generate_point_data } from './planet_panel_mesh_generation.js';

const 	use_colours = true,
		apply_amp = true,
		colour_threshholds = [
			{
				'threshhold' : 90,
				'colour' : 'white'
			},
			{
				'threshhold' : 80,
				'colour' : 'lightgrey'
			},
			{
				'threshhold' : 60,
				'colour' : 'saddlebrown'
			},
			{
				'threshhold' : 30,
				'colour' : 'forestgreen'
			},
			{
				'threshhold' : 20,
				'colour' : 'khaki'
			},
			{
				'threshhold' : 10,
				'colour' : 'blue'
			},
			{
				'threshhold' : 0,
				'colour' : 'navy'
			},
		],
		rotation_values = [
			[ 0, 0, 0 ],
			[ 1.5708 * 2, 0, 0 ],
			[ 1.5708, 0, 0 ],
			[ 0, 0, 1.5708 ],
			[ 0, 0, -1.5708 ],
			[ -1.5708, 0, 0 ],
		],
		colours = [ 0x00ff00, 0xff00ff, 0x0000ff, 0xff0000, 0xffff00, 0x00ffff ],
		sides_to_render = 6;

// Translate data from cube to sphere
const map_data_onto_sphere = ( grid_data, layer_options, final_freq_count ) => {
	const 	quadrant_cutoff_index = Math.ceil( final_freq_count / 2 ),
			panel_quadrant_one = [...grid_data].slice( 0, quadrant_cutoff_index ).map( ( item ) => [...item].slice( 0, quadrant_cutoff_index ) );

	grid_data.forEach( ( quadrant_row, index ) => {
		quadrant_row.forEach( ( quadrant_row_index, sub_index ) => {
			const 	xz_length_to_center = ( quadrant_row_index.x * quadrant_row_index.x ) + ( quadrant_row_index.z * quadrant_row_index.z ),
					xzy_length_to_center = Math.sqrt( ( quadrant_row_index.y * quadrant_row_index.y ) + xz_length_to_center ),
					coords_multiplier =  layer_options.radius / ( xzy_length_to_center - quadrant_row_index.amp_value );

			quadrant_row_index.y = quadrant_row_index.y * coords_multiplier;
			quadrant_row_index.x = quadrant_row_index.x * coords_multiplier; 
			quadrant_row_index.z = quadrant_row_index.z * coords_multiplier; 
		} );
	} );
}

// Calculate the colour base on average height of all face points
const get_colour_by_height = ( a, b, c, layer_options ) => {
	const 	average_height = ( ( ( a.amp_value + b.amp_value + c.amp_value ) / 3 ) ) + ( layer_options.base_amp / 2 ),
			average_height_as_percent_max_amp = ( average_height / layer_options.base_amp ) * 100;

	for ( let i = 0; i < colour_threshholds.length; i ++ ) {
		if ( average_height_as_percent_max_amp > colour_threshholds[ i ].threshhold || i == colour_threshholds.length - 1 ) return colour_threshholds[ i ].colour;
	}
}

// Plot point and faces in space
const plot_points = ( grid_data, final_freq_count, layer_options, rotation_values_index, scene, apply_amp = false ) => {
	const geometry = new THREE.Geometry();

	[...grid_data].flat().forEach( ( item ) => {
		geometry.vertices.push( new THREE.Vector3( item.x, item.y + ( apply_amp ? item.amp_value : 0 ), item.z ) );
	} );

	for ( let i = 1; i < grid_data.length; i ++ ) {
		for ( let j = 0; j < grid_data[ i ].length - 1; j ++ ) {
			const points = {
				'oo' : grid_data[ i ][ j ],
				'oi' : grid_data[ i - 1 ][ j ],
				'io' : grid_data[ i ][ j + 1 ],
				'ii' : grid_data[ i - 1 ][ j + 1 ],
			};

			geometry.faces.push(
				new THREE.Face3( points.oo.index, points.oi.index, points.ii.index ),
				new THREE.Face3( points.oo.index, points.io.index, points.ii.index ),
			);

			geometry.faces[ geometry.faces.length - 2 ].color = new THREE.Color( get_colour_by_height( points.oo, points.oi, points.ii, layer_options ) );
			geometry.faces[ geometry.faces.length - 1 ].color = new THREE.Color( get_colour_by_height( points.oo, points.io, points.ii, layer_options ) );
		}
	}

	const material = new THREE.MeshBasicMaterial( use_colours ? {
		vertexColors: THREE.FaceColors,
		side: THREE.DoubleSide
	} : {
		color: colours[ rotation_values_index ],
		wireframe: true,
	} ),
	terrain = new THREE.Mesh( geometry, material );

	scene.add( terrain );

	apply_rotation_to_side( terrain, rotation_values_index );
}

// Align each side properly
const apply_rotation_to_side = ( terrain, i ) => {
	const current_rotation_values = rotation_values[ i ];

	terrain.rotation.x = current_rotation_values[ 0 ];	
	terrain.rotation.y = current_rotation_values[ 1 ];
	terrain.rotation.z = current_rotation_values[ 2 ];
}

// Adds rotational drag controls
const apply_drag_controls = ( scene ) => {
	let click_coords = {
		'x' : null,
		'y' : null,
	},
	can_drag = false;

	document.addEventListener( 'mousedown', ( event ) => {
		can_drag = true;

		click_coords = {
			'x' : event.clientX,
			'y' : event.clientY,
		};
	} );

	document.addEventListener( 'mouseup', ( event ) => can_drag = false );

	document.addEventListener( 'mousemove', ( event ) => {
		if ( can_drag ) {
			scene.rotation.y += ( ( click_coords.x - event.clientX ) / 400 );
			scene.rotation.x += ( ( click_coords.y - event.clientY ) / 400 );

			click_coords = {
				'x' : event.clientX,
				'y' : event.clientY,
			};
		} 
	} );
}

// Master planet creator
export function create_planet ( layer_options ) {
	if ( layer_options ) {
		const 	final_freq_count = layer_options.base_layers == 1 ? layer_options.base_freq : ( layer_options.base_freq * ( Math.pow( layer_options.freq_diff, layer_options.base_layers ) ) / 2 - ( new Array( layer_options.base_layers ).fill().map( ( i, index ) => Math.floor( Math.pow( layer_options.freq_diff, ( index - 1 ) ) ) ).reduce( ( a, b ) => a + b ) ) ),
				scene = new THREE.Scene(),
				camera = new THREE.PerspectiveCamera( 100, window.innerWidth / window.innerHeight, .1, 1000 ),
				renderer = new THREE.WebGLRenderer(),
				grid_data = generate_point_data( layer_options, final_freq_count, sides_to_render );
		
		renderer.setSize( window.innerWidth, window.innerHeight );
		document.body.appendChild( renderer.domElement );

		camera.position.z = 1000; // make this more relative to planet size and window

		for ( let i = 0; i < sides_to_render; i ++ ) {
			map_data_onto_sphere( grid_data[ i ][ 'data' ], layer_options, final_freq_count );
			plot_points( grid_data[ i ][ 'data' ], final_freq_count, layer_options, i, scene )
		}

		apply_drag_controls( scene );

		const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
		scene.add( directionalLight );

		function animate() {
			requestAnimationFrame( animate );
			renderer.render( scene, camera );
		}
		animate();
	}
}