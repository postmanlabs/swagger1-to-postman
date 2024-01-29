var fs = require('fs');
var { v4: uuidv4 } = require('uuid');
var path = require('path');
var validator = require('postman_validator');
var _ = require('lodash').noConflict();
var UserError = require('./UserError');

var converter = {

    sampleFile: {},
    env: {},

    convertAPI: function(res, dir, description, apiDeclaration) {

        var apiFile;

        // When Swagger has Resource Listings, instead of resolving the actual files
        // create simple GET operations for specific endpoints
        if(!apiDeclaration){
            apiFile = res;
            apiFile.apis = _.map(_.get(res, 'apis'), (resource) => {
                return {
                    path: _.get(resource, 'path', '/'),
                    description: _.get(resource, 'description', ''),
                    operations: [{
                        parameters: [],
                        method: 'GET',
                        nickname: _.get(resource, 'path', '/')
                    }]
                }
            })
        }
        else{
            apiFile = res;
        }
        
        var folderItem = {};

        folderItem.name = apiFile.resourcePath;
        folderItem.description = description;
        folderItem.collectionName = this.sampleFile.name;
        folderItem.collectionId = this.sampleFile.id;
        folderItem.order = [];
        folderItem.id = this.generateId();

        _.forEach(apiFile.apis, (api) => {
            _.forEach(api.operations, (operation) => {

                // Operation variables.
                var header = '';
                var query = '';
                var queryFlag = false;

                // Make a deep copy of the the sampleRequest.
                var request = _.cloneDeep(this.sampleRequest);
                var params = false;
                request.collectionId = this.sampleFile.id;

                // No specification found for other modes.
                request.dataMode = "params";
                request.description = operation.summary;
                request.id = this.generateId();
                request.method = operation.method;
                request.name = operation.nickname;
                request.time = this.generateTimestamp();

                _.forEach(operation.parameters, (param) => {
                    switch (param.paramType) {
                        case 'header':
                            header += param.name + ": \n";
                            break;
                        case 'query':
                            if (queryFlag) {
                                query += '&' + param.name + '=';
                            } else {
                                queryFlag = true;
                                query += '?' + param.name + '=';
                            }
                            break;
                        case 'form':
                            request.data.push({
                                "key": param.name,
                                "value": "",
                                "type": "text"
                            });
                            break;
                        case 'path':

                            if(!params){
                                request.description += "\n\nParameters:\n\n";
                                params = true;
                            }
                            
                            this.addEnvKey(param.name, param.type, false);

                            param.description = param.description || "";
                            request.description += param.name + ': ' + param.description + " \n\n";    
                            
                            // Modify the url to suit POSTMan
                            api.path = api.path.replace('{' + param.name + '}', ':' + param.name);
                            break;

                            // Need to handle body paramType
                            // Need to parse the models and account for inheritance
                        case 'body':
                            break;

                        default:
                            break;
                    }
                });

                folderItem.order.push(request.id);

                // api.path begins with a /
                request.url = apiFile.basePath + api.path;

                request.headers = header;
                request.url += query;

                this.sampleFile.requests.push(request);
            });
        });

        if(folderItem.order.length > 1){
            this.sampleFile.folders.push(folderItem);   
        }else{
            this.sampleFile.order.push(folderItem.order[0]);
        }

        if(apiDeclaration){
            // In case it is an apiDeclaration, do not create folders.
            // Just add the requests to the collection and populate the root
            // order property.
            this.sampleFile.order = folderItem.order;
            this.sampleFile.folders = [];
        }
    },

    read: function(location) {
        var data = fs.readFileSync(location, 'utf-8');
        return JSON.parse(data);
    },

    addEnvKey: function(key, type, displayName) {
        if (!_.has(this.env, key)) {
            var envObj = {};
            envObj.name = displayName || key;
            envObj.enabled = true;
            envObj.value = "";
            envObj.type = type || "string";
            envObj.key = key;

            this.env[key] = envObj;
        }
    },

    generateId: function() {
        if (this.test) {
            return "";
        } else {
            return uuidv4();
        }
    },

    generateTimestamp: function() {
        if (this.test) {
            return 0;
        } else {
            return Date.now();
        }
    },

    convert: function(inputFile, options, cb, cbError) {

        this.group = options.group;

        // set this to true to generate the test file
        this.test = options.test;

        var resourceList;
        var file = path.resolve(__dirname, inputFile);
        var dir = path.dirname(inputFile);

        try {
            resourceList = this.read(file);
        }
        catch (e) {
            return cbError(e);
        }

        var inputJson = resourceList;
        this.convertJSON(inputJson, options, cb, cbError);
        
    },

    convertJSON: function(inputJson, options, cb, cbError) {
        try {
            this.sampleFile = JSON.parse('{"environment":{"values": [],"name": "","id": "","timestamp": 0},"folders": [{"id": "","name": "","description": "","order": [],"collection_name": "","collection_id": ""}],"id": "","name": "Postman Barebones","order": [],"requests": [{"collectionId": "","dataMode": "params","descriptionFormat": "html","description": "","data": [],"headers": "","id": "","method": "","name": "","preRequestScript": "","pathVariables": {},"responses": [],"synced": false,"tests": "","time": 0,"url": ""}],"synced": false,"timestamp": 0}');

            var sf = this.sampleFile;

            // Collection trivia
            sf.id = this.generateId();
            sf.timestamp = this.generateTimestamp();

            if (_.has(inputJson, 'info') && _.has(inputJson.info, 'title')) {
                sf.name = inputJson.info.title;
            }
            
            var len = inputJson.apis.length;
            var apis = inputJson.apis;

            this.sampleRequest = sf.requests[0];

            if (len < 1) {
                cbError({ message: "No requests are specified in the Swagger 1.2 spec."});
            }

            sf.requests = [];
            sf.folders = [];

            sf.environment.name = ( sf.name || "Default" ) + "'s Environment";
            sf.environment.timestamp = this.generateTimestamp();
            sf.environment.id = this.generateId();

            // Check if read file is an API declaration or a Resource Listing
            // API Declaration's apis property elements have operations as a required field.
            this.convertAPI(inputJson, '', '', _.has(apis[0], 'operations'))

            // Add the environment variables.
            _.forOwn(this.env, (val) => {
                sf.environment.values.push(val);
            });

            if (!this.group) {
                // If grouping is disabled, reset the folders.
                sf.folders = [];
            }

            this.validate();

            var env = _.cloneDeep(this.sampleFile.environment);
            
            delete sf.environment;

            cb(sf, env);
        }
        catch(e) {
            if(typeof cbError === "function") {
                const error = new UserError('Provided specification is invalid', e);
                cbError();
            }
        }
    },

    validate: function() {
        if (validator.validateJSON('c', this.sampleFile).status) {
            return true;
        } else {
            return false;
        }
    }
};

module.exports = converter;