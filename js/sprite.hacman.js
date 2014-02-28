HAC.define('Hacman',[
    'utils',
    'Const'
], function(utils, Const) {
    var Hacman;

    Hacman = enchant.Class.create(enchant.Sprite, {
        initialize: function(options){
            enchant.Sprite.call(this, 32, 32);

            this.game = options.game;
            this.map = options.map;

            this.speed = 8;
            this.x = this.width;
            this.y = this.height;
            this.image = this.game.assets[Const.assets['chara0']];
            this.frame = 0;
        },
        move: function(){
            //console.log(this.map.hitTest(this.x, this.y))
            if (this.game.input.left && this.map.hitTest(this.x-this.speed, this.y)) {
                this.x -= this.speed;
            } else if (this.game.input.right && this.map.hitTest(this.x+this.width+this.speed/2, this.y)) {
                this.x += this.speed;
            }
            if (this.game.input.up && this.y && this.map.hitTest(this.x, this.y-this.speed)) {
                this.y -= this.speed;
            } else if (this.game.input.down && this.map.hitTest(this.x, this.y+this.height+this.speed/2)) {
                this.y += this.speed;
            }
        }
    });

    return Hacman;
});