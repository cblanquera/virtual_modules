> DEPRECATION NOTICE: This project has moved to 
[@inceptjs/virtualfs](https://www.npmjs.com/package/@inceptjs/virtualfs)

Thanks to everyone that gave great feedback to this project! We moved 
to `@inceptjs/virtualfs` *(VFS)*. VFS is built on top of 
[memfs](https://www.npmjs.com/package/memfs) and can properly patch 
the `fs` for use with `babel` and `webpack`.

This package will still exist for educational purposes.

# Node Virtual Modules

Virtual Modules lets you create and modify files in a way that node 
treats them as if they were physically presented in the file system.

> Warning: An experimental project that uses a few of Node's private 
methods.

> Tested on Node v16

## Install

```bash
# with NPM
$ npm i --save virtual_modules

# with Yarn
$ yarn add virtual_modules
```

## Basic Usage

Just call `register()` to make virtual files. Once they are registered,
they can be immediately used.

```js
const vm = require('virtual_modules')

vm.register('ghost/foo.js', 'module.exports = { foo: "foo" }')

//... somewhere else
const foo = require('ghost/foo')
console.log(foo.foo) //--> "foo"
```

### Relative Files

You can define virtual files anywhere, not just in `node_modules`.

```js
const vm = require('virtual_modules')

vm.register('/some/path/to/foo.js', 'module.exports = { foo: "foo" }')

//... in `/some/path/to/`
const foo = require('./foo')
console.log(foo.foo) //--> "foo"

//... in `/some/path/to/bar`
const foo = require('../foo')
console.log(foo.foo) //--> "foo"
```

### Code Generating

You can register a root path and treat it like a route.

```js
vm.register('ghost/plus-one', function(relative, absolute, cwd, vm) {
  if (request === 'ghost/plus-one') {
    return 'module.exports = x => x + 1'
  }

  if (request === 'ghost/plus-one/number') {
    return 'module.exports = 1'
  }
})
const plusOne = require('ghost/plus-one')
const number = require('ghost/plus-one/number')
console.log(plusOne(number)) //--> 2
```

### Transforming files

Virtual modules has a basic transformer that sits on top that you can 
use optionally. 

```js
vm.rule(/\.(js)$/, (file, code) => {
  return code + ';console.log("transformed");'
})
```

> If you are using babel to transform files, you can still use babel 
without interupting your work flow. 

You can optionally replace `@babel/register` with virtual modules like 
the following snippet.

```js
vm.rule(/\.(js)$/, (file, code) => {
  return babel.transform(code, {
    presets: [
      '@babel/preset-env',
      '@babel/preset-react'
    ]
  }).code
})
```

### Bundling files

Virtual modules can integrate with webpack using 
[webpack-virtual-modules](https://www.npmjs.com/package/webpack-virtual-modules)
like the following example.

```js
// webpack.config.js
const VirtualModulesPlugin = require('webpack-virtual-modules')

module.exports = {
  entry: { ... },
  output: { ... },
  plugins: [
    new VirtualModulesPlugin(vm.safeRegistry)
  ]
}
```

> `webpack-virtual-modules` is a separate project managed by a separate 
author.


### Stop/Start

Virtual modules works directly with Node's `Module` and `require.cache`.
To cover cases to revert to the original Node methods you can start and 
stop virtual modules like this.

```js
vm.stop()

vm.start()
```

> Virtual modules automatically starts as soon as `register()` or 
`rule()` is called.

### Contributing

Always welcome. Just ping me.

 - Fork/Clone this repo 
 - Run `npm run build`
 - Run `npm test`

