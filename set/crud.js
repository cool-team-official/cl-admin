import Vue from "vue";
import Cl_CRUD from "cl-crud2";

export default function ({ crud }) {
	Vue.use(Cl_CRUD, {
		fn: {
			// crud 权限配置
			permission(that) {
				const { permission = "" } = that.$store.getters;
				const { add, delete: del, update } = that.service.permission || {};

				return {
					add: permission.includes(add),
					delete: permission.includes(del),
					update: permission.includes(update)
				};
			}
		},
		...crud
	});
}
