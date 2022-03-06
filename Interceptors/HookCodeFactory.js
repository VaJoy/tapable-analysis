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
					this.contentWithInterceptors({  // 修改
						onDone: () => "",
						onResult: result => `return ${result};\n`,
					})
				);
				break;
			case "async":
				fn = new Function(
					this.args({
						after: "_callback"
					}),
					'"use strict";\n' +
					this.header() +
					this.contentWithInterceptors({  // 修改
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

	header() {
		let code = "";
		code += "var _x = this._x;\n";
		if (this.options.interceptors.length > 0) {  // 新增
			code += "var _taps = this.taps;\n";
			code += "var _interceptors = this.interceptors;\n";
		}
		return code;
	}

	// 新增
	contentWithInterceptors(options) {
		if (this.options.interceptors.length > 0) {
			const onError = options.onError;
			const onResult = options.onResult;
			const onDone = options.onDone;
			let code = "";
			for (let i = 0; i < this.options.interceptors.length; i++) {
				const interceptor = this.options.interceptors[i];
				if (interceptor.call) {
					code += `${this.getInterceptor(i)}.call(${this.args()});\n`;
				}
			}
			code += this.content(
				Object.assign(options, {
					onError:
						onError &&
						(err => {
							let code = "";
							for (let i = 0; i < this.options.interceptors.length; i++) {
								const interceptor = this.options.interceptors[i];
								if (interceptor.error) {
									code += `${this.getInterceptor(i)}.error(${err});\n`;
								}
							}
							code += onError(err);
							return code;
						}),
					onResult,
					onDone:
						onDone &&
						(() => {
							let code = "";
							for (let i = 0; i < this.options.interceptors.length; i++) {
								const interceptor = this.options.interceptors[i];
								if (interceptor.done) {
									code += `${this.getInterceptor(i)}.done();\n`;
								}
							}
							code += onDone();
							return code;
						})
				})
			);
			return code;
		} else {
			return this.content(options);
		}
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

	callTap(tapIndex, { onError, onDone, onResult }) {
		let code = "";
		let hasTapCached = false;  // 新增
		for (let i = 0; i < this.options.interceptors.length; i++) {  // 新增
			const interceptor = this.options.interceptors[i];
			if (interceptor.tap) {
				if (!hasTapCached) {
					code += `var _tap${tapIndex} = ${this.getTap(tapIndex)};\n`;
					hasTapCached = true;
				}
				code += `${this.getInterceptor(i)}.tap(_tap${tapIndex});\n`;
			}
		}
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
			case "async":
				let cbCode = "";
				if (onResult)
					cbCode += `(function(_err${tapIndex}, _result${tapIndex}) {\n`;
				else cbCode += `(function(_err${tapIndex}) {\n`;
				cbCode += `if(_err${tapIndex}) {\n`;
				cbCode += onError(`_err${tapIndex}`);
				cbCode += "} else {\n";
				if (onResult) {
					cbCode += onResult(`_result${tapIndex}`);
				}
				if (onDone) {
					cbCode += onDone();
				}
				cbCode += "}\n";
				cbCode += "})";
				code += `_fn${tapIndex}(${this.args({
					after: cbCode
				})});\n`;
				break;
			case "promise":
				code += `var _hasResult${tapIndex} = false;\n`;
				code += `var _promise${tapIndex} = _fn${tapIndex}(${this.args()});\n`;
				code += `if (!_promise${tapIndex} || !_promise${tapIndex}.then)\n`;
				code += `  throw new Error('Tap function (tapPromise) did not return promise (returned ' + _promise${tapIndex} + ')');\n`;
				code += `_promise${tapIndex}.then((function(_result${tapIndex}) {\n`;
				code += `_hasResult${tapIndex} = true;\n`;
				if (onResult) {
					code += onResult(`_result${tapIndex}`);
				}
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
		onError,
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
				onError: error => onError(j, error, current, doneBreak),
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

	callTapsLooping({ onError, onDone }) {
		if (this.options.taps.length === 0) return onDone();
		const syncOnly = this.options.taps.every(t => t.type === "sync"); 
		let code = "";
		if (!syncOnly) {
			code += "var _looper = (function() {\n";
			code += "var _loopAsync = false;\n";
		}
		code += "var _loop;\n";
		code += "do {\n";
		code += "_loop = false;\n";
		for (let i = 0; i < this.options.interceptors.length; i++) {  // 新增
			const interceptor = this.options.interceptors[i];
			if (interceptor.loop) {
				code += `${this.getInterceptor(i)}.loop(${this.args()});\n`;
			}
		}
		code += this.callTapsSeries({
			onError,
			onResult: (i, result, next, doneBreak) => {
				let code = "";
				code += `if(${result} !== undefined) {\n`;
				code += "_loop = true;\n";
				if (!syncOnly) code += "if(_loopAsync) _looper();\n";
				code += doneBreak(true);
				code += `} else {\n`;
				code += next();
				code += `}\n`;
				return code;
			},
			onDone
		});
		code += "} while(_loop);\n";
		if (!syncOnly) {
			code += "_loopAsync = true;\n";
			code += "});\n";
			code += "_looper();\n";
		}
		return code;
	}

	callTapsParallel({
		onError,
		onResult,
		onDone,
		onTap = (i, run) => run()
	}) {
		if (this.options.taps.length <= 1) {
			return this.callTapsSeries({
				onError,
				onResult,
				onDone,
			});
		}
		let code = "";
		code += "do {\n";
		code += `var _counter = ${this.options.taps.length};\n`;
		if (onDone) {
			code += "var _done = (function() {\n";
			code += onDone();
			code += "});\n";
		}
		for (let i = 0; i < this.options.taps.length; i++) {
			const done = () => {
				if (onDone) return "if(--_counter === 0) _done();\n";
				else return "--_counter;";
			};
			const doneBreak = skipDone => {
				if (skipDone || !onDone) return "_counter = 0;\n";
				else return "_counter = 0;\n_done();\n";
			};
			code += "if(_counter <= 0) break;\n";
			code += onTap(
				i,
				() =>
					this.callTap(i, {
						onError: error => {
							let code = "";
							code += "if(_counter > 0) {\n";
							code += onError(i, error, done, doneBreak);
							code += "}\n";
							return code;
						},
						onResult:
							onResult &&
							(result => {
								let code = "";
								code += "if(_counter > 0) {\n";
								code += onResult(i, result, done, doneBreak);
								code += "}\n";
								return code;
							}),
						onDone:
							!onResult &&
							(() => {
								return done();
							})
					}),
				done,
				doneBreak
			);
		}
		code += "} while(false);\n";
		return code;
	}
	
	args({ before, after } = {}) {
		let allArgs = this._args;
		if (before) allArgs = [before].concat(allArgs);
		if (after) allArgs = allArgs.concat(after);
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

	getInterceptor(idx) {  // 新增
		return `_interceptors[${idx}]`;
	}
}

module.exports = HookCodeFactory;
