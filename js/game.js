HAC.define('GameMain', [
    'Const',
    'utils',
    'BaseMap',
    'Hacman',
    'Point',
    'End'
], function(Const, utils, BaseMap, Hacman, Point, End) {
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
            _this.onLoadGame();
        };
        _this.game.fps = 30;
        _this.game.scale = 1;
    };

    GameMain.prototype._initWorld = function() {
        this.usersArray = {};
        this.rootScene = new Scene();
        this.map = new BaseMap(this.game);
        this.users = new Group();

        this.rootScene.addChild(this.map);
        this.rootScene.addChild(this.users);
        this.game.pushScene(this.rootScene);
    };

    GameMain.prototype._main = function() {
        var _this = this;

        utils.bind(_this, '_onKeyPress', '_onEnterFrame', '_onJoinUser', '_onUpdateUser', '_onLoseUser', '_onLeaveUser', '_onRemovePoint', '_onReplacePoint');

        _this.hacmanId = _this.server.data.hacmanId;
        _this.me = _this._onJoinUser(_this.server.data.me);
        _this.me.server = _this.server;
        _this.me.label.color = '#ff0';

        //Init users
console.log(_this.server.data.users)
        utils.each(_this.server.data.users, function(userData) {
            var user;

            if (userData.id !== _this.server.data.me.id) {
                _this._createUser(userData);
            }
        });

        document.addEventListener('keypress', _this._onKeyPress);

        //Update my chara
        _this.me.addEventListener('enterframe', _this._onEnterFrame);

        //The other user joind
        _this.server.on('joinUser', _this._onJoinUser);

        //The other user updated
        _this.server.on('updateUser', _this._onUpdateUser);

        //The other user lose
        _this.server.on('loseUser', _this._onLoseUser);

        //The other user left
        _this.server.on('leaveUser', _this._onLeaveUser);

        //The point was gotten by someone
        _this.server.on('removePoint', _this._onRemovePoint);

        //The point repleced by timer
        _this.server.on('replacePoint', _this._onReplacePoint);

    };

    GameMain.prototype._onKeyPress = function(e) {
        var chr = String.fromCharCode(e.which);

        this.me.setMessage(chr);
    };

    GameMain.prototype._onEnterFrame = function() {
        var hacmanUser,
            isGotPoint,
            isKilled;

        hacmanUser = this.usersArray[this.hacmanId];
        isKilled = (this.hacmanId && hacmanUser && (this.hacmanId !== this.me.id) && hacmanUser.chara.intersect(this.me.chara)) ? true : false;

        if (isKilled) {
            this.server.updateUser({
                id: this.hacmanId,
                score: hacmanUser.score+1
            });
            hacmanUser.setScore(hacmanUser.score+1);
            this._gameOver();
        } else {
            if (this.me.move()) {
                isGotPoint = (this.point && this.point.intersect(this.me.chara)) ? true : false;

                if (isGotPoint) {
                    this._removePoint();
                    this.server.removePoint();

                    if (this.hacmanId && this.usersArray[this.hacmanId]) {
                        this.usersArray[this.hacmanId].loseHacman();
                    }
                    this.me.getHacman();
                    this.hacmanId = this.me.id;
                }

                this.server.updateUser({
                    id: this.me.id,
                    x: this.me.x,
                    y: this.me.y,
                    isHacman: this.me.isHacman
                });
            }
        }
    };

    GameMain.prototype._onRemovePoint = function() {
        this._removePoint();
    };

    GameMain.prototype._onReplacePoint = function(pointData) {
        this._removePoint();
        this._createPoint(pointData);
    };

    GameMain.prototype._onJoinUser = function(userData) {
        var user;

        user = this._createUser(userData);
        this.showMessage('<b>' + userData.name + '</b> was joined.', 'join');

        return user;
    };

    GameMain.prototype._onUpdateUser = function(userData) {
        var target = this.usersArray[userData.id];

        target.x = userData.x || target.x;
        target.y = userData.y || target.y;

        if (userData.score && target.score !== userData.score) {
            target.setScore(userData.score);
        }

        if (userData.message && target.message !== userData.message) {
            target.setComment(userData.message);
        }

        if (!target.isHacman && userData.isHacman) {
            if (this.hacmanId && this.usersArray[this.hacmanId]) {
                this.usersArray[this.hacmanId].loseHacman();
            }

            target.getHacman();
            this.hacmanId = userData.id;
        }
    };

    GameMain.prototype._onLoseUser = function(data) {
        var target = this.usersArray[data.userId],
            killer = this.usersArray[data.killerId] || {name: 'unknown'};

        if (target) {
            this.showMessage('<b>' + target.name + '</b> was killed by <b>' + killer.name +'</b>.', 'killed');
        }
        this._removeUser(data.userId);
    };

    GameMain.prototype._onLeaveUser = function(userId) {
        var target = this.usersArray[userId];

        this.showMessage('<b>' + target.name + '</b> was left.', 'leave');
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
            id: userData.id,
            name: userData.name,
            charaId: userData.charaId,
            score: userData.score || 0,
            isHacman: userData.isHacman || false,
            message: userData.message || '',
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
        if (user) {
            this.users.removeChild(user);
            delete this.usersArray[userId];
        }
    };

    GameMain.prototype._getUser = function(userId) {
        return this.usersArray[userId];
    };

    GameMain.prototype._gameOver = function() {
        var data = {
            userId: this.me.id,
            killerId: this.hacmanId
        };

        this.me.dead();
        this.me.removeEventListener('enterframe');
        this.server.loseUser(data);
        this._onLoseUser(data);
        this.rootScene.addChild(new End({
            game: this.game
        }));
    };

    GameMain.prototype.loadGame = function() {
        this.game.start();
    };

    GameMain.prototype.onLoadGame = function() {
        //for override
    };

    GameMain.prototype.startGame = function() {
        this._main();
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

    GameMain.prototype.showMessage = function() {
        //for override
    };

    return GameMain;
});