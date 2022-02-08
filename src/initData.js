/*
 * @Author: raoqidi
 * @Date: 2021-08-03 17:23:34
 * @LastEditors: raoqidi
 * @LastEditTime: 2021-08-06 16:08:09
 * @Description: please add a description to the file
 * @FilePath: /baba-vue/src/initData.js
 */
import { proxy } from './utils.js';
import observe from './observe.js';
/**
 * 1、初始化 options.data
   2、代理 data 对象上的各个属性到 Vue 实例
   3、赋予 data 对象上的各个属性响应式的能力
 * @param {*} vm Vue 实例
 * @return {*}
 */
export default function initData(vm) {
  // 获取 data 选项
  const { data } = vm.$options;
  // 设置 vm._data 选项，保证它的值是一个对象
  if (!data) {
    vm._data = {};
  } else {
    vm._data = typeof data === 'function' ? data() : data;
  }

  // 代理，将 data 对象上的各个属性代理到 Vue 实例上面，支持 this.xxx 来进行访问
  for (const key in vm._data) {
    proxy(vm, '_data', key);
  }

  // 设置响应式
  observe(vm._data);
}
