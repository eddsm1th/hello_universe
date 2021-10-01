	
	const 	wireframe = false,

			use_water = true,
			use_earth = true,

			// terrain_colours = [
			// 	{
			// 		'rgb' : [ 255, 255, 123 ],
			// 		'threshold' : 0,
			// 	},
			// 	{
			// 		'rgb' : [ 0, 204, 0 ],
			// 		'threshold' : .15,
			// 	},
			// 	{
			// 		'rgb' : [ 0, 102, 0 ],
			// 		'threshold' : .3,
			// 	},
			// 	{
			// 		'rgb' : [ 153, 76, 0 ],
			// 		'threshold' : .6,
			// 	},
			// 	{
			// 		'rgb' : [ 102, 51, 0 ],
			// 		'threshold' : 1,
			// 	}
			// ],
			// water_colours = [
			// 	{
			// 		'rgb' : [ 0, 220, 255 ],
			// 		'threshold' : 0,
			// 	},
			// 	{
			// 		'rgb' : [ 0, 0, 90 ],
			// 		'threshold' : 1,
			// 	}
			// ];

			/* Random Colours */
				terrain_colours = [
					{
						'rgb' : [ parseInt( Math.random() * 255 ), parseInt( Math.random() * 255 ), parseInt( Math.random() * 255 ) ],
						'threshold' : 0,
					},
					{
						'rgb' : [ Math.random() * 255, Math.random() * 255, Math.random() * 255 ],
						'threshold' : .15,
					},
					{
						'rgb' : [ Math.random() * 255, Math.random() * 255, Math.random() * 255 ],
						'threshold' : .6,
					},
					{
						'rgb' : [ Math.random() * 255, Math.random() * 255, Math.random() * 255 ],
						'threshold' : 1,
					}
				],
				water_colours = [
					{
						'rgb' : [ parseInt( Math.random() * 255 ), parseInt( Math.random() * 255 ), parseInt( Math.random() * 255 ) ],
						'threshold' : 0,
					},
					{
						'rgb' : [ Math.random() * 255, Math.random() * 255, Math.random() * 255 ],
						'threshold' : 1,
					}
				];
			
	export const render_data = ( grid_data, final_freq_count, layer_options, above_options, below_options ) => {
		const 	scene = new THREE.Scene(),
				camera = new THREE.PerspectiveCamera( 80, window.innerWidth / window.innerHeight, .1, 6000 ),
				renderer = new THREE.WebGLRenderer(),
				sun = new THREE.HemisphereLight( 0xffffff, 0x000000, .2 ),
				directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );

		renderer.setSize( window.innerWidth, window.innerHeight );
		document.body.appendChild( renderer.domElement );
		camera.position.z = sun.position.z = directionalLight.position.z = layer_options.radius * 2; // make camera position more relative to window and readius

		plot_points( grid_data.splice( 0, 6 ), final_freq_count, layer_options, scene, above_options, below_options );

		scene.add( sun, directionalLight );

		function animate() {
			requestAnimationFrame( animate );
			renderer.render( scene, camera );
		} animate();

		apply_spaceship_controls( scene );

		return grid_data;
	}

	const plot_points = ( grid_data, final_freq_count, layer_options, scene, above_options, below_options ) => {
		const 	geometry = new THREE.Geometry(),
				material = ( !wireframe ? new THREE.MeshStandardMaterial( {
					// normalMap: new THREE.TextureLoader().load( './src/images/land.png' ),
					vertexColors: THREE.FaceColors,
					side: THREE.DoubleSide,
					roughness: .8,
				} ) : new THREE.MeshBasicMaterial( {
					color: 0x00ff00,
					wireframe: true,
				} ) ),
				water_geometry = new THREE.Geometry(),
				water_material = ( !wireframe ? new THREE.MeshStandardMaterial( {
					// normalMap: new THREE.TextureLoader().load( './src/images/water.png' ),
					vertexColors: THREE.VertexColors,
					transparent: true,
					opacity: .8,
					roughness: .3,
					side: THREE.DoubleSide,
				} ) : new THREE.MeshBasicMaterial( {
					color: 0xff0000,
					wireframe: true,
				} ) );

		grid_data.forEach( ( { data } ) => {
			data.flat().forEach( item => {
				if ( use_earth ) geometry.vertices.push( new THREE.Vector3( item.x, item.y, item.z ) );
				if ( use_water ) water_geometry.vertices.push( new THREE.Vector3( item.base_x, item.base_y, item.base_z ) );
			} );
		} );

		grid_data.forEach( ( { data } ) => {
			for ( let i = 1, _in = data.length; i < _in; i ++ ) {
				for ( let j = 0, _jn = data[ i ].length - 1; j < _jn; j ++ ) {
					const points = {
						'oo' : data[ i ][ j ],
						'oi' : data[ i - 1 ][ j ],
						'io' : data[ i ][ j + 1 ],
						'ii' : data[ i - 1 ][ j + 1 ],
					};

					add_face_to_goemetry( points, geometry, water_geometry, above_options, below_options );
				}
			}
 		} );

		if ( use_earth ) {
			geometry.computeVertexNormals();
			scene.add( new THREE.Mesh( geometry, material ) );
		}

		if ( use_water ) {
			water_geometry.computeVertexNormals();
			scene.add( new THREE.Mesh( water_geometry, water_material ) );
		}
	}

	const get_colour_by_amp = ( depth, colours ) => {
		if ( depth > 0 ) {
			let lower_colour_reference, higher_colour_reference, depth_relative_to_reference_colours, new_values = [];

			for ( let i = 0, _in = colours.length - 1; i < _in; i ++ ) {
				if ( depth <= colours[ i + 1 ].threshold || i == colours.length - 2 ) {
					lower_colour_reference = colours[ i ].rgb;
					higher_colour_reference = colours[ i + 1 ].rgb;
					depth_relative_to_reference_colours = ( depth - colours[ i ].threshold ) / ( colours[ i + 1 ].threshold - colours[ i ].threshold );

					break;
				}
			}

			for ( let i = 0; i < 3; i ++ ) {
				const new_value = parseInt( lower_colour_reference[ i ] - ( ( lower_colour_reference[ i ] - higher_colour_reference[ i ] ) * depth_relative_to_reference_colours ) );

				new_values.push( new_value < 0 ? 0 : new_value );
			}

			return `rgb( ${ new_values[ 0 ] }, ${ new_values[ 1 ] }, ${ new_values[ 2 ] } )`;
		} else {
			return `rgb( ${ colours[ 0 ].rgb[ 0 ] }, ${ colours[ 0 ].rgb[ 1 ] }, ${ colours[ 0 ].rgb[ 2 ] } )`;
		}
	}

	const add_face_to_goemetry = ( points, geometry, water_geometry, above_options, below_options ) => {
		points.avg_amplitude = [ points.oo.amp_value, points.oi.amp_value, points.io.amp_value, points.ii.amp_value ].reduce( ( a, b ) => a + b ) / 4

		if ( use_earth ) {
			points.terrain_true_middle = {
				x : [ points.oo.x, points.oi.x, points.io.x, points.ii.x ].reduce( ( a, b ) => a + b ) / 4,
				y : [ points.oo.y, points.oi.y, points.io.y, points.ii.y  ].reduce( ( a, b ) => a + b ) / 4,
				z : [ points.oo.z, points.oi.z, points.io.z, points.ii.z ].reduce( ( a, b ) => a + b ) / 4,
			};

			geometry.vertices.push( new THREE.Vector3( points.terrain_true_middle.x, points.terrain_true_middle.y, points.terrain_true_middle.z ) );

			geometry.faces.push( create_geometry_face( points.oo, points.io, geometry.vertices.length - 1, above_options, terrain_colours, points.avg_amplitude ) );
			geometry.faces.push( create_geometry_face( points.io, points.ii, geometry.vertices.length - 1, above_options, terrain_colours, points.avg_amplitude ) );
			geometry.faces.push( create_geometry_face( points.ii, points.oi, geometry.vertices.length - 1, above_options, terrain_colours, points.avg_amplitude ) );
			geometry.faces.push( create_geometry_face( points.oi, points.oo, geometry.vertices.length - 1, above_options, terrain_colours, points.avg_amplitude ) );
		}

		if ( use_water && ( points.oo.amp_value <= 0 || points.oi.amp_value <= 0 || points.ii.amp_value <= 0 || points.io.amp_value <= 0 ) ) {
			points.water_true_middle = {
				x : [ points.oo.base_x, points.oi.base_x, points.io.base_x, points.ii.base_x ].reduce( ( a, b ) => a + b ) / 4,
				y : [ points.oo.base_y, points.oi.base_y, points.io.base_y, points.ii.base_y  ].reduce( ( a, b ) => a + b ) / 4,
				z : [ points.oo.base_z, points.oi.base_z, points.io.base_z, points.ii.base_z ].reduce( ( a, b ) => a + b ) / 4,
			};

			water_geometry.vertices.push( new THREE.Vector3( points.water_true_middle.x, points.water_true_middle.y, points.water_true_middle.z ) );

			water_geometry.faces.push( create_geometry_face( points.oo, points.io, water_geometry.vertices.length - 1, below_options, water_colours, points.avg_amplitude, -1 ) );
			water_geometry.faces.push( create_geometry_face( points.io, points.ii, water_geometry.vertices.length - 1, below_options, water_colours, points.avg_amplitude, -1 ) );
			water_geometry.faces.push( create_geometry_face( points.ii, points.oi, water_geometry.vertices.length - 1, below_options, water_colours, points.avg_amplitude, -1 ) );
			water_geometry.faces.push( create_geometry_face( points.oi, points.oo, water_geometry.vertices.length - 1, below_options, water_colours, points.avg_amplitude, -1 ) );
		}
	}

	const create_geometry_face = ( a, b, c, options, colours, center_amp, polarity = 1 ) => {
		let face = new THREE.Face3( a.index, b.index, c );

		const 	a_amp = a.amp_value,
				b_amp = b.amp_value;

		if ( !wireframe ) for ( let i = 0; i < 3; i ++ ) {
			const depth = [ a_amp, b_amp, center_amp ][ i ] / ( options.base_amp * polarity );

			face.vertexColors[ i ] = new THREE.Color( get_colour_by_amp( depth, colours ) );
		}

		return face;
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
				camera.rotateY( ( click_coords.x - event.clientX ) / 400 );
				camera.rotateX( ( click_coords.y - event.clientY ) / 400 );

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
