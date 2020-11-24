<template>
    <main class="options">
        <accordion
            v-for="accordion, index in accordions"
            :key="index"
            :content="accordion.content"
            :child_component="accordion.child_component"
        ></accordion>
    </main>
</template>

<script>
    import accordion from './vue-components/Accordion.vue';

    export default {
        name: 'app',

        components: {
            accordion,
        },

        data () {
            return {
                accordions: [
                    {
                        'content' : {
                            'title' : 'Planet Data',
                            'cta_content' : 'Generate Planet'
                        },
                        'child_component' : 'planetDataSelector'
                    },
                    {
                        'content' : {
                            'title' : 'Colour Data',
                            'cta_content' : 'Generate Colours'
                        },
                        'child_component' : 'colourDataSelector'
                    }
                ]
            }
        },
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
