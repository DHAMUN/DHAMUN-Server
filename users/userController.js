var User = require('./userModel.js'),
    Q    = require('q'),
    jwt  = require('jwt-simple');

module.exports = {
  signin: function (req, res, next) {
    var hash = req.body.hashCode;

    var findUser = Q.nbind(User.findOne, User);
    findUser({hashCode: hash})
      .then(function (user) {
        if (!user) {
          next(new Error('User does not exist'));
        } else {
          if (user.compareCodes(hash)){
            var token = jwt.encode(user, process.env.TOKEN_SECRET);
            res.json({token: token});
          } else {
            return next(new Error('No user'));
          }
        }
      })
      .fail(function (error) {
        next(error);
      });
  },

  checkAuth: function (req, res, next) {
    // checking to see if the user is authenticated
    // grab the token in the header is any
    // then decode the token, which we end up being the user object
    // check to see if that user exists in the database
    var token = req.headers['x-access-token'];
    if (!token) {
      next(new Error('No token'));
    } else {
      var user = jwt.decode(token, process.env.TOKEN_SECRET);
      var findUser = Q.nbind(User.findOne, User);
      findUser({hashCode: user.hashCode})
        .then(function (foundUser) {
          if (foundUser) {
            res.send(200);
          } else {
            res.send(401);
          }
        })
        .fail(function (error) {
          next(error);
        });
    }
  }
  
};

