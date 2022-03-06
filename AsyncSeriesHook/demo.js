const AsyncSeriesHook = require('./AsyncSeriesHook.js');

// 初始化钩子
const hook = new AsyncSeriesHook(['passenger']);

// hook.tapAsync('Fly to Beijing', (passenger, callback) => {
//     console.log(`${passenger} is on the way to Beijing...`);

//     setTimeout(callback, 1000);
// })

// hook.tapAsync('Fly to Shanghai', (passenger, callback) => {
//     console.log(`${passenger} is on the way to Shanghai...`);

//     setTimeout(callback, 2000);
// })


hook.tapPromise('Fly to Tokyo', (passenger) => {
    console.log(`${passenger} is taking off to Tokyo...`);

    return new Promise((resolve) => {
        setTimeout(resolve, 1000);
    });
})

hook.tapPromise('Back to Shenzhen', (passenger) => {
    console.log(`${passenger} is now comming back to Shenzhen...`);

    return new Promise((resolve) => {
        setTimeout(resolve, 2000);
    });
})

// 执行订阅回调
hook.callAsync('VJ', () => { console.log('Done!') });

console.log('Starts here...');