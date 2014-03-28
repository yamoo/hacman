var io,
	users,
	hacmanId;

users = {};
io = require('socket.io').listen(3000);

io.sockets.on('connection', function (socket) {

	socket.on('entry', function(userData) {
		var newUser;

		newUser = {
			id: socket.id,
			name: userData.name,
			charaId: userData.charaId,
			isHacman: false,
			x: 0,
			y: 0
		};

		users[newUser.id] = newUser;

		socket.emit('accept', {
			me: newUser,
			users: users
		});

		socket.broadcast.emit('join', newUser);
	});

	socket.on('update', function (data) {
		users[data.id].x = data.x || users[data.id].x;
		users[data.id].y = data.y || users[data.id].y;
		if (data.isHacman) {
			users[data.id].isHacman = data.isHacman;
			if (hacmanId) {
				users[hacmanId].isHacman = false;
				socket.broadcast.emit('update', users[hacmanId]);
			}
			hacmanId = data.id;
		}
		socket.broadcast.emit('update', data);
	});

	socket.on('replacePoint', function (data) {
		socket.broadcast.emit('replacePoint', data);
	});

	socket.on('disconnect', function () {
		socket.broadcast.emit('leave', socket.id);
		delete users[socket.id];
	});

	socket.emit('confirm');

});

setInterval(function() {
	io.sockets.socket(getAnyUser()).emit('replacePoint');
}, 5000)

function getAnyUser() {
	var user;

	for (user in users) {
		break;
	}

	return user;
}


