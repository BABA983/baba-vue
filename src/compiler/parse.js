/*
 * @Author: raoqidi
 * @Date: 2021-08-21 10:50:28
 * @LastEditors: raoqidi
 * @LastEditTime: 2021-09-21 11:51:24
 * @Description: please add a description to the file
 * @FilePath: /baba-vue/src/compiler/parse.js
 */
import { isUnaryTag } from '../utils.js';
/**
 * 解析模版字符串，生成 AST 语法树
 * @param {*} template 模版字符串
 * @returns {AST} root ast 语法树
 */
export default function parse(template) {
  // 最终返回的结果
  let root = null;
  // 备份模版html
  let html = template;
  // 存放所有的未配对的开始标签的 AST 对象
  const stack = [];
  while (html.trim()) {
    // 注释标签
    if (html.indexOf('<!--') === 0) {
      // 找到注释节点的结束为止
      const endIdx = html.indexOf('-->');
      // <!-- comment --><div id="app">xxx</div>
      html = html.slice(endIdx + 3);
      continue;
    }
    const startIdx = html.indexOf('<');
    // 匹配到 html 标签的开头 <div id="app"></div>
    if (startIdx === 0) {
      if (html.indexOf('</') === 0) {
        // 结束标签
        parseEnd();
      } else {
        // 开始标签 html更新 去掉<div>, 剩下 xxx</div>
        parseStartTag();
      }
    } else if (startIdx > 0) {
      // html: xxx</div> 处理结束标签前面的内容
      const nextStartIdx = html.indexOf('<');
      if (stack.length) {
        // stack 说明文本是栈顶元素的文本节点
        processChars(html.slice(0, nextStartIdx));
      }
      // 将文本节点从 html 字符串中截掉 更新html: </div>
      html = html.slice(nextStartIdx);
    } else {
      // 整个模版 template 中没有标签信息，纯文本
      // 不考虑，直接去掉
    }
  }
  return root;
  /**
   * 处理开始标签，比如：<div id="app"></div> || <h3></h3>
   */
  function parseStartTag() {
    // 匹配开始标签的结束位置 >
    const endIdx = html.indexOf('>');

    // 截取开始标签内的所有内容 `div id="app"` || h3
    const content = html.slice(1, endIdx);

    // 更新 html 模版字符串 剩下 xxx</div>
    html = html.slice(endIdx + 1);

    let tagName = '';
    let attrStr = '';
    // 找到 content 里面的第一个空格
    const firstSpaceIdx = content.indexOf(' ');
    if (firstSpaceIdx === -1) {
      // 没有找到空格, 只有标签名没有属性
      tagName = content;
    } else {
      // const contentArr = content.split(' ');
      // tagName = contentArr[0];
      tagName = content.slice(0, firstSpaceIdx);
      // 属性字符串 `id="app" class="className"`
      attrStr = content.slice(firstSpaceIdx + 1);
    }

    // 属性字符串切割成数组 ['id="app"','class="className"']
    const attrs = attrStr ? attrStr.split(' ') : [];

    // 进一步处理属性数组，得到一个 map 对象
    const attrMap = parseAttrs(attrs);

    // 生成 AST
    const elementAst = generateAST(tagName, attrMap);

    if (!root) {
      // 说明现在处理的标签是最开始的第一个标签
      root = elementAst;
    }

    // 将 ast 对象 push 到栈中，当遇到它的结束标签时，就讲栈顶的 ast 对象 pop 出来，这样两个就是一对
    stack.push(elementAst);

    // 自闭合标签，比如 <input v-model="input"/>
    if (isUnaryTag(tagName)) {
      // 说明是自闭合标签，直接进入闭合标签的处理逻辑, 不入栈
      processElement();
    }
  }
  /**
   * 解析属性数组，得到 key, value 形式的 Map 对象
   * @param {*} attrs 属性数组
   */
  function parseAttrs(attrs) {
    const attrMap = {};
    for (const attr of attrs) {
      // attr = `id="app"`
      const [attrName, attrValue] = attr.split('=');
      attrMap[attrName] = attrValue.replace(/\"/g, '');
    }
    return attrMap;
  }
  /**
   * 生成 ast 对象
   * @param {*} tag 标签名
   * @param {*} attrMap 属性对象
   */
  function generateAST(tag, attrMap) {
    return {
      // 元素节点
      type: 1,
      // 标签名
      tag,
      // 原始属性对象
      rawAttr: attrMap,
      // 子节点
      children: [],
    };
  }

  /**
   * 处理闭合标签
   */
  function parseEnd() {
    // 将闭合标签从 html 中去掉
    html = html.slice(html.indexOf('>') + 1);
    // 处理栈顶元素
    processElement();
  }

  /**
   * 处理文本节点的内容
   * @param text 文本内容
   */
  function processChars(text) {
    if (!text.trim()) return;

    // 构造文本节点的 AST 对象
    const textAST = {
      type: 3, // NodeType
      text,
    };
    if (text.match(/{{(.*)}}/)) {
      // 处理文本是表达式的情况
      textAST.expression = RegExp.$1.trim();
    }
    // 将文本节点放到栈里
    stack[stack.length - 1].children.push(textAST);
  }

  /**
   * 进一步处理闭合标签的时候会被调用
   * 进一步处理元素上面的各个属性，并且将处理结果放到 attr 属性上面
   * <input v-model="xxx" v-bind:placeholder="xxx" />
   * <button v-on:click="handleClick">click</button>
   */
  function processElement() {
    // 弹出栈顶元素，做进一步处理
    const curEle = stack.pop();
    // 进一步处理 AST 对象中的 rawAttr 对象，{ attrName: attrValue, ... }, 将处理结果放到 attr
    const { rawAttr } = curEle;
    curEle.attr = {};
    // 原始属性名组成的数组，比如 ['v-model', 'v-bind:xxx', 'v-on:click']
    const propertyArr = Object.keys(rawAttr);
    if (propertyArr.includes('v-model')) {
      // 处理 v-model 指令
      processVModel(curEle);
    } else if (propertyArr.find((item) => item.match(/v-bind:(.*)/))) {
      // 处理 v-bind
      processVBind(curEle, RegExp.$1, rawAttr[`v-bind:${RegExp.$1}`]);
    } else if (propertyArr.find((item) => item.match(/v-on:(.*)/))) {
      // 处理 v-on
      processVOn(curEle, RegExp.$1, rawAttr[`v-on:${RegExp.$1}`]);
    }

    // 处理插槽内容
    processSlotContent(curEle);

    // 节点处理完以后让其和父节点产生关系
    const stackLen = stack.length;
    if (stackLen) {
      stack[stackLen - 1].children.push(curEle);
      curEle.parent = stack[stackLen - 1];

      // 如果节点存在 slotName，则说明该节点是组件传递给插槽的内容
      // 将插槽信息放到组件节点的 rawAttr.scopedSlots 对象上
      // 而这些信息在生成组件插槽的 VNode 时（renderSlot）会用到
      if (curEle.slotName) {
        const { parent, slotName, scopeSlot, children } = curEle;
        // 这里关于 children 的操作，只是单纯为了避开 JSON.stringify 的循环引用问题
        // 因为生成渲染函数时需要对 attr 执行 JSON.stringify 方法
        const slotInfo = {
          slotName,
          scopeSlot,
          children: children.map((item) => {
            delete item.parent;
            return item;
          }),
        };
        if (parent.rawAttr.scopedSlots) {
          parent.rawAttr.scopedSlots[curEle.slotName] = slotInfo;
        } else {
          parent.rawAttr.scopedSlots = { [curEle.slotName]: slotInfo };
        }
      }
    }
  }
}

/**
 * 处理 v-model 指令，将处理结果放到 curEle.attr 对象对象上
 * @param {*} curEle
 * <input type="text" v-model="xx"/>
 * <textarea v-model="xx"/>
 * <input type="checkbox" v-model="xx"/>
 * <select  v-model="xx"/>
 */
function processVModel(curEle) {
  const { tag, attr, rawAttr } = curEle;
  const { type, 'v-model': vModelValue } = rawAttr;
  if (tag === 'input') {
    // input 输入框 或者 checkbox
    if (/text/.test(type)) {
      // 文本框
      attr.vModel = { tag, type: 'text', value: vModelValue };
    } else if (/checkbox/.test(type)) {
      attr.vModel = { tag, type: 'checkbox', value: vModelValue };
    }
  } else if (tag === 'textarea') {
    attr.vModel = { tag, value: vModelValue };
  } else if (tag === 'select') {
    attr.vModel = { tag, value: vModelValue };
  }
}
/**
 * 处理 v-bind 指令，将处理结果放到 curEle.attr 对象对象上
 * @param {*} curEle
 * @param {*} bindKey
 * @param {*} bindValue
 * <span v-bind:title="title"></span>
 */
function processVBind(curEle, bindKey, bindValue) {
  curEle.attr.vBind = { [bindKey]: bindValue };
}
/**
 * 处理 v-on 指令，将处理结果放到 curEle.attr 对象对象上
 * @param {*} curEle
 * @param {*} vOnKey
 * @param {*} vOnVal
 * <button v-on:click>click</button>
 */
function processVOn(curEle, vOnKey, vOnVal) {
  curEle.attr.vOn = { [vOnKey]: vOnVal };
}

/**
 * 处理插槽
 * <scope-slot>
 *   <template v-slot:default="scopeSlot">
 *     <div>{{ scopeSlot }}</div>
 *   </template>
 * </scope-slot>
 * @param {*} el 节点的 AST 对象
 */
function processSlotContent(el) {
  // 注意，具有 v-slot:xx 属性的 template 只能是组件的根元素，这里不做判断
  if (el.tag === 'template') {
    // 获取插槽信息
    // 属性 map 对象
    const attrMap = el.rawAttr;
    // 遍历属性 map 对象，找出其中的 v-slot 指令信息
    for (let key in attrMap) {
      if (key.match(/v-slot:(.*)/)) {
        // 说明 template 标签上 v-slot 指令
        // 获取指令后的插槽名称和值，比如: v-slot:default=xx
        // default
        const slotName = (el.slotName = RegExp.$1);
        // xx
        el.scopeSlot = attrMap[`v-slot:${slotName}`];
        // 直接 return，因为该标签上只可能有一个 v-slot 指令
        return;
      }
    }
  }
}
