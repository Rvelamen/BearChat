// 连接到background脚本
const port = chrome.runtime.connect({ name: "sidebar" });

// 获取DOM元素
const iframe = document.getElementById("deepopen-content-frame");
const loader = document.getElementById("loader");
const urlInput = document.getElementById("url-input");

// 处理URL输入
function handleUrlInput() {
  let url = urlInput.value.trim();
  
  // 基本URL验证
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `http://${url}`;
  }
  
  try {
    new URL(url); // 验证URL格式
    loadIframe(url);
  } catch {
    loader.textContent = "无效的网址格式";
  }
}

// 加载iframe的通用函数
function loadIframe(url) {
  loader.querySelector('div').style.display = 'block'; // 显示加载提示
  // 创建一个新的iframe元素替换旧的
  // 这种方式可以避免unload事件相关的问题
  const newIframe = document.createElement("iframe");
  newIframe.id = "deepopen-content-frame";
  newIframe.style.width = "100%";
  newIframe.style.height = "100%";
  newIframe.style.border = "none";
  newIframe.style.display = "none";
  newIframe.setAttribute(
    "sandbox",
    "allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation"
  );
  newIframe.setAttribute("allow", "fullscreen *; autoplay *");

  // 监听加载完成事件
  newIframe.addEventListener("load", () => {
    loader.style.display = "none";
    newIframe.style.display = "block";
  });

  // 设置错误处理
  newIframe.addEventListener("error", () => {
    loader.textContent = "无法加载内容";
  });

  // 设置src
  newIframe.src = url;

  // 替换旧的iframe
  if (iframe.parentNode) {
    iframe.parentNode.replaceChild(newIframe, iframe);
  }
}

// 修改DOMContentLoaded事件
document.addEventListener("DOMContentLoaded", () => {
  // 隐藏加载文字，只显示输入框
  loader.querySelector('div').style.display = 'none';
  
  // 设置输入框事件监听
  urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleUrlInput();
    }
  });
  
  // 初始聚焦输入框
  urlInput.focus();
});

