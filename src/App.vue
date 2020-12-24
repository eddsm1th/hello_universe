<template>
    <main
        class="main_"
        :class="{
            'instantiated' : instantiated
        }"
    >
<!--         <helloUniverse
            v-if="loaded"
        />

        <section
            v-if="loaded"
            class="state-container"
            :style="{
                height : state_height,
            }"
        >
            <div
                class="state-container__inner"
                ref="state_content"
            >
                <component
                    :is="current_state.name"
                    :solar_system_data="selected_solar_system"
                    :solar_systems="solar_systems"
                    :celestial_body="selected_celestial_body"
                />
            </div>
        </section> -->

<!--         <accordion
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


    import { create_celestial_body } from './js-components/celestial_body_generator.js';

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
                placeholder_body: null,
                instantiated: false,
                loaded: false,
                loading: false,

                states_ready: false,
                states_transitioning: false,
                state_height: 0,

                states: [
                    {
                        'name' : 'solarSystemSelector',
                        'active' : true
                    },
                    {
                        'name' : 'solarSystemEditor',
                        'active' : false
                    },
                    {
                        'name' : 'celestialBodyEditor',
                        'active' : false
                    },
                ],

                solar_systems: [],
                selected_solar_system: {},
                selected_celestial_body: {},

                theme_music: ['Thanks for all the fish!','404','¯\\_(ツ)_/¯', 'CYA2TMR','EXTRA LIFE!','FATALITY','Thanks for staying!','...oops','EXECUTE ORDER 66','*SNAP*','Pulling an Alderaan...'],

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
            this.solar_systems = [
                this.make_solar_system(),
                this.make_solar_system(),
                this.make_solar_system(),
            ];

            setTimeout( () => this.instantiated = true, 300 );
            setTimeout( () => this.loaded = true, 500 ); 

            this.placeholder_body = create_celestial_body();
        },

        methods: {
            load_state ( state_index ) {
                [ this.set_state_height(), this.set_state_height( '0px', 40 ) ];

                setTimeout( () => {
                    this.current_state.active = false;

                    [ this.states[ state_index ].active = true, this.set_state_height(), this.set_state_height( 'auto', 300 ) ];
                }, 300 );
            },

            set_initial_state () {
                this.states_ready = true;
                
                [ this.set_state_height(), this.set_state_height( 'auto', 300 ) ]
            },

            set_state_height ( height = null, delay = 0 ) {
                setTimeout( () => this.state_height = ( height || this.$refs.state_content.offsetHeight + 1 + 'px' ), delay )
            },

            make_solar_system ( data = {} ) {
                return {
                    'name' : data.name || 'My First Solar System',
                    'celestial_bodies' : data.celestial_bodies || [ this.make_celestial_body() ],
                    'blackhole' : data.blackhole || false,
                    'doom' : data.doom || false,
                    'doom_music' : this.theme_music[ Math.floor( Math.random() * this.theme_music.length ) ],
                };
            },

            make_celestial_body ( data = {} ) {
                return {
                    'name' : data.name || 'My First Celestial Body',
                    'blackhole' : data.blackhole || false,
                    'doom' : data.doom || false,
                    'doom_music' : this.theme_music[ Math.floor( Math.random() * this.theme_music.length ) ],
                };
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
        // width: 100vw;
        // height: 100vh;
        // overflow: hidden;
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
            background: linear-gradient(90deg, rgba(255, 255, 255, .15), rgba(255, 255, 255, 0));
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
