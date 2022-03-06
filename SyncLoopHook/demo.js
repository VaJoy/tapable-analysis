const SyncLoopHook = require('./SyncLoopHook.js');

// 初始化钩子
const hook = new SyncLoopHook([]);

let count = 1;

// 订阅事件
hook.tap('event-1', () => {
    console.log('event-1')
})

hook.tap('event-2', () => {
    console.log('event-2, count:', count);
    if (count++ !== 3) {
        return true;
    }
})

hook.tap('event-3', () => {
    console.log('event-3');
})

// 执行订阅回调
hook.call()