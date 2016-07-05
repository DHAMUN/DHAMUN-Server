var mongoose = require('mongoose');

var committeeSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  voteSessions: {
    type: {}
  },

  resolutions: {
    type: {}
  }

});

module.exports = mongoose.model('committees', committeeSchema);