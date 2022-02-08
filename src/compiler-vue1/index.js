/*
 * @Author: raoqidi
 * @Date: 2021-08-08 11:02:21
 * @LastEditors: raoqidi
 * @LastEditTime: 2021-08-14 19:48:23
 * @Description: please add a description to the file
 * @FilePath: /baba-vue/src/compiler/index.js
 */
import compileNode from './compileNode.js';
export default function mount(vm) {
  // 获取 el 节点
  const el = document.querySelector(vm.$options.el);
  compileNode(Array.from(el.childNodes), vm);
}
