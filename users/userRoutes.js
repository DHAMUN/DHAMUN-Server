var userController = require('./userController.js'),
           helpers = require('../config/helpers.js');



module.exports = function (app) {
  // app === userRouter injected from middlware.js

  app.post('/signin', userController.signin);
  app.get('/signedin', userController.checkAuth);

};
