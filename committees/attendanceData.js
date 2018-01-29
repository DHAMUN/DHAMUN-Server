var User = require('../users/userModel.js');
var makeid   = require('../config/utils.js').makeid;
var CommitteeModel = require('./committeeData.js').initialModel;

var committees = Object.keys(CommitteeModel);

var modelBuilder = function (cb) {

  var attendanceModel = {};
  var completed = 0;

  for (var key in CommitteeModel) {
    attendanceModel[key] = {
      "verificationID": makeid(6)
    }
  
    User.find({committee: key}, function(err, users){
      for (var i = 0; i < users.length; i++) {
        if (users[i].country !== "" && users[i].userLevel == "Delegate") {
          attendanceModel[users[i].committee][users[i].country] = false;
        }
      }
      
      if (++completed == committees.length) {
        cb(attendanceModel);
      }

    });
  }

}

var modelResettor = function(subModel) {
  for (var country in subModel) {
    subModel[country] = false;
  }

  subModel.verificationID = makeid(6);

  return subModel;
}

module.exports = {
  modelBuilder,
  modelResettor
}
