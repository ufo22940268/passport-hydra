const expect = require('chai').expect;
const HydraStrategy = require('../lib/strategy');

describe('Profile', function() {
  describe('fetched from default endpoint', function() {
    let profile;

    const strategy = new HydraStrategy({
      clientID: 'ABC123', clientSecret: 'secret', baseURL: 'http://127.0.0.1'
    }, function() {
    });

    strategy._oauth2.get = function(url, accessToken, callback) {
      if (url !== 'http://127.0.0.1/userinfo') {
        return callback(new Error('incorrect url argument'));
      }
      if (accessToken !== 'token') {
        return callback(new Error('incorrect token argument'));
      }

      const body = `{
        "birthdate": "string",
        "email": "1@1",
        "email_verified": true,
        "family_name": "string",
        "gender": "string",
        "given_name": "string",
        "locale": "string",
        "middle_name": "string",
        "name": "string",
        "nickname": "string",
        "phone_number": "string",
        "phone_number_verified": true,
        "picture": "string",
        "preferred_username": "string",
        "profile": "string",
        "sub": "2@2",
        "updated_at": 0,
        "website": "string",
        "zoneinfo": "string"
      }`;

      callback(null, body, undefined);
    };

    before(function(done) {
      strategy.userProfile('token', function(err, p) {
        if (err) {
          return done(err);
        }
        profile = p;
        done();
      });
    });

    it('should parse profile', function() {
      expect(profile.email).to.equal('1@1');
      expect(profile.emails[0].value).to.equal('1@1');
      expect(profile.sub).to.equal('2@2');
    });

    it('should set raw property', function() {
      expect(profile._raw).to.be.a('string');
    });

    it('should set json property', function() {
      expect(profile._json).to.be.an('object');
    });
  });

  describe('error caused by invalid token', function() {
    let err;

    const strategy = new HydraStrategy({
      clientID: 'ABC123', clientSecret: 'secret'
    }, function() {
    });

    strategy._oauth2.get = function(url, accessToken, callback) {
      const body = JSON.stringify({
        error: {
          message: 'Invalid OAuth access token.', type: 'OAuthException', code: 190, fbtraceid: 'XxXXXxXxX0x'
        }
      });

      callback({statusCode: 400, data: body});
    };

    before(function(done) {
      strategy.userProfile('token', function(e, p) {
        err = e;
        profile = p;
        done();
      });
    });

    it('should error', function() {
      expect(err).to.be.an.instanceOf(Error);
      expect(err.name).to.equal('InternalOAuthError');
      expect(err.message).to.equal('Failed to fetch user profile');
    });
  });

  describe('error caused by malformed response', function() {
    let err;

    const strategy = new HydraStrategy({
      clientID: 'ABC123', clientSecret: 'secret'
    }, function() {
    });

    strategy._oauth2.get = function(url, accessToken, callback) {
      const body = 'Hello, world.';
      callback(null, body, undefined);
    };

    before(function(done) {
      strategy.userProfile('token', function(e, p) {
        err = e;
        profile = p;
        done();
      });
    });

    it('should error', function() {
      expect(err).to.be.an.instanceOf(Error);
      expect(err.message).to.equal('Failed to parse user profile');
    });
  });

  describe('internal error', function() {
    let err;
    let profile;

    const strategy = new HydraStrategy({
      clientID: 'ABC123', clientSecret: 'secret'
    }, function() {
    });

    strategy._oauth2.get = function(url, accessToken, callback) {
      return callback(new Error('something went wrong'));
    };

    before(function(done) {
      strategy.userProfile('wrong-token', function(e, p) {
        err = e;
        profile = p;
        done();
      });
    });

    it('should error', function() {
      expect(err).to.be.an.instanceOf(Error);
      expect(err.constructor.name).to.equal('InternalOAuthError');
      expect(err.message).to.equal('Failed to fetch user profile');
      expect(err.oauthError).to.be.an.instanceOf(Error);
      expect(err.oauthError.message).to.equal('something went wrong');
    });

    it('should not load profile', function() {
      expect(profile).to.be.an('undefined');
    });
  });
});
