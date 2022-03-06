const SyncHook = require('./SyncHook.js');

// 初始化钩子
const hook = new SyncHook(["contry", "city", "people"]);

// 注册事件
hook.tap('event-1', (contry, city, people) => {
    console.log('event-1:', contry, city, people)
})

hook.tap('event-2', (contry, city, people) => {
    console.log('event-2:', contry, city, people)
})
// 执行事件
hook.call('China', 'Shenzhen', 'VJ')

hook.tap('event-3', (contry, city, people) => {
    console.log('event-3:', contry, city, people)
})

hook.tap('event-4', (contry, city, people) => {
    console.log('event-4:', contry, city, people)
})

// 执行订阅回调
hook.call('USA', 'NYC', 'Trump')