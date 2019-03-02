const Util = require('./util');
const Board = require('./board');
const Profile = require('./profile');

// const MAX_DEPTH       = 10;
const MAX_DEPTH       = 19 * 19;
const SQUIRM_FACTOR   = 125 / 5;
const FOOD_FACTOR     = 100;
const STARVING_FACTOR = 3;

let start;

const squirming = () => 
    Date.now() - start > SQUIRM_FACTOR;

const move = Profile.wrapdump((state) => {
    snakeBoardCache = {};
    let { width, height, food, snakes } = state.board;
    snakes = snakes.filter(({ id }) => id !== state.you.id);
    const snakeBoard = getSnakesBoard(width, height, snakes);
    const board      = Board.board(width, height, Util.points(state.you.body));
    const head       = Util.first(board.body);
    const options    = getOptions(Board.merge([board, snakeBoard]), head, width, height);

    if (options.length === 0) {
        const lastDitchOptions = getLastDitchOptions(board, head);
        console.log('Last ditch effort!');
        if (lastDitchOptions.length === 0) {
            throw 'I Die!';
        }
        return Util.move(head, lastDitchOptions[0]);
    }

    const weightedOptions = options.map(p => { 
        start = Date.now();
        return [p[0], p[1], score(board, snakeBoard, p, 0)]
    });
    // console.log(weightedOptions);
    const limitedOptions = limitOptions(weightedOptions);

    // If we are not hungry yet, return a random move from limitedOptions.
    // If Real=lly hungry go for food no matter what
    if (state.you.health < STARVING_FACTOR) {

    }
    // if (state.you.health >= FOOD_FACTOR * snakes.length) {
    //   return Util.move(head, Util.first(Util.shuffle(limitedOptions)));
    // }
    
    const foodWeightedOptions = limitedOptions.map(p =>
        [p[0], p[1], foodWeight(Util.points(food), p)]
    );
    Util.sort(foodWeightedOptions);
    // console.log(foodWeightedOptions);
    const move = Util.move(head, foodWeightedOptions[0]);
    return move;
}, 'move');

const score = Profile.wrap((board, snakeBoard, move, depth) => {
    if (depth >= MAX_DEPTH || squirming()) {
        console.log('depth', depth);
        return Infinity;
        // return depth;
    }

    if (!bounds(board, move)) {
        return depth;
    }
    // console.log('move', move);
    // console.log('board', Board.at(getSnakeBoardAtDepth(snakeBoard, depth), ...move));
    // console.log(Board.str(getSnakeBoardAtDepth(snakeBoard, depth)));
    if (Board.at(getSnakeBoardAtDepth(snakeBoard, depth), ...move) > 0) {
        return depth;
    }
    const next = getOptions(board, move);
    let highScore = depth;
    Board.forward(board, [move]);
    while (next.length > 0) {
        const point = next.pop();
        let newScore = score(board, snakeBoard, point, depth + 1);
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

let snakeBoardCache = {};

const getSnakeBoardAtDepth = Profile.wrap((board, depth) => {
    if (snakeBoardCache[depth]) {
        return snakeBoardCache[depth];
    }
    if (depth === 0) {
        forwardSnakesBoard(board);
        snakeBoardCache[0] = board; 
        return board;
    }
    const next = Board.copy(snakeBoardCache[depth - 1]);
    forwardSnakesBoard(next);
    snakeBoardCache[depth] = next;
    return next;
}, 'getSnakeBoardAtDepth');

const getSnakesBoard = Profile.wrap((width, height, snakes) => {
    const heads = [];
    const snakeBoards = snakes.map(snake => {
        const body = Util.points(snake.body);
        heads.push(body.shift());
        return Board.board(width, height, body);
    });
    let snakeBoard = Board.merge(snakeBoards, width, height);
    Board.forward(snakeBoard, heads);
    // snakeBoard.tail = 0;
    // forwardSnakesBoard(snakeBoard);
    return snakeBoard;
}, 'getSnakesBoard');

const forwardSnakesBoard = Profile.wrap(board => {
    const heads = Board.heads(board);
    const moves = heads.flatMap(head => getOptions(board, head));
    Board.forward(board, moves);
}, 'forwardSnakesBoard');

/*
const fillMove = Profile.wrap((board, food, point1, point2) => {
    let count1 = 0;
    const board1 = Board.copy(board);
    Board.set(board1, point1, 1);
    let queue;
    queue = [point1];
    while (queue.length > 0) {
        count1++;
        const p = queue.pop();
        // Board.forward(board1, []);
        naiveNext(p).forEach(neighbor => {
            if (bounds(board1, neighbor)) {
                Board.set(board1, Util.x(neighbor), Util.y(neighbor), 1);
                queue.push(neighbor)
            }
        });
    }
    console.log('point1 fill done.', count1);
    let count2 = 0;
    const board2 = Board.copy(board);
    Board.set(board2, point2, 1);
    queue = [point2];
    while (queue.length > 0) {
        count2++;
        const p = queue.pop();
        // Board.forward(board2, []);
        naiveNext(p).forEach(neighbor => {
            if (bounds(board2, neighbor)) {
                Board.set(board2, Util.x(neighbor), Util.y(neighbor), 1);
                queue.push(neighbor)
            }
        });
    }
    console.log('point2 fill done.', count2);
    if (count1 > count2) {
        console.log('returning point1.');
        return point1;
    }
    if (count2 > count1) {
        console.log('returning point2');
        return point2;
    }
    if (count1 == count2) {
        console.log('food weighting:');
        const foodWeightedOptions = [point1, point2].map(p =>
            [p[0], p[1], foodWeight(Util.points(food), p)]
        );
        Util.sort(foodWeightedOptions);
        console.log(foodWeightedOptions);
        return foodWeightedOptions[0];
    }
    throw 'Waaah!';
});
*/

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

const getOptions = Profile.wrap((board, head) => {
    return naiveNext(head).filter(p => bounds(board, p));
}, 'getOptions');

const getLastDitchOptions = Profile.wrap((board, head) => {
    return naiveNext(head).filter(p => bounds(board, p) || Util.equal(p, Util.last(board.body)));
}, 'getOptions');

const foodWeight = Profile.wrap((food, [x, y]) => 
    Math.min(...food.map(p => Util.manhattan([x, y], p))), 'foodWeight');

module.exports = { move };