const { expect } = require('chai')
const vm = require('../dist')

describe('node_modules Tests', () => {
  before(() => vm.start())
  after(() => vm.stop())

  it('Should import literal file', () => {
    vm.register('ghost/literal.js', 'module.exports = "Literal"')
    const actual = require('ghost/literal.js')
    expect(actual).to.equal('Literal')
  })

  it('Should import literal module', () => {
    vm.register('ghost/literal', 'module.exports = "Literal"')
    const actual = require('ghost/literal')
    expect(actual).to.equal('Literal')
  })

  it('Should import module function', () => {
    vm.register('ghost/plus-one', function(request) {
      if (request === 'ghost/plus-one') {
        return 'module.exports = x => x + 1'
      }
    
      if (request === 'ghost/plus-one/number') {
        return 'module.exports = 1'
      }
    })
    const plusOne = require('ghost/plus-one')
    const number = require('ghost/plus-one/number')
    expect(plusOne(number)).to.equal(2)
  })

  it('Should import from itself', () => {
    vm.register('ghost/main', `module.exports = require('./child')`)
    vm.register('ghost/child', 'module.exports = 1')
    const actual = require('ghost/main')
    expect(actual).to.equal(1)
  })
})