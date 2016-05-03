var User = require('./userModel.js'),
    Q    = require('q'),
    jwt  = require('jwt-simple');

module.exports = {
  signin: function (req, res, next) {
    var username = req.body.username,
        password = req.body.password;

    var findUser = Q.nbind(User.findOne, User);
    findUser({username: username})
      .then(function (user) {
        if (!user) {
          next(new Error('User does not exist'));
        } else {
          return user.comparePasswords(password)
            .then(function(foundUser) {
              if (foundUser) {
                var token = jwt.encode(user, process.env.TOKEN_SECRET);
                res.json({token: token});
              } else {
                return next(new Error('Invalid Username'));
              }
            });
        }
      })
      .fail(function (error) {
        next(error);
      });
  },

  signup: function (req, res, next) {
    var username  = req.body.username,
        password  = req.body.password,
        hash      = req.body.hashCode,
        save;

    var findUser = Q.nbind(User.findOne, User);
    findUser({hashCode: hash})
      .then(function (user) {
        if (!user) {
          next(new Error('Not a DHAMUN Code!'));
        } else {
          if (user.compareCodes(hash) && !user.hashVerified){

            user.username = username;
            user.password = password;
            user.hashVerified = true;

            user.save(function(err){
              if (err) {
                next(err);
              } else {
                var token = jwt.encode(user, process.env.TOKEN_SECRET);
                res.json({token: token});             
              }
            })

          } else {
            return next(new Error('This code has been registered. Talk to an admin if its yours.'));
          }
        }
      })
      .fail(function (error) {
        console.log("TRIGGERED BRO");
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

