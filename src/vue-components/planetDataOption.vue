<template>
	<div
		class="data-option__inner"
		v-if="data_option"
	>
		<h3 class="data-option__title"><span>{{ data_option.title }}&nbsp;</span><span>//&nbsp;{{ Math.round( data_option.value ) }}</span></h3>

		<valueSelector
			:min="data_option.min"
			:max="data_option.max"
			:value="data_option.value"
		/>
	</div>
</template>

<script>
	import valueSelector from './valueSelector.vue';

	export default {
		name: 'PlanetDataOption',
		
		props: {
			data_option: {
				type: Object,
				required: true
			}
		},

		components: {
			valueSelector,
		},

		methods: {
			update_value ( value_addition ) {
				const new_value = this.data_option.value + value_addition;

				this.data_option.value = ( new_value < this.data_option.min ? this.data_option.min : ( new_value > this.data_option.max ? this.data_option.max : new_value ) );
			}
		}
	}
</script>

<style lang="scss">
	.data-option {
		user-select: none;

		&:not(:last-child) {
			margin-bottom: 16px;
		}

		&__title {
			display: flex;
			justify-content: space-between;
			margin-bottom: 4px;
		}
	}
</style>