HAC.main([
    'utils',
    'Server',
    'GameMain'
], function(utils, Server, GameMain) {
    var server,
        gameMain,
        $signin;

    $signin = utils.$('#signin');
    $signin.addEventListener('submit', _onSubmit);

    function _onSubmit(e) {
        var nickname,
            chara;

        e.preventDefault();
        nickname = utils.$('#signin-nickname').value;
        chara = utils.$('[name="signin-chara[]"]:checked').value;

        server = new Server();
        gameMain = new GameMain(server);
        server.gameMain = gameMain;

        server.on('connected', function(data) {
            gameMain.loadGame();
        });

        gameMain.onload = function() {
            var initPos;
            initPos = gameMain.getRandomPos();

            server.entry({
                name: nickname,
                charaId: chara,
                x: initPos.x,
                y: initPos.y
            });
        };

        server.on('accepted', function(data) {
            gameMain.startGame();
        });

        if (nickname) {
            server.connect();
        } else {
            utils.message('Please enter your nickname');
        }
    }

});