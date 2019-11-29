var converter = require('./lib/convert'),
    fs = require('fs'),
    yaml = require('js-yaml');
module.exports = {
    getOptions: function() {
        return [];
    },
    convert: function(input, options, callback) {
        let converterOptions = {
                group: true, // Group requests into folders
                test: false // Disable "test mode"
            },
            success = (collection, environment) => {
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
            });
            },
            failure = (error) => {
                return callback({
                    result: false,
                    reason: error
                });
            },
            data;
        if (input.type === 'file') {
            data = fs.readFileSync(input.data).toString();
            data = yaml.safeLoad(data);
            if (typeof data !== 'object') {
                failure('Data is not valid JSON/YAML.')
            }
            converter.convertJSON(data, converterOptions, success, failure);
        }
        else if(input.type === 'string') {
            data = yaml.safeLoad(input.data);
            if (typeof data !== 'object') {
                failure('Data is not valid JSON/YAML.')
            }
            converter.convertJSON(data, converterOptions, success, failure);
        }
        else {
            return callback({
                result: false,
                reason: 'input type: ' + input.type + ' is not valid'
            });
        }
    },
    validate: function(input) {
        let data;
        if (input.type === 'file') {
            data = fs.readFileSync(input.data).toString();
            data = yaml.safeLoad(data);
            return { result: typeof data === 'object' && data.hasOwnProperty('swaggerVersion') };
        }
        else if(input.type === 'string') {
            data = yaml.safeLoad(input.data);
            return { result: typeof data === 'object' && data.hasOwnProperty('swaggerVersion') };
        }
        else {
            return { 
                result: false,
                reason: 'input type: ' + input.type + ' is not valid'
            };
        }
    }
}