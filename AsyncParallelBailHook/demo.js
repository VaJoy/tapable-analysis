const AsyncParallelBailHook = require('./AsyncParallelBailHook.js');

const hook = new AsyncParallelBailHook(['passenger']);

hook.tapAsync('Fly to Beijing', (passenger, callback) => {
    console.log(`${passenger} is on the way to Beijing...`);

    setTimeout(() => {
        console.log('[Beijing] Arrived');
        callback(null, true)
    }, 500);
})

hook.tapPromise('Fly to Tokyo', (passenger) => {
    console.log(`${passenger} is on the way to Tokyo...`);

    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('[Tokyo] Arrived');
            resolve(true);
        }, 2000);
    });
})

hook.tapAsync('Fly to Shanghai', (passenger, callback) => {
    console.log(`${passenger} is on the way to Shanghai...`);
    setTimeout(() => {
        console.log('[Shanghai] Arrived');
        callback()
    }, 1000);
})

hook.callAsync('VJ', () => { console.log('Hook has been Done!') });



