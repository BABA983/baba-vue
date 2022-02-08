/*
 * @Author: raoqidi
 * @Date: 2021-08-22 15:13:03
 * @LastEditors: raoqidi
 * @LastEditTime: 2021-10-04 13:01:18
 * @Description: please add a description to the file
 * @FilePath: /baba-vue/src/compiler/mountComponent.js
 */
import Vue from '../index.js';
import Watcher from '../watcher.js';
export default function mountComponent(vm) {
  const updateComponent = () => {
    vm._update(vm._render());
  };
  // 实例化一个渲染 Watcher
  new Watcher(updateComponent);
}

Vue.prototype._render = function () {
  return this.$options.render.apply(this);
};

/**
 *
 * @param {*} vnode 由 render 函数生成的 VNode
 */
Vue.prototype._update = function (vnode) {
  // 获取旧的 VNode 节点
  const prevVNode = this._vnode;
  // 设置新的 VNode
  this._vnode = vnode;
  if (!prevVNode) {
    // 说明首次渲染
    this.$el = this.__patch__(this.$el, vnode);
  } else {
    this.$el = this.__patch__(prevVNode, vnode);
  }
};
