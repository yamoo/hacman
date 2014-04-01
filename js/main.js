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

        gameMain.onLoadGame = function() {
            var initPos;
            initPos = gameMain.getRandomPos();

            server.entry({
                name: nickname,
                charaId: chara,
                x: initPos.x,
                y: initPos.y
            });
        };

        gameMain.onLeaveGame = function(hacmanName) {
            sendMessage('<b>' + nickname + '</b> was left.', 'leave');
        };

        gameMain.onGameOver = function(hacmanName) {
            sendMessage('I was killed by <b>' + hacmanName + '</b>...', 'gameover');
        };

        server.on('accepted', function(data) {
            gameMain.startGame();

            utils.$('#ui-signin').remove();
            utils.$('#ui-chat').style.display = 'block';
            utils.$('#ui-chat-send').addEventListener('click', _onSendMessage);

            sendMessage('<b>' + nickname + '</b> was joined.', 'join');
        });

        server.on('sendMessage', function(data) {
            addMessage(data);
        });

        if (nickname) {
            server.connect();
        } else {
            utils.message('Please enter your nickname');
        }
    }

    function _onSendMessage() {
        var msg,
            $input;

        $input = utils.$('#ui-chat-input');
        msg = $input.value;
        $input.value = '';

        sendMessage(msg);
    }

    function addMessage(data) {
        var temp,
            $item,
            $container;

        temp = utils.$('#ui-chat-item').innerHTML;
        $container = utils.$('#ui-chat-list');
        $item = document.createElement('div');
        $item.innerHTML = utils.template(temp, data);
        $container.insertBefore($item.children[0], $container.firstChild);
    }

    function sendMessage(msg, status) {
        var data;

        data = {
            user: {
                name: gameMain.me.name,
                charaId: gameMain.me.charaId
            },
            date: new Date().getHours() + ':' + new Date().getMinutes() + ':' + new Date().getSeconds(),
            msg: msg,
            status: status || ''
        };
        addMessage(data);
        server.sendMessage(data);
    }

});