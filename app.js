var io,
	users,
	hacmanId,
	timerDuration = 5000;

users = {};
io = require('socket.io').listen(3000);

io.sockets.on('connection', function (socket) {

	socket.on('entry', function(userData) {
		var newUser;

		newUser = {
			id: socket.id,
			name: userData.name,
			charaId: userData.charaId,
			score: 0,
			isHacman: false,
			message: '',
			x: userData.x,
			y: userData.y
		};

		users[newUser.id] = newUser;

		socket.emit('accepted', {
			me: newUser,
			users: users,
			hacmanId: hacmanId
		});

		socket.broadcast.emit('joinUser', newUser);
	});

	socket.on('updateUser', function (userData) {
		var target = users[userData.id];

		target.x = userData.x || target.x;
		target.y = userData.y || target.y;
		target.score = userData.score || target.score;
		target.message = userData.message || target.message;

        if (!target.isHacman && userData.isHacman) {
			if (hacmanId && users[hacmanId]) {
				users[hacmanId].isHacman = false;
			}
			target.isHacman = true;
			hacmanId = userData.id;
		}

		socket.broadcast.emit('updateUser', userData);
	});

	socket.on('loseUser', function (data) {
		socket.broadcast.emit('loseUser', data);
		delete users[data.userId];
	});

	socket.on('replacePoint', function (pointData) {
		socket.broadcast.emit('replacePoint', pointData);
	});

	socket.on('removePoint', function () {
		socket.broadcast.emit('removePoint');
	});

	socket.on('sendMessage', function (data) {
		if (data.msg === '#reset') {
			io.sockets.emit('system.reset');
		} else {
			socket.broadcast.emit('sendMessage', data);
		}
	});

	socket.on('disconnect', function () {
		var target = users[socket.id];

		socket.broadcast.emit('leaveUser', socket.id);
		if (target) {
			delete users[socket.id];
		}
	});

	socket.emit('connected');
});

setInterval(function() {
	var anyUserId = getAnyUser();
	if (anyUserId) {
		io.sockets.socket(anyUserId).emit('replacePoint');
	}
}, timerDuration);

function getAnyUser() {
	var user;

	for (user in users) {
		break;
	}

	return user;
}


