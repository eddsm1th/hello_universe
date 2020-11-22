<template>
    <main class="options">
        <accordion
            :content="{
                'title' : 'Planet Data',
                'cta_content' : 'Generate Planet',
            }"
            :child_component="'planetDataSelector'"
            v-on="$listeners"
            @dispatch_planet_generation_event="dispatch_planet_generation_event"
        ></accordion>

        <accordion
            :content="{
                'title' : 'Colour Data',
                'cta_content' : 'Generate Colours',
            }"
            :child_component="'colourDataSelector'"
        ></accordion>
    </main>
</template>

<script>
    import { create_planet } from './js-components/planet.js';
    import accordion from './vue-components/Accordion.vue';

    export default {
        name: 'app',

        components: {
            accordion,
        },

        data () {
            return {
                selected_planet_data: {},
                selected_colour_data: []
            }
        },

        methods: {
            dispatch_planet_generation_event ( data ) {
                create_planet( data );
            }
        }
    };
</script>

<style lang="scss">
    *, *:before, *:after {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        font-family: helvetica;
        font-weight: 100;
        font-size: 1em;
        text-transform: uppercase;
        letter-spacing: .5em;
    }

    body, html {
        background-color: #000;
    }

    .options {
        position: absolute;
        top: 20px;
        left: 20px;
    }
</style>
