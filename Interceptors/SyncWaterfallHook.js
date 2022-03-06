"use strict";

const Hook = require("./Hook");
const HookCodeFactory = require("./HookCodeFactory");

class SyncWaterfallHookCodeFactory extends HookCodeFactory {
	content({ onResult }) {
		return this.callTapsSeries({
			onResult: (i, result, next) => {  // 修改点
				let code = "";
				code += `if(${result} !== undefined) {\n`;
				code += `${this._args[0]} = ${result};\n`;
				code += `}\n`;
				code += next();
				return code;
			},
			onDone: () => onResult(this._args[0]),  // 修改点
		});
	}
}

const factory = new SyncWaterfallHookCodeFactory();

const COMPILE = function(options) {
	factory.setup(this, options);
	return factory.create(options);
};

function SyncWaterfallHook(args = [], name = undefined) {
	const hook = new Hook(args, name);
	hook.constructor = SyncWaterfallHook;
	hook.compile = COMPILE;
	return hook;
}

SyncWaterfallHook.prototype = null;

module.exports = SyncWaterfallHook;
