HAC.define('Hacman',[
    'utils',
    'Const'
], function(utils, Const) {
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

            this.speed = 8;
            this.x = options.x || settings.width;
            this.y = options.y || settings.height;

            this.chara = new Sprite(settings.width, settings.height);
            this.chara.image = this.game.assets[Const.assets['chara0']];
            this.chara.frame = options.charaId;

            this.label = new Label();
            this.label.text = options.name;
            this.label.color = '#fff';
            this.label.x = this.chara.width;

            this.addChild(this.chara);
            this.addChild(this.label);

        },

        move: function(){
            var isMoved = false;

            if (this.game.input.left && this.map.hitTest(this.x-this.speed, this.y)) {
                this.x -= this.speed;
                isMoved = true;
            } else if (this.game.input.right && this.map.hitTest(this.x+this.chara.width+this.speed/2, this.y)) {
                this.x += this.speed;
                isMoved = true;
            }
            if (this.game.input.up && this.y && this.map.hitTest(this.x, this.y-this.speed)) {
                this.y -= this.speed;
                isMoved = true;
            } else if (this.game.input.down && this.map.hitTest(this.x, this.y+this.chara.height+this.speed/2)) {
                this.y += this.speed;
                isMoved = true;
            }

            return isMoved;
        },

        getHacman: function(flag) {
            this.isHacman = flag
        }
    }); 

    return Hacman;
});