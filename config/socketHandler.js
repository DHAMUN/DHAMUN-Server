
var committeeData = require('../committees/committeeData.js').initialModel;

var generalSocketListeners = require('../sockets/general.js');
var resolutionSocketListeners = require('../sockets/resolution.js');
var voteSocketListeners = require('../sockets/vote.js');
var attendanceSocketListeners = require('../sockets/attendance.js');


// Loads data from DB into committeeData, if exists.
require('../committees/committeeData.js').initialLoad(committeeData);


module.exports = function (io) {

  io.on("connection", function(socket){


    socket.on("subscribe", generalSocketListeners.subscribe.bind(socket));

    socket.on("logout", generalSocketListeners.logout.bind(socket));


    socket.on("resolution create", resolutionSocketListeners.create.bind(io));

    socket.on("resolution sign request", resolutionSocketListeners.signRequest.bind(io));

    socket.on("resolution sign revoke", resolutionSocketListeners.signRevoke.bind(io));

    socket.on("resolution sign accept", resolutionSocketListeners.signAccept.bind(io));

    socket.on("resolution approve", resolutionSocketListeners.approve.bind(io));

    socket.on("resolution amendment add", resolutionSocketListeners.amendmentAdd.bind(io));

    socket.on("resolution amendment remove", resolutionSocketListeners.amendmentRemove.bind(io));

    socket.on("resolution get", resolutionSocketListeners.get.bind(socket));


    socket.on("vote add", voteSocketListeners.add.bind(io));

    socket.on("vote get", voteSocketListeners.get.bind(socket));

    socket.on("vote create", voteSocketListeners.create.bind(io));

    socket.on("vote close", voteSocketListeners.close.bind(io));


    socket.on("attendance present", attendanceSocketListeners.markPresent.bind(io));

    socket.on("attendance get", attendanceSocketListeners.get.bind(socket));

  });
}
