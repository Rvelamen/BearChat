// 监听扩展图标点击事件
chrome.action.onClicked.addListener((tab) => {
  // 打开侧边栏
  chrome.sidePanel.open({ tabId: tab.id });
});

// 当侧边栏连接到background时
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'sidebar') {
    // 监听来自侧边栏的消息
    port.onMessage.addListener((message) => {
      console.log(message);
    });
  }
});

// 检查URL是否有效且可嵌入
function isValidUrl(url) {
  // 检查是否为chrome:// 扩展页面或其他特殊协议页面
  if (url.startsWith('chrome://') || url.startsWith('chrome-extension://') || 
      url.startsWith('about:') || url.startsWith('edge://') || 
      url.startsWith('brave://') || url.startsWith('view-source:')) {
    return false;
  }
  
  // 尝试解析URL
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}