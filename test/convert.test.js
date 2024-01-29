var convert = require('../index').convert,
  expect = require('expect.js'),
  fs = require('fs'),
  _ = require('lodash');

describe('convert', function () {

  it('should return false result for incorrect input type', function (done) {
    convert({
      type: 'unknown'
    }, {}, (err) => {
      expect(err).to.not.be.empty;
      expect(err.reason instanceof Error).to.equal(true);
      expect(err.reason.name).to.equal('UserError');
      expect(err.reason.message).to.equal('input type: unknown is not valid');
      done();
    });
  });

  it('should return false result for incorrect definition (type: string)', function (done) {
    convert({
      type: 'string',
      data: '{"hello":  "world"}'
    }, {}, (err) => {
      expect(err).to.not.be.empty;
      expect(err.reason instanceof Error).to.equal(true);
      expect(err.reason.name).to.equal('UserError');
      expect(err.reason.message).to.equal('Provided Swagger definition is invalid');
      done();
    });
  });

  it('should return false result for incorrect definition (type: file)', function (done) {
    convert({
      type: 'file',
      data: './package.json'
    }, {}, (err) => {
      expect(err).to.not.be.empty;
      expect(err.reason instanceof Error).to.equal(true);
      expect(err.reason.name).to.equal('UserError');
      expect(err.reason.message).to.equal('Provided Swagger definition is invalid');
      done();
    });
  });

  it('should correctly convert valid definition (type: file)', function (done) {
    convert({
      type: 'file',
      data: './sample_files/apptest.json'
    }, {}, (err, result) => {
      expect(result.result).to.equal(true);
      done();
    });
  });

  it('should correctly convert valid definition (type: string)', function (done) {
    convert({
      type: 'string',
      data: fs.readFileSync('./sample_files/apptest.json', 'utf8')
    }, {}, (err, result) => {
      expect(result.result).to.equal(true);
      done();
    });
  });

  it('should correctly convert definition with resource listing', function (done) {
    convert({
      type: 'file',
      data: './sample_files/resource-listing.json'
    }, {}, (err, result) => {
      expect(result.result).to.equal(true);
      expect(result.output[0].type).to.equal('collection');
      expect(result.output[0].data).to.be.an('object');
      expect(result.output[0].data.requests.length).to.equal(3);
      expect(result.output[0].data.requests[0].method).to.equal('GET');
      expect(result.output[0].data.requests[0].name).to.equal('/api-docs/products.{format}');
      expect(result.output[0].data.requests[1].method).to.equal('GET');
      expect(result.output[0].data.requests[1].name).to.equal('/api-docs/Orders.{format}');
      expect(result.output[0].data.requests[2].method).to.equal('GET');
      expect(result.output[0].data.requests[2].name).to.equal('/api-docs/Customers.{format}');
      done();
    });
  });
});

