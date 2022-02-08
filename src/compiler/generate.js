/*
 * @Author: raoqidi
 * @Date: 2021-08-21 10:50:50
 * @LastEditors: raoqidi
 * @LastEditTime: 2021-09-21 11:46:25
 * @Description: please add a description to the file
 * @FilePath: /baba-vue/src/compiler/generate.js
 */
/**
 * 从 AST 对象生成渲染函数
 * @param {AST} el
 */
export default function generate(el) {
  const renderStr = genElement(el);
  // 通过 new Function 将字符串形式的函数变成可执行函数，并用 with 为渲染函数扩展作用域链
  return new Function(`with(this) { return ${renderStr} }`);
}

/**
 * _c(tag, attr, children)
 * @param {*} ast
 */
function genElement(ast) {
  const { tag, rawAttr, attr } = ast;
  const attrs = { ...rawAttr, ...attr };
  const children = genChildren(ast);

  if (tag === 'slot') {
    // 生成插槽的处理函数
    return `_t(${JSON.stringify(attrs)}, [${children}])`;
  }

  return `_c('${tag}',${JSON.stringify(attrs)},[${children}])`;
}

/**
 * 处理 AST 节点的字节点，将字节点变成渲染函数
 * @param {*} el
 */
function genChildren(el) {
  const ret = [];
  const { children } = el;
  for (const child of children) {
    if (child.type === 3) {
      // 文本节点
      ret.push(`_v(${JSON.stringify(child)})`);
    } else if (child.type === 1) {
      ret.push(genElement(child));
    }
  }
  return ret;
}
