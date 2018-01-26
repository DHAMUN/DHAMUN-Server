var Mailgen = require('mailgen');

var api_key = process.env.MAILGUN_KEY;
var domain = process.env.MAILGUN_DOMAIN;
var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});
var User = require('../users/userModel.js');
var mailTemplator = require('./mailTemplater.js');

// Kinda like enums.
var EMAIL_SINGLE_TYPES = {
  FORGOT_PASS: "FORGOT_PASS", 
  NEW_USER: "NEW_USER",
  REMIND_USER: "REMIND_USER"
}

var EMAIL_BATCH_TYPES = {
  NOT_REGISTERED: "NOT_REGISTERED"
}

var EMAIL_TYPE = {
  SINGLE: "SINGLE",
  BATCH: "BATCH"
}

var mailGenerator = new Mailgen({
    theme: 'default',
    product: {
        // Appears in header & footer of e-mails
        name: 'DHAMUN',
        link: process.env.WEB_HOST_URI + '/'
        // Optional product logo
        // logo: 'https://mailgen.js/img/logo.png'
    }
});

module.exports = {

  sendSingle: function (user, type, cb) {


    function sendMailgun(email, messageData) {
      var emailBody = mailGenerator.generate(email);

      messageData.html = emailBody;

      mailgun.messages().send(messageData, function (error, body) {
        if (error) cb(error);
        else cb(error, body);
      });

    }

    if (type === EMAIL_SINGLE_TYPES.FORGOT_PASS) {

      // becuase of the 'pre' on Usermodel, this generates a new hashcode!
      user.hashCode = undefined;
      user.hashVerified = false;

      user.save(function(err){
        var template = mailTemplator.forgotPassEmail(user);
        sendMailgun(template.email, template.data);
      });

    } else if (type === EMAIL_SINGLE_TYPES.NEW_USER) {

      var template = mailTemplator.newUserEmail(user);
      sendMailgun(template.email, template.data);

    } else if (type === EMAIL_SINGLE_TYPES.REMIND_USER) {

      var template = mailTemplator.reminderEmail(user);
      sendMailgun(template.email, template.data);

    } else {
      cb("Illegal message type");
    }

  },

  // TODO: use promises
  sendBatch: function (type, cb) {
    var _this = this;

    if (type === EMAIL_SINGLE_TYPES.REMIND_USER) {
      var completed = [];

      User.find({registered: false}, function(err, foundUsers) {
        if (err || foundUsers.length == 0) cb("couldn't find unregistered users");

        foundUsers.forEach(function(user){
          _this.sendSingle(user, type, function (err, body){
            completed.push({err, body});
            if (completed.length == foundUsers.length) cb(null, completed);
          })
        })

      })

    } else cb("Illegal batch type");

  },

  send: function (req, res, next) {
    // body...


    if (req.body.recipient === EMAIL_TYPE.SINGLE) {

      User.findOne({email: req.body.email}, function(err, foundUser){
        if (err || !foundUser) res.status(400).send(err);
        else module.exports.sendSingle(foundUser, req.body.type, function(err, body){
          if (err) {
            res.status(400).send(err);
          } else res.status(200).send(body)
        });

      });

    } else if (req.body.recipient === EMAIL_TYPE.BATCH) {

      module.exports.sendBatch(req.body.type, function(err, body){
        if (err) {
          res.status(400).send(err);
        } else res.status(200).send(body);
      });

    } else res.status(400).send("invalid recipient type")


  }
}