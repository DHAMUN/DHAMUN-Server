// THIS STRUCTURE IS SAVED TO MONGO
// THIS STRUCTURE IS ALSO UPDATED IF (and only if) THE DOC EXISTS.
// OTHERWISE, THIS IS USED AS THE DEFAULT "STARTING" POINT
var initialModel = {
  "General Assembly": {
    voteSessions: {

    },
    resolutions: {

    }
  },
  "Security Council": {
    voteSessions: {

    },
    resolutions: {

    }
  },
}

var vote = function(user, type, sessionObj) {
  sessionObj.votes[user.country] = {school: user.school, type: type};
}

var getVote = function(user, sessionObj) {
  return sessionObj.votes[user.country];
}

module.exports = {
  initialModel: initialModel,
  vote: vote,
  getVote: getVote
}