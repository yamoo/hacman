HAC.main([
    'utils',
    'Server',
    'GameMain'
], function(utils, Server, GameMain) {
    var server, game, $signin;

    server = new Server();
    server.on('accept', function(data) {
        game = new GameMain(server);
    });

    $signin = document.getElementById('signin');
    $signin.addEventListener('submit', function(e) {
        var name = document.getElementById('signin-nickname').value;

        if (name) {
            server.connect({
                name: name,
                x: 32,
                y: 32
            });
        } else {
            utils.message('Please enter your nickname');
        }

        e.preventDefault();
    });

});