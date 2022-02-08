/*
 * @Author: raoqidi
 * @Date: 2021-10-04 12:35:54
 * @LastEditors: raoqidi
 * @LastEditTime: 2021-10-08 16:30:04
 * @Description: 异步队列更新
 * @FilePath: /baba-vue/src/asyncUpdateQueue.js
 */
// 存放所有 watcher 实例
const queue = [];
// 标识当前 watcher 队列是否正在被刷新
let flushing = false;
// 标识 callbacks 数组中是否已经存在一个刷新 watcher 队列的函数
let waiting = false;
// 存放刷新 watcher 队列的函数，或者用户调用 Vue.nextTick 方法传递的回调函数
const callbacks = [];
// 标识浏览器当前任务队列中是否存在刷新 callbacks 数组的函数
let pending = false;

export default function queueWatcher(watcher) {
  // 防止重复入队
  if (!queue.includes(watcher)) {
    // 说明 watcher 队列没有在刷新，直接入队
    if (!flushing) {
      queue.push(watcher);
    } else {
      // 当前队列正在被刷新，比如用户 watcher 的回调函数中更改了某个响应式数据
      // watcher 队列的时候，新进来一个 watcher
      // 刷新 watcher 队列的时候，这个队列是有序的，所以要将新插入的 watcher 放到一个合适的位置
      // 保证队列有序
      // 标记当前 watcher 在 for 中是否已经完成入队操作
      let flag = false;
      // 这时的 watcher 队列时有序的(uid 由小到大)，需要保证当前 watcher 插入进去后仍然有序
      for (let i = queue.length - 1; i >= 0; i--) {
        if (queue[i].uid < watcher.uid) {
          // 找到了刚好比当前 watcher.uid 小的那个 watcher 的位置
          // 将当前 watcher 插入到该位置的后面
          queue.splice(i + 1, 0, watcher);
          flag = true;
          break;
        }
      }
      if (!flag) {
        // 说明上面的 for 循环在队列中没找到比当前 watcher.uid 小的 watcher
        // 将当前 watcher 插入到队首
        queue.unshift(watcher);
      }
    }
    if (!waiting) {
      // 表示当前 callbacks 数组中还没有刷新 watcher 队列的函数
      // 保证 callbacks 数组中只会有一个刷新 watcher 队列的函数
      // 因为如果有多个，没有任何意义，第二个执行的时候 watcher 队列已经为空了
      waiting = true;
      nextTick(flushSchedulerQueue);
    }
  }
}

/**
 * 负责刷新 watcher 队列的函数，由 flushCallbacks 函数调用
 */
function flushSchedulerQueue() {
  // 表示正在刷新 watcher 队列
  flushing = true;
  // 给 watcher 队列排序，根据 uid 由小到大排序
  queue.sort((a, b) => a.uid - b.uid);
  // 遍历队列，依次执行其中每个 watcher 的 run 方法
  while (queue.length) {
    // 取出队首的 watcher
    const watcher = queue.shift();
    // 执行 run 方法
    watcher.run();
  }
  // 到这里 watcher 队列刷新完毕
  flushing = waiting = false;
}

/**
 * 将刷新 watcher 队列的函数或者用户调用 Vue.nextTick 方法传递的回调函数放入 callbacks 数组
 * 如果当前的浏览器任务队列中没有刷新 callbacks 的函数，则将 flushCallbacks 函数放入任务队列
 */
function nextTick(cb) {
  callbacks.push(cb);
  if (!pending) {
    // 表明浏览器当前任务队列中没有刷新 callbacks 数组的函数
    // 将 flushCallbacks 函数放入浏览器的微任务队列
    Promise.resolve().then(flushCallbacks);
    // 标识浏览器的微任务队列中已经存在 刷新 callbacks 数组的函数了
    pending = true;
  }
}

/**
 * 负责刷新 callbacks 数组的函数，执行 callbacks 数组中的所有函数
 */
function flushCallbacks() {
  // 表示浏览器任务队列中的 flushCallbacks 函数已经被拿到执行栈执行了
  // 新的 flushCallbacks 函数可以进入浏览器的任务队列了
  pending = false;
  while (callbacks.length) {
    // 拿出最头上的回调函数
    const cb = callbacks.shift();
    // 执行回调函数
    cb();
  }
}
