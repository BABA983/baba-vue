/*
 * @Author: raoqidi
 * @Date: 2021-08-03 17:39:38
 * @LastEditors: raoqidi
 * @LastEditTime: 2021-09-12 11:06:49
 * @Description: please add a description to the file
 * @FilePath: /baba-vue/src/utils.js
 */
/**
 * @description: 将 key 代理到 target 上，如 this._data.xx => this.xx
 * @param {*} target 目标对象，如 vm
 * @param {*} sourceKey 原始key，如 _data
 * @param {*} key 代理的原始对象上的指定属性，如 _data.xx
 * @return {*}
 */
export function proxy(target, sourceKey, key) {
  Object.defineProperty(target, key, {
    // target.key 的读取操作实际上返回的是 target.sourceKey.key
    get() {
      return target[sourceKey][key];
    },
    // 赋值操作
    set(newVal) {
      target[sourceKey][key] = newVal;
    },
  });
}
/**
 * 判断指定标签是否为自闭合标签
 * @param {*} tagName 标签名
 */
export function isUnaryTag(tagName) {
  return ['input'].includes(tagName);
}

/**
 * 是否为平台保留标签
 * @param {*} tagName 标签名
 */
export function isReserveTag(tagName) {
  const reserveTag = [
    'div',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'span',
    'input',
    'select',
    'option',
    'button',
    'p',
    'template',
  ];
  return reserveTag.includes(tagName);
}
