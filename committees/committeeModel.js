var mongoose = require('mongoose');

var committeeSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  votes: {
    type: Array
  },

  resolutions: {
    type: Array
  }

});

module.exports = mongoose.model('committees', committeeSchema);