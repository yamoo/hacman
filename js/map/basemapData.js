HAC.define('BaseMapData',[
    'Const'
], function(Const) {
    var ascii,
        mapping;

    ascii = [
        '┌----------------------┐',
        '|                      |',
        '| ┌----┐ ┌----┐ ┌----┐ |',
        '| |xxxx| |xxxx| |xxxx| |',
        '| └----┘ └----┘ └----┘ |',
        '|                      |',
        '| ┌----┐ ┌----┐ ┌----┐ |',
        '| |xxxx| |xxxx| |xxxx| |',
        '| └----┘ └----┘ └----┘ |',
        '|                      |',
        '└----------------------┘'
    ];

    mapping = {
        ' ': {frame: 0, hit: 1},
        'x': {frame: 0, hit: 1},
        '┌': {frame: 1, hit: 0},
        '┐': {frame: 2, hit: 0},
        '└': {frame: 3, hit: 0},
        '┘': {frame: 4, hit: 0},
        '-': {frame: 5, hit: 0},
        '|': {frame: 6, hit: 0}
    };

    return {
        ascii: ascii,
        mapping: mapping
    };
});