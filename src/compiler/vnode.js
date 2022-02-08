/*
 * @Author: raoqidi
 * @Date: 2021-08-22 15:23:16
 * @LastEditors: raoqidi
 * @LastEditTime: 2021-08-22 15:27:36
 * @Description: 虚拟 dom 的结构
 * @FilePath: /baba-vue/src/compiler/vnode.js
 */
/**
 * 生成指定节点的虚拟DOM
 * @param {*} tag 标签名
 * @param {*} attr 属性对象
 * @param {*} children 子节点 VNode 数组
 * @param {*} context Vue instance
 * @param {*} text 文本节点的 AST 对象
 */
export default function VNode(
  tag,
  attr,
  children,
  context = null,
  text = null
) {
  return {
    tag,
    attr,
    children,
    context,
    text,
    // 当前节点的父节点，真正的 dom 节点
    parent: null,
    // 当前节点的真实 dom
    elm: null,
  };
}
