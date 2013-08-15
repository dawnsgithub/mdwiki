'use strict';

var fs = require('fs'),
    path = require('path'),
    util = require('util'),
    sinon = require('sinon'),
    should = require('should'),
    git = require('../lib/git'),
    Q = require('q'),
    errors = require('../lib/errors'),
    child_process = require('child_process');

/*function rmdirIfExists(path) {
  var deferred = Q.defer();

  if (fs.existsSync(path) === false) {
    deferred.resolve();
  }

  exec('rm -rf ' + path, function (err, out) {
    if (err) {
      deferred.reject(err);
    }
    deferred.resolve();
  });

  return deferred.promise;
}*/

describe('tests for git module tests', function () {
  this.timeout(5000);

  describe('When the clone method was called and the content folder does not exists', function () {
    var sandbox,
        gitRepositoryUrl = 'https://github.com/janbaer/mdwiki.wiki.git';

    beforeEach(function () {
      sandbox = sinon.sandbox.create();
    });

    it('should clone the specified repository into the content folder', function (done) {
      // ARRANGE
      sandbox.stub(fs, 'exists', function (folder, callback) {
        callback(false);
      });
      var stub = sandbox.stub(child_process, 'exec', function (command, options, callback) {
        callback(null, 'ok');
      });
      var expected = util.format('git clone %s content', gitRepositoryUrl);

      // ACT
      git.clone(__dirname, 'content', gitRepositoryUrl)
        .done(function () {
          // ASSERT
          stub.calledOnce.should.be.true;
          stub.calledWithMatch(expected).should.be.true;
          done();
        });
    });

    afterEach(function () {
      sandbox.restore();
    });
  });

  describe('When content folder already exists', function () {
    var sandbox;

    beforeEach(function () {
      sandbox = sinon.sandbox.create();
    });

    it('should return an ContentFolderExistsError', function (done) {
      // ARRANGE
      sandbox.stub(fs, 'exists', function (folder, callback) {
        callback(true);
      });
      var stub = sandbox.stub(child_process, 'exec', function (command, options, callback) {
        callback(null, 'ok');
      });

      var lastError;

      // ACT
      git.clone(__dirname, 'content', 'git...')
        .catch(function (error) {
          lastError = error;
        })
        .done(function () {
          should.exists(lastError);
          lastError.should.be.an.instanceof(errors.ContentFolderExistsError);
          stub.callCount.should.be.eql(0);
          done();
        });

    });

    afterEach(function () {
      sandbox.restore();
    });
  });
});



