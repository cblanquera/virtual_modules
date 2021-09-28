const { expect } = require('chai')
const vm = require('../dist')
const babel = require('@babel/core')
const ReactIs = require('react-is')

describe('Babel Tests', () => {
  before(() => vm.start())
  after(() => vm.stop())

  it('Should import module function', () => {
    vm.rule(/\.(js)$/, (file, code) => {
      return babel.transform(code, {
        presets: [
          '@babel/preset-env',
          '@babel/preset-react'
        ]
      }).code
    })

    vm.register('ghost/components', function(request, destination, cwd) {
      if (request === 'ghost/components/Link') {
        return vm.transform(`${destination}.js`, [
          `import React from 'react'`,
          `import Header from './Header'`,
          `export default <Header><a href="/">Hello</a></Header>`
        ].join("\n"))
      }

      if (destination === `${cwd}/virtual_modules/ghost/components/Header`) {
        return vm.transform(`${destination}.js`, [
          `import React from 'react'`,
          `export default ({children}) => (<h1>{children}</h1>)`
        ].join("\n"))
      }
    })

    const actual = require('ghost/components/Link').default
    expect(ReactIs.isElement(actual)).to.equal(true)
  })
})