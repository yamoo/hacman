HAC.define('Server',[
    'Const',
    'utils'
], function(Const, utils) {
    var Server;

    Server = function() {
        this._init();
    };

    Server.prototype._init = function() {
        this.socket = null;
        this.data = null;
        this.events = {};
    };

    Server.prototype.connect = function() {
        var _this = this;

        if (window.io) {
            _this.socket = io.connect(Const.server);

            _this.socket.on('connected', function() {
                _this._onConnected();
            });

            _this.socket.on('accepted', function(data) {
                _this.data = data;
                _this._onAccepted(data);
            });
        }

        return _this.socket;
    };

    Server.prototype.entry = function(options) {
        this.socket.emit('entry', options);
    };

    Server.prototype._onConnected = function(options) {
        this.trigger('connected');
    };

    Server.prototype._onAccepted = function(data) {
        var _this = this;

        _this.socket.on('joinUser', function (userData) {
            _this.trigger('joinUser', userData);
        });

        _this.socket.on('leaveUser', function (userId) {
            _this.trigger('leaveUser', userId);
        });

        _this.socket.on('updateUser', function (userData) {
            _this.trigger('updateUser', userData);
        });

        _this.socket.on('replacePoint', function (pointData) {
            if (!pointData) {
                pointData = _this.gameMain.getRandomPos();
                _this.socket.emit('replacePoint', pointData);
            }
            _this.trigger('replacePoint', pointData);
        });

        _this.socket.on('removePoint', function () {
            _this.trigger('removePoint');
        });

        _this.trigger('accepted', data);
    };

    Server.prototype.removePoint = function() {
        this.socket.emit('removePoint');
    };

    Server.prototype.updateUser = function(data) {
        this.socket.emit('updateUser', data);
    };

    Server.prototype.on = function(eventName, handler) {
        if (this.events[eventName]) {
            this.events[eventName].push(handler);
        } else {
            this.events[eventName] = [handler];
        }
    };

    Server.prototype.trigger = function(eventName, args) {
        var _this = this;

        utils.each(_this.events[eventName], function(handler) {
            handler.apply(_this, [args]);
        });
    };

    return Server;
});