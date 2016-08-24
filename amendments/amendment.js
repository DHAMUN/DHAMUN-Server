module.exports = function (creator, title, message) {
  var currentObj = {};

  currentObj.creator = creator;
  currentObj.title = title;
  currentObj.message = message || "None Provided";

  return currentObj;
}