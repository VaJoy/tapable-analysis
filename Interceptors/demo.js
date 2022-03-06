const AsyncSeriesLoopHook = require('./AsyncSeriesLoopHook.js');
const hook = new AsyncSeriesLoopHook(['name', 'country']);

hook.intercept({
    // 订阅前触发
    register: (options) => {
        console.log(`[register-intercept] ${options.name} is going registering...`);
        // 修改订阅者信息
        if (options.name === 'event-1') {
            const oldFn = options.fn;
            options.fn = (...args) => {
                args[1] = 'USA';
                oldFn(...args);
            }
        }

        return options;  // 订阅者的信息会变成修改后的
    },
    // call 方法调用时触发
    call(...args) {
        console.log('[call-intercept]', args);
    },
    // 调用订阅事件回调前触发
    tap(options) {
        console.log('[tap-intercept]', options);
    },
    loop(...args) {
        console.log('[loop-intercept]', args);
    },
    done() {
        console.log('[done-intercept] Last interceptor.')
    }
});

let count = 1;

hook.tapAsync('event-1', (name, country, callback) => {
    console.log(`event-1 starts..., the country of ${name} is ${country}.`);
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
            if (count++ !== 2) {
                resolve(true)
            } else {
                resolve()
            }
        }, 1000);
    });
})

hook.tapAsync('event-3', (name, country, callback) => {
    console.log('event-3 starts...');
    setTimeout(() => {
        console.log('event-3 done');
        callback()
    }, 2000);
})

hook.callAsync('Trump', 'China', () => { console.log('Hook has been done!'); });


