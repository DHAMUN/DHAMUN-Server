// io will be the context for these methods.

var jwt  = require('jwt-simple');

var committeeData = require('../committees/committeeData.js').initialModel;
var saveToDB = require('../committees/committeeData.js').saveToDB;
var Resolution = require('../resolutions/resolution.js');

module.exports = {

  get: function(data) {
    
    var user = jwt.decode(data.token, process.env.TOKEN_SECRET);

    if (user) {
      this.emit("resolution update", committeeData[user.committee].resolutions);
    }

  },

  create: function(data) {
    var user = jwt.decode(data.token, process.env.TOKEN_SECRET);

    if (user) {
      committeeData[user.committee].resolutions[data.name] = Resolution(data.link, user.country);

      this.sockets.in(user.committee).emit("resolution update", committeeData[user.committee].resolutions);

      saveToDB(committeeData);
    }
  },

  signRequest: function(data) {
    var user = jwt.decode(data.token, process.env.TOKEN_SECRET);

    if (user) {
      committeeData[user.committee].resolutions[data.name].requests[user.country] = {
        type: data.signType
      };

      this.sockets.in(user.committee).emit("resolution update", committeeData[user.committee].resolutions);
      console.log("updating users with request");

      saveToDB(committeeData);
    }
  },

  signRevoke: function(data) {

    var user = jwt.decode(data.token, process.env.TOKEN_SECRET);

    if (user) {
      committeeData[user.committee].resolutions[data.name].requests[user.country] = undefined;

      committeeData[user.committee].resolutions[data.name].cosub[user.country] = undefined;
      committeeData[user.committee].resolutions[data.name].signat[user.country] = undefined;

      this.sockets.in(user.committee).emit("resolution update", committeeData[user.committee].resolutions);

      saveToDB(committeeData);
    }

  },

  signAccept: function(data) {
    var user = jwt.decode(data.token, process.env.TOKEN_SECRET);

    var resPick = committeeData[user.committee].resolutions[data.name];

    if (user && (resPick.creator === user.country)) {

      var type = resPick.requests[data.country];
      resPick[type] = true;

      this.sockets.in(user.committee).emit("resolution update", committeeData[user.committee].resolutions);

      saveToDB(committeeData);

    }
  },

  approve: function(data) {
    var user = jwt.decode(data.token, process.env.TOKEN_SECRET);

    if (user && user.userLevel !== "Delegate") {

      committeeData[user.committee].resolutions[data.name].approve = true;
      this.sockets.in(user.committee).emit("resolution update", committeeData[user.committee].resolutions);
      console.log(user.firstName + " is getting resolutions " + " for " + user.committee);
      saveToDB(committeeData);
    }
  }

}



