<template>
	<div
		class="value-selector"
		@mousedown="handle_mouse_down()"
		ref="value_selector"
	>
		<i
			class="value-selector__progress"
			:style="{
				width : ( value_as_percent_of_min_and_max + '%' ),
			}"
		></i>
	</div>
</template>

<script>
	export default {
		name: "valueSelector",

		props: {
			'min': {
				type: Number,
				required: true,
			},
			'max': {
				type: Number,
				required: true,
			},
			'value': {
				type: Number,
				required: true,
			},
		},

		data () {
			return {
				can_drag: false,

				click_coords: {
					'x' : null,
				},
			}
		},

		mounted () {
			window.addEventListener( 'mouseup', () => {
				this.can_drag = false;
			} );

			window.addEventListener( 'mousemove', event => {
				if ( this.can_drag ) {
					this.$parent.update_value( ( ( this.click_coords.x - event.clientX ) / this.percent_per_pixel ) * -1 );

					this.click_coords = {
						'x' : event.clientX,
					};
				}
			} );

			window.addEventListener( 'blur', () => this.can_drag = false );
		},

		methods: {
			handle_mouse_down () {
				this.can_drag = true;

				this.click_coords = {
					'x' : event.clientX,
				};
			}
		},

		computed: {
			value_as_percent_of_min_and_max () {
				return this.value / this.max * 100;
			},

			percent_per_pixel () {
				return this.$refs.value_selector.clientWidth / this.max;
			}
		}
	}
</script>

<style lang="scss">
	.value-selector {
		border: 1px solid #fff;

		&__progress {
			display: block;
			height: 24px;
			position: relative;
			background: linear-gradient(-90deg, rgba( 255, 255, 255, .2 ), rgba( 255, 0, 0, 0 ) );

			&:after {
				content: "";
				position: absolute;
				left: 100%;
				top: 0;
				height: 100%;
				width: 0;
				border-right: 1px solid #fff;
			}
		}

		&__grab {
			position: absolute;
			right: 0;
			top: 50%;
			width: 4px;
			height: calc( 100% + 4px );
			background-color: #fff;
			transform: translate( 50%, -50% );
			cursor: pointer;
			z-index: 1
		}
	}
</style>