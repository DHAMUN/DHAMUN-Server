module.exports = function(creator) {
  var currentObj = {};

  currentObj.closed = false;
  currentObj.creator = creator;
  currentObj.votes = {};

  return currentObj;
}