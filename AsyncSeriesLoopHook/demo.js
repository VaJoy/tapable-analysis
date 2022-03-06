const AsyncSeriesLoopHook = require('./AsyncSeriesLoopHook.js');

const hook = new AsyncSeriesLoopHook([]);

let count = 1;

hook.tapAsync('event-1', (callback) => {
    console.log('event-1 starts...');
    setTimeout(() => {
        console.log('event-1 done');
        callback()
    }, 500);
})

hook.tapPromise('event-2', () => {
    return new Promise((resolve) => {
        console.log('event-2 starts...');
        setTimeout(() => {
            console.log('event-2 done, count:', count);
            if (count++ !== 3) {
                resolve(true)
            } else {
                resolve()
            }
        }, 1000);
    });
})

hook.tapAsync('event-3', (callback) => {
    console.log('event-3 starts...');
    setTimeout(() => {
        console.log('event-3 done');
        callback()
    }, 2000);
})

hook.callAsync(() => { console.log('Hook has been Done!') });