var validate = require('../index').validate,
  expect = require('expect.js'),
  _ = require('lodash');

describe('validate', function () {
  it('return false result for incorrect input type', function (done) {
    const result = validate({
      type: 'unknown'
    });
    expect(result.result).to.equal(false);
    expect(result.reason).to.equal('input type: unknown is not valid');
    done();
  });

  it('return false result for empty definition (input type: string)', function (done) {
    const result = validate({
      type: 'string',
      data: ''
    });
    expect(result.result).to.equal(false);
    expect(result.reason).to.equal('Data is not valid JSON/YAML.');
    done();
  });

  it('return false result for incorrect definition (input type: string)', function (done) {
    const result = validate({
      type: 'string',
      data: '{"hello":  "world"}'
    });
    expect(result.result).to.equal(false);
    expect(result.reason).to.equal('Specification must have a swaggerVersion property');
    done();
  });

  it('return false result for empty definition (input type: file)', function (done) {
    const result = validate({
      type: 'file',
      data: './.gitignore'
    });
    expect(result.result).to.equal(false);
    expect(result.reason).to.equal('Data is not valid JSON/YAML.');
    done();
  });

  it('return false result for incorrect definition (input type: file)', function (done) {
    const result = validate({
      type: 'file',
      data: './package.json'
    });
    expect(result.result).to.equal(false);
    expect(result.reason).to.equal('Specification must have a swaggerVersion property');
    done();
  });

  it('return true result for valid definition (input type: string)', function (done) {
    const result = validate({
      type: 'string',
      data: '{"swaggerVersion":  "1.0", "apis": []}'
    });
    expect(result.result).to.equal(true);
    done();
  });

  it('return true result for valid definition (input type: file)', function (done) {
    const result = validate({
      type: 'file',
      data: './sample_files/apptest.json'
    });
    expect(result.result).to.equal(true);
    done();
  });
});

