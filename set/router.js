export default function ({ routes, router }) {
	router.$plugin = {
		addRoutes: (list, options) => {
			if (!options) {
				options = {};
			}

			list.map((e) => {
				if (!e.component) {
					let url = e.viewPath;

					if (url) {
						if (
							/^(http[s]?:\/\/)([0-9a-z.]+)(:[0-9]+)?([/0-9a-z.]+)?(\?[0-9a-z&=]+)?(#[0-9-a-z]+)?/i.test(
								e.viewPath
							)
						) {
							e.meta.iframeUrl = e.viewPath;
							e.component = () => import(`@/pages/iframe/index.vue`);
						} else {
							e.component = () => import(`@/${e.viewPath}`);
						}
					} else {
						e.redirect = "/404";
					}
				}
			});

			router.addRoutes([
				{
					path: "/",
					component: (resolve) => require([`@/pages/layout/index.vue`], resolve),
					children: [...list, ...routes]
				},
				{
					path: "*",
					redirect: "/404"
				}
			]);
		},

		to: (url) => {
			if (router.path != url) {
				router.push(url);
			}
		}
	};

	router.onError((err) => {
		if (err.code == "MODULE_NOT_FOUND") {
			console.error(
				"页面地址错误",
				err.message.replace("Cannot find module ", ""),
				"文件不存在"
			);
		} else {
			console.error(err);
		}
	});
}
