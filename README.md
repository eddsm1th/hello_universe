# Hello_Universe

Ever wanted to create a solar system? Crash your computer by putting every option to the max? Play god?

Well now you can! ( or at least you will when I get around to adding in all the features I have in my head ) Introducing 'Hello_Universe'; a procedural planet generator. Tailor the options of your planet ( and soon colours too! ) to create the planet you've always dreamed of... and hey, if your dream isn't what you were expecting, destroy that planet. It's probably not old enough to have life on it yet anyway... probably. Make a new planet, go nuts. Make a flat planet, a spiky planet, a sort of flat and sort of spiky planet. This is YOUR universe.

> sic itur ad astra

## Build Setup
``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build
```

## TODO
```
FEATURES
	- warnings on large generations
	- terrain/geometry amp bias
	- colours
		- flat colours
			- base
			- altitude scale
			- base colour angle selector
		- water colours
			- blend with base colours within from 0 to 20% depth
		- build colour selectors
	- invert terrain noise to use ridge noise(?)
	- different geometries for different layers to render when further away (based on body radius?)
	- update how bodies are stored in the app
	- solar system center point anchor
	- solar system overview screen
	- gravity
	- multiple bodies at once
	- ???
	- profit
```

For detailed explanation on how things work, consult the [docs for vue-loader](http://vuejs.github.io/vue-loader).
