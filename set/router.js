import { Message } from "element-ui";

export default function ({ router }) {
	router.$plugin = {
		addViews: (list, options) => {
			if (!options) {
				options = {};
			}

			// Parse route config
			list.map((e) => {
				if (!e.component) {
					let url = e.viewPath;

					if (url) {
						if (
							/^(http[s]?:\/\/)([0-9a-z.]+)(:[0-9]+)?([/0-9a-z.]+)?(\?[0-9a-z&=]+)?(#[0-9-a-z]+)?/i.test(
								url
							)
						) {
							e.meta.iframeUrl = url;
							e.component = () => import(`cool/components/base/pages/iframe/index.vue`);
						} else {
							if (url.indexOf("views/") === 0) {
								e.component = () => import(`@/${url}`);
							} else {
								console.error(url, "异常");
							}
						}
					} else {
						e.redirect = "/404";
					}
				}
			});

			// Batch add route
			list.forEach((e) => {
				router.addRoute("index", e);
			});

			// Add 404 rule
			if (!options.ignore404) {
				router.addRoute({
					path: "*",
					redirect: "/404"
				});
			}
		},

		to: (url) => {
			if (router.path != url) {
				router.push(url);
			}
		}
	};

	let lock = false;

	router.onError((err) => {
		if (!lock) {
			lock = true;

			if (err.code == "MODULE_NOT_FOUND") {
				console.error(err.message.replace("Cannot find module ", ""), "路由组件不存在");

				Message.error(`路由组件路径错误`);
			} else {
				console.error(err);
			}

			setTimeout(() => {
				lock = false;
			}, 0);
		}
	});
}
