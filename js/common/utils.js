HAC.define('utils',[
	'Const'
], function(Const) {
	var each,
		object2Array,
		readMap,
		message;

	each = function(arg, callback) {
		var i;

		if (arg instanceof Object) {
			for (i in arg) {
				callback.apply(arg[i], [arg[i], i]);
			}
		} else {
			for (i=0;i<arg.length;i++) {
				callback.apply(arg[i], [arg[i], i]);
			}
		}
	};

	object2Array = function(object) {
		var key, array;

		array = [];

		each(object, function(val) {
			array.push(val);
		});

		return array;
	};

	ascii2map = function(map) {
		var mapArray,
			colMapArray;

		mapArray = [];
		colMapArray = [];

		each(map.ascii, function(line) {
			var lineMapArray,
				lineColMapArray;

			lineMapArray = [];
			lineColMapArray = [];

			each(line, function(chara) {
				var mapping;

				mapping = map.mapping[chara];
				lineMapArray.push(mapping.frame);
				lineColMapArray.push(mapping.hit);
			});

			mapArray.push(lineMapArray);
			colMapArray.push(lineColMapArray);
		});


		return {
			map: mapArray,
			colMap: colMapArray
		};
	};

	message = function(msg) {
		alert(msg);
	};

	return {
		each: each,
		object2Array: object2Array,
		ascii2map: ascii2map,
		message: message
	};
});