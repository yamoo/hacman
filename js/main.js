HAC.main([
    'utils',
    'Server',
    'GameMain'
], function(utils, Server, GameMain) {
    var server,
        game,
        $signin;

    server = new Server();
    server.on('accept', function(data) {
        game = new GameMain(server);
    });

    $signin = utils.$('#signin');
    $signin.addEventListener('submit', _onSubmit);

    function _onSubmit(e) {
        var nickname,
            chara;

        e.preventDefault();
        nickname = utils.$('#signin-nickname').value;
        chara = utils.$('[name="signin-chara[]"]:checked').value;

        if (nickname) {
            server.connect({
                name: nickname,
                charaId: chara
            });
        } else {
            utils.message('Please enter your nickname');
        }
    }

});