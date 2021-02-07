import Vue from "vue";
import { deepMerge, isString, isObject } from "../utils";
import cool from "@/cool";

export default function (options = {}) {
	if (!options.events) {
		options.events = {};
	}

	// 匹配
	const files = require.context("cl-component/", true, /index.js/);

	// 组件注册的视图
	let componentView = [];

	// 组件列表
	let components = [];

	// 安装组件
	function install(comp) {
		let { store, components, service, directives, filters, pages, views, name } = comp;
		let { onInstall, onSuccess, onFail } = options.events[name] || {};

		try {
			const next = () => {
				// 注册vuex模块
				if (store) {
					for (let i in store) {
						options.store.registerModule(`${name}-${i}`, store[i]);
					}
				}

				// 注册组件
				if (components) {
					for (let i in components) {
						Vue.component(components[i].name, components[i]);
					}
				}

				// 注册请求服务
				if (service) {
					deepMerge(options.store.$service, service);
				}

				// 注册指令
				if (directives) {
					for (let i in directives) {
						Vue.directive(i, directives[i]);
					}
				}

				// 注册过滤器
				if (filters) {
					for (let i in filters) {
						Vue.filter(i, filters[i]);
					}
				}

				// 注册页面
				if (pages) {
					for (let i in pages) {
						options.router.addRoutes([
							{
								path: i,
								component: pages[i]
							}
						]);
					}
				}

				// 注册视图
				if (views) {
					for (let i in views) {
						componentView.push({
							path: i,
							component: views[i]
						});
					}
				}

				// 包安装成功
				if (onSuccess) onSuccess(comp);
			};

			// 安装前
			if (onInstall) {
				onInstall(comp, { next });
			} else {
				next();
			}
		} catch (e) {
			console.error(e);

			// 安装失败
			if (onFail) onFail(comp, e);
		}
	}

	// 解析组件
	cool.components.map((e) => {
		if (!e) {
			return null;
		}

		let comp = null;

		if (isString(e)) {
			comp = {
				name: e
			};
		} else if (isObject(e)) {
			comp = e;
		} else {
			comp = {
				name: e[0],
				options: e[1]
			};
		}

		// 是否开启
		if (comp.options && comp.options.enable === false) {
			return null;
		}

		if (!comp.value) {
			try {
				comp.value = files(`./${comp.name}/index.js`).default;
			} catch (e) {
				console.warn("未检测到插件", comp.name);
			}
		}

		if (comp) {
			comp = {
				name: comp.name,
				options: comp.options,
				...comp.value
			};

			components.push(comp);
			install(comp);
		}
	});

	// 设置缓存
	options.store.commit("SET_COMPONENT_VIEWS", componentView);
	options.store.commit("SET_COMPONENT", components);
}
