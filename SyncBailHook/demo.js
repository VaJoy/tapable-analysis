const SyncBailHook = require('./SyncBailHook.js');

// 初始化钩子
const hook = new SyncBailHook(["contry", "city", "people"]);

// 订阅事件
hook.tap('event-1', (contry, city, people) => {
    console.log('event-1:', contry, city, people)
})

hook.tap('event-2', (contry, city, people) => {
    console.log('event-2:', contry, city, people);
    return null;  // 设置了返回值
})

// 因为 event-2 设置了返回值，所以后续的 event-3、event-4 都不会执行
hook.tap('event-3', (contry, city, people) => {
    console.log('event-3:', contry, city, people)
})

hook.tap('event-4', (contry, city, people) => {
    console.log('event-4:', contry, city, people)
})

// 执行订阅回调
hook.call('USA', 'NYC', 'Trump')