/*
 * @Author: raoqidi
 * @Date: 2021-08-03 16:53:27
 * @LastEditors: raoqidi
 * @LastEditTime: 2021-10-03 10:47:18
 * @Description: please add a description to the file
 * @FilePath: /baba-vue/src/index.js
 */
// import mount from './compiler-vue1/index.js';
import mount from './compiler/index.js';
import patch from './compiler/patch.js';
import renderHelper from './compiler/renderHelper.js';
import initComputed from './initComputed.js';
import initData from './initData.js';
/**
 * @description: Vue 构造函数
 * @param {*} options 传递进来的配置对象
 * @return {*}
 */
export default function Vue(options) {
  this._init(options);
}
/**
 * @description: 初始化配置对象
 * @param {*} options
 * @return {*}
 */
Vue.prototype._init = function (options) {
  // 将 options 挂载到实例上
  this.$options = options;
  // 初始化 options.data
  // 代理 data 对象上的各个属性到 Vue 实例
  // 赋予 data 对象上的各个属性响应式的能力
  initData(this);
  // 初始化 computed 选项，并将计算属性代理到 Vue 实例上
  // 结合 watcher 实现缓存
  initComputed(this);
  // 在 Vue 实例上挂载运行时生成 VNode 的工具函数
  renderHelper(this);

  // 将 patch 挂载到 Vue 实例上
  this.__patch__ = patch;

  // 如果存在 el 配置项，则调用 $mount 方法编译模版
  if (this.$options.el) {
    this.$mount();
  }
};

Vue.prototype.$mount = function () {
  mount(this);
};
