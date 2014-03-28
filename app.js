var io,
	users;

users = {};
io = require('socket.io').listen(3000);

io.sockets.on('connection', function (socket) {

	socket.on('entry', function(userData) {
		var newUser;

		newUser = {
			id: socket.id,
			name: userData.name,
			charaId: userData.charaId,
			x: userData.x,
			y: userData.y
		};

		users[newUser.id] = newUser;

		socket.emit('accept', {
			me: newUser,
			users: users
		});

		socket.broadcast.emit('join', newUser);
	});

	socket.on('move', function (data) {
		users[data.id].x = data.x;
		users[data.id].y = data.y;
		socket.broadcast.emit('move', data);
	});

	socket.on('disconnect', function () {
		socket.broadcast.emit('leave', socket.id);
		delete users[socket.id];
	});

	socket.emit('confirm');
});

