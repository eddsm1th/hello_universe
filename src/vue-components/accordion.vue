<template>
	<section
		v-if="content && content.title && content.cta_content && child_component"
		class="accordion"
	>
		<div
			class="accordion__header"
			@click="accordion_is_open = !accordion_is_open"
		>
			{{ content.title }}
		</div>
		<div
			class="accordion__content-wrapper"
			:class="{
				'accordion_is_open' : accordion_is_open,
			}"
			:style="{
				height : ( ( accordion_is_open ? $refs.accordion_content.clientHeight : 0 ) + 'px' ),
			}"
		>
			<div
				class="accordion__content"
				ref="accordion_content"
			>
				<component
					:is="child_component"
					:content="content"
					:celestial_body="celestial_body"
					v-on="$listeners"
				/>
			</div>
		</div>
	</section>
</template>

<script>
	import planetDataSelector from './planetDataSelector.vue';

	export default {
		name: 'accordion',

		components: {
			planetDataSelector
		},

		props: {
			'content' : {
				type: Object,
				required: true,
			},
			'child_component' : {
				type: String,
				required: true,
			},
			'celestial_body' : {
				type: Object,
				required: true,
			}
		},

		data () {
			return {
				accordion_is_open : false
			}
		},
	}
</script>

<style lang="scss">
	.accordion {
		border: 1px solid #fff;
		color: #fff;
		position: relative;
		flex-shrink: 0;

		&:not(:last-child) {
			margin-bottom: 12px;
		}

		&__header {
			padding: 8px;
			font-size: 8px;
			background-color: #ffffff;
			color: #000000;

			&--border {
				border-bottom: 1px solid #fff;
			}
		}

		&__content-wrapper {
			transition: .3s height ease-out;
			overflow: hidden;
			position: relative;
			font-size: 10px;

			&:after {
				content: "";
				position: absolute;
				top: 0;
				left: 0;
				height: 0;
				border-top: 1px solid #fff;
				width: 100%;
				background-color: #fff;
			}
		}

		&__content {
			padding: 12px;
			font-size: 10px;
		}

		&__cta {
			padding: 8px 12px;
			font-size: 10px;
			border: 1px solid #fff;
			color: #fff;
			background-color: transparent;
			border-radius: 0;
		}
	}
</style>