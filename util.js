const first = iter =>
    iter[0];

const last = iter =>
    iter[iter.length - 1];

const shuffle = iter => {
    for (let i = iter.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [iter[i], iter[j]] = [iter[j], iter[i]];
    }
    return iter;
}

const points = iter =>
    iter.map(({ x, y }) =>
        [x, y, 1]);

const x = ([x]) => 
    x;

const y = ([x, y]) =>
    y;

const up = ([x, y]) => 
    [x, y - 1];

const down = ([x, y]) => 
    [x, y + 1];

const left = ([x, y]) => 
    [x - 1, y];

const right = ([x, y]) => 
    [x + 1, y];

const weight = ([x, y, weight]) =>
    weight;

const manhattan = ([x1, y1], [x2, y2]) => {
    if (x1 > x2) {
        if (y1 > y2) {
            return x1 - x2 + y1 - y2;
        } else {
            return x1 - x2 + y2 - y1;
        }
    } else {
        if (y1 > y2) {
            return x2 - x1 + y1 - y2;
        } else {
            return x2 - x1 + y2 - y1;
        }
    }
};

const sort = (points, descending) => {
    if (descending) {
        return points.sort((p1, p2) => weight(p2) - weight(p1));
    } else {
        return points.sort((p1, p2) => weight(p1) - weight(p2));
    }
};

const move = ([x1, y1], [x2, y2]) => {
    if (x1 != x2) {
        if (x1 > x2) {
            return { move: 'left' };
        } else {
            return { move: 'right' };
        }
    } else {
        if (y1 > y2) {
            return { move: 'up' };
        } else {
            return { move: 'down' };
        }
    }
};

const equal = ([x1, y1], [x2, y2]) =>
    x1 === x2 && y1 === y2;

module.exports = {
    first,
    last,
    shuffle,
    points,
    x,
    y,
    up,
    down,
    left, 
    right,
    weight,
    manhattan,
    sort,
    move,
    equal,
};