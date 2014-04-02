var io,
    utils,
    itemList,
    users,
    items,
    observers,
    maxItemNum = 10,
    hacmanId,
    timerDuration = 2000;

itemList = [{
    class: 'Point',
    frame: 0,
    abilities: {
        hacman: true,
        sick: false
    }
}, {
    class: 'Kick',
    frame: 1,
    abilities: {
        kick: true,
        sick: false
    }
}, {
    class: 'Dash',
    frame: 2,
    abilities: {
        speed: 16,
        sick: false
    }
}, {
    class: 'Devil',
    frame: 3,
    abilities: {
        speed: 2,
        hacman: false,
        sick: true
    }
}, {
    class: 'Drug',
    frame: 4,
    abilities: {
        sick: false
    }
}];
users = {};
observers = {};
items = {};

utils = require('./js/common/utils');
io = require('socket.io').listen(3000);

io.sockets.on('connection', function (socket) {

    socket.on('entry', function(userData) {
        var newUser;

        newUser = {
            id: socket.id,
            name: userData.name,
            charaId: userData.charaId,
            score: 0,
            message: '',
            item: {},
            x: userData.x,
            y: userData.y
        };

        users[newUser.id] = newUser;

        socket.emit('accepted', {
            me: newUser,
            users: users,
            items: items,
            hacmanId: hacmanId
        });

        socket.broadcast.emit('joinUser', newUser);
    });

    socket.on('updateUser', function (userData) {
        var target = users[userData.id];

        if (target) {
            utils.update(target.x, userData.x, function(val) {
                target.x = val;
            });
            utils.update(target.y, userData.y, function(val) {
                target.y = val;
            });
            utils.update(target.score, userData.score, function(val) {
                target.score = val;
            });
            utils.update(target.message, userData.message, function(val) {
                target.message = val;
            });

            if (!utils.isEmpty(userData.item)) {
                target.item = utils.extend(target.item, userData.item);

                if (target.item.hacman) {
                    if (hacmanId && users[hacmanId]) {
                        users[hacmanId].item.hacman = false;
                        socket.broadcast.emit('updateUser', users[hacmanId]);
                    }
                    hacmanId = target.id;
                }
            }
        }

        socket.broadcast.emit('updateUser', userData);
    });

    socket.on('loseUser', function (data) {
        socket.broadcast.emit('loseUser', data);
        observers[data.userId] = users[data.userId];
        delete users[data.userId];
    });

    socket.on('createItem', function (itemData) {
        items[itemData.id] = itemData;
        socket.broadcast.emit('createItem', itemData);
    });

    socket.on('removeItem', function (itemId) {
        socket.broadcast.emit('removeItem', itemId);
        delete items[itemId];
    });

    socket.on('sendMessage', function (data) {
        if (data.msg === '#reset') {
            io.sockets.emit('system.reset');
        } else {
            socket.broadcast.emit('sendMessage', data);
        }
    });

    socket.on('disconnect', function () {
        var target = users[socket.id],
            observer = observers[socket.id];

        socket.broadcast.emit('leaveUser', socket.id);

        if (target) {
            delete users[socket.id];
        }

        if (observer) {
            delete observers[socket.id];
        }

        if (socket.id === hacmanId) {
            hacmanId = null;
        }
    });

    socket.emit('connected');
});

setInterval(function() {
    var anyUserId = getAnyUser();

    if ((utils.length(items) < maxItemNum) && anyUserId) {
        io.sockets.socket(anyUserId).emit('createItem', getRandomItem());
    }
}, timerDuration);

function getRandomItem() {
    var item = itemList[Math.floor(Math.random() * itemList.length)];

    item.id = getUniqueId('item');
    return item;
}

function getUniqueId(prefix) {
    return (prefix || '') + new Date().getTime();
}

function getAnyUser() {
    var user;

    for (user in users) {
        break;
    }

    return user;
}


