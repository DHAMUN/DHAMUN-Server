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

      saveToDB(committeeData);
    }
  },

  signRevoke: function(data) {

    var user = jwt.decode(data.token, process.env.TOKEN_SECRET);

    if (user) {
      var resPick = committeeData[user.committee].resolutions[data.name];


      if (!data.country || resPick.original === user.country) {

        var country = data.country || user.country;

  

        delete resPick.requests[country];
        delete resPick.cosub[country];
        delete resPick.signat[country];
        delete resPick.mainsub[country];

      } 

      this.sockets.in(user.committee).emit("resolution update", committeeData[user.committee].resolutions);
      saveToDB(committeeData);

    }

  },

  signAccept: function(data) {
    var user = jwt.decode(data.token, process.env.TOKEN_SECRET);

    var resPick = committeeData[user.committee].resolutions[data.name];



    if (user && (resPick.original === user.country)) {

      var signType = resPick.requests[data.country].type;

      resPick[signType][data.country] = true;

      delete resPick.requests[data.country]

      this.sockets.in(user.committee).emit("resolution update", committeeData[user.committee].resolutions);

      saveToDB(committeeData);

    }
  },

  approve: function(data) {
    var user = jwt.decode(data.token, process.env.TOKEN_SECRET);

    if (user && user.userLevel !== "Delegate") {

      committeeData[user.committee].resolutions[data.name].approved = true;
      this.sockets.in(user.committee).emit("resolution update", committeeData[user.committee].resolutions);
      saveToDB(committeeData);
    }
  }

}



