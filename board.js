const Util = require('./util');
const Profile = require('./profile');

const board = Profile.wrap((width, height, body) => {
    const board = {
        width, height, body,
        heads  : body.map(() => 1),
        tail   : 0,
        data   : new Float32Array(width * height),
    };
    return update(board, body);
}, 'board');

const mergeTwo = (board1, board2) =>
    board(board1.width, board1.height,  board1.body.concat(board2.body));

const merge = (boards) => {
    return boards.reduce((merged, board) => mergeTwo(merged, board));
};

const at = Profile.wrap((board, x, y) =>
    board.data[x + y * board.width], 'at');

const set = Profile.wrap((board, x, y, weight) =>
    board.data[x + y * board.width] = weight, 'set');

const add = Profile.wrap((board, x, y, weight) =>
    board.data[x + y * board.width] += weight, 'add');

const str = board => {
    let str = '';
    for (let y = 0; y < board.height; y++) {
        for (let x = 0; x < board.width; x++) {
            str += at(board, x, y).toFixed(1) + ' ';
        }
        str += '\n';
    }
    return str;
};

const zero = Profile.wrap(board => {
    for (let i = 0; i < board.data.length; i++) {
        board.data[i] = 0;
    }
}, 'zero');

const tailIndex = Profile.wrap((board) => {
    let tail = board.tail;
    let index = -1;
    while (tail >= 0) {
        index += board.heads[tail];
        tail--;
    }
    return board.body.length - index - 1;
}, 'tailIndex');

const forward = Profile.wrap((board, moves) => {
    board.body = moves.concat(board.body);
    board.heads.push(moves.length); 
    const index = tailIndex(board);
    // const points = board.body.slice(0, index);
    const points = board.body;    
    update(board, points);
    board.tail++;
    return board;
}, 'forward');

const backward = Profile.wrap((board) => {
    board.tail--;    
    const numHeads = board.heads.pop();
    board.body.splice(0, numHeads);
    const index = tailIndex(board);
    // const points = board.body.slice(0, index + 1);
    const points = board.body;
    return update(board, points);
}, 'backward');

const update = Profile.wrap((board, points) => {
    zero(board);
    for (const [x, y, weight] of points) {
        add(board, x, y, weight || 1);
    }
    return board;
}, 'update');

module.exports = {
    board,
    str,
    merge,
    at,
    forward,
    backward,
};