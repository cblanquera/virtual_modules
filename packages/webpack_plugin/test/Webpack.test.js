const fs = require('fs')
const path = require('path')
const { expect } = require('chai')
const webpack = require('webpack')
const vm = require('virtual_modules').default
const config = require('./assets/webpack.config')

describe('Base Tests', () => {
  after(() => {
    fs.unlinkSync(`${__dirname}/assets/build/main.js`)
    fs.rmdirSync(`${__dirname}/assets/build`)
  })
  beforeEach(() => vm.patchFS())
  afterEach(() => vm.revertPatch())

  it('Should be able to bundle virtual files', async() => {
    vm.mkdirSync(`${__dirname}/assets`, { recursive: true })
    vm.writeFileSync(
      `${__dirname}/assets/entry.js`,
      `const num = require('./num')`
    )
    vm.writeFileSync(
      `${__dirname}/assets/num.js`,
      `module.exports = 1`
    )
    
    await new Promise((resolve, reject) => {
      webpack(config).run((error, info) => {
        if (error) return reject(error)
        resolve(info)
      })
    }).catch(e => { throw e })
    
    const actual = fs.readFileSync(`${__dirname}/assets/build/main.js`).toString()
    expect(actual).to.contain('./test/assets/num.js')
    expect(actual).to.contain('module.exports = 1')
    expect(actual).to.contain('const num = __webpack_require__("./test/assets/num.js")')
  })
})

