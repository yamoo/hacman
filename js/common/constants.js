HAC.define('Const',[
], function() {

	return {
		//server: 'http://localhost:3000',
		server: 'http://VLB12-28:3000',
		storage: 'hacman_data_v0.1',

		world: {
			tile: 32,
			width: 24*32,
			height: 18*32
		},
		charactor: {
			length: 17
		},
		assets: {
			'chara0': 'img/chara0.png',
			'item0': 'img/item0.png',
			'map0': 'img/map0.png',
			'end': 'img/end.png'
		},
		message: {
			common: {
				time: '<%= hour %>:<%= minute %>:<%= second %>'
			},
			user: {
				lose: '<b><%= targetName %></b> was killed by <b><%= killerName %></b>.',
				leave: '<b><%= targetName %></b> was left.',
				join: '<b><%= targetName %></b> was joined.'
			},
			error: {
				ie: 'Sorry... I know you love IE, but unfortunately, we do not support IE. Please access via Chrome or Firefox.'
			}
		},
		link: {
			redirect: 'http://www.play.com/'
		}
	};
});