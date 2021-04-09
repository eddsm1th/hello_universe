<template>
	<section class="loading">
		<div class="selector">
			<h3 class="selector__title">Loading...</h3>
			<p class="selector__list loading__text">{{ custom_content }}</p>
		</div>
	</section>
</template>

<script>
	export default {
		name: 'loading',

		props: {
			'custom_content' : {
				type: String,
				required: true,
			}
		},

		data () {
			return {
				dot_timing: 300,
			}
		},
	}
</script>

<style lang="scss">
	.loading {
		position: absolute;
		z-index: 1;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 100%;
		max-width: 400px;

		&__text {
			font-size: 10px;
		}
	}
</style>