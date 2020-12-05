<template>
	<section class="selector">
		<h3 class="selector__title">
			<span>$://Solar_Systems&nbsp;</span><span>//&nbsp;{{ solar_systems.length }}&nbsp;/&nbsp;9</span>
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
			>
				<h4>00{{ index + 1 }}_{{ solar_system.name.replace( / /g, '_', -1 ) }}</h4>
				<small>00{{ solar_system.planets.length }}_planets</small>
			</li>
		</ul>

		<ul class="selector__options">
			<li class="selector__option">
				<button>Create_New</button>
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

		data () {
			return {
				solar_systems: [
					{
						'name' : 'My First Solar System',
						'planets' : [
							{}
						]
					},
					{
						'name' : 'Another one',
						'planets' : [
							{}
						]
					},
					{
						'name' : 'Andromeda',
						'planets' : [
							{}
						]
					}
				]
			}
		},

		methods: {
			select_solar_system ( solar_system ) {
				this.$parent.selected_solar_system = solar_system;

				this.$parent.load_state( 1 );
			}
		}
	}
</script>

<style lang="scss">
	.selector {
		padding: 20px;
		border: 1px solid #fff;
		color: #fff;

		&__title {
			display: flex;
			justify-content: space-between;
			margin-bottom: 20px
		}

		&__list, &__options {
			list-style: none;
		}

		&__item {
			padding: 8px 12px;
			border: 1px solid #fff;
			cursor: pointer;
			transition: .3s background-color ease;

			&:hover {
				background-color: rgba( 255, 255, 255, .2 );
			}

			&:not(:last-child) {
				margin-bottom: 12px;
			}

			small {
				font-size: 10px;
			}
		}

		&__options {
			margin-top: 20px;
			display: flex;
			margin-left: -12px;
		}

		&__option {
			padding-left: 12px;
			width: 50%;
			
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
	}
</style>