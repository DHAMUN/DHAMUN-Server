module.exports = function(creator) {
  var currentObj = {};
  
  // Ignore the creator.
  currentObj.original = creator;

  currentObj.mainsub = {};
  currentObj.cosub = {};
  currentObj.signat = {};
  currentObj.requests = {};

  currentObj.mainsub[creator] = true;
  currentObj.approved = false;
  currentObj.empty = false;

  // main sub, co sub, signators
  // Min signators.

  return currentObj;
}
