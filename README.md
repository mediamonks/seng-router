[![Travis](https://img.shields.io/travis/mediamonks/seng-router.svg?maxAge=2592000)](https://travis-ci.org/mediamonks/seng-router)
[![Code Climate](https://img.shields.io/codeclimate/github/mediamonks/seng-router.svg?maxAge=2592000)](https://codeclimate.com/github/mediamonks/seng-router)
[![Coveralls](https://img.shields.io/coveralls/mediamonks/seng-router.svg?maxAge=2592000)](https://coveralls.io/github/mediamonks/seng-router?branch=master)
[![npm](https://img.shields.io/npm/v/seng-router.svg?maxAge=2592000)](https://www.npmjs.com/package/seng-router)
[![npm](https://img.shields.io/npm/dm/seng-router.svg?maxAge=2592000)](https://www.npmjs.com/package/seng-router)

# seng-router

Add a description here...


## Installation

### npm

```sh
npm i -S seng-router
```

### other

We also have browser, amd, commonjs, umd, systemjs and es6 versions of
this module available attached to the [Github Releases](https://github.com/mediamonks/seng-router/releases).

<!--- 

Note: The below cannot be used yet, as there is no way to link to a
specific version yet without updating this readme manually after each
new version.


### browser

```html
<script src="http://mediamonks-development.s3.amazonaws.com/seng/libs/seng-router/1.2.0/seng-router.min.js"></script>
```
```js
console.log(window.SengRouter)
```

### other

Besides the browser version, there are other versions available for
download as well:

- [browser](http://mediamonks-development.s3.amazonaws.com/seng/libs/seng-router/1.2.0/seng-router.js) (and [minified](http://mediamonks-development.s3.amazonaws.com/seng/libs/seng-router/1.2.0/seng-router.min.js))
- [umd](http://mediamonks-development.s3.amazonaws.com/seng/libs/seng-router/1.2.0/seng-router.js) (and [minified](http://mediamonks-development.s3.amazonaws.com/seng/libs/seng-router/1.2.0/seng-router-umd.min.js))
- [amd](http://mediamonks-development.s3.amazonaws.com/seng/libs/seng-router/1.2.0/seng-router-amd.js)
- [commonjs](http://mediamonks-development.s3.amazonaws.com/seng/libs/seng-router/1.2.0/seng-router-commonjs.js)
- [systemjs](http://mediamonks-development.s3.amazonaws.com/seng/libs/seng-router/1.2.0/seng-router-system.js)
- [es6](http://mediamonks-development.s3.amazonaws.com/seng/libs/seng-router/1.2.0/seng-router-es6.zip)

-->

### manual

Check the **build** section below to see your you can build for all the
targets yourself.

## Usage

```ts
import SengRouter from 'seng-router';
// import SengRouter from 'seng-router/lib/classname';

// do something with SengRouter
```


## Documentation

View the [generated documentation](https://rawgit.com/mediamonks/seng-router/master/doc/typedoc/index.html).


## Building

In order to build seng-router, ensure that you have [Git](http://git-scm.com/downloads)
and [Node.js](http://nodejs.org/) installed.

Clone a copy of the repo:
```sh
git clone https://github.com/mediamonks/seng-router.git
```

Change to the seng-router directory:
```sh
cd seng-router
```

Install dev dependencies:
```sh
npm install
```

Use one of the following main scripts:
```sh
npm run build   		# build this project
npm run generate   		# generate all artifacts (compiles ts, webpack, docs and coverage)
npm run typings			# install .d.ts dependencies (done on install)
npm run test-unit    	# run the unit tests
npm run validate		# runs validation scripts, including test, lint and coverage check
npm run lint			# run tslint on this project
npm run doc				# generate typedoc documentation
npm run typescript-npm	# just compile the typescript output used in the npm module
```

When installing this module, it adds a pre-push hook, that runs the `validate`
script before committing, so you can be sure that everything checks out.

If you want to create the distribution files yourself, you can run the
`build-dist` script, and the following files will get generated in the
`dist` folder:

- **/dist/seng-router.js**: bundled with webpack, can be loaded from
	a script tag, available as `window.SengRouter`
- **/dist/seng-router.min.js**: same as above, but minified
- **/dist/seng-router-amd.js**: bundled with webpack, can be used
	with e.g. requirejs
- **/dist/seng-router-commonjs.js**: bundled with webpack, can be
	used in systems that support commonjs, but you should just use npm
- **/dist/seng-router-umd.js**: bundled with webpack, works in the
	browser, with requirejs, and in a commonjs system
- **/dist/seng-router-umd.min.js**: same as above, but minified
- **/dist/seng-router-system.js**: bundled with typescript, can be
	used in systems	that support systemjs
- **/dist/seng-router-es6.zip**: transpiled with typescript, only
	types are removed from the source files

## Contribute

View [CONTRIBUTING.md](./CONTRIBUTING.md)


## Changelog

View [CHANGELOG.md](./CHANGELOG.md)


## Authors

View [AUTHORS.md](./AUTHORS.md)


## LICENSE

[MIT](./LICENSE) © MediaMonks


