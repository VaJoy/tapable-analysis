"use strict";

const Hook = require("./Hook");
const HookCodeFactory = require("./HookCodeFactory");

class AsyncSeriesHookCodeFactory extends HookCodeFactory {
	content({ onDone, onError }) {  // 新增 onError
		return this.callTapsSeries({
			// 新增 onError，处理异步回调中的错误
			onError: (i, err, next, doneBreak) => onError(err) + doneBreak(true),
			onDone
		});
	}
}

const factory = new AsyncSeriesHookCodeFactory();

const COMPILE = function(options) {
	factory.setup(this, options);
	return factory.create(options);
};

function AsyncSeriesHook(args = [], name = undefined) {
	const hook = new Hook(args, name);
	hook.constructor = AsyncSeriesHook;
	hook.compile = COMPILE;
	// AsyncSeriesHookCodeFactory 没有 call 方法
	hook._call = undefined;
	hook.call = undefined;
	return hook;
}

AsyncSeriesHook.prototype = null;

module.exports = AsyncSeriesHook;
