/*
 * @Author: raoqidi
 * @Date: 2021-08-14 19:40:46
 * @LastEditors: raoqidi
 * @LastEditTime: 2021-08-15 13:46:37
 * @Description: please add a description to the file
 * @FilePath: /baba-vue/src/compiler/compileTextNode.js
 */
import Watcher from '../watcher.js';
export default function compileTextNode(node, vm) {
  console.log(RegExp.$1);
  const key = RegExp.$1.trim();
  // 当响应式数据 key 更新时，dep 通知 watcher 执行 update 函数，cb 会被调用
  function cb() {
    const value = vm[key];
    node.textContent =
      typeof value === 'object' ? JSON.stringify(value) : String(value);
  }
  // 实例化 Watcher，执行 cb，触发 getter，进行依赖收集
  new Watcher(cb);
}
