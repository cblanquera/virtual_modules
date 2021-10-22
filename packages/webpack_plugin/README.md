# Virtual Modules Webpack Plugin

Webpack plugin for [Virtual Modules](https://www.npmjs.com/package/virtual_modules)

Using routes in virtual modules could be problematic with `webpack` 
because it uses `enhanced-resolve`, and that uses `fs.stat()` on folders 
to determine if a file exists. 

Since routes like `/my/post/:id/info.json` have an unlimited 
permutation, it would not be possible for vm to populate stats in a 
directory. It could still work however, if all the possible 
permutations were pre-written to virtual modules.

Therefore we created a webpack plugin you can insert as a plugin 
resolver in your `webpack` config.

```js
import VMWebpackPlugin from 'virtual_modules-webpack'

module.exports = {
  resolve: {
    ...
    plugins: [ new VMWebpackPlugin ]
  },
  ...
}
```

