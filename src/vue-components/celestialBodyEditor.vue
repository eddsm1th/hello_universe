<template>
	<section class="selector clipped">
		<h3 class="selector__title">
			<span>CB://{{ celestial_body.name }}</span>
		</h3>

		<div class="selector__list">
			<accordion
				v-for="accordion, index in accordions"
				:key="index"
				:content="accordion.content"
				:celestial_body="celestial_body"
				:child_component="accordion.child_component"
			></accordion>

			<h1 @click="$parent.load_state( 0 )">Back</h1>
		</div>
	</section>
</template>

<script>
	import accordion from './accordion.vue';

	export default {
		name: 'celestialBodyEditor',

		components: {
			accordion,
		},

		props: {
			celestial_body: {
				type: Object,
				required: true,
			}
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
		}
	}
</script>