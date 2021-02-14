<template>
	<section class="selector clipped">
		<h3 class="selector__title">
			<span>CB://</span>
		</h3>

		<accordion
			v-for="accordion, index in accordions"
			:key="index"
			:content="accordion.content"
			:child_component="accordion.child_component"
		></accordion>
	</section>
</template>

<script>
	import accordion from './accordion.vue';

	export default {
		name: 'celestialBodyEditor',

		components: {
			accordion,
		},

		data () {
			return {
				accordions: [
                    {
                        'content' : {
                            'title' : 'Celestial_Body_Data',
                            'cta_content' : 'Generate_Planet'
                        },
                        'child_component' : 'planetDataSelector'
                    },
                    {
                        'content' : {
                            'title' : 'Colour_Data',
                            'cta_content' : 'Generate_Colours'
                        },
                        'child_component' : 'colourDataSelector'
                    }
                ]
			}
		},
	}
</script>