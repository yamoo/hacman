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

    Server.prototype.connect = function(options) {
        var _this = this;

        if (window.io) {
            _this.socket = io.connect(Const.server);
            _this.socket.on('confirm', function() {
                _this.socket.emit('entry', options);
            });
            _this.socket.on('accept', function(data) {
                _this.data = data;
                _this._onAccept();
            });
        }

        return _this.socket;
    };

    Server.prototype._onAccept = function() {
        var _this = this;

        _this.socket.on('join', function (userData) {
            _this.trigger('join', userData);
        });

        _this.socket.on('leave', function (userId) {
            _this.trigger('leave', userId);
        });

        _this.socket.on('move', function (userData) {
            _this.trigger('move', userData);
        });

        _this.trigger('accept', _this.data);
    };

    Server.prototype.send = function(data) {
        this.socket.emit('move', data);
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