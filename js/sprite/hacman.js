HAC.define('Hacman',[
    'utils',
    'Const',
    'Comment'
], function(utils, Const, Comment) {
    var Hacman, settings;

    settings = {
        width: 32,
        height: 32
    };

    Hacman = enchant.Class.create(enchant.Group, {
        initialize: function(options){
            enchant.Group.call(this);

            this.game = options.game;
            this.map = options.map;

            this.id = options.id;
            this.name = options.name;
            this.x = options.x || 0;
            this.y = options.y || 0;
            this.charaId = options.charaId;
            this.score = options.score || 0;
            this.isHacman = options.isHacman || false;
            this.speed = 8;

            this.message = options.message || '';
            this.messageTimer = null;
            this.messageTimerDuration = 1000;

            this.hacmanFace = new Sprite(settings.width, settings.height);
            this.hacmanFace.image = this.game.assets[Const.assets['chara0']];
            this.hacmanFace.frame = 0;

            this.chara = new Sprite(settings.width, settings.height);
            this.chara.image = this.game.assets[Const.assets['chara0']];
            this.chara.frame = options.charaId;

            this.label = new Label();
            this.label.font = '14px sans-serif';
            this.label.x = this.chara.width;
            this.label.color = options.color || '#fff';

            this.comment = new Comment();
            this.comment.setText(this.message);
            this.comment.x = settings.width/2;
            this.comment.y = this.chara.height + 0;

            if (!this.isHacman) {
                this.hacmanFace.visible = false;
            }

            this.addChild(this.hacmanFace);
            this.addChild(this.chara);
            this.addChild(this.label);
            this.addChild(this.comment);
            this.setLabel();
        },

        move: function(){
            var isMoved = false;

            if (this.game.input.left && !this.map.hitTest(this.x-this.speed, this.y)) {
                this.x -= this.speed;
                isMoved = true;
            } else if (this.game.input.right && !this.map.hitTest(this.x+this.chara.width+this.speed/2, this.y)) {
                this.x += this.speed;
                isMoved = true;
            }
            if (this.game.input.up && this.y && !this.map.hitTest(this.x, this.y-this.speed)) {
                this.y -= this.speed;
                isMoved = true;
            } else if (this.game.input.down && !this.map.hitTest(this.x, this.y+this.chara.height+this.speed/2)) {
                this.y += this.speed;
                isMoved = true;
            }

            return isMoved;
        },

        setLabel: function() {
            this.label.text = this.name + ' (' + this.score + ')';
        },

        setScore: function(score) {
            this.score = score;
            this.setLabel();
        },

        getHacman: function() {
            this.isHacman = true;
            this.hacmanFace.visible = true;
        },

        loseHacman: function() {
            this.isHacman = false;
            this.hacmanFace.visible = false;
        },

        setMessage: function(msg) {
            var _this = this;

            _this.message += msg;
            this.setComment();

            clearTimeout(this.messageTimer);
            this.messageTimer = setTimeout(function() {
                _this.server.updateUser({
                    id: _this.id,
                    message: _this.message
                });
                _this.message = '';
            }, this.messageTimerDuration);
        },

        setComment: function(msg) {
            this.comment.setText(msg || this.message);
        },

        dead: function() {
            this.remove();
        }
    });

    return Hacman;
});