const AsyncSeriesWaterfallHook = require('./AsyncSeriesWaterfallHook.js');

const hook = new AsyncSeriesWaterfallHook(['passenger']);

hook.tapAsync('Fly to Beijing', (passenger, callback) => {
    console.log(`${passenger} is on the way to Beijing...`);

    callback(null, 2000);
})

hook.tapPromise('Fly to Tokyo', (time) => {
    console.log(`Take off to Tokyo after ${time} ms.`);

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(1000);
        }, time);
    });
})

hook.tapAsync('Fly to Shanghai', (time, callback) => {
    console.log(`Take off to Shanghai after ${time} ms.`);

    setTimeout(callback, time);
})

hook.callAsync('VJ', () => { console.log('Hook has been Done!') });

