const AsyncSeriesBailHook = require('./AsyncSeriesBailHook.js');

const hook1 = new AsyncSeriesBailHook(['passenger']);

hook1.tapAsync('Fly to Beijing', (passenger, callback) => {
    console.log(`${passenger} is on the way to Beijing...`);

    setTimeout(() => {
        callback(true);  // 设置了返回值
    }, 2000);
})

hook1.tapAsync('Fly to Shanghai', (passenger, callback) => {
    console.log(`${passenger} is on the way to Shanghai...`);

    setTimeout(callback, 2000);
})

hook1.callAsync('Jay', () => { console.log('Hook1 has been Done!') });

const hook2 = new AsyncSeriesBailHook(['passenger']);

hook2.tapPromise('Fly to Tokyo', (passenger) => {
    console.log(`${passenger} is taking off to Tokyo...`);

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);  // 设置了返回值
        }, 1000);
    });
})

hook2.tapPromise('Back to Shenzhen', (passenger) => {
    console.log(`${passenger} is now comming back to Shenzhen...`);

    return new Promise((resolve) => {
        setTimeout(resolve, 2000);
    });
})

hook2.callAsync('VJ', () => { console.log('Hook2 has been Done!') });

