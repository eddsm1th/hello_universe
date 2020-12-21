
	export const render_data = data => {
		const 	geometry = new THREE.Geometry(),
				scene = new THREE.Scene(),
				camera = new THREE.PerspectiveCamera( 100, window.innerWidth / window.innerHeight, .1, 1000 ),
				renderer = new THREE.WebGLRenderer();

		camera.position.z = 1000; // make this more relative to planet size and window
		renderer.setSize( window.innerWidth, window.innerHeight );
		document.body.appendChild( renderer.domElement );

		data.flat().forEach( ( item, index ) => {
			item.index = index;
			geometry.vertices.push( new THREE.Vector3( item.x, item.y, item.z ) )
		} );

		for ( let i = 1; i < Math.ceil( data.length / 2 ); i ++ ) {
			const 	current_layer = data[ i ],
					polar_current_layer = data[ data.length - 1 - i ],
					points_per_side = ( current_layer.length / 4 );

			let point_layer_offsets = 1;

			current_layer.forEach( ( layer_item, index ) => {
				if ( index % points_per_side == 0 ) {
					point_layer_offsets -= 1;

					const create_corner_panel = ( sent_arr, sent_index ) => {
						geometry.faces.push( new THREE.Face3(
							sent_arr[ index ].index,
							data[ sent_index ][ index + point_layer_offsets ].index,
							( sent_arr[ index + 1 ] || sent_arr[ 0 ] ).index
						) );
					}

					create_corner_panel( current_layer, ( i - 1 ) );
					create_corner_panel( polar_current_layer, ( data.length - i  ) );
				} else {
					const create_upper_panel = ( sent_arr, sent_index ) => {
						geometry.faces.push( new THREE.Face3(
							sent_arr[ index ].index,
							data[ sent_index ][ index + point_layer_offsets - 1 ].index,
							( data[ sent_index ][ index + point_layer_offsets ] || data[ sent_index ][ 0 ] ).index,
						) );
					},
					create_lower_panel = ( sent_arr, sent_index ) => {
						geometry.faces.push( new THREE.Face3(
							sent_arr[ index ].index,
							( data[ sent_index ][ index + point_layer_offsets ] || data[ sent_index ][ 0 ] ).index,
							( sent_arr[ index + 1 ] || sent_arr[ 0 ] ).index
						) );
					};

					create_upper_panel( current_layer, ( i - 1 ) );
					create_upper_panel( polar_current_layer, ( data.length - i ) );
					create_lower_panel( current_layer, ( i - 1 ) );
					create_lower_panel( polar_current_layer, ( data.length - i ) );
				}
			} );
		}

		const 	material = new THREE.MeshBasicMaterial( {
					color: 0x00ff00,
					wireframe: true,
					side: THREE.DoubleSide,
				} ),
				terrain = new THREE.Mesh( geometry, material );

		scene.add( terrain );

		apply_drag_controls( scene );

		function animate() {
				requestAnimationFrame( animate );
				renderer.render( scene, camera );
		} animate();
	}

	const apply_drag_controls = scene => {
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