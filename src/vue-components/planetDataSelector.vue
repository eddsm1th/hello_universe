<template>
	<section>
		<ul class="planet-options-list">
			<li
				class="data-option"
				v-for="data_option, index in viable_data_options"
				:key="index"
			>
				<planetDataOption
					:data_option="data_option"
				/>
			</li>
		</ul>

		<button
			@click.prevent="submit_planet_data()"
			class="accordion__cta"
		>
			{{ content.cta_content }}
		</button>
	</section>
</template>

<script>
	import { create_planet } from './../js-components/planet.js';
	import planetDataOption from './planetDataOption.vue';

	export default {
		name: 'planetDataSelector',

		props: {
			content: {
				type: Object,
				required: true
			}
		},

		components: {
			planetDataOption
		},

		mounted () {
			this.submit_planet_data()
		},

		methods: {
			submit_planet_data () {
				let data = {};

				this.data_options.forEach( ( item ) => data[ item.slug ] = Math.round( item.value ) );

				this.grid_data = create_planet( data );
	        }
		},

		computed: {
			viable_data_options () {
				return this.data_options.filter( ( item ) => item.active );
			}
		},

		data () {
			return {
				grid_data: null,
				data_options: [
					{
						'title' : 'Base_Amplitude',
						'slug' : 'base_amp',
						'value' : 100,
						'min' : 0,
						'max' : 200,
						'active' : true
					},
					{
						'title' : 'Amplitude_Layer_Division',
						'slug' : 'amp_diff',
						'value' : 2,
						'min' : 1,
						'max' : 10,
						'active' : true
					},
					{
						'title' : 'Amplitude_Bias',
						'slug' : 'amp_bias',
						'value' : 4,
						'min' : -100,
						'max' : 100,
						'active' : true
					},
					{
						'title' : 'Base_Frequency',
						'slug' : 'base_freq',
						'value' : 4,
						'min' : 2,
						'max' : 36,
						'active' : true
					},
					{
						'title' : 'Frequency_Multiplier',
						'slug' : 'freq_diff',
						'value' : 2,
						'min' : 2,
						'max' : 2,
						'active' : false
					},
					{
						'title' : 'Base_Layers',
						'slug' : 'base_layers',
						'value' : 3,
						'min' : 1,
						'max' : 6,
						'active' : true
					},
					{
						'title' : 'Water_Level',
						'slug' : 'water_level',
						'value' : 50,
						'min' : 0,
						'max' : 100,
						'active' : true
					},
					{
						'title' : 'Planet_Radius',
						'slug' : 'radius',
						'value' : 600,
						'min' : 100,
						'max' : 1000,
						'active' : true
					},
				]
			}
		}
	}
</script>

<style lang="scss">
	.planet-options-list {
		list-style: none;
	}
</style>