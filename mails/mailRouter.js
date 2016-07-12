var mailController = require('./mailController.js'),
           helpers = require('../config/helpers.js');



module.exports = function (app) {
  // app === userRouter injected from middlware.js

  app.post('/send', mailController.send);

};
