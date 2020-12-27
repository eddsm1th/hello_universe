	
	const 	use_colours = true,
			colours = [ 0x00ff00, 0xff00ff, 0x0000ff, 0xff0000, 0xffff00, 0x00ffff ],
			colour_threshholds = [
				{
					'threshhold' : 90,
					'colour' : 'white'
				},
				{
					'threshhold' : 85,
					'colour' : 'lightgrey'
				},
				{
					'threshhold' : 75,
					'colour' : 'saddlebrown'
				},
				{
					'threshhold' : 55,
					'colour' : 'forestgreen'
				},
				{
					'threshhold' : 0,
					'colour' : 'khaki'
				},
			],
			rotation_values = [
				[ 0, 0, 0 ],
				[ 1.5708 * 2, 0, 0 ],
				[ 1.5708, 0, 0 ],
				[ 0, 0, 1.5708 ],
				[ 0, 0, -1.5708 ],
				[ -1.5708, 0, 0 ],
			];

	export const render_data = ( grid_data, final_freq_count, layer_options ) => {
		const 	scene = new THREE.Scene(),
				camera = new THREE.PerspectiveCamera( 100, window.innerWidth / window.innerHeight, .1, 1000 ),
				renderer = new THREE.WebGLRenderer(),
				ambient = new THREE.AmbientLight( 0xffffff, .1 ),
				directionalLight = new THREE.DirectionalLight( 0xffffff, 1 ),
				s_geometry = new THREE.SphereGeometry( ( layer_options.radius - ( layer_options.base_amp / 2 ) ) + ( layer_options.base_amp * ( layer_options.water_level / 100 ) ), final_freq_count / 2, final_freq_count / 2 ),
				s_material = new THREE.MeshPhongMaterial( {
					color: 'blue',
					opacity: .75,
					transparent: true,
					reflectivity: 1,
				} ),
				sphere = new THREE.Mesh( s_geometry, s_material );
		
		renderer.setSize( window.innerWidth, window.innerHeight );
		document.body.appendChild( renderer.domElement );

		for ( let i = 0; i < 6; i ++ ) plot_points( grid_data[ i ][ 'data' ], final_freq_count, layer_options, i, scene )

		camera.position.z = ambient.position.z = directionalLight.position.z = 1000; // make camera position more relative to window and readius

		scene.add( ambient, directionalLight, sphere );

		function animate() {
			requestAnimationFrame( animate );
			renderer.render( scene, camera );
		}
		animate();

		apply_drag_controls( scene );

		return grid_data;
	}

	const plot_points = ( grid_data, final_freq_count, layer_options, rotation_values_index, scene ) => {
		const 	geometry = new THREE.Geometry(),
				material = ( use_colours ? new THREE.MeshLambertMaterial( {
					vertexColors: THREE.FaceColors,
					side: THREE.DoubleSide,
					flatShading: false
				} ) : new THREE.MeshBasicMaterial( {
					color: colours[ rotation_values_index ],
					wireframe: true,
				} ) );

		[ ...grid_data ].flat().forEach( ( item ) => geometry.vertices.push( new THREE.Vector3( item.x, item.y, item.z ) ) );

		for ( let i = 1; i < grid_data.length; i ++ ) {
			for ( let j = 0; j < grid_data[ i ].length - 1; j ++ ) {
				const points = {
					'oo' : grid_data[ i ][ j ],
					'oi' : grid_data[ i - 1 ][ j ],
					'io' : grid_data[ i ][ j + 1 ],
					'ii' : grid_data[ i - 1 ][ j + 1 ],
				};

				geometry.faces.push( new THREE.Face3( points.io.index, points.oo.index, points.ii.index ) );
				geometry.faces[ geometry.faces.length - 1 ].color = new THREE.Color( get_colour_by_height( points.oo, points.oi, points.ii, layer_options ) );

				geometry.faces.push( new THREE.Face3( points.oo.index, points.oi.index, points.ii.index ) );
				geometry.faces[ geometry.faces.length - 1 ].color = new THREE.Color( get_colour_by_height( points.oo, points.oi, points.ii, layer_options ) );	
			}
		}

		geometry.computeFaceNormals();
		geometry.computeVertexNormals();

		const terrain = new THREE.Mesh( geometry, material );

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

	// Calculate the colour base on average height of all face points
	const get_colour_by_height = ( a, b, c, layer_options ) => {
		const 	average_height = ( ( ( a.amp_value + b.amp_value + c.amp_value ) / 3 ) ) + ( layer_options.base_amp / 2 ),
				average_height_as_percent_max_amp = ( average_height / layer_options.base_amp ) * 100;

		for ( let i = 0; i < colour_threshholds.length; i ++ ) {
			if ( average_height_as_percent_max_amp > colour_threshholds[ i ].threshhold || i == colour_threshholds.length - 1 ) return colour_threshholds[ i ].colour;
		}
	}
