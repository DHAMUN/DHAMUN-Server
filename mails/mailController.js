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

      // becuase of the 'pre' on Usermodel, this generates a new hashcode!
      user.hashCode = undefined;
      user.hashVerified = false;

      user.save(function(err){
        console.log(user);
        data.subject = "Password Reset"

        email.body.intro = 'You have received this email because a password reset request for your account was received.';
        email.body.action = {
            instructions: 'Click the button below to reset your password:',
            button: {
                color: '#DC4D2F',
                text: 'Reset your password',
                link: process.env.WEB_HOST_URI + "/#/home/signup/" + user.hashCode + "/"
            }
        };
        email.body.outro = 'If you did not request a password reset, no further action is required on your part.';
        sendMailgun(email, data);
      });



    } else if (type === EMAIL_SINGLE_TYPES.NEW_USER) {

      data.subject = "Account Activation"

      email.body.intro = 'Welcome to DHAMUN! We’re very excited to have you attend.',
      email.body.action = {
          instructions: 'To setup a password on DHAMUN Portal, please click here:',
          button: {
              color: '#22BC66', // Optional action button color
              text: 'Confirm your account',
              link: process.env.WEB_HOST_URI + "/#/home/signup/" + user.hashCode + "/"
          }
      };

      email.body.outro = 'Need help, or have questions? Just reply to this email, we\'ll help you out.';
      sendMailgun(email, data);

    } else {
      cb("Illegal message type");
    }

  },

  // TODO
  sendBatch: function (type, cb) {
    cb("Not implemented yet :)")
  },

  send: function (req, res, next) {
    // body...


    if (req.body.recipient === EMAIL_TYPE.SINGLE) {

      User.findOne({email: req.body.email}, function(err, foundUser){
        if (err) cb(err);
        else module.exports.sendSingle(foundUser, req.body.type, function(err, body){
          if (err) {
            console.log(err);
            res.status(400).send(err);
          } else res.status(200).send(body)
        });

      });

    } else if (req.body.recipient === EMAIL_TYPE.BATCH) {

      if (req.user.userLevel === "Delegate") {
        res.status(403).send("Fordbidden");
        return;
      }

      module.exports.sendBatch(req.body.type, function(err, body){
        if (err) {
          res.status(400).send(err);
        }
      });

    }


  }
}