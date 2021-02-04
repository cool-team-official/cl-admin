import { BaseService, Service, Permission } from "./service";
import { SET_SERVICE, SET_CRUD, SET_ROUTER, SET_PACKAGE } from "./set";
import "./common";

async function bootstrap(options) {
    const { store, router, ["view-routes"]: routes, ["cl-crud"]: crud, packages } = options;

    SET_SERVICE({ store });
    SET_PACKAGE({ store, router, events: packages });
    SET_CRUD({ crud });
    SET_ROUTER({ router, routes, store });

    return { router, store };
}

export { Service, Permission, BaseService, bootstrap };
