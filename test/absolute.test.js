const { expect } = require('chai')
const vm = require('../dist')

describe('Absolute Tests', () => {
  before(() => vm.start())
  after(() => vm.stop())

  it('Should import absolute file', () => {
    vm.register('/literal.js', 'module.exports = "Literal"')
    const actual = require('/literal.js')
    expect(actual).to.equal('Literal')
  })

  it('Should import absolute module', () => {
    vm.register('/literal', 'module.exports = "Literal"')
    const actual = require('/literal')
    expect(actual).to.equal('Literal')
  })

  it('Should import absolute function', () => {
    vm.register('/plus-one', function(request) {
      if (request === '/plus-one') {
        return 'module.exports = x => x + 1'
      }
    
      if (request === '/plus-one/number') {
        return 'module.exports = 1'
      }
    })
    const plusOne = require('/plus-one')
    const number = require('/plus-one/number')
    expect(plusOne(number)).to.equal(2)
  })
})