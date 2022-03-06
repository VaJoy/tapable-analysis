const SyncHook = require('./SyncHook.js');
const SyncBailHook = require('./SyncBailHook.js');
const HookMap = require('./HookMap.js');
const MultiHook = require('./lib/MultiHook');


const keyedHook = new HookMap(() => new SyncHook(["desc"]));

keyedHook.for("webpack").tap("Plugin-A", (desc) => { console.log("Plugin-A-phase-1", desc) });

// 配置拦截器，更换新的钩子类型
keyedHook.intercept({
    factory: (key) => {
        console.log(`[intercept] New hook: ${key}.`)
        return new SyncBailHook(["desc"]);
    }
});

// 已有名为 webpack 的钩子，拦截器不会影响，它依旧是 SyncHook 钩子
keyedHook.for("webpack").tap("Plugin-A", (desc) => {
    console.log("Plugin-A-phase-2", desc);
    return true;
});

keyedHook.for("webpack").tap("Plugin-B", (desc) => {
    console.log("Plugin-B", desc);
});

// 新的钩子，类型为拦截器替换掉的 SyncBailHook
keyedHook.for("babel").tap("Plugin-C", (desc) => {
    console.log("Plugin-C-phase-1", desc);
    return true;
});

keyedHook.for("babel").tap("Plugin-C", (desc) => {
    console.log("Plugin-C-phase-2", desc);
});

function getHook(hookName) {
    return keyedHook.get(hookName);
}

function callHook(hookName, desc) {
    const hook = getHook(hookName);
    if (hook !== undefined) {
        const call = hook.call || hook.callAsync;
        call.bind(hook)(desc);
    }
}

callHook('webpack', "It's on Webpack plugins processing");
callHook('babel', "It's on Webpack plugins processing");

module.exports.getHook = getHook;
module.exports.callHook = callHook;




/**** Demo of MutiHook ****/ 

// const hook1 = new SyncHook(["contry", "city", "people"]);
// const hook2 = new SyncBailHook(["contry", "city", "people"]);
// const hooks = new MultiHook([hook1, hook2]);

// hooks.tap('multiHook-event', (contry, city, people) => {
//     console.log('multiHook-event-1:', contry, city, people);
//     return true;
// })

// hooks.tap('multiHook-event', (contry, city, people) => {
//     console.log('multiHook-event-2:', contry, city, people);
//     return true;
// })

// hook1.call('China', 'Shenzhen', 'VJ');
// hook2.call('USA', 'NYC', 'Joey');
