	
	import Vue from 'vue'
	import App from './App.vue'

	window.Event = new Vue(  );

	window.Main = new Vue( {
		el: '#app',

		render: h => h(App),
	} );

	
