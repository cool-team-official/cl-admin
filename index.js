import { BaseService, Service, Permission } from "./service";
import { SET_SERVICE, SET_ROUTER, SET_COMPONENT } from "./set";
import "./common";

async function bootstrap(options) {
	const { store, router, components } = options;

	SET_ROUTER({ router });
	SET_SERVICE({ store });
	SET_COMPONENT({ store, router, events: components });

	return { router, store };
}

export { Service, Permission, BaseService, bootstrap };
