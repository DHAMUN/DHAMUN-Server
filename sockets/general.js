var jwt  = require('jwt-simple');

// Sockets are the context for every one of these methods
module.exports = {
  subscribe: function(data){

    var user = jwt.decode(data.token, process.env.TOKEN_SECRET);

    if (user) {
      this.join(user.committee + " " + user.country);
      this.join(user.committee);
    }
  },

  logout: function(data){
    var user = jwt.decode(data.token, process.env.TOKEN_SECRET);

    if (user) {

      this.leave(user.committee + " " + user.country);
      this.leave(user.country);

      console.log(user.firstName + " is leaving " + user.committee);
    }
  }
}