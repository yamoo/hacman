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
			x: userData.x,
			y: userData.y
		};

		users[newUser.id] = newUser;

		socket.emit('accepted', {
			me: newUser,
			users: users
		});

		socket.broadcast.emit('joinUser', newUser);
	});

	socket.on('updateUser', function (data) {
		users[data.id].x = data.x || users[data.id].x;
		users[data.id].y = data.y || users[data.id].y;
		if (data.isHacman) {
			users[data.id].isHacman = data.isHacman;
			if (hacmanId && users[hacmanId]) {
				users[hacmanId].isHacman = false;
				socket.broadcast.emit('updateUser', users[hacmanId]);
			}
			hacmanId = data.id;
		}
		socket.broadcast.emit('updateUser', data);
	});

	socket.on('replacePoint', function (data) {
		socket.broadcast.emit('replacePoint', data);
	});

	socket.on('removePoint', function () {
		socket.broadcast.emit('removePoint');
	});

	socket.on('disconnect', function () {
		socket.broadcast.emit('leaveUser', socket.id);
		delete users[socket.id];
	});

	socket.emit('connected');
});

setInterval(function() {
	io.sockets.socket(getAnyUser()).emit('replacePoint');
}, 5000);

function getAnyUser() {
	var user;

	for (user in users) {
		break;
	}

	return user;
}


