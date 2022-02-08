/*
 * @Author: raoqidi
 * @Date: 2021-08-05 11:55:18
 * @LastEditors: raoqidi
 * @LastEditTime: 2021-08-07 21:29:47
 * @Description: please add a description to the file
 * @FilePath: /baba-vue/src/defineReactive.js
 */

import Dep from './dep.js';
import observe from './observe.js';

/**
 * 通过 Object.defineProperty 为 obj.key 设置 getter，setter 拦截
 * getter 时收集依赖
 * setter 时依赖通过 watcher 更新
 * @param {*} obj
 * @param {*} key
 * @param {*} val
 */
export default function defineReactive(obj, key, val) {
  // 递归调用 observe，处理 val 仍然为对象的情况
  const childOb = observe(val);
  const dep = new Dep();
  Object.defineProperty(obj, key, {
    // 当发现 obj[key] || obj.key 的读取行为的时候进行拦截
    get() {
      // 读取数据时 && Dep.target !== null，则进行依赖收集
      if (Dep.target) {
        dep.depend();
        // 如果存在子 ob，则一块儿完成依赖收集
        if (childOb) {
          childOb.dep.depend();
        }
      }
      console.log(`getter: key = ${key}`);
      return val;
    },
    // 当发生 obj.key = xx 的赋值行为时，会被 set 拦截
    set(newVal) {
      console.log(`setter: ${key} = ${newVal}`);
      if (newVal === val) return;
      val = newVal;
      // 做响应式处理，对新值为非原始值的情况进行处理，例如数组
      observe(val);
      // 数据更新，让 dep 通知自己收集的所有 watcher 执行 update 方法
      dep.notify();
    },
  });
}
