var Mailgen = require('mailgen');

var api_key = process.env.MAILGUN_KEY;
var domain = process.env.MAILGUN_DOMAIN;
var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});
var User = require('../users/userModel.js');
// Kinda like enums.
var EMAIL_SINGLE_TYPES = {
  FORGOT_PASS: "FORGOT_PASS", 
  NEW_USER: "NEW_USER"
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
        link: 'http://dhamun.com/'
        // Optional product logo
        // logo: 'https://mailgen.js/img/logo.png'
    }
});

module.exports = {

  sendSingle: function (user, type, cb) {

    var data = {
      from: 'DHAMUN <admins@dhamun.com>',
      to: user.email
    };

    var email = {
        body: {
            name: user.firstName + " " +  user.lastName,
            action: {

            }
        }
    };

    if (type === EMAIL_SINGLE_TYPES.FORGOT_PASS) {

      data.subject = "Password Reset"

      email.body.intro = 'You have received this email because a password reset request for your account was received.';
      email.body.action = {
          instructions: 'Click the button below to reset your password:',
          button: {
              color: '#DC4D2F',
              text: 'Reset your password',
              link: 'https://google.com' // Nope
          }
      };
      email.body.outro = 'If you did not request a password reset, no further action is required on your part.';


    } else if (type === EMAIL_SINGLE_TYPES.NEW_USER) {

      data.subject = "Account Activation"

      email.body.intro = 'Welcome to DHAMUN! We’re very excited to have you attend.',
      email.body.action = {
          instructions: 'To setup a password on DHAMUN Portal, please click here:',
          button: {
              color: '#22BC66', // Optional action button color
              text: 'Confirm your account',
              link: "http://dhamun.com/#/home/signup/" + user.hashCode + "/"
          }
      };

      email.body.outro = 'Need help, or have questions? Just reply to this email, we\'ll help you out.';

    } else {
      cb("Illegal message type");
      return;
    }

    var emailBody = mailGenerator.generate(email);

    data.html = emailBody;

    mailgun.messages().send(data, function (error, body) {
      if (error) cb(error);
      else cb(error, body);
    });

  },

  // TODO
  sendBatch: function (type, cb) {
    cb("Not implemented yet :)")
  },

  send: function (req, res, next) {
    // body...
    if (req.user.userLevel === "Delegate") {
      res.statusCode(403);
    }

    if (req.body.recipient === EMAIL_TYPE.SINGLE) {

      Users.findOne({email: req.body.email}, function(err, foundUser){
        if (err) cb(err);
        else this.sendSingle(foundUser, req.body.type, function(err, body){
          if (err) {
            res.statusCode(400).send(err);
          } else res.statusCode(200).send(body)
        });

      });

    } else if (req.body.recipient === EMAIL_TYPE.BATCH) {

      this.sendBatch(req.body.type, function(err, body){
        if (err) {
          res.statusCode(400).send(body);
        }
      });

    }


  }
}