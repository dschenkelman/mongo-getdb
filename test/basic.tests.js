var getDb  = require('./..');
var expect = require('chai').expect;

describe('getDb', function () {
  describe('with basic init', function () {
    var db;

    before(function (done) {
      getDb.init('mongodb://localhost/foo', {
        server: {
          poolSize: 10,
          socketOptions: {
            connectTimeoutMS: 500,
            keepAlive: 300
          }
        }
      });

      getDb(function (theDb) {
        db = theDb;
        done();
      });
    });

    it('should return a connected db', function () {
      expect(db.serverConfig.isConnected())
        .to.be.true;

      expect(db.databaseName)
        .to.equal('foo');
    });

    it('should have auto_reconnect', function () {
      expect(db.serverConfig.options.auto_reconnect)
        .to.be.true;
    });

    it('should have the socket keepAlive', function () {
      expect(db.serverConfig.options.socketOptions.keepAlive)
        .to.equal(300);
    });

    it('should have poolSize 10', function () {
      expect(db.serverConfig.options.poolSize)
        .to.equal(10);
    });

    it('shuld return always same instance', function (done) {
      getDb(function (secondCallDb) {
        expect(secondCallDb).to.equal(db);
        done();
      });
    });
  });

  describe('error in callback', function () {
    it('should return the error object', function (done) {
      getDb('mongodb://127.0.0.1:9287', function (err, db) {
        expect(err.message).to.equal('failed to connect to [127.0.0.1:9287]');
        expect(db).to.be.undefined;
        done();
      });
    });

    it('should return the db in the second parameter', function (done) {
      getDb('mongodb://127.0.0.1:27017', function (err, db) {
        expect(err).to.null;
        expect(db).to.be.ok;
        done();
      });
    });

  });

  describe('with env "DB"', function () {
    before(function () {
      process.env.DB = 'mongodb://localhost/HAA';
      getDb.init();
    });

    after(function () {
      delete process.env.DB;
    });

    it('should work', function (done) {
      getDb(function (db) {
        expect(db.databaseName)
          .to.equal('HAA');
        done();
      });
    });
  });

  describe('without init', function () {

    after(function () {
      delete process.env.DB;
    });

    it('should work', function (done) {
      getDb('mongodb://localhost/HAA123', function (db) {
        expect(db.databaseName)
          .to.equal('HAA123');
        done();
      });
    });
  });
});