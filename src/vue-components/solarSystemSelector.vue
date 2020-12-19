<template>
	<section class="selector">
		<h3 class="selector__title">
			<span>U://Solar_Systems&nbsp;</span><span>//&nbsp;{{ solar_systems.length }}&nbsp;/&nbsp;9</span>
		</h3>

		<ul
			v-if="solar_systems.length"
			class="selector__list"
		>
			<li
				class="selector__item"
				v-for="solar_system, index in solar_systems"
				:key="index"
				@click="select_solar_system( solar_system )"
				:class="{
					'blackhole' : solar_system.blackhole,
				}"
			>
				<div>
					<input
						class="selector__item-title"
						@click.stop
						v-model="solar_system.name"
					></input>
					<small>00{{ solar_system.celestial_bodies.length }}_celestial_bodies</small>
				</div>
				<i
					class="selector__delete"
					@click.stop="solar_system.blackhole = true"
				></i>

				<div 
					class="selector__shadow"
					@click.stop
					:class="{
						'blackhole' : solar_system.blackhole
					}"
					v-if="solar_system.blackhole"
				>
					<span v-if="!solar_system.doom">Are you sure?
						<i
							class="selector__shadow-button"
							@click.stop="solar_system.blackhole = false;"
						>no</i>
						<i
							class="selector__shadow-button"
							@click.stop="destroy_solar_system( solar_system )"
						>yes</i>
					</span>
					<span v-else>{{ solar_system.doom_music }}</span>
				</div>
			</li>
		</ul>

		<ul class="selector__options">
			<li class="selector__option">
				<button @click="create_solar_system()">New_solar_system</button>
			</li>
			<li class="selector__option">
				<button>Browse_(WIP)</button>
			</li>
		</ul>

	</section>
</template>

<script>
	export default {
		name: 'solarSystemSelector',

		props: {
			'solar_systems' : {
				type: Array,
			}
		},

		data () {
			return {
			}
		},

		methods: {
			select_solar_system ( solar_system ) {
				this.$parent.selected_solar_system = solar_system;

				this.$parent.load_state( 1 );
			},

			destroy_solar_system ( solar_system ) {
				solar_system.doom = true;

				setTimeout( () => {
					this.solar_systems.splice( this.solar_systems.indexOf( solar_system ), 1 );
				}, 1000 );
			},

			create_solar_system () {
				this.solar_systems.unshift( this.$parent.make_solar_system() );
			},
		}
	}
</script>

<style lang="scss">
	@import "../scss-components/_mixins.scss";

	.selector {
		@include clipped;
		padding: 20px;
		border: 1px solid #fff;
		color: #fff;

		&__title {
			display: flex;
			flex-wrap: wrap;
			justify-content: space-between;
			margin-bottom: 20px;

			small {
				width: 100%;
				font-size: 10px;
			}
		}

		&__list, &__options {
			list-style: none;
		}

		&__item {
			padding: 8px 60px 8px 12px;
			border: 1px solid transparent;
			cursor: pointer;
			position: relative;

			&:not(.blackhole):hover {
				@include clipped;
				border: 1px solid #fff;
			}

			&:not(:last-child) {
				margin-bottom: 12px;
			}

			small {
				font-size: 10px;
			}

			&.blackhole {
				border: 1px solid transparent;
				background-color: transparent;

				> * {
					opacity: 0;
				}
			}
		}

		&__item-title {
			background: transparent;
			border: none;
			border-radius: 0px;
			width: auto;
			color: inherit;
			width: 100%;
		}

		&__options {
			margin-top: 20px;
			display: flex;
			margin-left: -12px;
		}

		&__option {
			@include clipped;
			padding-left: 12px;
			min-width: 50%;
			font-size: 12px;
			
			button {
				padding: 12px 12px;
				border: 1px solid #fff;
				transition: .3s background-color ease;
				background-color: transparent;
				width: 100%;
				color: #fff;
				text-align: left;
				border-radius: 0;

				&:hover {
					background-color: rgba( 255, 255, 255, .2 );
				}
			}
		}

		&_delete:hover {
			border: 1px solid #f00;
		}

		&__delete {
			position: absolute;
			top: 50%;
			right: 12px;
			width: 1em;
			height: 1em;
			border: 1px solid #fff;
			transform: translateY(-50%);

			&:hover {
				border: 1px solid #f00;

				&:after, &:before {
					background-color: #f00;
				}
			}

			&:after, &:before {
				content: "";
				position: absolute;
				top: 50%;
				left: 50%;
				width: 1px;
				height: 144%;
				transform: translate( -50%, -50%) rotate(45deg);
				background: #fff;
			}

			&:after {
				transform: translate( -50%, -50%) rotate(-45deg);
			}
		}

		&__shadow {
			@include clipped ( #f00 );
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			border: 1px solid #f00;
			font-size: 12px;
			z-index: 99;
			display: flex;
			align-items: center;
			justify-content: center;
			color: #f00;
			opacity: 0;
			pointer-events: none;

			&.blackhole {
				opacity: 1;
				pointer-events: auto;
			}
		}

		&__shadow-button {
			margin-left: 12px;
			padding: 0 12px;
			position: relative;
			transition: .2s background-color ease;

			&:hover {
				background-color: rgba( 255, 0, 0, .2 );
			}

			&:after, &:before {
				content: "";
				position: absolute;
				top: 50%;
				left: 0;
				width: 4px;
				height: 120%;
				border: 1px solid #f00;
				border-right: none;
				transform: translateY(-50%);
			}

			&:after {
				right: 0;
				left: auto;
				border-right: 1px solid #f00;
				border-left: none;
			}
		}
	}
</style>