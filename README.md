# Hello_Universe
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
FIXES:
	- plot planet without mirroring points to avoid seam issue on equator
	- alter offet on bottom half of planet when generating terrain to use the correct value
	- update layer tan method to work on layer indexes
	- rethink about terrain generation

FEATURES
	- seperate above and below sea level generation values
	- colours
		- base
		- flat
			- variation scale
			- based on altitude
		- water 
		- blending
```

For detailed explanation on how things work, consult the [docs for vue-loader](http://vuejs.github.io/vue-loader).
