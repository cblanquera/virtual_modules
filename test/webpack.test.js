const { expect } = require('chai')
const vm = require('../dist')
const webpack = require('webpack')
const VirtualModulesPlugin = require('webpack-virtual-modules');

describe('Webpack Tests', () => {
  before(() => vm.start())
  after(() => vm.stop())

  it('Should build virtual file', (done) => {
    vm.register(`${__dirname}/ghost/literal.js`, 'module.exports = "Literal"')

    const wp = webpack({
      entry: `${__dirname}/ghost/literal.js`,
      output: {
        filename: 'literal.js',
        path: `${__dirname}/assets`
      },
      plugins: [
        new VirtualModulesPlugin(vm.safeRegistry)
      ]
    })

    const compiler = wp.run(function(error, stats) {
      if (error) {
        return done(error)
      //if there's an error
      } else if (stats.hasErrors()) {
        //`stats.toJson()` is memory intensive
        return done(stats.toJson({
          all: false,
          errors: true
        }).errors[0].message)
      }

      done()
    })
  })
})