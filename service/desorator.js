import { isObject } from "../utils";

export function Permission(value) {
	return function (target, key, descriptor) {
		if (!target.permission) {
			target.permission = {};
		}

		setTimeout(() => {
			target.permission[key] = (
				(target.namespace ? target.namespace + "/" : "") + value
			).replace(/\//g, ":");
		}, 0);

		return descriptor;
	};
}

export function Service(value) {
	return function (target) {
		// 命名
		if (typeof value == "string") {
			target.prototype.namespace = value;
		}

		// 复杂项
		if (isObject(value)) {
			const { proxy, namespace, url, mock } = value;
			const item = process.env.PROXY_LIST[proxy]

			if (!item) {
				console.error(`${proxy} 指向的地址不存在！`)
			}

			target.prototype.namespace = namespace;
			target.prototype.mock = mock;

			if (proxy) {
				target.prototype.proxy = proxy;
				target.prototype.url = url || item ? item.target : null;
			}
		}
	};
}
