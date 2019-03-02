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
    const options         = getOptions(board, head);

    /*
    if (options.length === FILL_LENGTH) {
        console.log('FILL');
        return Util.move(head, fillMove(board, food, ...options));
    }
    */

    console.log('STANDARD');

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

const foodWeight = Profile.wrap((food, [x, y]) => 
    Math.min(...food.map(p => Util.manhattan([x, y], p))), 'foodWeight');

module.exports = { move };