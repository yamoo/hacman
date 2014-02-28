(function() {
	var module,
		define,
		main;

	module = function(dependences, callback) {
		var i,
			modules;

		modules = [];

		for (i=0; i<dependences.length; i++) {
			modules.push(HAC[dependences[i]]);
		}

		return callback.apply(null, modules);
	};

	define = function(name, dependences, callback) {
		HAC[name] = module(dependences, callback);
	};

	main = function(dependences, callback) {
		module(dependences, callback);
	};

	window.HAC = {
		define: define,
		main: main
	};
})();