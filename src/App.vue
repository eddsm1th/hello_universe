<template>
    <main
        class="main"
        :class="{
            'instantiated' : instantiated
        }"
    >
        <helloUniverse
            v-if="loaded"
        />

        <section
            v-if="loaded"
            class="state-container"
            :style="{
                height : ( states_transitioning ?  0 : ( ( state_height + 1 ) + 'px' ) ),
            }"
        >
            <div
                class="state-container__inner"
                ref="state_content"
            >
                <component
                    :is="current_state.name"
                    :solar_system_data="selected_solar_system"
                />
            </div>
        </section>

       <!--  <accordion
            v-for="accordion, index in accordions"
            :key="index"
            :content="accordion.content"
            :child_component="accordion.child_component"
        ></accordion> -->
    </main>
</template>

<script>
    import accordion from './vue-components/accordion.vue';
    import helloUniverse from './vue-components/helloUniverse.vue';
    import solarSystemSelector from './vue-components/solarSystemSelector.vue';
    import solarSystemEditor from './vue-components/solarSystemEditor.vue';

    export default {
        name: 'app',

        components: {
            accordion,
            helloUniverse,
            solarSystemSelector,
            solarSystemEditor,
        },

        data () {
            return {
                instantiated: false,
                loaded: false,
                loading: false,

                states_ready: false,
                states_transitioning: false,
                state_height: 0,

                selected_solar_system: null,

                states: [
                    {
                        'name' : 'solarSystemSelector',
                        'active' : true
                    },
                    {
                        'name' : 'solarSystemEditor',
                        'active' : true
                    },
                ],

                accordions: [
                    {
                        'content' : {
                            'title' : 'Planet_Data',
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

        computed: {
            current_state () {
                return this.states.find( inst => inst.active );
            }
        },

        mounted () {
            setTimeout( () => this.instantiated = true, 300 );
            setTimeout( () => this.loaded = true, 500 ); 
        },

        methods: {
            load_state ( state_index ) {
                this.states_transitioning = true;

                setTimeout( () => {
                    this.current_state.active = false;
                    this.states[ state_index ].active = true;

                    this.states_transitioning = false;
                    this.state_height = this.$refs.state_content.offsetHeight;
                }, 300 );      
            },

            set_initial_state () {
                this.states_ready = true;
                this.state_height = this.$refs.state_content.offsetHeight;
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
        letter-spacing: .4em;
    }

    body, html {
        background-color: #000;
        width: 100vw;
        height: 100vh;
        overflow: hidden;
    }

    body {
        perspective: 500px;
    }

    .main {
        padding: 20px;
        margin: 20px;
        position: relative;
        width: 80%;
        // max-width: 400px;
        display: flex;
        flex-direction: column;
        transform: rotateY(10deg);
        transform-origin: 0 50%;
        transition: .3s width ease, .3s padding-top ease, .3s padding-bottom ease;

        &:not(.instantiated) {
            width: 0;
            padding-top: 0;
            padding-bottom: 0;
        }

        &:after {
            content: "";
            position: absolute;
            width: 100%;
            height: calc( 100% + 16px );
            top: -8px;
            left: 0;
            background: linear-gradient(90deg, rgba(255, 255, 255, .25), rgba(255, 255, 255, 0));
            filter: blur(8px);
            pointer-events: none;
        }
    }

    .state-container {
        transition: .3s height ease;
        overflow: hidden;

        &__inner {
            padding-top: 20px;
        }
    }
</style>
