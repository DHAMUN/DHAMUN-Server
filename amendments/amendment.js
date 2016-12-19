module.exports = function (creator, title, message, type) {
  var currentObj = {};

  currentObj.creator = creator;
  currentObj.title = title;
  currentObj.message = message || "None Provided";
  currentObj.type = type;

  return currentObj;
}