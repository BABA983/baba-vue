/*
 * @Author: raoqidi
 * @Date: 2021-08-22 16:17:59
 * @LastEditors: raoqidi
 * @LastEditTime: 2021-10-02 15:01:18
 * @Description: please add a description to the file
 * @FilePath: /baba-vue/src/compiler/patch.js
 */
import Vue from '../index.js';
import { isReserveTag } from '../utils.js';

/**
 * 负责初始渲染和后续更新
 * @param {*} oldVnode
 * @param {*} vnode
 */
export default function patch(oldVnode, vnode) {
  if (oldVnode && !vnode) {
    // 老的 vnode 存在，新的没有，则销毁组件
    return;
  }

  if (!oldVnode) {
    // 说明子组件首次渲染
    createElm(vnode);
  } else {
    if (oldVnode.nodeType) {
      // 说明是真正的 dom 节点
      // body
      const parent = oldVnode.parentNode;
      // 参考节点，即老的 vnode 的下一个节点 —— script，新节点要插在 script 的前面
      // 即 body 里面，script 的前面
      const referNode = oldVnode.nextSibling;
      // 创建元素，将 vnode 变成真正的 dom，并添加到父节点
      createElm(vnode, parent, referNode);
      // 移除老的
      parent.removeChild(oldVnode);
    } else {
      // 后续更新
      console.log('update...');
      patchVNode(oldVnode, vnode);
    }
  }
}

/**
 * 创建元素
 * @param {*} vnode vnode
 * @param {*} parent 父节点
 * @param {*} referNode 参考节点
 */
function createElm(vnode, parent, referNode) {
  // 在 vnode 上面记录父节点
  vnode.parent = parent;

  // 创建自定义组件，如果不是组件，则继续往下走
  if (createComponent(vnode)) return;

  const { tag, attr, children, text } = vnode;

  // 文本节点
  if (text) {
    vnode.elm = createTextNode(vnode);
  } else {
    // 元素节点
    vnode.elm = document.createElement(tag);
    // 给元素设置属性
    setAttribute(attr, vnode);
    // 创建子节点
    for (const child of children) {
      createElm(child, vnode.elm);
    }
  }
  // 节点创建完毕，将创建的节点插入到父节点内
  if (parent) {
    const elm = vnode.elm;
    if (referNode) {
      parent.insertBefore(elm, referNode);
    } else {
      parent.appendChild(elm);
    }
  }
}

/**
 * 创建自定义组件
 * @param vnode
 */
function createComponent(vnode) {
  if (vnode.tag && !isReserveTag(vnode.tag)) {
    // 获取组件的配置信息
    const {
      tag,
      context: {
        $options: { components },
      },
    } = vnode;
    const compOptions = components[tag];
    // 没有 $options.el 手动执行 mount
    const compIns = new Vue(compOptions);
    // 把父组件的 vnode 放到子组件的实例上---处理插槽的时候会用到
    compIns._parentVnode = vnode;
    compIns.$mount();
    // 记录子组件 vnode 的父节点信息
    // compIns._vnode.parent = vnode.parent;
    // 将子节点添加到父节点内
    vnode.parent.appendChild(compIns._vnode.elm);
  }
}

/**
 * 创建文本节点
 * @param {*} textVnode
 */
function createTextNode(textVnode) {
  const { text } = textVnode;
  let textNode = null;
  // 说明含有表达式 {{xxx}}
  if (text.expression) {
    // 获取 Vue 实例上的值
    const value = textVnode.context[text.expression];
    textNode = document.createTextNode(
      typeof value === 'object' ? JSON.stringify(value) : String(value)
    );
  } else {
    textNode = document.createTextNode(text.text);
  }
  return textNode;
}

/**
 * 给节点设置属性
 * @param {*} attr
 * @param {*} vnode
 */
function setAttribute(attr, vnode) {
  // 遍历属性对象，如果是普通属性，直接设置，如果是指令，就特殊处理
  for (const name in attr) {
    if (name === 'vModel') {
      setVModel(vnode.tag, attr.vModel.value, vnode);
    } else if (name === 'vBind') {
      setVBind(vnode);
    } else if (name === 'vOn') {
      setVOn(vnode);
    } else {
      vnode.elm.setAttribute(name, attr[name]);
    }
  }
}
/**
 * v-model 原理
 * @param {*} tag 标签
 * @param {*} value 属性值
 * @param {*} vnode vnode
 */
function setVModel(tag, value, vnode) {
  const { context: vm, elm } = vnode;
  if (tag === 'select') {
    Promise.resolve().then(() => {
      // 设置初始值
      elm.value = vm[value];
    });
    elm.addEventListener('change', function () {
      vm[value] = elm.value;
    });
  } else if (tag === 'input' && vnode.elm.type === 'text') {
    elm.value = vm[value];
    elm.addEventListener('input', function () {
      vm[value] = elm.value;
    });
  } else if (tag === 'input' && vnode.elm.type === 'checkbox') {
    elm.checked = vm[value];
    elm.addEventListener('change', function () {
      vm[value] = elm.checked;
    });
  }
}

