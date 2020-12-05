<template>
	<section class="solar-system-editor">
		<h1 style="font-size: 2rem; color: white;">{{ solar_system_data.name }}</h1>
	</section>
</template>

<script>
	export default {
		name: 'solarSystemEditor',

		props: {
			solar_system_data: {
				type: Object,
				required: true,
			}
		},

		data () {
			return {
			}
		},
	}
</script>

<style lang="scss">

</style>