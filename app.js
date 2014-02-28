var io,
	users;

users = {};
io = require('socket.io').listen(3000);

io.sockets.on('connection', function (socket) {
	users[socket.id] = {
		x: 0,
		y: 0
	};

	socket.emit('accept', {
		userId: socket.id,
		users: users
	});
	socket.broadcast.emit('join', socket.id);

	socket.on('join', function (userId) {
		socket.broadcast.emit('join', userId);
	});

	socket.on('move', function (data) {
		users[data.userId] = {
            x: data.x,
            y: data.y
        };
		socket.broadcast.emit('move', data);
	});

	socket.on('disconnect', function () {
		socket.broadcast.emit('leave', socket.id);
		delete users[socket.id];
	});
});

