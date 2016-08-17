module.exports = function(publicLink, creator) {
  var currentObj = {};


  // Ignore the creator.
  currentObj.original = creator;

  currentObj.publicLink = publicLink;

  currentObj.mainsub = {};
  currentObj.cosub = {};
  currentObj.signat = {};
  currentObj.requests = {};

  currentObj.mainsub[creator] = true;
  currentObj.approved = false;

  // main sub, co sub, signators
  // Min signators.

  return currentObj;
}
