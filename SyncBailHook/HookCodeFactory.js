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

	callTap(tapIndex, { onDone, onResult }) {
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

		}
		return code;
	}

	callTapsSeries({
		onDone,
		onResult // 新增
	}) {
		if (this.options.taps.length === 0) return onDone();
		let code = "";
		let current = onDone;
		for (let j = this.options.taps.length - 1; j >= 0; j--) {
			const i = j;
			const content = this.callTap(i, {
				onDone: !onResult && current,  // 如果存在 onResult 则设为 false
				// 新增 onResult 传参
				onResult:
					onResult &&
					(result => {
						return onResult(i, result, current);
					}),
			});
			current = () => content;
		}
		code += current();
		return code;
	}

	args() {
		let allArgs = this._args;
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
