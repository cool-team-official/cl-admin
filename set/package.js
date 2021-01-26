import Vue from "vue";
import { deepMerge, isString } from "../utils";
import { deps } from "@/cool/packages";

export const ROUTER = {
	views: []
};

export default function (options) {
	if (!options.events) {
		options.events = {};
	}

	// 匹配文件
	const files = require.context("@/cool/packages/", true, /index.js/);

	// 列表
	const packages = deps
		.map((e) => {
			if (!e) {
				return null;
			}

			if (isString(e)) {
				e = [e]
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
		.filter(Boolean);

	// 安装
	packages.forEach((pkg) => {
		let { store, components, service, directives, filters, pages, views, name } = pkg;
		let { onInstall, onSuccess, onFail } = options.events[name] || {};

		try {
			const next = () => {
				// 注册vuex模块
				if (store) {
					for (let storeName in store) {
						options.store.registerModule(storeName, store[storeName]);
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
						ROUTER.views.push({
							path: i,
							component: views[i]
						});
					}
				}

				// 包安装成功
				if (onSuccess) {
					onSuccess(pkg);
				}
			};

			// 安装时
			if (onInstall) {
				onInstall(pkg, { next });
			} else {
				next();
			}
		} catch (e) {
			console.error(e);

			// 安装失败
			if (onFail) {
				onFail(pkg, e);
			}
		}
	});
}
