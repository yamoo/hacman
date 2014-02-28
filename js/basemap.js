HAC.define('BaseMap',[
	'Const',
	'utils',
	'MapData'
], function(Const, utils, MapData) {
    var Hacman;

    BaseMap = enchant.Class.create(enchant.Map, {
        initialize: function(game){
			var mapdata;

            enchant.Map.call(this, Const.world.tile, Const.world.tile);

            mapdata = utils.ascii2map(MapData);
			this.image = game.assets[Const.assets['map0']];
			this.loadData(mapdata.map);
			this.collisionData = mapdata.colMap;
        }
    });

    return BaseMap;
});