/*
 * @Author: raoqidi
 * @Date: 2021-08-07 19:53:01
 * @LastEditors: raoqidi
 * @LastEditTime: 2021-10-04 15:01:23
 * @Description: please add a description to the file
 * @FilePath: /baba-vue/src/watcher.js
 */

import queueWatcher from './asyncUpdateQueue.js';
import { pushTarget, popTarget } from './dep.js';

let uid = 0;
/**
 * @description:
 * @param {*} cb 负责更新 dom 的回调函数
 * @return {*}
 */
export default function Watcher(cb, options = {}, vm = null) {
  console.log(this);
  this.uid = uid++;
  // 备份 cb 函数
  this._cb = cb;
  // 配置项
  this.options = options;
  // 回调函数执行后的值
  this.value = null;
  // computed 计算属性实现缓存的原理，标记当前回调函数在本次渲染周期内是否已经被执行过
  this.dirty = !!options.lazy;
  // Vue 实例
  this.vm = vm;
  // 非懒执行时，直接执行 cb 函数，cb 函数中会发生 vm.xx 的属性读取，从而进行依赖收集
  !options.lazy && this.get();

  // // 赋值 Dep.target
  // Dep.target = this;
  // // 执行回调函数时，会有一些 this.xx 的读取操作，从而触发 getter 进行依赖收集
  // this._cb();
  // // 依赖收集完成，防止重复收集
  // Dep.target = null;
}

/**
 * 响应式数据更新时，dep 通知 watcher 执行 update 方法，
 * 让 update 方法执行 this._cb 函数更新 DOM
 */
Watcher.prototype.update = function () {
  // 通过 Promise，将 this._cb 的执行放到 this.dirty = true 的后面
  // 否则，在点击按钮时，computed 属性的第一次计算会无法执行，
  // 因为 this._cb 执行的时候，会更新组件，获取计算属性的值的时候 this.dirty 依然是
  // 上一次的 false，导致无法得到最新的的计算属性的值
  // 不过这个在有了异步更新队列之后就不需要了，当然，毕竟异步更新对象的本质也是 Promise
  // Promise.resolve().then(() => {
  //   this._cb();
  // });
  // 执行完 _cb 函数，DOM 更新完毕，进入下一个渲染周期，所以将 dirty 置为 false
  // 当再次获取 计算属性 时就可以重新执行 evaluate 方法获取最新的值了
  // this.dirty = true;

  if (this.options.lazy) {
    // 懒执行，比如 computed 计算属性
    // 将 dirty 置为 true，当页面重新渲染获取计算属性时就可以执行 evaluate 方法获取最新的值了
    this.dirty = true;
  } else {
    // 将 watcher 放入异步 watcher 队列
    queueWatcher(this);
  }
};
/**
 * 由刷新 watcher 队列的函数调用，负责执行 watcher.get 方法
 */
Watcher.prototype.run = function () {
  this.get();
};

/**
 * 负责执行 Watcher 的 cb 函数
 * 执行时进行依赖收集
 */
Watcher.prototype.get = function () {
  pushTarget(this);
  this.value = this._cb.apply(this.vm);
  popTarget();
};

Watcher.prototype.evaluate = function () {
  // 执行 get，触发计算函数 (cb) 的执行
  this.get();
  // 将 dirty 置为 false，实现一次刷新周期内 computed 实现缓存
  this.dirty = false;
};
