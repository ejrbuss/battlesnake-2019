const Util = require('./util');
const Board = require('./board');
const Profile = require('./profile');

const MAX_DEPTH = 100;
const SQUIRM_FACTOR = 250 / 4;

let start;

const squirming = () => 
    Date.now() - start > SQUIRM_FACTOR;

const move = Profile.wrapdump((state) => {
    let { width, height, food } = state.board;
    const board           = Board.board(width, height, state.you);
    const head            = Util.first(board.body);
    const options         = naiveNext(head);
    const weightedOptions = options.map(p => {
        start = Date.now();
        return [p[0], p[1], score(board, p, 0)]
    });
    console.log(weightedOptions);
    const limitedOptions = limitOptions(weightedOptions);
    const foodWeightedOptions = limitedOptions.map(p =>
        [p[0], p[1], foodWeight(Util.points(food), p)]
    );
    Util.sort(foodWeightedOptions);
    const move = Util.move(head, foodWeightedOptions[0]);
    return move;
}, 'move');

const score = (board, move, depth) => {
    if (depth > MAX_DEPTH || squirming()) {
        console.log(depth);
        return Infinity;
        // return depth;
    }
    if (!bounds(board, move)) {
        return depth;
    }
    const next = naiveNext(move);
    let highScore = depth;
    Board.forward(board, [move]);
    while (next.length > 0) {
        const point = next.pop();
        let newScore = score(board, point, depth + 1);
        if (newScore > highScore) {
            highScore = newScore;
        }
        if (highScore >= MAX_DEPTH) {
            break;
        }
    }
    Board.backward(board);
    return highScore;
};

const limitOptions = options => {
    Util.sort(options, true);
    const bestWeight = options[0][2];
    return options.filter(([x, y, weight]) => weight === bestWeight);
}

const naiveNext = point => [
    Util.up(point), 
    Util.down(point), 
    Util.left(point), 
    Util.right(point),
];

const bounds = (board, [x, y]) =>
    (      x >= 0 
        && y >= 0 
        && x < board.width 
        && y < board.height 
        && Board.at(board, x, y) == 0
    );


const foodWeight = (food, [x, y]) => 
    Math.min(...food.map(p => Util.manhattan([x, y], p)));

module.exports = { move };