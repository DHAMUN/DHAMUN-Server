var User = require('./userModel.js'),
    Q    = require('q'),
    jwt  = require('jwt-simple'),
    MailController = require('../mails/mailController.js')

module.exports = {
  signin: function (req, res, next) {
    var email    = req.body.email,
        password = req.body.password;

    var findUser = Q.nbind(User.findOne, User);
    var findUsers = Q.nbind(User.find, User);

    findUser({email: email})
      .then(function (user) {
        if (!user) {
          next(new Error('Invalid email'));
        } else if (!user.registered){
          next(new Error('You have not registered your account. Check your email for a link.'));
        } else {
          return user.comparePasswords(password)
            .then(function(foundUser) {
              if (foundUser) {

                var sendUserBack = function(user) {
                  var token = jwt.encode(user, process.env.TOKEN_SECRET);
                  res.json({token: token});
                }

                var newUser = user.toObject();


                var qry = {
                  country: {
                    $eq: user.country
                  },
                  committee: {
                    $eq: user.committee
                  },
                  email: {
                    $ne: user.email
                  },
                  userLevel: {
                    $eq: user.userLevel
                  }
                }

                findUser(qry).then(function(partner){

                  if (partner) {
                    partner.password = undefined;
                    partner.hashVerified = undefined;
                    partner.registered = undefined;
                    partner.hashCode = undefined;
                    partner._id = undefined;
                    newUser.partner = partner;
                  }

                  var adminsQuery = {
                    committee: {
                      $eq: user.committee
                    },
                    userLevel: {
                      $ne: "Delegate"
                    }
                  }

                  findUsers(adminsQuery).then(function(admins){

                    admins.forEach(function(item){
                      item.password = undefined;
                      item.hashVerified = undefined;
                      item.registered = undefined;
                      item.hashCode = undefined;
                      item._id = undefined;                      
                    })

                    newUser.admins = admins;
                    sendUserBack(newUser);
                  });
                });

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

    var findUser = Q.nbind(User.findOne, User);

    findUser({hashCode: hash})
      .then(function (user) {
        if (!user) {
          next(new Error('Not a valid link!'));
        } else {
          if (user.compareCodes(hash) && !user.hashVerified){

            user.password = password;
            user.hashVerified = true;
            user.registered = true;

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

  createUser: function (req, res, next) {

    // The first user must be made by the developer, using the token secret (or directly hitting the DB).
    // After that, use the token from that user to create more.
    if (req.user.userLevel === "Delegate") {
      res.status(403).send();
    }

    var firstName  = req.body.firstName,
        lastName  = req.body.lastName,
        userLevel = req.body.userLevel,
        committee = req.body.committee,
        school = req.body.school,
        country = req.body.country,
        email = req.body.email,
        create,
        newUser;

    var findOne = Q.nbind(User.findOne, User);

    // check to see if user already exists
    findOne({email: email})
      .then(function(user) {
        if (user) {
          next(new Error('User already exists!'));
        } else {
          // make a new user if not one
          create = Q.nbind(User.create, User);
          newUser = {
            firstName: firstName,
            lastName: lastName,
            userLevel: userLevel,
            committee: committee,
            school: school,
            country: country,
            email: email,
            registered: false
          };


          return create(newUser);
        }
      })
      .then(function (user) {
        
        user.save(function(err){
          MailController.sendSingle(user, "NEW_USER", function(err, done){
            console.log(err);
            if (err) res.status(400).send(err); 
            else res.status(200).send();
          })
        });

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
            res.status(200).send();
          } else {
            res.status(400).send();
          }
        })
        .fail(function (error) {
          next(error);
        });
    }
  }
  
};

