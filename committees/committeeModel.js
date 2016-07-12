var mongoose = require('mongoose');

// TODO: Nested Schema
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

}, {minimize: false});

// Minimize removes empty objects in the database.
// We happen to need empty objects. In case cosub or mainsub is empty (resolutions)

module.exports = mongoose.model('committees', committeeSchema);