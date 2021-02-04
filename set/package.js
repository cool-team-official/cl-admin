import Vue from "vue";
import { deepMerge, isString } from "../utils";
import { deps } from "cl-pkg";

export default function (options) {
	if (!options.events) {
		options.events = {};
	}

	// 匹配
	const files = require.context("cl-pkg/", true, /index.js/);

	// 路由视图
	let depsViews = [];

	// 检测
	let list = deps
		.map((e) => {
			if (!e) {
				return null;
			}

			if (isString(e)) {
				e = [e];
			}

			let [name, options = {}] = e;

			// 检测是否开启
			if (options.enable === false) {
				return false;
			}

			let mdl = null;

			try {
				mdl = files(`./${name}/index.js`);
			} catch (e) {
				console.warn("未检测到插件", name);
			}

			if (mdl && mdl.default) {
				return {
					...mdl.default,
					name,
					options
				};
			} else {
				return null;
			}
		})
		.filter(Boolean)
		.reverse()

	// 安装
	list.forEach((dep) => {
		let { store, components, service, directives, filters, pages, views, name } = dep;
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
						depsViews.push({
							path: i,
							component: views[i]
						});
					}
				}

				// 包安装成功
				if (onSuccess) {
					onSuccess(dep);
				}
			};

			// 安装时
			if (onInstall) {
				onInstall(dep, { next });
			} else {
				next();
			}
		} catch (e) {
			console.error(e);

			// 安装失败
			if (onFail) {
				onFail(dep, e);
			}
		}
	});

	// 设置缓存
	options.store.commit("SET_DEPS_VIEWS", depsViews);
	options.store.commit("SET_DEPS", list);
}
