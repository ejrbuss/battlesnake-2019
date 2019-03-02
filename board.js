const Util = require('./util');

const board = (width, height, snake) => {
    const body = Util.points(snake.body);
    const board = {
        width, height, body,
        heads  : body.map(() => 1),
        tail   : 0,
        data   : new Float32Array(width * height),
    };
    return update(board, body);
};

const at = (board, x, y) =>
    board.data[x + y * board.width];

const set = (board, x, y, weight) =>
    board.data[x + y * board.width] = weight;

const add = (board, x, y, weight) =>
    board.data[x + y * board.width] += weight;

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

const zero = board => {
    for (let i = 0; i < board.data.length; i++) {
        board.data[i] = 0;
    }
};

const tailIndex = (board) => {
    let tail = board.tail;
    let index = -1;
    while (tail >= 0) {
        index += board.heads[tail];
        tail--;
    }
    return board.body.length - index - 1;
};

const forward = (board, moves) => {
    board.body = moves.concat(board.body);
    board.heads.push(moves.length); 
    const index = tailIndex(board);
    // const points = board.body.slice(0, index);
    const points = board.body;    
    update(board, points);
    board.tail++;
    return board;
};

const backward = (board) => {
    board.tail--;    
    const numHeads = board.heads.pop();
    board.body.splice(0, numHeads);
    const index = tailIndex(board);
    // const points = board.body.slice(0, index + 1);
    const points = board.body;
    return update(board, points);
};

const update = (board, points) => {
    zero(board);
    for (const [x, y, weight] of points) {
        add(board, x, y, weight);
    }
    return board;
}

module.exports = {
    board,
    str,
    at,
    forward,
    backward,
};