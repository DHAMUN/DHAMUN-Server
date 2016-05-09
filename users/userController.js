var User = require('./userModel.js'),
    Q    = require('q'),
    jwt  = require('jwt-simple');

module.exports = {
  signin: function (req, res, next) {
    var email    = req.body.email,
        password = req.body.password;

    var findUser = Q.nbind(User.findOne, User);
    findUser({email: email})
      .then(function (user) {
        if (!user) {
          next(new Error('Invalid email'));
        } else if (!user.hashVerified){
          next(new Error('You have not registered your account. Check your email for a link.'));
        } else {
          return user.comparePasswords(password)
            .then(function(foundUser) {
              if (foundUser) {

                var sendUserBack = function(user) {
                  var token = jwt.encode(user, process.env.TOKEN_SECRET);
                  res.json({token: token});
                }
                // Pretty much finding their partner. If you're a chair, you dont have one :)
                // Limit school? Probably not my problem.
                if (user.userLevel === "Delegate") {

                  var qry = {
                    country: {
                      $eq: user.country
                    },
                    committee: {
                      $eq: user.committee
                    },
                    email: {
                      $ne: user.email
                    }
                  }

                  findUser(qry).then(function(partner){

                    if (partner) {

                      partner.password = undefined;
                      partner.hashVerified = undefined;
                      partner.hashCode = undefined;
                      var newUser = user.toObject();
                      newUser.partner = partner;
                    }

                    sendUserBack(newUser);

                  })
                } else {
                  sendUserBack(user);
                }

              } else {
                return next(new Error('Incorrect Password'));
              }
            });
        }
      })
      .fail(function (error) {
        next(error);
      });
  },

  signup: function (req, res, next) {
    var password  = req.body.password,
        hash      = req.body.hash,
        save;

    console.log(req.body);

    var findUser = Q.nbind(User.findOne, User);
    findUser({hashCode: hash})
      .then(function (user) {
        if (!user) {
          next(new Error('Not a valid link!'));
        } else {
          if (user.compareCodes(hash) && !user.hashVerified){

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
            return next(new Error('This account has been registered. Talk to an admin if its yours.'));
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

