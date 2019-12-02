/* eslint-disable no-prototype-builtins */
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
      try {
        data = yaml.safeLoad(data)
        if (typeof data !== 'object') {
          failure('Data is not valid JSON/YAML.')
        }
        converter.convertJSON(data, converterOptions, success, failure)
      } catch (error) {
        failure('Data is not valid JSON/YAML.')
      }
    } else if (input.type === 'string') {
      try {
        data = yaml.safeLoad(data)
        if (typeof data !== 'object') {
          failure('Data is not valid JSON/YAML.')
        }
        converter.convertJSON(data, converterOptions, success, failure)
      } catch (error) {
        failure('Data is not valid JSON/YAML.')
      }
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
      try {
        data = yaml.safeLoad(data)
        if (typeof data !== 'object') {
          return {
            result: false,
            reason: 'Data is not valid JSON/YAML.'
          }
        }
        if (!data.hasOwnProperty('swaggerVersion')) {
          return {
            result: false,
            reason: 'Specification must have a swaggerVersion property'
          }
        }
        return { result: true }
      } catch (error) {
        return {
          result: false,
          reason: 'Data is not valid JSON/YAML.'
        }
      }
    } else if (input.type === 'string') {
      try {
        data = yaml.safeLoad(input.data)
        if (typeof data !== 'object') {
          return {
            result: false,
            reason: 'Data is not valid JSON/YAML.'
          }
        }
        if (!data.hasOwnProperty('swaggerVersion')) {
          return {
            result: false,
            reason: 'Specification must have a swaggerVersion property'
          }
        }
        return { result: true }
      } catch (error) {
        return {
          result: false,
          reason: 'Data is not valid JSON/YAML.'
        }
      }
    } else {
      return {
        result: false,
        reason: 'input type: ' + input.type + ' is not valid'
      }
    }
  }
}
