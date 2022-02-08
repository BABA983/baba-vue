/*
 * @Author: raoqidi
 * @Date: 2021-08-04 09:25:57
 * @LastEditors: raoqidi
 * @LastEditTime: 2021-08-07 21:00:56
 * @Description: please add a description to the file
 * @FilePath: /baba-vue/src/observer.js
 */

import observe from './observe.js';
import defineReactive from './defineReactive.js';
import protoArgument from './protoArgument.js';
import Dep from './dep.js';

/**
 * 为普通对象或数组设置响应式的入口
 */
export default function Observer(value) {
  // 为对象本身设置一个 dep，方便在更新对象本身时使用，比如:数组通知依赖更新时就会用到
  this.dep = new Dep();
  // 为对象设置 __ob__ 属性，值为this，说明当前对象已经是一个响应式对象
  Object.defineProperty(value, '__ob__', {
    value: this,
    // false 禁止枚举，不会在 value 的属性上枚举
    // 1、可以在递归设置数据响应式的时候跳过 __ob__
    // 2、将响应式对象字符串化的时候不会显示 __ob__ 对象
    enumerable: false,
    writable: true,
    configurable: true,
  });

  if (Array.isArray(value)) {
    // 数组响应式
    protoArgument(value);
    this.observeArray(value);
  } else {
    this.walk(value);
  }
}
/**
 * 遍历对象的每个属性，为这些属性设置 getter, setter 拦截
 * @param {*} obj
 */
Observer.prototype.walk = function (obj) {
  for (const key in obj) {
    defineReactive(obj, key, obj[key]);
  }
};

// 遍历数组的每个元素，为每个元素设置响应式
// 其实这里是为了处理元素为对象的情况，达到 this.arr[i].xx 的响应式能力
Observer.prototype.observeArray = function (arr) {
  for (const item of arr) {
    observe(item);
  }
};
