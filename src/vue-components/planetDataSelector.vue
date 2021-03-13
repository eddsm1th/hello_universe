<template>
	<section class="planet-options">
		<div class="planet-options__list">
			<div class="accordion">
				<h3 class="accordion__header accordion__header--border">Base_data</h3>
				<div class="accordion__content">
					<ul class="planet-options__list">
						<li
							class="data-option"
							v-for="data_option, index in data_options"
							:key="index"
						>
							<planetDataOption
								:data_option="data_option"
								:value="celestial_body.generation_attributes[ data_option.slug ]"
								v-on:updateValue="update_value"
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
								:value="celestial_body.generation_attributes.above[ data_option.slug ]"
								:polarity="1"
								v-on:updateValue="update_value"
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
								:value="celestial_body.generation_attributes.below[ data_option.slug ]"
								:polarity="-1"
								v-on:updateValue="update_value"
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
			},
			celestial_body: {
				type: Object,
				required: true
			}
		},

		components: {
			planetDataOption
		},

		mounted () {
			/*
				uncomment to generate planet on load
			*/
			// this.submit_planet_data();
		},

		methods: {
			submit_planet_data () {
				let data = {}, above_data = {}, below_data = {};

				this.celestial_body.generation_attributes.forEach( item => data[ item.slug ] = Math.round( item.value ) );
				this.celestial_body.generation_attributes.above.forEach( item => above_data[ item.slug ] = Math.round( item.value ) );
				this.celestial_body.generation_attributes.below.forEach( item => below_data[ item.slug ] = Math.round( item.value ) );
				
				const grid_data = create_celestial_body_base( [], data, above_data, below_data );
	        },

	        update_value ( { value, title, polarity } ) {
	        	if ( polarity == 0 ) {
	        		this.celestial_body.generation_attributes[ title ] = value;
	        	} else if ( polarity == -1 ) {
	        		this.celestial_body.generation_attributes.below[ title ] = value;
	        	} else if ( polarity == 1 ) {
	        		this.celestial_body.generation_attributes.above[ title ] = value;
	        	}
	        }
		},

		data () {
			return {
				data_options: [
					{
						'title' : 'Amplitude_Layer_Division',
						'slug' : 'amp_diff',
						'min' : 1,
						'max' : 10,
					},
					{
						'title' : 'Base_Frequency',
						'slug' : 'base_freq',
						'min' : 2,
						'max' : 10,
					},
					{
						'title' : 'Frequency_Layer_Multiplication',
						'slug' : 'freq_diff',
						'min' : 2,
						'max' : 6,
					},
					{
						'title' : 'Layers',
						'slug' : 'base_layers',
						'min' : 1,
						'max' : 4,
					},
					{
						'title' : 'Radius',
						'slug' : 'radius',
						'min' : 100,
						'max' : 1000,
					},
				],
				above_options: [
					{	
						'title' : 'Base Amplitude',
						'slug' : 'base_amp',
						'min' : 0,
						'max' : 200,
					},
					{
						'title' : 'Amplitude_Bias',
						'slug' : 'amp_bias',
						'min' : -100,
						'max' : 100,
					},
				],
				below_options: [
					{	
						'title' : 'Base Amplitude',
						'slug' : 'base_amp',
						'min' : 0,
						'max' : 200,
					},
					{
						'title' : 'Amplitude_Bias',
						'slug' : 'amp_bias',
						'min' : -100,
						'max' : 100,
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