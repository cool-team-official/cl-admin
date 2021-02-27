import { Store } from 'vuex/types'
import Router from 'vue-router/types'

interface Crud {
   dict: {
       sort: {
           order: String,
           prop: String
       },
       api: {
           list: String,
           add: String,
           update: String,
           delete: String,
           info: String,
           page: String
       },
       pagination: {
           page: String,
           size: String
       },
       search: {
           keyWord: String,
           query: String
       },
       label: {
           add: String,
           delete: String,
           multiDelete: String,
           update: String,
           refresh: String,
           advSearch: String,
           saveButtonText: String,
           closeButtonText: String,
       },
       table: {
           "context-menu": Boolean
       }
   },
   fn: {
       permission(): {add: Boolean, delete: Boolean, update: Boolean}
   }
}

enum MenuType {
   0 = '目录',
   1 = '菜单',
   2 = '权限'
}

interface ViewRoute {
   icon: String,
   name: String,
   router: String,
   type: MenuType,
   viewPath: String,
   keepAlive: Boolean,
   isShow: Boolean,
   orderNum: Number,
   children: Array<ViewRoute>
}

interface Options {
   "cl-crud": {
       crud: Crud
   }
}

// cool-admin index function
export function bootstrap(options: Options): Promise<{ store: Store, router: Router }>

// Request service
export class BaseService {};

// Desorator
export function Service(value: String): function
export function Service(value: { proxy: String, namespace: String, url: String }): function
export function Permission(value: String): function