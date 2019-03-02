let records = {};
let stack = [];

const ON = false;

const start = (name) => {
    stack.push([name, Date.now()]);
};

const stop = (name) => {
    const [n, start] = stack.pop();
    if (n !== name) {
        console.log(n);
        console.log(name);
        throw 'Profiler unbalanced!';
    }
    if (!records[name]) {
        records[name] = [];
    }
    records[name].push(Date.now() - start);
};

const dump = () => {
    if (stack.length > 0) {
        throw 'Stack not empty when profiler dumped!';
    }
    const table = {};
    for (const name in records) {
        const record = records[name];
        const total = record.reduce((a, b) => a + b);
        table[name] = {
            'average   (ms)' : total / record.length,
            'total     (ms)' : total,
            'count      (#)' : record.length,
        }
    };
    records = {};
    stack = [];
    console.table(table);
};

const wrap = (fn, name) => {
    if (!ON) {
        return fn;
    }
    return (...args) => {
        start(name || fn.name);
        const result = fn(...args);
        stop(name || fn.name);
        return result;
    };
};

const wrapdump = (fn, name) => {
    if (!ON) {
        return fn;
    }
    return (...args) => {
        start(name || fn.name);
        const result = fn(...args);
        stop(name || fn.name);
        dump();
        return result;
    };
};

module.exports = {
    start, 
    stop, 
    dump,
    wrap,
    wrapdump,
}