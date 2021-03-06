var userController = require('./userController.js'),
           helpers = require('../config/helpers.js');



module.exports = function (app) {
  // app === userRouter injected from middlware.js

  app.post('/signin', userController.signin);
  app.post('/signup', userController.signup);
  app.post('/create', helpers.decode, userController.createUser);
  app.get('/signedin', userController.checkAuth);
  app.post('/fbasetoken', helpers.decode, userController.refreshFbaseToken);

};
