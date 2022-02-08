/*
 * @Author: raoqidi
 * @Date: 2021-08-05 16:18:35
 * @LastEditors: raoqidi
 * @LastEditTime: 2021-08-08 10:28:03
 * @Description: please add a description to the file
 * @FilePath: /baba-vue/src/protoArgument.js
 */
/**
 * 拦截数组的7个方法实现
 */

// 数组的原型对象
const arrayProto = Array.prototype;
// 用数组的原型对象为原型创建一个对象
const arrayMethods = Object.create(arrayProto);
// 7个数组方法，通过拦截这7个方法来实现响应式
// 因为只有这7个方法是改变数组自身的，如 concat 就返回一个新的数组
const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse',
];

methodsToPatch.forEach((method) => {
  // 拦截7个方法，先完成本职工作再做响应式处理
  Object.defineProperty(arrayMethods, method, {
    value: function (...args) {
      // 完成本职工作，如 this.arr.push(x)
      const ret = arrayProto[method].apply(this, args);
      console.log('array reactive');
      // 新增的元素列表
      let inserted = [];
      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args;
          break;
        case 'splice':
          // this.xx.splice(index, num, a, b, c)
          inserted = args.slice(2);
          break;
      }
      // 如果数组有新增的元素，则对新增的元素进行响应式处理
      inserted.length && this.__ob__.observeArray(inserted);
      // 依赖通知更新
      this.__ob__.dep.notify();
      return ret;
    },
    configurable: true,
    enumerable: true,
    writable: true,
  });
});

/**
 * 覆盖数组 arr 的原型对象
 * @param {*} arr
 */
export default function protoArgument(arr) {
  arr.__proto__ = arrayMethods;
}
