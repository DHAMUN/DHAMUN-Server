var mongooseMock = require('mongoose-mock'),
  proxyquire = require('proxyquire'),
  chai = require('chai'),
  expect = chai.expect,
  sinon = require('sinon'),
  sinonChai = require('sinon-chai');

chai.use(sinonChai);

describe('User', function () {

  var User;

  beforeEach(function () {
    User = proxyquire('../../../users/userModel.js', { 'mongoose': mongooseMock });
  });

  describe('.compareCodes', function () {

    // it('exists', function () {
    //   var compareCodes = User.compareCodes;
    //   expect(compareCodes).to.exist;
    // })

    // SAMPLE REFERENCE PASSING TEST
    it('saves the user', function () {
      var callback = sinon.spy();
      var user = User.createAndSave({ title: 'Mr', lastName: 'White' }, callback);
      expect(user.save).calledOnce;

      // expect(1).to.equal(1);
    });
  });
});