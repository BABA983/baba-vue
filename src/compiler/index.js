/*
 * @Author: raoqidi
 * @Date: 2021-08-21 10:40:43
 * @LastEditors: raoqidi
 * @LastEditTime: 2021-09-12 23:52:53
 * @Description: please add a description to the file
 * @FilePath: /baba-vue/src/compiler/index.js
 */
import compileToFunction from './compileToFunction.js';
import mountComponent from './mountComponent.js';
/**
 * 编译器
 */
export default function mount(vm) {
  if (!vm.$options.render) {
    // 没有 render 函数，则进行编译
    let template = '';
    if (vm.$options.template) {
      // 存在 template 选项
      template = vm.$options.template;
    } else if (vm.$options.el) {
      // 存在挂载点
      template = document.querySelector(vm.$options.el).outerHTML;
      // 在实例上记录挂载点，this._update 中会用到
      vm.$el = document.querySelector(vm.$options.el);
    }

    // 生产渲染函数
    const render = compileToFunction(template);
    // 将渲染函数挂载到配置项
    vm.$options.render = render;
  }
  mountComponent(vm);
}
