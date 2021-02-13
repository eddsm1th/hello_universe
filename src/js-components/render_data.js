	
	const 	use_colours = false,
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
			];
			
	export const render_data = ( grid_data, final_freq_count, layer_options ) => {
		const 	loader = new THREE.TextureLoader(),
				scene = new THREE.Scene(),
				camera = new THREE.PerspectiveCamera( 100, window.innerWidth / window.innerHeight, .1, 1000 ),
				renderer = new THREE.WebGLRenderer(),
				ambient = new THREE.AmbientLight( 0xffffff, .6 ),
				directionalLight = new THREE.DirectionalLight( 0xffffff, 1 ),
				s_geometry = new THREE.SphereGeometry( ( layer_options.radius - ( layer_options.base_amp / 2 ) ) + ( layer_options.base_amp * ( layer_options.water_level / 100 ) ), 24, 24 ),
				s_material = new THREE.MeshStandardMaterial( {
					color: 'blue',
					roughness: .3,
					transparent: true,
					opacity: .85,
				} ),
				sphere = new THREE.Mesh( s_geometry, s_material );

		renderer.setSize( window.innerWidth, window.innerHeight );
		document.body.appendChild( renderer.domElement );
		camera.position.z = ambient.position.z = directionalLight.position.z = 1000; // make camera position more relative to window and readius

		plot_points( [ ...grid_data ], final_freq_count, layer_options, scene )

		use_colours ? scene.add( ambient, directionalLight, sphere ) : scene.add( ambient, directionalLight );

		function animate() {
			requestAnimationFrame( animate );
			renderer.render( scene, camera );
		} animate();

		apply_spaceship_controls( camera );

		return grid_data;
	}

	const plot_points = ( grid_data, final_freq_count, layer_options, scene ) => {
		const 	geometry = new THREE.Geometry(),
				material = ( use_colours ? new THREE.MeshLambertMaterial( {
					vertexColors: THREE.FaceColors,
					side: THREE.DoubleSide,
				} ) : new THREE.MeshBasicMaterial( {
					color: 0x00ff00,
					wireframe: true,
				} ) );


		grid_data.forEach( ( { data } ) => {
			data.flat().forEach( item => geometry.vertices.push( new THREE.Vector3( item.x, item.y, item.z ) ) );

			for ( let i = 1; i < data.length; i ++ ) {
				for ( let j = 0; j < data[ i ].length - 1; j ++ ) {
					const points = {
						'oo' : data[ i ][ j ],
						'oi' : data[ i - 1 ][ j ],
						'io' : data[ i ][ j + 1 ],
						'ii' : data[ i - 1 ][ j + 1 ],
					};

					geometry.faces.push( new THREE.Face3( points.io.index, points.oo.index, points.ii.index ) );
					geometry.faces[ geometry.faces.length - 1 ].color = new THREE.Color( get_colour_by_height( points.oo, points.oi, points.ii, layer_options ) );

					geometry.faces.push( new THREE.Face3( points.oo.index, points.oi.index, points.ii.index ) );
					geometry.faces[ geometry.faces.length - 1 ].color = new THREE.Color( get_colour_by_height( points.oo, points.oi, points.ii, layer_options ) );	
				}
			}
 		} );

		geometry.computeVertexNormals();

		const terrain = new THREE.Mesh( geometry, material );
		terrain.castShadow = true;

		scene.add( terrain );
	}

	// Adds rotational drag controls
	const apply_spaceship_controls = camera => {
		let click_coords = {
			'x' : null,
			'y' : null,
		},
		can_drag = false,
		speed = 16;

		document.addEventListener( 'mousedown', event => {
			can_drag = true;

			click_coords = {
				'x' : event.clientX,
				'y' : event.clientY,
			};
		} );

		document.addEventListener( 'mouseup', event => can_drag = false );

		document.addEventListener( 'mousemove', event => {
			if ( can_drag ) {
				camera.rotation.y += ( ( click_coords.x - event.clientX ) / 400 );
				camera.rotation.x += ( ( click_coords.y - event.clientY ) / 400 );

				click_coords = {
					'x' : event.clientX,
					'y' : event.clientY,
				};
			} 
		} );

		document.addEventListener( 'keydown', e => {
			switch ( e.keyCode ) {
				case 87 : // W
					camera.translateZ( speed * -1 );
					break;
				case 68 : // D
					camera.translateX( speed );
					break;
				case 83 : // S
					camera.translateZ( speed );
					break;
				case 65 : // A
					camera.translateX( speed * -1 );
					break;
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
