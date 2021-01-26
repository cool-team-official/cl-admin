import Vue from "vue";
import { deepMerge } from "../utils";

export default function (options) {
	if (!options.events) {
		options.events = {};
	}

	// 匹配文件
	const files = require.context("@/cool/packages/", true, /index.js/);

	// 列表
	const packages = files
		.keys()
		.filter((e) => {
			return e != "./index.js" && e.split("/").length == 3 && !e.includes("--ignore");
		})
		.map((e) => {
			let m = files(e);

			if (m && m.default) {
				return {
					...m.default,
					name: e.split("/")[1]
				};
			} else {
				return null;
			}
		})
		.filter(Boolean);

	// 安装
	for (let i in packages) {
		let pkg = packages[i];
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
					let children = []

					for (let i in views) {
						children.push({
							path: i,
							component: views[i]
						})
					}

					console.log(options.router.options.routes)

					options.router.addRoutes([
						{
							path: '/',
							children
						}
					]);
				}

				// 包安装成功
				if (onSuccess) {
					onSuccess(pkg);
				}
			};

			// 包安装时
			if (onInstall) {
				onInstall(pkg, { next });
			} else {
				next();
			}
		} catch (e) {
			console.error(e);

			// 包安装失败
			if (onFail) {
				onFail(pkg, e);
			}
		}
	}
}
