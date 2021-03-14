<template>
	<section
		class="hello-universe"
		:style="{
			height : correct_height,
		}"
	>
		<div
			class="hello-universe__content"
			ref="main_body"
		>
			<!-- <i class="hello-universe__icon"></i> -->
			<h1
				class="hello-universe__text"
			>$://<span
					v-for="step, index in steps"
					:key="index"
					:class="{
						'active' : step.active
					}"
					v-html="step.char"
				/>
			</h1>
		</div>
	</section>
</template>

<script>
	export default {
		name: 'helloUniverse',

		data () {
			return {
				loaded: false,

				steps: [
					{
						'char' : 'H',
						'timing' : 38,
						'active' : false
					},
					{
						'char' : 'E',
						'timing' : 31,
						'active' : false
					},
					{
						'char' : 'L',
						'timing' : 38,
						'active' : false
					},
					{
						'char' : 'L',
						'timing' : 39,
						'active' : false
					},
					{
						'char' : 'O',
						'timing' : 27,
						'active' : false
					},
					{
						'char' : '_',
						'timing' : 44,
						'active' : false
					},
					{
						'char' : 'U',
						'timing' : 55,
						'active' : false
					},
					{
						'char' : 'N',
						'timing' : 26,
						'active' : false
					},
					{
						'char' : 'I',
						'timing' : 34,
						'active' : false
					},
					{
						'char' : 'V',
						'timing' : 29,
						'active' : false
					},
					{
						'char' : 'E',
						'timing' : 18,
						'active' : false
					},
					{
						'char' : 'R',
						'timing' : 49,
						'active' : false
					},
					{
						'char' : 'S',
						'timing' : 16,
						'active' : false
					},
					{
						'char' : 'E',
						'timing' : 0,
						'active' : false
					},
				]
			}
		},

		computed: {
			correct_height () {
				return ( this.loaded ? this.$refs.main_body.offsetHeight : 0 ) + 'px';
			}
		},

		mounted () {
			setTimeout( () => this.loaded = true, 300 );
			setTimeout( () => this.type_in_text(), 600 );	
		},

		methods: {
			type_in_text ( index = 0, current_index = this.steps[ 0 ] ) {
				current_index.active = true;

				if ( index !== this.steps.length - 1 ) {
					setTimeout( () => {
						this.type_in_text( index + 1, this.steps[ index + 1 ] );
					}, current_index.timing * 2 );
				} else {
					setTimeout( () => this.$parent.set_initial_state(), 200 );
				}
			}
		}
	}
</script>

<style lang="scss">
	@import "../scss-components/_mixins.scss";
	
	.hello-universe {
		transition: .3s height ease;
		overflow: hidden;
		color: #ffffff;

		&__content {
			display: flex;
		}

		&__icon {
			height: 1em;
			width: 1em;
			font-size: 8px;
			padding: 8px;
			border: 1px solid #ffffff;
			box-sizing: content-box;
			margin-right: 10px;
			flex-shrink: 0;
			background-image: repeating-linear-gradient( 45deg, #000, #000 6px, #fff 8px );
		}

		&__text {
			@include clipped;
			flex: 1;
			padding: 8px;
			font-size: 10px;
			border: 1px solid #ffffff;
			color: #000000;
			background-color: #ffffff;

			span {
				&:not(.active) {
					opacity: 0;
				}
			}
		}
	}
</style>