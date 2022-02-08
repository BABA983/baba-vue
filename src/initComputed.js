/*
 * @Author: raoqidi
 * @Date: 2021-10-03 10:46:38
 * @LastEditors: raoqidi
 * @LastEditTime: 2021-10-03 11:10:36
 * @Description: please add a description to the file
 * @FilePath: /baba-vue/src/initComputed.js
 */

import Watcher from './watcher.js';

/**
 * 初始化 computed 配置项
 * 为每一项实例化一个 Watcher，并将其 computed 属性代理到 Vue 实例上
 * 结合 watcher.dirty 和 watcher.evaluate 实现 computed 缓存
 * @param {*} vm Vue 实例
 */
export default function initComputed(vm) {
  // 获取配置项
  const computed = vm.$options.computed;
  // 记录 watcher
  const watcher = (vm._watcher = Object.create(null));
  for (const key in computed) {
    watcher[key] = new Watcher(computed[key], { lazy: true }, vm);
    // 将 computed 属性 key 代理到 Vue 实例上
    defineComputed(vm, key);
  }
}

/**
 * 将计算属性代理到 Vue 实例上
 * @param {*} vm Vue 实例
 * @param {*} key computed 的计算属性
 */
function defineComputed(vm, key) {
  // 属性描述符
  const descriptor = {
    get: function () {
      const watcher = vm._watcher[key];
      if (watcher.dirty) {
        // 说明当前 computed 回调函数在本次渲染周期内没有被执行过
        // 执行 evaluate，通知 watcher 执行 computed 回调函数，得到回调函数返回值
        watcher.evaluate();
      }
      return watcher.value;
    },
    set: function () {
      console.log('no setter');
    },
  };
  // 将计算属性代理到 Vue 实例上
  Object.defineProperty(vm, key, descriptor);
}
