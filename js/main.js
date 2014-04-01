HAC.main([
    'Const',
    'utils',
    'Server',
    'GameMain'
], function(Const, utils, Server, GameMain) {
    var server,
        gameMain,
        $signin,
        $nickname;

    function _init () {
        var storage;

        if (_isIE()) {
            utils.message('Sorry... we do not support IE. Please access via Chrome or Firefox.');
        } else {
            $signin = utils.$('#signin');
            $nickname = utils.$('#signin-nickname');

            $signin.addEventListener('submit', _onSubmit);

            storage = _loadData();

            if (storage) {
                $nickname.value = storage.nickname;
                utils.$('[name="signin-chara[]"][value="'+storage.charaId+'"]').checked = true;
            }

            if (_checkQuery('mode=secret')) {
                utils.each(utils.$('.chara-hidden'), function($el) {
                    $el.style.visibility = 'visible';
                });
            }
        }
    }

    function _onSubmit(e) {
        var nickname,
            charaId;

        e.preventDefault();
        nickname = $nickname.value;
        charaId = utils.$('[name="signin-chara[]"]:checked').value;

        _saveData({
            nickname: nickname,
            charaId: charaId
        });

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
                charaId: charaId,
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

    function _loadData() {
        var data;

        data = localStorage.getItem(Const.storage);
        if (data) {
            return JSON.parse(data);
        }
    }

    function _saveData(data) {
        localStorage.setItem(Const.storage, JSON.stringify(data));
    }

    function _isIE() {
        var isIE;

        if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)) {
            isIE = true;
        }

        return isIE;
    }

    function _checkQuery(query) {
        var isQuery;

        if (new RegExp(query).test(location.search)) {
            isQuery = true;
        }

        return isQuery;
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

    _init();
});