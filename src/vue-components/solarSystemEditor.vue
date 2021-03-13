<template>
	<section class="selector clipped">
		<h3 class="selector__title">
			<span>U://{{ solar_system_data.name }}</span>
		</h3>

		<ul
			v-if="solar_system_data.celestial_bodies.length"
			class="selector__list"
		>
			<li
				class="selector__item"
				v-for="celestial_body, index in solar_system_data.celestial_bodies"
				:key="index"
				@click="select_celestial_body( celestial_body )"
				:class="{
					'blackhole' : celestial_body.blackhole,
				}"
			>
				<div>
					<input
						class="selector__item-title"
						@click.stop=""
						v-model="celestial_body.name"
					></input>
					<small>R600//BF12//L4</small>
				</div>
				<i
					class="selector__delete"
					@click.stop="celestial_body.blackhole = true"
				></i>

				<div 
					class="selector__shadow clipped clipped-red"
					@click.stop=""
					:class="{
						'blackhole' : celestial_body.blackhole
					}"
					v-if="celestial_body.blackhole"
				>
					<span v-if="!celestial_body.doom">Are you sure?
						<i
							class="selector__shadow-button"
							@click.stop="destroy_celestial_body( celestial_body )"
						>yes</i>
						<i
							class="selector__shadow-button"
							@click.stop="celestial_body.blackhole = false;"
						>no</i>
					</span>
					<span v-else>{{ celestial_body.doom_music }}</span>
				</div>
			</li>
		</ul>

		<ul class="selector__options">
			<li class="selector__option clipped">
				<button @click="create_celestial_body()">New_celestial_body</button>
			</li>
		</ul>

	</section>
</template>

<script>
	export default {
		name: 'solarSystemEditor',

		props: {
			solar_system_data: {
				type: Object,
			}
		},

		data () {
			return {
			}
		},

		methods: {
			select_celestial_body ( celestial_body ) {
				this.$parent.selected_celestial_body = celestial_body;

				this.$parent.load_state( 1 ); // celestial_body editor
			},

			destroy_celestial_body ( celestial_body ) {
				celestial_body.doom = true;

				setTimeout( () => {
					this.solar_system_data.celestial_bodies.splice( this.solar_system_data.celestial_bodies.indexOf( celestial_body ), 1 );
				}, 1000 );
			},

			create_celestial_body () {
				this.solar_system_data.celestial_bodies.unshift( this.$parent.make_celestial_body() );
			},
		}
	}
</script>

<style lang="scss">

</style>