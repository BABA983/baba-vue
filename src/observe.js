/*
 * @Author: raoqidi
 * @Date: 2021-08-03 17:54:17
 * @LastEditors: raoqidi
 * @LastEditTime: 2021-08-06 16:08:28
 * @Description: please add a description to the file
 * @FilePath: /baba-vue/src/observe.js
 */
import Observer from './observer.js';
/**
 * @description: 通过 Observer 类为对象设置响应式能力
 * @param {*} value
 * @return {*} Observer 实例
 */
export default function observe(value) {
  // 避免无限递归
  // 不是对象就返回 object || function
  if (typeof value !== 'object') return;

  // value.__ob__ 是 Observer实例
  // 如果有说明已经被 observe 过有响应式能力了
  if (value.__ob__) return value.__ob__;

  // 返回 Observer 实例
  return new Observer(value);
}
