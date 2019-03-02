const Util = require('./util');
const Board = require('./board');

b = Board.board(5, 5, {
    body: [{ x:2, y:2 }, { x:2, y:2 }]
})

console.log(Board.str(b));


Board.forward(b, [[2, 1, 1]]);

console.log(Board.str(b));

Board.forward(b, [[2, 0, 1]]);

console.log(Board.str(b));

Board.forward(b, [[3, 0, 0.5], [1, 0, 0.5]]);

console.log(Board.str(b));

Board.backward(b);

console.log(Board.str(b));

Board.backward(b);

console.log(Board.str(b));

Board.backward(b);

console.log(Board.str(b));