const path = require('path')
const { expect } = require('chai')
const vm = require('../dist')

describe('Relative Tests', () => {
  before(() => vm.start())
  after(() => vm.stop())

  it('Should import relative file', () => {
    vm.register(`${__dirname}/literal.js`, 'module.exports = "Literal"')
    const actual = require('./literal')
    expect(actual).to.equal('Literal')
  })

  it('Should import relative function', () => {
    vm.register(`${__dirname}/plus-one`, function(request, destination) {
      if (destination === `${__dirname}/plus-one`) {
        return 'module.exports = x => x + 1'
      }
    
      if (destination === `${__dirname}/plus-one/number`) {
        return 'module.exports = 1'
      }
    })
    const plusOne = require('./plus-one')
    const number = require('./plus-one/number')
    expect(plusOne(number)).to.equal(2)
  })

  it('Should import parent file', () => {
    const dirname = path.dirname(__dirname)
    vm.register(`${dirname}/literal.js`, 'module.exports = "Literal"')
    const actual = require('../literal.js')
    expect(actual).to.equal('Literal')
  })

  it('Should import parent module', () => {
    const dirname = path.dirname(__dirname)
    vm.register(`${dirname}/literal`, 'module.exports = "Literal"')
    const actual = require('../literal')
    expect(actual).to.equal('Literal')
  })

  it('Should import parent function', () => {
    const dirname = path.dirname(__dirname)
    vm.register(`${dirname}/plus-one`, function(request, destination) {
      if (destination === `${dirname}/plus-one`) {
        return 'module.exports = x => x + 1'
      }
    
      if (destination === `${dirname}/plus-one/number`) {
        return 'module.exports = 1'
      }
    })
    const plusOne = require('../plus-one')
    const number = require('../plus-one/number')
    expect(plusOne(number)).to.equal(2)
  })
})