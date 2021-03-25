import { routerMode } from "@/config/env";
import storage from "./storage";

export function getUrlParam(name) {
	let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
	let r = window.location.search.substr(1).match(reg);
	if (r != null) return decodeURIComponent(r[2]);
	return null;
}

export function isPc() {
	const userAgentInfo = navigator.userAgent;
	const Agents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"];
	let flag = true;
	for (let v = 0; v < Agents.length; v++) {
		if (userAgentInfo.indexOf(Agents[v]) > 0) {
			flag = false;
			break;
		}
	}
	return flag;
}

export function getBrowser() {
	const { clientHeight, clientWidth } = document.documentElement;

	// 浏览器信息
	const ua = navigator.userAgent.toLowerCase();

	// 浏览器类型
	let type = (ua.match(/firefox|chrome|safari|opera/g) || "other")[0];

	if ((ua.match(/msie|trident/g) || [])[0]) {
		type = "msie";
	}

	// 平台标签
	let tag = "";

	const isTocuh =
		"ontouchstart" in window || ua.indexOf("touch") !== -1 || ua.indexOf("mobile") !== -1;
	if (isTocuh) {
		if (ua.indexOf("ipad") !== -1) {
			tag = "pad";
		} else if (ua.indexOf("mobile") !== -1) {
			tag = "mobile";
		} else if (ua.indexOf("android") !== -1) {
			tag = "androidPad";
		} else {
			tag = "pc";
		}
	} else {
		tag = "pc";
	}

	// 浏览器内核
	let prefix = "";

	switch (type) {
		case "chrome":
		case "safari":
		case "mobile":
			prefix = "webkit";
			break;
		case "msie":
			prefix = "ms";
			break;
		case "firefox":
			prefix = "Moz";
			break;
		case "opera":
			prefix = "O";
			break;
		default:
			prefix = "webkit";
			break;
	}

	// 操作平台
	const plat = ua.indexOf("android") > 0 ? "android" : navigator.platform.toLowerCase();

	// 屏幕信息
	let screen = "full";

	if (clientWidth < 768) {
		screen = "xs";
	} else if (clientWidth < 992) {
		screen = "sm";
	} else if (clientWidth < 1200) {
		screen = "md";
	} else if (clientWidth < 1920) {
		screen = "xl";
	} else {
		screen = "full";
	}

	// 是否 ios
	const isIOS = !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);

	// 浏览器版本
	const version = (ua.match(/[\s\S]+(?:rv|it|ra|ie)[\/: ]([\d.]+)/) || [])[1];

	// 是否 PC 端
	const isPC = tag === "pc";

	// 是否移动端
	const isMobile = isPC ? false : true;

	// 是否移动端 + 屏幕宽过小
	const isMini = screen === "xs" || isMobile;

	return {
		height: clientHeight,
		width: clientWidth,
		version,
		type,
		plat,
		tag,
		prefix,
		isMobile,
		isIOS,
		isPC,
		isMini,
		screen
	};
}

export function href(path, newWindow) {
	const { origin, pathname } = window.location;

	if (pathname == path) {
		return false;
	}

	let url = "";

	if (routerMode == "history") {
		url = origin + process.env.BASE_URL + path;
	} else {
		url = href.substring(0, href.indexOf("#"));
	}

	if (newWindow) {
		window.open(url);
	} else {
		window.location.href = url;
	}
}

export function orderBy(list, key) {
	return list.sort((a, b) => a[key] - b[key]);
}

export function deepTree(list) {
	let newList = [];
	let map = {};

	list.forEach((e) => (map[e.id] = e));

	list.forEach((e) => {
		let parent = map[e.parentId];

		if (parent) {
			(parent.children || (parent.children = [])).push(e);
		} else {
			newList.push(e);
		}
	});

	const fn = (list) => {
		list.map((e) => {
			if (e.children instanceof Array) {
				e.children = orderBy(e.children, "orderNum");

				fn(e.children);
			}
		});
	};

	fn(newList);

	return orderBy(newList, "orderNum");
}

export function revDeepTree(list = []) {
	let d = [];
	let id = 0;

	const deep = (list, parentId) => {
		list.forEach((e) => {
			if (!e.id) {
				e.id = id++;
			}

			e.parentId = parentId;

			d.push(e);

			if (e.children && isArray(e.children)) {
				deep(e.children, e.id);
			}
		});
	};

	deep(list || [], null);

	return d;
}

export function debounce(fn, delay) {
	let timer = null;

	return function () {
		let args = arguments;
		let context = this;

		if (timer) {
			clearTimeout(timer);

			timer = setTimeout(function () {
				fn.apply(context, args);
			}, delay);
		} else {
			timer = setTimeout(function () {
				fn.apply(context, args);
			}, delay);
		}
	};
}

export function isArray(value) {
	if (typeof Array.isArray === "function") {
		return Array.isArray(value);
	} else {
		return Object.prototype.toString.call(value) === "[object Array]";
	}
}

export function isObject(value) {
	return Object.prototype.toString.call(value) === "[object Object]";
}

export function isNumber(value) {
	return !isNaN(Number(value));
}

export function isFunction(value) {
	return typeof value == "function";
}

export function isString(value) {
	return typeof value == "string";
}

export function isEmpty(value) {
	if (isArray(value)) {
		return value.length === 0;
	}

	if (isObject(value)) {
		return Object.keys(value).length === 0;
	}

	return value === "" || value === undefined || value === null;
}

export function isBoolean(value) {
	return typeof value === "boolean";
}

export function last(data) {
	if (isArray(data) || isString(data)) {
		return data[data.length - 1];
	}
}

export function cloneDeep(obj) {
	let d = isArray(obj) ? obj : {};

	if (isObject(obj)) {
		for (let key in obj) {
			if (obj.hasOwnProperty && obj.hasOwnProperty(key)) {
				if (obj[key] && typeof obj[key] === "object") {
					d[key] = cloneDeep(obj[key]);
				} else {
					d[key] = obj[key];
				}
			}
		}
	}

	return d;
}

export function clone(obj) {
	return Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj));
}

export function deepMerge(a, b) {
	let k;
	for (k in b) {
		a[k] =
			a[k] && a[k].toString() === "[object Object]" ? deepMerge(a[k], b[k]) : (a[k] = b[k]);
	}
	return a;
}

export function contains(parent, node) {
	if (document.documentElement.contains) {
		return parent !== node && parent.contains(node);
	} else {
		while (node && (node = node.parentNode)) if (node === parent) return true;
		return false;
	}
}

export { storage };
