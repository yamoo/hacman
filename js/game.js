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
        this.usersArray = {};
        this.rootScene = new Scene();
        this.map = new BaseMap(_this.game);
        this.users = new Group();

        this.rootScene.addChild(_this.map);
        this.rootScene.addChild(_this.users);
        this.game.pushScene(_this.rootScene);
    };

    GameMain.prototype.loadGame = function() {
        this.game.debug();
    };

    GameMain.prototype.startGame = function() {
        this._main();
    };

    GameMain.prototype._main = function() {
        var _this = this;

        utils.bind(_this, '_onEnterFrame', '_removePoint', '_onReplacePoint', '_onJoinUser', '_onUpdateUser', '_onLeaveUser');

        _this.me = _this._createUser(_this.server.data.me);

        //Init users
        utils.each(_this.server.data.users, function(userData) {
            var user;

            if (userData.id !== _this.server.data.me.id) {
                _this._createUser(userData);
            }
        });

        //Update users
        _this.users.addEventListener('enterframe', _this._onEnterFrame);

        //The other user joind
        _this.server.on('joinUser', _this._onJoinUser);

        //The other user updated
        _this.server.on('updateUser', _this._onUpdateUser);

        //The other user left
        _this.server.on('leaveUser', _this._onLeaveUser);

        //The point was gotten by someone
        _this.server.on('removePoint', _this._onRemovePoint);

        //The point repleced by timer
        _this.server.on('replacePoint', _this._onReplacePoint);

    };

    GameMain.prototype._onEnterFrame = function() {
        var isGotPoint,
            isKilled;

        if (this.me.move()) {
            isGotPoint = (this.point && this.point.intersect(this.me.chara)) ? true : false;
            isKilled = this;

            if (isGotPoint) {
                this.me.getHacman();
                this._removePoint();
                this.server.removePoint();
            }

            this.server.updateUser({
                id: this.server.data.me.id,
                x: this.me.x,
                y: this.me.y,
                isHacman: isGotPoint
            });
        }
    };

    GameMain.prototype._onReplacePoint = function(pointData) {
        this._removePoint();
        this._createPoint(pointData);
    };

    GameMain.prototype._onJoinUser = function(userData) {
        this._createUser(userData);
    };

    GameMain.prototype._onUpdateUser = function(userData) {
        this.usersArray[userData.id].x = userData.x || this.usersArray[userData.id].x;
        this.usersArray[userData.id].y = userData.y || this.usersArray[userData.id].y;

        if (!this.usersArray[userData.id].isHacman && userData.isHacman) {

            this.usersArray[userData.id].getHacman();

            if (this.hacmanId) {
                this.usersArray[this.hacmanId].loseHacman();
            }
            this.hacmanId = userData.id;
        }
    };

    GameMain.prototype._onLeaveUser = function(userData) {
        this._removeUser(userId);
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