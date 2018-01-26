function commonTemplate (user) {
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

  return {data, email}
}

module.exports = {
  reminderEmail: function (user) {
    var {data, email} = commonTemplate(user);

    data.subject = "Hey! Sign up already!"
    email.body.intro = "Welcome to DHAMUN! We’ve noticed that you haven't activated your account yet :(",
    email.body.action = {
      instructions: 'To setup a password on DHAMUN Portal, please click here:',
      button: {
        color: '#22BC66', // Optional action button color
        text: 'Confirm your account',
        link: process.env.WEB_HOST_URI + "/#/home/signup/" + user.hashCode + "/"
      }
    };

    email.body.outro = 'Need help, or have questions? Email a member of the DHAMUN exec team (or reply to this email).';
    return {data, email};
  },

  forgotPassEmail: function (user) {  
    var {data, email} = commonTemplate(user);
    
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
    return {data, email};
    
  },

  newUserEmail: function (user) {
    var {data, email} = commonTemplate(user);
    
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
    
    email.body.outro = 'Need help, or have questions? Email a member of the DHAMUN exec team (or reply to this email).';
    return {data, email};
    
  }
}


// var template = mailTemplator.reminderEmail(user);
// sendMailgun(template.email, template.data);
