"use strict";

class HookCodeFactory {
	constructor(config) {
		this.config = config;
		this.options = undefined;
		this._args = undefined;
	}

	create(options) {
		this.init(options);
		let fn;
		switch (this.options.type) {
			case "sync":
				fn = new Function(
					this.args(),
					'"use strict";\n' +
					this.header() +
					this.content({
						onDone: () => "",
						onResult: result => `return ${result};\n`,
					})
				);
				break;
			// 新增 async 类型处理(hook.callAsync)
			case "async":
				fn = new Function(
					this.args({
						after: "_callback"
					}),
					'"use strict";\n' +
					this.header() +
					this.content({
						onError: err => `_callback(${err});\n`,
						onResult: result => `_callback(null, ${result});\n`,
						onDone: () => "_callback();\n"
					})
				);
				break;
		}
		this.deinit();
		return fn;
	}

	setup(instance, options) {
		instance._x = options.taps.map(t => t.fn);
	}

	init(options) {
		this.options = options;
		this._args = options.args.slice();
	}

	deinit() {
		this.options = undefined;
		this._args = undefined;
	}

	header() {
		let code = "";
		code += "var _x = this._x;\n";
		return code;
	}

	callTap(tapIndex, { onError, onDone, onResult }) {  // 新增 onError
		let code = "";
		code += `var _fn${tapIndex} = ${this.getTapFn(tapIndex)};\n`;
		const tap = this.options.taps[tapIndex];
		switch (tap.type) {
			case "sync":
				if (onResult) {
					code += `var _result${tapIndex} = _fn${tapIndex}(${this.args()});\n`;
				} else {
					code += `_fn${tapIndex}(${this.args()});\n`;
				}

				if (onResult) {
					code += onResult(`_result${tapIndex}`);
				}

				if (onDone) {
					code += onDone();
				}
				break;
			// 新增 async 类型处理（通过 hook.tapAsync 订阅的回调模板处理）
			case "async":
				let cbCode = "";
				cbCode += `(function(_err${tapIndex}) {\n`;
				cbCode += `if(_err${tapIndex}) {\n`;
				cbCode += onError(`_err${tapIndex}`);
				cbCode += "} else {\n";
				if (onDone) {
					cbCode += onDone();
				}
				cbCode += "}\n";
				cbCode += "})";
				code += `_fn${tapIndex}(${this.args({
					after: cbCode
				})});\n`;
				break;
			// 新增 async 类型处理（通过 hook.tapPromise 订阅的回调模板处理）
			case "promise":
				code += `var _hasResult${tapIndex} = false;\n`;
				code += `var _promise${tapIndex} = _fn${tapIndex}(${this.args()});\n`;
				code += `if (!_promise${tapIndex} || !_promise${tapIndex}.then)\n`;
				code += `  throw new Error('Tap function (tapPromise) did not return promise (returned ' + _promise${tapIndex} + ')');\n`;
				code += `_promise${tapIndex}.then((function(_result${tapIndex}) {\n`;
				code += `_hasResult${tapIndex} = true;\n`;
				if (onDone) {
					code += onDone();
				}
				code += `}), function(_err${tapIndex}) {\n`;
				code += `if(_hasResult${tapIndex}) throw _err${tapIndex};\n`;
				code += onError(`_err${tapIndex}`);
				code += "});\n";
				break;
		}
		return code;
	}

	callTapsSeries({
		onDone,
		onError, // 新增 onError
		onResult
	}) {
		if (this.options.taps.length === 0) return onDone();
		let code = "";
		let current = onDone;
		const doneBreak = skipDone => {
			if (skipDone) return "";
			return onDone();
		};
		for (let j = this.options.taps.length - 1; j >= 0; j--) {
			const content = this.callTap(j, {
				onError: error => onError(j, error, current, doneBreak),  // 新增 onError
				onDone: !onResult && current,
				onResult:
					onResult &&
					(result => {
						return onResult(j, result, current, doneBreak);
					}),
			});
			current = () => content;
		}
		code += current();
		return code;
	}

	callTapsLooping({
		onDone,
	}) {
		if (this.options.taps.length === 0) return onDone();
		let code = "";
		code += "var _loop;\n";
		code += "do {\n";
		code += "_loop = false;\n";
		code += this.callTapsSeries({
			onResult: (i, result, next, doneBreak) => {
				let code = "";
				code += `if(${result} !== undefined) {\n`;
				code += "_loop = true;\n";
				code += (doneBreak && doneBreak(true)) || '';
				code += `} else {\n`;
				code += next();
				code += `}\n`;
				return code;
			},
			onDone,
		});
		code += "} while(_loop);\n";
		return code;
	}
	
	args({ before, after } = {}) {  // 新增 before, after 参数
		let allArgs = this._args;
		if (before) allArgs = [before].concat(allArgs);  // 新增
		if (after) allArgs = allArgs.concat(after);  // 新增
		if (allArgs.length === 0) {
			return "";
		} else {
			return allArgs.join(", ");
		}
	}

	getTapFn(idx) {
		return `_x[${idx}]`;
	}

	getTap(idx) {
		return `_taps[${idx}]`;
	}
}

module.exports = HookCodeFactory;
