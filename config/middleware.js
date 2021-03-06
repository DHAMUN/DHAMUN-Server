var morgan      = require('morgan'), // used for logging incoming request
    bodyParser  = require('body-parser'),
    helpers     = require('./helpers.js'); // our custom middleware


module.exports = function (app, express) {

  // Simple activity checker
  app.get('/active', function (req, res) {
    res.send("Hi. You've pinged a Referendum server :)")
  })

  // Express 4 allows us to use multiple routers with their own configurations
  var userRouter = express.Router();
  var mailRouter = express.Router();

  app.use(morgan('dev'));
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());

  app.use('/api/users', userRouter); // use user router for all user request
  app.use('/api/mails', mailRouter); // use mail router for all mail request

  app.use(helpers.errorLogger);
  app.use(helpers.errorHandler);

  // inject our routers into their respective route files
  require('../users/userRoutes.js')(userRouter);
  require('../mails/mailRoutes.js')(mailRouter);


};
