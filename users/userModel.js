var mongoose = require('mongoose'),
    bcrypt   = require('bcrypt-nodejs'),
    Q        = require('q'),
    SALT_WORK_FACTOR  = 10,
    HASH_SIZE = 10;

var makeid = function() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < HASH_SIZE; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

var UserSchema = new mongoose.Schema({

  hashCode: {
    type: String,
    unique: true
  },

  hashVerified: {
    type: Boolean,
    default: false
  },

  email: {
    type: String,
    unique: true
  },

  password: {
    type: String
  },

  firstName: {
    type: String,
    required: true
  },

  lastName: {
    type: String,
    required: true    
  },

  school: {
    type: String,
    required: true
  },

  country: {
    type: String,
    required: false
  },
  
  userLevel: {
    type: String,
    required: true
  },

  committee: {
    type: String,
    required: false
  },

  registered: {
    type: Boolean,
    required: true
  }

});

UserSchema.methods.compareCodes = function (candidateCode) {
  var savedPassword = this.hashCode;
  return this.hashCode === candidateCode;
};

UserSchema.methods.comparePasswords = function (candidatePassword) {
  var defer = Q.defer();
  var savedPassword = this.password;
  bcrypt.compare(candidatePassword, savedPassword, function (err, isMatch) {
    if (err) {
      defer.reject(err);
    } else {
      defer.resolve(isMatch);
    }
  });
  return defer.promise;
};

UserSchema.pre('save', function (next) {
  var user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) {
    return next();
  }

  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) {
      return next(err);
    }

    // hash the password along with our new salt
    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) {
        return next(err);
      }

      user.password = hash;
      user.salt = salt;
      next();
    });
  });
});

UserSchema.pre('save', function (next) {
  
  var user = this;

  // only create hashcode if !exist.

  if (user.hashCode) {
    return next();
  }

  user.hashCode = makeid();
  next();

});


module.exports = mongoose.model('users', UserSchema);
