HAC.define('utils',[
	'Const'
], function(Const) {
	var each,
		object2Array,
		readMap,
		message,
		bind,
		$;

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

	bind = function(scope) {
		var handlers = Array.prototype.slice.call(arguments, 1);

		each(handlers, function(handler) {
			var func = scope[handler];

			scope[handler] = function() {
				func.apply(scope, arguments);
			};
		});
	};

	$ = function(selector) {
		if (selector.charAt(0) === '#') {
			return document.getElementById(selector.slice(1));
		} else if (selector.charAt(0) === '.') {
			return document.getElementsByClassName(selector.slice(1));
		} else {
			return document.querySelector(selector);
		}
	};

	return {
		each: each,
		object2Array: object2Array,
		ascii2map: ascii2map,
		message: message,
		bind: bind,
		$: $
	};
});