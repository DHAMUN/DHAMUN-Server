
var chai = require('chai'),
    expect = chai.expect,
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    mongoose = require('mongoose'),
    mockgoose = require('mockgoose'),
    User;

chai.use(sinonChai);

before(function(done) {
  mockgoose(mongoose).then(function() {
    mongoose.connect('mongodb://localhost/TestingDB', function(err) {
      User = require('../../../users/userModel.js');
      done(err);
    });
  });
});


describe('User', function () {

  var newUser;

  beforeEach(function(){
    newUser = {
      firstName: "John",
      lastName: "Doe",
      userLevel: "Delegate",
      committee: "General Assembly",
      school: "General School",
      country: "United States",
      email: "john@doe.com"
    };
  })

  afterEach(function(done){
    mockgoose.reset(function() {
      done()
    });
  })

  describe('Mongoose', function(){
    it('is mocked', function(){
      expect(mongoose.isMocked).to.equal(true);
    })
  })

  describe('creates a valid user', function() {

    var validUser;

    before(function(){
      validUser = new User(newUser);
    })

    it('should have a firstName field', function() {
      expect(validUser.firstName).to.exist;
    });


    it('should have a lastName field', function() {
      expect(validUser.lastName).to.exist;
    });

    it('should have a email field', function() {
      expect(validUser.email).to.exist;
    });

    it('should have a committee field', function() {
      expect(validUser.committee).to.exist;
    });

    it('should have a userLevel field', function() {
      expect(validUser.userLevel).to.exist;
    });

    it('should have a country field', function() {
      expect(validUser.country).to.exist;
    });

    it('should have a school field', function() {
      expect(validUser.school).to.exist;
    });

  });


  describe('.pre', function(){

    var preUser;
    var enteredPassword;

    before(function(done){
      enteredPassword = newUser.password = "1234";
      preUser = new User(newUser);
      preUser.save(function(err, u) {
        done(err);
      });
    })

    it('adds a hashcode (link) onto a user', function(){
      expect(preUser.hashCode).to.exist;
    })

    it('encrypts/hashes a users password', function(){
      expect(preUser.password).to.not.equal(enteredPassword);
    })

    it('adds a salt to a users password', function(){
      expect(preUser.salt).to.exist;
    })

  })

  describe('.compareCodes', function (done) {

    var preUser;

    before(function(done){
      preUser = new User(newUser);
      preUser.save(function(err, u) {
        done(err);
      });
    })

    it('exists', function () {
      expect(preUser.compareCodes).to.exist;
    })

    it('compares codes correctly', function(){
      preUser.hashCode = "thisverydiscretecodeman";
      expect(preUser.compareCodes(preUser.hashCode)).to.be.true;
    })

  });

  
});