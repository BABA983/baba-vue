/*
 * @Author: raoqidi
 * @Date: 2021-08-21 10:48:43
 * @LastEditors: raoqidi
 * @LastEditTime: 2021-08-22 11:14:35
 * @Description: please add a description to the file
 * @FilePath: /baba-vue/src/compiler/compileToFunction.js
 */
import generate from './generate.js';
import parse from './parse.js';
/**
 * 解析模版字符串，得到 AST 语法树
 * 将 AST 语法树生成渲染函数
 * @param { String } template 模版字符串
 * @returns 渲染函数
 */
export default function compileToFunction(template) {
  // 将模版编译为 ast
  const ast = parse(template);
  // 从 ast 生成渲染函数
  const render = generate(ast);
  return render;
}
