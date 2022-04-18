<template>
    <main>
        <loading
            v-if="is_in_loading_state"
            :custom_content="custom_loading_message"
        />

        <section
            class="main"
            :class="{
                'instantiated' : instantiated,
                'is_in_loading_state' : is_in_loading_state,
            }"
        >
            <helloUniverse
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
                        :solar_system_data="solar_system_data"
                        :celestial_body="selected_celestial_body"
                        @isLoading="set_is_loading"
                    />
                </div>
            </section>
        </section>
    </main>
</template>

<script>
    import helloUniverse from './vue-components/helloUniverse.vue';
    import loading from './vue-components/loading.vue';
    import solarSystemEditor from './vue-components/solarSystemEditor.vue';
    import celestialBodyEditor from './vue-components/celestialBodyEditor.vue';

    export default {
        name: 'app',

        components: {
            helloUniverse,
            solarSystemEditor,
            celestialBodyEditor,
            loading
        },

        data () {
            return {
                scene: null,
                is_in_loading_state: false,
                custom_loading_message: '',
                celestial_body_default_data: {
                    'amp_diff' : 4,
                    'base_freq' : 8,
                    'freq_diff' : 4,
                    'base_layers' : 3,
                    'radius' : 600,
                    'above' : {
                        'base_amp' : 80,
                        'amp_bias' : 0,
                    },
                    'below' : {
                        'base_amp' : 100,
                        'amp_bias' : 0,
                    }
                },
                placeholder_body: null,
                instantiated: false,
                loaded: false,
                loading: false,
                states_ready: false,
                states_transitioning: false,
                state_height: 0,
                states: [
                    {
                        'name' : 'solarSystemEditor',
                        'active' : true
                    },
                    {
                        'name' : 'celestialBodyEditor',
                        'active' : false
                    },
                ],
                selected_celestial_body: {},
                theme_music: ['Thanks for all the fish!','404','¯\\_(ツ)_/¯', 'CYA_TMR','EXTRA LIFE!','FATALITY','Thanks for staying!','...oops','EXECUTE ORDER 66','*SNAP*','Pulling an Alderaan...','blackhole.exe','The 8th day'],
                solar_system_data: {
                    'name' : 'My first solar system',
                    'celestial_bodies' : []
                },
            }
        },

        computed: {
            current_state () {
                return this.states.find( inst => inst.active );
            }
        },

        mounted () {
            this.solar_system_data.celestial_bodies.push( this.make_celestial_body() );

            setTimeout( () => this.instantiated = true, 300 );
            setTimeout( () => this.loaded = true, 500 ); 
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

            make_celestial_body ( data = {} ) {
                return {
                    'name' : data.name || 'My First Celestial Body',
                    'blackhole' : data.blackhole || false,
                    'doom' : data.doom || false,
                    'doom_music' : this.theme_music[ Math.floor( Math.random() * this.theme_music.length ) ],
                    'generation_attributes' : data.generation_attributes || { ...this.celestial_body_default_data },
                    'point_data' : data.point_data || null,
                };
            },

            set_is_loading ( { state, custom_message } = { state: false, custom_message: 'Beep boop beep boop' } ) {
                this.is_in_loading_state = state;
                this.custom_loading_message = custom_message;
            }
        }
    };
</script>

<style lang="scss">
    @import "/scss-components/_mixins.scss";

    *, *:before, *:after {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        font-family: helvetica;
        font-weight: 100;
        font-size: 1em;
        text-transform: uppercase;
        letter-spacing: .4em;
        user-select: none;
    }

    body, html {
        background-color: #000;
        width: 100vw;
        height: 100vh;
        // overflow: hidden;
    }

    body {
        perspective: 500px;
    }

    canvas {
        position: absolute;
        top: 0;
    }

    .main {
        padding: 20px;
        position: absolute;
        z-index: 1;
        width: 80%;
        max-width: 800px;
        display: flex;
        flex-direction: column;
        transition: .3s width ease, .3s padding-top ease, .3s padding-bottom ease, .3s opacity ease;

        &:not(.instantiated) {
            width: 0;
            padding-top: 0;
            padding-bottom: 0;
        }

        &.is_in_loading_state {
            opacity: .4;
            pointer-events: none;
        }
    }

    .state-container {
        transition: .3s height ease;
        overflow: hidden;

        &__inner {
            margin-top: 12px;
            // background-color: #000000;
        }
    }

    .selector {
        @include clipped;
        border: 1px solid #fff;
        color: #fff;
        // background-color: #000;

        &__title {
            padding: 8px;
            font-size: 8px;
            background-color: #ffffff;
            color: #000000;
        }

        &__list, &__options {
            list-style: none;
            padding: 12px;
        }

        &__options {
            padding-top: 0;
        }

        &__item {
            padding: 8px 60px 8px 12px;
            border: 1px solid transparent;
            cursor: pointer;
            position: relative;

            &:not(.blackhole):hover {
                @include clipped;
                border: 1px solid #fff;
            }

            &:not(:last-child) {
                margin-bottom: 12px;
            }

            small {
                font-size: 10px;
            }

            &.blackhole {
                border: 1px solid transparent;
                background-color: transparent;
                > * {
                    opacity: 0;
                }
            }
        }

        &__item-title {
            background: transparent;
            border: none;
            border-radius: 0px;
            width: auto;
            color: inherit;
            width: 100%;
        }

        &__options {
            display: flex;
            margin-left: -12px;
        }

        &__option {
            @include clipped;
            padding-left: 12px;
            min-width: 50%;
            font-size: 12px;
            
            button {
                padding: 12px 12px;
                border: 1px solid #fff;
                transition: .3s background-color ease;
                background-color: transparent;
                width: 100%;
                color: #fff;
                text-align: left;
                border-radius: 0;

                &:hover {
                    background-color: rgba( 255, 255, 255, .2 );
                }
            }
        }

        &__delete:hover {
            border: 1px solid #f00;
        }

        &__delete {
            position: absolute;
            top: 50%;
            right: 12px;
            width: 1em;
            height: 1em;
            border: 1px solid #fff;
            transform: translateY(-50%);
            &:hover {
                border: 1px solid #f00;
                &:after, &:before {
                    background-color: #f00;
                }
            }
            &:after, &:before {
                content: "";
                position: absolute;
                top: 50%;
                left: 50%;
                width: 1px;
                height: 144%;
                transform: translate( -50%, -50%) rotate(45deg);
                background: #fff;
            }
            &:after {
                transform: translate( -50%, -50%) rotate(-45deg);
            }
        }

        &__shadow {
            @include clipped( #f00 );
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: 1px solid #f00;
            font-size: 12px;
            z-index: 99;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #f00;
            opacity: 0;
            pointer-events: none;

            &.blackhole {
                opacity: 1;
                pointer-events: auto;
            }
        }

        &__shadow-button {
            margin-left: 12px;
            padding: 0 12px;
            position: relative;
            transition: .2s background-color ease;

            &:hover {
                background-color: rgba( 255, 0, 0, .2 );
            }

            &:after, &:before {
                content: "";
                position: absolute;
                top: 50%;
                left: 0;
                width: 4px;
                height: 120%;
                border: 1px solid #f00;
                border-right: none;
                transform: translateY(-50%);
            }

            &:after {
                right: 0;
                left: auto;
                border-right: 1px solid #f00;
                border-left: none;
            }
        }
    }
</style>
