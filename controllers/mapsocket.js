

module.exports = function(callback)
{
  callback(
    {
      socketio : socketio
    });
}

function socketio(io){
    var channels = {};
    var sockets = {};
    var userList = [];
    io.sockets.on('connection', function (socket) {
      var room;
      socket.on('subscribe', function (data) {
        room = data.eventname;
        // console.log("room :"+room)
        socket.join(data.eventname);
        var foundUser = false;
        for (var i = 0; i < userList.length; i++) {
          if (userList[i]["pseudoname"] == data.pseudoname) {
            foundUser = true;
            break;
          }
        }
        var roomUsers = [];
        if (!foundUser) {
          socket.user = data;
          userList.push(data);
        }
        for (var i = 0; i < userList.length; i++) {
          if (userList[i].eventname == data.eventname) {
            roomUsers.push(userList[i])
            console.log("in :"+JSON.stringify(roomUsers))
          }
        }
        // console.log("serverusers :"+JSON.stringify(roomUsers));

        io.sockets.to(data.eventname).emit('userList', roomUsers);
      });
      socket.on('disconnect', function () {
         console.log("disconnected")
          var index = userList.indexOf(socket.user);
          userList.splice(index, 1);
          var users = [];
          for (var i = 0; i < userList.length; i++) {
              if (userList[i].eventname == room) {
                users.push(userList[i])
              }
          }
          // console.log("users :"+JSON.stringify(users));
           io.sockets.to(room).emit('userList', users);
          // io.sockets.to(room).emit('deletemap', "hi");


      });

      socket.on('locationChanged', function (data) {
        io.sockets.emit('locationUpdate', data);
      })
    })
}




//   socket.channels = {};
//   sockets[socket.id] = socket;
//
//   socket.on('disconnect', function () {
//     for (var channel in socket.channels) {
//       part(channel);
//     }
//     delete sockets[socket.id];
//   });
//
//
//   socket.on('logger', function (data) {
//
//   });
//
//
//   socket.on('join', function (config) {
//     var channel = config.channel;
//     var userdata = config.userdata;
//     socket.join(channel);
//     socket.to(channel).emit("callrequest","ACCept");
//
//     if (channel in socket.channels) {
//       return;
//     }
//
//     if (!(channel in channels)) {
//       channels[channel] = {};
//     }
//
//     for (id in channels[channel]) {
//       channels[channel][id].emit('addPeer', {'peer_id': socket.id, 'should_create_offer': false});
//       socket.emit('addPeer', {'peer_id': id, 'should_create_offer': true});
//     }
//
//     channels[channel][socket.id] = socket;
//     socket.channels[channel] = channel;
//   });
//
//   function part(channel) {
//
//     if (!(channel in socket.channels)) {
//       return;
//     }
//
//     delete socket.channels[channel];
//     delete channels[channel][socket.id];
//
//     for (id in channels[channel]) {
//       channels[channel][id].emit('removePeer', {'peer_id': socket.id});
//       socket.emit('removePeer', {'peer_id': id});
//     }
//   }
//   socket.on('part', part);
//
//   socket.on('relayICECandidate', function(config) {
//     var peer_id = config.peer_id;
//     var ice_candidate = config.ice_candidate;
//
//     if (peer_id in sockets) {
//       sockets[peer_id].emit('iceCandidate', {'peer_id': socket.id, 'ice_candidate': ice_candidate});
//     }
//   });
//
//   socket.on('relaySessionDescription', function(config) {
//     var peer_id = config.peer_id;
//     var session_description = config.session_description;
//     if (peer_id in sockets) {
//       sockets[peer_id].emit('sessionDescription', {'peer_id': socket.id, 'session_description': session_description});
//     }
//   });
//
// });
