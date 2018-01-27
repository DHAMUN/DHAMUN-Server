
var jwt  = require('jwt-simple');
var attendanceData;

require('../committees/attendanceData.js')(function(builtAttendanceModel) {
  attendanceData = builtAttendanceModel;
});


function selectivelyStripID(attendanceData, user) {
  return (user.userLevel !== "Delegate" ? attendanceData[user.committee] : 
    Object.assign({}, attendanceData[user.committee], {verificationID: null}));
}

module.exports = {

  markPresent: function(data){
    var user = jwt.decode(data.token, process.env.TOKEN_SECRET);
    console.log(data.inputtedVerificationID, attendanceData[user.committee].verificationID)
    if (user && (data.inputtedVerificationID == attendanceData[user.committee].verificationID)) {     
      attendanceData[user.committee][user.country] = true;
      this.sockets.in(user.committee).emit("attendance update", selectivelyStripID(attendanceData, user));
      console.log(user.firstName + " is marking himself present");
    } 

  },

  get: function(data){

    var user = jwt.decode(data.token, process.env.TOKEN_SECRET);
    if (user) {
      this.emit("attendance update", selectivelyStripID(attendanceData, user));
      console.log(user.firstName + " is getting attendance for " + user.committee);
    }

  },
}