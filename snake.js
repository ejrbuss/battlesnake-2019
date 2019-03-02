const Util = require('./util');
const Board = require('./board');
const Profile = require('./profile');

const MAX_DEPTH = 10000;
const SQUIRM_FACTOR = 250 / 5;

let start;

const squirming = () => 
    Date.now() - start > SQUIRM_FACTOR;

const move = Profile.wrapdump((state) => {
    let { width, height, food, snakes } = state.board;
    snakes = snakes.filter(({ id }) => id !== state.you.id);
    // represent all snakes as a single board with multiple heads,
    // fast update
    // Possibly: cachee snakes board based on depth, take advantage of low 
    // memory footprint
    const snakeBoards     = snakes.map(snake => 
        Board.board(width, height, Util.points(snake.body))
    );
    snakeBoards.forEach(b => {
        Board.forward(b, naiveNext(Util.first(b.body)));
    });
    const board           = Board.board(width, height, Util.points(state.you.body));
    const head            = Util.first(board.body);
    const options         = naiveNext(head);
    const weightedOptions = options.map(p => {
        start = Date.now();
        return [p[0], p[1], score(board, snakeBoards, p, 0)]
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

const score = Profile.wrap((board, snakeBoards, move, depth) => {
    if (depth > MAX_DEPTH || squirming()) {
        console.log(depth);
        return Infinity;
        // return depth;
    }

    if (!bounds(Board.merge([board, ...snakeBoards]), move)) {
        return depth;
    }
    const next = naiveNext(move);
    let highScore = depth;
    Board.forward(board, [move]);
    while (next.length > 0) {
        const point = next.pop();
        let newScore = score(board, snakeBoards, point, depth + 1);
        if (newScore > highScore) {
            highScore = newScore;
        }
        if (highScore >= MAX_DEPTH) {
            highScore = Infinity;
            break;
        }
    }
    Board.backward(board);
    return highScore;
}, 'score');

const limitOptions = options => {
    Util.sort(options, true);
    const bestWeight = options[0][2];
    return options.filter(([x, y, weight]) => weight === bestWeight);
}

const naiveNext = Profile.wrap(point => [
    Util.up(point), 
    Util.down(point), 
    Util.left(point), 
    Util.right(point),
], 'naiveNext');

const bounds = Profile.wrap((board, [x, y]) => {
    return (
        x >= 0 
        && y >= 0 
        && x < board.width 
        && y < board.height 
        && Board.at(board, x, y) < 1
    );
}, 'bounds');

const snakeFactor = Profile.wrap((board, snakeBoards, [x, y]) => {
    return (
        x >= 0 
        && y >= 0 
        && x < board.width 
        && y < board.height 
        && Board.at(board, x, y) == 0
        && Board.at(snakeBoardsMerged, x, y) == 0
    );
}, 'snakeFactor');

const foodWeight = Profile.wrap((food, [x, y]) => 
    Math.min(...food.map(p => Util.manhattan([x, y], p))), 'foodWeight');

module.exports = { move };