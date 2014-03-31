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
            _this._initWorld.apply(_this);
            _this.onload();
        };
        _this.game.fps = 30;
        _this.game.scale = 1;
    };

    GameMain.prototype.onload = function() {
        //for override
    };

    GameMain.prototype._initWorld = function() {
        var _this = this;

        _this.usersArray = {};
        _this.rootScene = new Scene();
        _this.map = new BaseMap(_this.game);
        _this.users = new Group();

        _this.rootScene.addChild(_this.map);
        _this.rootScene.addChild(_this.users);
        _this.game.pushScene(_this.rootScene);
    };

    GameMain.prototype.loadGame = function() {
        this.game.debug();
    };

    GameMain.prototype.startGame = function() {
        this._main();
    };

    GameMain.prototype._main = function() {
        var _this = this;

        _this.me = _this._createUser(_this.server.data.me);

        //Init users
        utils.each(_this.server.data.users, function(userData) {
            var user;

            if (userData.id !== _this.server.data.me.id) {
                _this._createUser(userData);
            }
        });

        //Update users
        _this.users.addEventListener('enterframe', function() {
            var gotPoint;

            if (_this.me.move()) {
                gotPoint = (_this.point && _this.point.intersect(_this.me.chara)) ? true : false;
                _this.server.updateUser({
                    id: _this.server.data.me.id,
                    x: _this.me.x,
                    y: _this.me.y,
                    isHacman: gotPoint
                });
                if (gotPoint) {
                    _this.me.getHacman();
                    _this._removePoint();
                    _this.server.removePoint();
                }
            }
        });

        //The point was gotten by someone
        _this.server.on('removePoint', function(pointData) {
            _this._removePoint();
        });

        //The point repleced by timer
        _this.server.on('replacePoint', function(pointData) {
            _this._removePoint();
            _this._createPoint(pointData);
        });

        //The other user updated
        _this.server.on('updateUser', function(userData) {
            _this.usersArray[userData.id].x = userData.x || _this.usersArray[userData.id].x;
            _this.usersArray[userData.id].y = userData.y || _this.usersArray[userData.id].y;

            if (!_this.usersArray[userData.id].isHacman && userData.isHacman) {

                _this.usersArray[userData.id].getHacman();

                if (_this.hacmanId) {
                    _this.usersArray[_this.hacmanId].loseHacman();
                }
                _this.hacmanId = userData.id;
            }
        });

        //The other user joind
        _this.server.on('joinUser', function(userData) {
            _this._createUser(userData);
        });

        //The other user left
        _this.server.on('leaveUser', function(userId) {
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

        this.point = point;
        this.rootScene.addChild(this.point);

        return point;
    };

    GameMain.prototype._removePoint = function() {
        console.log(this.point)
        if (this.point) {
            this.point.remove();
        }
    };

    GameMain.prototype._createUser = function(userData) {
        var user,
            initPos;

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

    GameMain.prototype.getRandomPos = function() {
        var pos;

        pos = {x: 0, y: 0};

        while(1) {
            pos.x = Math.floor(Math.random()*(this.map.width/this.map.tileWidth))*this.map.tileWidth;
            pos.y = Math.floor(Math.random()*(this.map.height/this.map.tileHeight))*this.map.tileHeight;
            if (!this.map.hitTest(pos.x, pos.y)) {
                break;
            }
        }

        return pos;
    };

    return GameMain;
});