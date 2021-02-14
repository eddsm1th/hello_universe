<template>
	<section class="planet-options">
		<div class="planet-options__list">
			<div class="accordion">
				<h3 class="accordion__header accordion__header--border">Base_data</h3>
				<div class="accordion__content">
					<ul class="planet-options__list">
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
				</div>
			</div>
		</div>

		<div class="planet-options__list--half">
			<div class="accordion">
				<h3 class="accordion__header accordion__header--border">above_data</h3>
				<div class="accordion__content">
					<ul class="planet-options__list">
						<li
							class="data-option"
							v-for="data_option, index in above_options"
							:key="index"
						>
							<planetDataOption
								:data_option="data_option"
							/>
						</li>
					</ul>
				</div>
			</div>
		</div>

		<div class="planet-options__list--half">
			<div class="accordion">
				<h3 class="accordion__header accordion__header--border">below_data</h3>
				<div class="accordion__content">
					<ul class="planet-options__list">
						<li
							class="data-option"
							v-for="data_option, index in below_options"
							:key="index"
						>
							<planetDataOption
								:data_option="data_option"
							/>
						</li>
					</ul>
				</div>
			</div>
		</div>

		<div>
			<button
				@click.prevent="submit_planet_data()"
				class="accordion__cta"
			>
				{{ content.cta_content }}
			</button>
		</div>
	</section>
</template>

<script>
	import { create_celestial_body_base } from './../js-components/celestial_body_generator.js';
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

		methods: {
			submit_planet_data () {
				let data = {}, above_data = {}, below_data = {};

				this.data_options.forEach( item => data[ item.slug ] = Math.round( item.value ) );
				this.above_options.forEach( item => above_data[ item.slug ] = Math.round( item.value ) );
				this.below_options.forEach( item => below_data[ item.slug ] = Math.round( item.value ) );
				this.grid_data = create_celestial_body_base( [], data, above_data, below_data );
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
						'title' : 'Amplitude_Layer_Division',
						'slug' : 'amp_diff',
						'value' : 2,
						'min' : 1,
						'max' : 10,
						'active' : true
					},
					{
						'title' : 'Base_Frequency',
						'slug' : 'base_freq',
						'value' : 6,
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
						'value' : 4,
						'min' : 1,
						'max' : 6,
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
				],
				above_options: [
					{	
						'title' : 'Base Amplitude',
						'slug' : 'base_amp',
						'value' : 60,
						'min' : 0,
						'max' : 200,
						'active' : true
					},
					{
						'title' : 'Amplitude_Bias',
						'slug' : 'amp_bias',
						'value' : 0,
						'min' : -100,
						'max' : 100,
						'active' : true
					},
				],
				below_options: [
					{	
						'title' : 'Base Amplitude',
						'slug' : 'base_amp',
						'value' : 60,
						'min' : 0,
						'max' : 200,
						'active' : true
					},
					{
						'title' : 'Amplitude_Bias',
						'slug' : 'amp_bias',
						'value' : 0,
						'min' : -100,
						'max' : 100,
						'active' : true
					},
				],
			}
		}
	}
</script>

<style lang="scss">
	.planet-options {
		display: flex;
		flex-wrap: wrap;
		margin-top: -24px;
		margin-left: -24px;

		> * {
			padding-top: 24px;
			padding-left: 24px;
		}

		&__list {
			list-style: none;
			width: 100%;

			&--half {
				width: 50%;
			}
		}

		&__list-heading {
			font-size: 12px;
			margin-bottom: 16px;
		}
	}
</style>