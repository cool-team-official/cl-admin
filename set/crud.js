import Vue from "vue";
import Cl_CRUD from "cl-crud2";

export default function ({ crud }) {
	Vue.use(Cl_CRUD, crud);
}
