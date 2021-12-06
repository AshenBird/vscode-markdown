

import { shallowRef } from "vue";
export const debounce = <T extends unknown[]>(
  func: (...args: T) => void,
  delay: number
) => {
  let timer: number;
  return (...args: T) => {
    clearTimeout(timer);
    timer = window.setTimeout(() => {
      // func(...args);
      func.apply(undefined, args);
    }, delay);
  };
};


// 文章导航实现
export const getTitles = () => {
  const flatNodes = [];
  const groupMap = new Map();
  const list = new Map();
  const currentGroup: Record<string, string> = {};
  // 讲所有标题拿出来
  for (let i = 1; i <= 6; i++) {
    flatNodes.push(...document.querySelectorAll(`h${i}.heading`));
  }

  // 给他们排个序
  flatNodes.sort((a, b) => {
    const r = a.compareDocumentPosition(b);
    switch (r) {
      case 2:
        return 1;
      case 4:
        return -1;
    }
    return 0;
  });

  // 逐个遍历生成树
  flatNodes.forEach((node, index) => {
    const level = node.nodeName[1];
    const id = `AT${index + 1}`;
    currentGroup[level] = id;
    const group = currentGroup[(Number(level) - 1).toString()];
    const item = {
      level,
      label: node.textContent,
      key: id,
      scroll: () => node.scrollIntoView(),
      // children: [],
    };
    list.set(id, item);
    groupMap.set(id, item);
    if (level === "1") { return; } // 顶级
    
    const f = groupMap.get(group);
    if(!f.children){
      f.children = [];
    }
    console.log(f, item);
    f.children.push(groupMap.get(id));
  });

  return {
    list,
    tree: [...groupMap.values()].filter((item) => item.level === "2")
  };
};