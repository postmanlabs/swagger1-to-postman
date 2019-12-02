var converter = require('./lib/convert')
var fs = require('fs')
var yaml = require('js-yaml')
module.exports = {
  getOptions: function () {
    return []
  },
  convert: function (input, options, callback) {
    const converterOptions = {
      group: true, // Group requests into folders
      test: false // Disable "test mode"
    }
    const success = (collection, environment) => {
      return callback(null, {
        result: true,
        output: [
          {
            type: 'collection',
            data: collection
          },
          {
            type: 'environment',
            data: environment
          }
        ]
      })
    }
    const failure = (error) => {
      // eslint-disable-next-line standard/no-callback-literal
      return callback({
        result: false,
        reason: error
      })
    }
    let data
    if (input.type === 'file') {
      data = fs.readFileSync(input.data).toString()
      data = yaml.safeLoad(data)
      if (typeof data !== 'object') {
        failure('Data is not valid JSON/YAML.')
      }
      converter.convertJSON(data, converterOptions, success, failure)
    } else if (input.type === 'string') {
      data = yaml.safeLoad(input.data)
      if (typeof data !== 'object') {
        failure('Data is not valid JSON/YAML.')
      }
      converter.convertJSON(data, converterOptions, success, failure)
    } else {
      // eslint-disable-next-line standard/no-callback-literal
      return callback({
        result: false,
        reason: 'input type: ' + input.type + ' is not valid'
      })
    }
  },
  validate: function (input) {
    let data
    if (input.type === 'file') {
      data = fs.readFileSync(input.data).toString()
      data = yaml.safeLoad(data)
      // eslint-disable-next-line no-prototype-builtins
      return { result: typeof data === 'object' && data.hasOwnProperty('swaggerVersion') }
    } else if (input.type === 'string') {
      data = yaml.safeLoad(input.data)
      // eslint-disable-next-line no-prototype-builtins
      return { result: typeof data === 'object' && data.hasOwnProperty('swaggerVersion') }
    } else {
      return {
        result: false,
        reason: 'input type: ' + input.type + ' is not valid'
      }
    }
  }
}
