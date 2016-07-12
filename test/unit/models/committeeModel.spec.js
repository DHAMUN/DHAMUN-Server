
var chai = require('chai'),
    expect = chai.expect,
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    mongoose = require('mongoose'),
    mockgoose = require('mockgoose'),
    Committee = require('../../../committees/committeeModel.js');

chai.use(sinonChai);

before(function(done) {
  mockgoose(mongoose).then(function() {

    if (mongoose.connection.db) {
      return done();
    } 

    mongoose.connect('mongodb://localhost/TestingDB', function(err){
      done(err);
    });

  });
});

describe('Committee', function () {

  var newCommittee;

  beforeEach(function(done){
    newCommittee = {
      name: "John",
      voteSessions: {},
      resolutions: {}
    };
    mockgoose.reset(function() {
      done()
    });
  })

  describe('Mongoose', function(){
    it('is mocked', function(){
      expect(mongoose.isMocked).to.equal(true);
    })
  })

  describe('creates a valid committee', function() {

    var validCommittee;

    before(function(){
      validCommittee = new Committee(newCommittee);
    })

    it('should have a firstName field', function() {
      expect(validCommittee.name).to.exist;
    });


    it('should have a resolutions field', function() {
      expect(validCommittee.resolutions).to.exist;
    });

    it('should have a voteSessions field', function() {
      expect(validCommittee.voteSessions).to.exist;
    });

  });

});

