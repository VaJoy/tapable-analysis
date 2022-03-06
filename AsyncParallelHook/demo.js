const AsyncParallelHook = require('./AsyncParallelHook.js');

const hook = new AsyncParallelHook(['passenger']);

hook.tapAsync('Fly to Beijing', (passenger, callback) => {
    console.log(`${passenger} is on the way to Beijing...`);

    setTimeout(() => {
        console.log('[Beijing] Arrived');
        callback()
    }, 2000);
})

hook.tapPromise('Fly to Tokyo', (passenger) => {
    console.log(`${passenger} is on the way to Tokyo...`);

    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('[Tokyo] Arrived');
            resolve();
        }, 1000);
    });
})

hook.tapAsync('Fly to Shanghai', (passenger, callback) => {
    console.log(`${passenger} is on the way to Shanghai...`);
    callback()
})

hook.callAsync('VJ', () => { console.log('Hook has been Done!') });