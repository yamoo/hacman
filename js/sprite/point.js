HAC.define('Point',[
    'utils',
    'Const'
], function(utils, Const) {
    var Point, settings;

    settings = {
        width: 32,
        height: 32
    };

    Point = enchant.Class.create(enchant.Sprite, {
        initialize: function(options){
            enchant.Sprite.call(this);

            this.game = options.game;
            this.map = options.map;

            this.width = settings.width;
            this.height = settings.height;
            this.x = options.x;
            this.y = options.y;

            this.image = this.game.assets[Const.assets['chara0']];
            this.frame = 0;
        }
    });

    return Point;
});