/**
 * v-bind
 */
function setVBind(vnode) {
  const {
    attr: { vBind },
    elm,
    context: vm,
  } = vnode;
  for (const attrName in vBind) {
    elm.setAttribute(attrName, vm[vBind[attrName]]);
    elm.removeAttribute(`v-bind:${attrName}`);
  }
}

/**
 * v-on
 */
function setVOn(vnode) {
  const {
    attr: { vOn },
    elm,
    context: vm,
  } = vnode;
  for (const eventName in vOn) {
    elm.addEventListener(eventName, function (...args) {
      vm.$options.methods[vOn[eventName]].apply(vm, args);
    });
    elm.removeAttribute(`v-on:${eventName}`);
  }
}

/**
 * @description: 对比新老节点，找出其中的不同，更新老节点
 * @param {*} oldVnode
 * @param {*} vnode
 * @return {*}
 */
function patchVNode(oldVnode, vnode) {
  if (oldVnode === vnode) return;

  // _update(vnode) 传进来没有 elm
  // elm 是真正的 dom 节点
  vnode.elm = oldVnode.elm;

  // get the children of old and new vnode
  const child = vnode.children;
  const oldChild = oldVnode.children;

  if (!vnode.text) {
    // 新节点不存在文本节点
    if (child && oldChild) {
      // 新老节点都有 children
      // 进行 diff
      updateChildren(child, oldChild);
    } else if (child) {
      // 有新的无旧的，则新增 children 节点
    } else if (oldChild) {
      // 有旧的无新的，则删除 children 节点
    }
  } else {
    if (vnode.text.expression) {
      // 存在表达式，获取新值
      const value = JSON.stringify(vnode.context[vnode.text.expression]);
      try {
        // 获取旧节点上的旧值
        const oldValue = oldVnode.elm.textContent;
        if (value !== oldValue) {
          oldVnode.elm.textContent = value;
        }
      } catch (e) {
        // 防止更新时遇到插槽导致报错
        // 暂时不对插槽做响应式更新处理
      }
    }
  }
}

/**
 * @description: diff 对比孩子节点，找出不同节点，然后将不同点更新到老节点上面
 * 具体更新工作由 patchVNode 完成，递归
 * @param {*} child
 * @param {*} oldChild
 * @return {*}
 */
function updateChildren(child, oldChild) {
  // 四个游标
  // 新孩子节点的开始索引，叫 新开始
  let newStartIdx = 0;
  // 新结束
  let newEndIdx = child.length - 1;
  // 老开始
  let oldStartIdx = 0;
  // 老结束
  let oldEndIdx = oldChild.length - 1;
  // 循环遍历新老节点，找出节点中不一样的地方，然后更新
  while (newStartIdx <= newEndIdx || oldStartIdx <= oldEndIdx) {
    // 新开始节点
    const newStartNode = child[newStartIdx];
    // 新结束节点
    const newEndNode = child[newEndIdx];
    // 老开始节点
    const oldStartNode = oldChild[oldStartIdx];
    // 老结束节点
    const oldEndNode = oldChild[oldEndIdx];
    // 开始4种假设
    if (sameVnode(newStartNode, oldStartNode)) {
      // 对比这两个节点，找出不同然后更新
      patchVNode(oldStartNode, newStartNode);
      // 移动游标
      oldStartIdx++;
      newStartIdx++;
    } else if (sameVnode(newStartNode, oldEndNode)) {
      patchVNode(oldEndNode, newStartNode);
      // 将老节点移动到新开始的位置
      oldEndNode.elm.parentNode.insertBefore(
        oldEndNode.elm,
        oldChild[newStartIdx].elm
      );
      oldEndIdx--;
      newStartIdx++;
    } else if (sameVnode(newEndNode, oldStartNode)) {
      patchVNode(oldStartNode, newEndNode);
      oldStartNode.elm.parentNode.insertBefore(
        oldStartNode.elm,
        oldChild[newEndIdx].elm.nextSibling
      );
      oldStartIdx++;
      newEndIdx--;
    } else if (sameVnode(newEndNode, oldEndNode)) {
      patchVNode(oldEndNode, newEndNode);
      newEndIdx--;
      oldEndIdx--;
    } else {
      // 说明4种假设都失败了，则老老实的遍历，找到那个相同元素
    }
  }
  // 跳出循环，节点遍历结束
  if (newStartIdx < newEndIdx) {
    // 说明老节点先遍历结束，则将剩余的新节点添加到 DOM 中
  }
  if (oldStartIdx < oldEndIdx) {
    // 说明新节点先遍历结束，则将剩余的这些老节点从 DOM 中删掉
  }
}

/**
 * @description: 判断是否为同一个节点
 * @param {*} a
 * @param {*} b
 * @return {*}
 */
function sameVnode(a, b) {
  // undefined === undefined -> true
  return a.key === b.key && a.tag === b.tag;
}
