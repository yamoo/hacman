HAC.define('GameMain', [
    'Const',
    'utils',
    'BaseMap',
    'Hacman',
    'Point'
], function(Const, utils, BaseMap, Hacman, Point) {
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

        _this.server.gameMain = _this;
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
            var intersect;

            if (_this.me.move()) {
                intersect = (_this.point && _this.point.intersect(_this.me.chara)) ? true : false
                _this.server.update({
                    id: _this.server.data.me.id,
                    x: _this.me.x,
                    y: _this.me.y,
                    isHacman: intersect
                });
                if (intersect) {
                    if (_this.point) {
                        _this.point.remove();
                    }
                }
            }
        });

        //The other user moved
        _this.server.on('replacePoint', function(pointData) {
            if (_this.point) {
                _this.point.remove();
            }
            _this.point = _this._createPoint(pointData);
            _this.rootScene.addChild(_this.point);
        });

        //The other user updated
        _this.server.on('update', function(userData) {
            _this.usersArray[userData.id].x = userData.x || _this.usersArray[userData.id].x;
            _this.usersArray[userData.id].y = userData.y || _this.usersArray[userData.id].y;
            if (userData.isHacman) {
                _this.usersArray[userData.id].getHacman(userData.isHacman)
                if (hacmanId) {
                    _this.usersArray[hacmanId].getHacman(false);
                }
                hacmanId = userData.id;
                if (_this.point) {
                    _this.point.remove();
                }
            }
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

    GameMain.prototype._createPoint = function(pointData) {
        var point;

        point = new Point({
            x: pointData.x,
            y: pointData.y,
            game: this.game
        });

        return point;
    };

    GameMain.prototype._createUser = function(userData) {
        var user,
            initPos;

        initPos = this._getRandomPos();

        user = new Hacman({
            name: userData.name,
            charaId: userData.charaId,
            x: initPos.x,
            y: initPos.y,
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

    GameMain.prototype._getRandomPos = function() {
        var pos; 

        pos = {x: 0, y: 0};

        while(1) {
            pos.x = Math.floor(Math.random()*(this.map.width/this.map.tileWidth));
            pos.y = Math.floor(Math.random()*(this.map.height/this.map.tileHeight));

            if (!this.map.hitTest(pos.x, pos.y)) {
                pos.x = (pos.x) * this.map.tileWidth;
                pos.y = (pos.y) * this.map.tileHeight;
                break;
            }
        }

        return pos;
    };

    return GameMain;
});