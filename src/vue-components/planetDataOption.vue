<template>
	<div
		class="data-option__inner"
		v-if="data_option"
	>
		<h3 class="data-option__title"><span>{{ data_option.title }}&nbsp;</span><span>//&nbsp;{{ Math.round( value ) }}</span></h3>

		<valueSelector
			:min="data_option.min"
			:max="data_option.max"
			:value="value"
			:title="data_option.slug"
			:polarity="polarity"
			v-on="$listeners"
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
			},
			value: {
				type: Number,
				required: true,
			},
			polarity: {
				type: Number,
				default: 0,
			}
		},

		components: {
			valueSelector,
		},
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
			font-size: 8px;
		}
	}
</style>