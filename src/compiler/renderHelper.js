/*
 * @Author: raoqidi
 * @Date: 2021-08-22 15:19:52
 * @LastEditors: raoqidi
 * @LastEditTime: 2021-09-21 12:15:33
 * @Description: please add a description to the file
 * @FilePath: /baba-vue/src/compiler/renderHelper.js
 */

import VNode from './vnode.js';

/**
 * 负责运行时生成 VNode 的工具
 * @param {*} target Vue instance
 */
export default function renderHelper(target) {
  target._c = createElement;
  target._v = createTextNode;
  target._t = renderSlot;
}

/**
 * 为指定标签创建虚拟 DOM
 * @param {*} tag
 * @param {*} attr
 * @param {*} children
 * @returns
 */
function createElement(tag, attr, children) {
  return VNode(tag, attr, children, this);
}

/**
 * 创建文本节点的虚拟 DOM
 * @param {*} textAst
 */
function createTextNode(textAst) {
  return VNode(null, null, null, this, textAst);
}

/**
 * 插槽的原理其实很简单，难点在于实现
 * 其原理就是生成 VNode，难点在于生成 VNode 之前的各种解析，也就是数据准备阶段
 * 生成插槽的的 VNode
 * @param {*} attrs 插槽的属性
 * @param {*} children 插槽所有子节点的 ast 组成的数组
 */
function renderSlot(attrs, children) {
  // 父组件 VNode 的 attr 信息
  const parentAttr = this._parentVnode.attr;
  let vnode = null;
  if (parentAttr.scopedSlots) {
    // 说明给当前组件的插槽传递了内容
    // 获取插槽信息
    const slotName = attrs.name;
    const slotInfo = parentAttr.scopedSlots[slotName];
    // 这里的逻辑稍微有点绕，建议打开调试，查看一下数据结构，理清对应的思路
    // 这里比较绕的逻辑完全是为了实现插槽这个功能，和插槽本身的原理没关系
    this[slotInfo.scopeSlot] = this[Object.keys(attrs.vBind)[0]];
    vnode = genVNode(slotInfo.children, this);
  } else {
    // 插槽默认内容
    // 将 children 变成 vnode 数组
    vnode = genVNode(children, this);
  }

  // 如果 children 长度为 1，则说明插槽只有一个子节点
  if (children.length === 1) return vnode[0];
  return createElement.call(this, 'div', {}, vnode);
}

/**
 * 将一批 ast 节点(数组)转换成 vnode 数组
 * @param {Array<Ast>} childs 节点数组
 * @param {*} vm 组件实例
 * @returns vnode 数组
 */
function genVNode(childs, vm) {
  const vnode = [];
  for (let i = 0, len = childs.length; i < len; i++) {
    const { tag, attr, children, text } = childs[i];
    if (text) {
      // 文本节点
      if (typeof text === 'string') {
        // text 为字符串
        // 构造文本节点的 AST 对象
        const textAst = {
          type: 3,
          text,
        };
        if (text.match(/{{(.*)}}/)) {
          // 说明是表达式
          textAst.expression = RegExp.$1.trim();
        }
        vnode.push(createTextNode.call(vm, textAst));
      } else {
        // text 为文本节点的 ast 对象
        vnode.push(createTextNode.call(vm, text));
      }
    } else {
      // 元素节点
      vnode.push(createElement.call(vm, tag, attr, genVNode(children, vm)));
    }
  }
  return vnode;
}
