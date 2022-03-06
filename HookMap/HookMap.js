"use strict";

const defaultFactory = (key, hook) => hook;

class HookMap {
	constructor(factory, name = undefined) {
		this._map = new Map();
		this.name = name;
		this._factory = factory;
		this._interceptors = [];
	}

	get(key) {
		return this._map.get(key);
	}

	for(key) {
		const hook = this.get(key);
		if (hook !== undefined) {
			return hook;
		}
		let newHook = this._factory(key);
		const interceptors = this._interceptors;
		for (let i = 0; i < interceptors.length; i++) {
			newHook = interceptors[i].factory(key, newHook);
		}
		this._map.set(key, newHook);
		return newHook;
	}

	intercept(interceptor) {
		this._interceptors.push(
			Object.assign(
				{
					factory: defaultFactory
				},
				interceptor
			)
		);
	}
}

module.exports = HookMap;