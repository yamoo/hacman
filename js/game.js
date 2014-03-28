HAC.define('GameMain', [
    'Const',
    'utils',
    'BaseMap',
    'Hacman'
], function(Const, utils, BaseMap, Hacman) {
    var GameMain;

    GameMain = function(server) {
        enchant();

        this.server = server;
        this._init();
    };

    GameMain.prototype._init = function() {
        var _this = this;

        _this.game = new Game(Const.world.width, Const.world.height);
        _this.game.preload.apply(_this.game, utils.object2Array(Const.assets));
        _this.game.onload = function() {
            _this._main.apply(_this);
        };
        _this.game.fps = 30;
        _this.game.scale = 1;
        _this.game.start();
    };

    GameMain.prototype._main = function() {
        var _this = this;

        _this.usersArray = {};
        _this.rootScene = new Scene();
        _this.map = new BaseMap(_this.game);
        _this.users = new Group();

        _this.me = _this._createUser(_this.server.data.me);
        _this.rootScene.addChild(_this.map);
        _this.rootScene.addChild(_this.users);
        _this.game.pushScene(_this.rootScene);

        //Init users
        utils.each(_this.server.data.users, function(userData) {
            var user;

            if (userData.id !== _this.server.data.me.id) {
                _this._createUser(userData);
            }
        });

        //Update users
        _this.users.addEventListener('enterframe', function() {
            if (_this.me.move()) {
                _this.server.send({
                    id: _this.server.data.me.id,
                    x: _this.me.x,
                    y: _this.me.y
                });
            }
        });

        //The other user moved
        _this.server.on('move', function(userData) {
            _this.usersArray[userData.id].x = userData.x;
            _this.usersArray[userData.id].y = userData.y;
        });

        //The other user joind
        _this.server.on('join', function(userData) {
            _this._createUser(userData);
        });

        //The other user left
        _this.server.on('leave', function(userId) {
            _this._removeUser(userId);
        });
    };

    GameMain.prototype._createUser = function(userData) {
        var user;

        user = new Hacman({
            name: userData.name,
            charaId: userData.charaId,
            x: userData.x,
            y: userData.y,
            map: this.map,
            game: this.game
        });

        this.usersArray[userData.id] = user;
        this.users.addChild(user);

        return user;
    };

    GameMain.prototype._removeUser = function(userId) {
        var user;

        user = this._getUser(userId);
        this.users.removeChild(user);
    };

    GameMain.prototype._getUser = function(userId) {
        return this.usersArray[userId];
    };


    return GameMain;
});