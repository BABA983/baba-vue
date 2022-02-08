/*
 * @Author: raoqidi
 * @Date: 2021-08-14 19:37:19
 * @LastEditors: raoqidi
 * @LastEditTime: 2021-08-15 13:47:05
 * @Description: please add a description to the file
 * @FilePath: /baba-vue/src/compiler/compileNode.js
 */
import compileAttribute from './compileAttribute.js';
import compileTextNode from './compileTextNode.js';
export default function compileNode(nodes, vm) {
  for (const node of nodes) {
    if (node.nodeType === 1) {
      // 元素节点
      compileAttribute(node, vm);
      // 编译节点上的各个属性，v-bind、v-model、v-onclick
      compileNode(Array.from(node.childNodes), vm);
    } else if (node.nodeType === 3 && node.textContent.match(/{{(.*)}}/)) {
      // 当前节点为文本节点，比如 <span>{{ key }}</span>
      compileTextNode(node, vm);
    }
  }
}
