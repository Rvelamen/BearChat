import { v4 as uuidv4 } from "uuid";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";


// Generate a simple UUID
export const simpleUUID = (): string => {
  return uuidv4();
};

// Format message content with markdown and code highlighting
export const formatMessage = (content: string): string => {
  if (!content) {
    return "";
  }

  const marked = new Marked(
    markedHighlight({
      emptyLangClass: "hljs",
      langPrefix: "hljs language-",
      highlight(code, lang, info) {
        const language = hljs.getLanguage(lang) ? lang : "plaintext";
        return hljs.highlight(code, { language }).value;
      },
    }),
    {
      headerIds: false,
      mangle: false,
      gfm: true,  // 启动类似Github样式的Markdown,
      pedantic: false,  // 只解析符合Markdown定义的，不修正Markdown的错误
      sanitize: false,  // 原始输出，忽略HTML标签
      breaks: true,  // 支持Github换行符，必须打开gfm选项
      smartypants: false,
    }
  );
  return marked.parse(content);
};

// Scroll to bottom of container
export const scrollToBottom = (
  containerRef: React.RefObject<HTMLDivElement>
) => {
  if (containerRef.current) {
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }
};

// Scroll to top of container
export const scrollToTop = (containerRef: React.RefObject<HTMLDivElement>) => {
  if (containerRef.current) {
    containerRef.current.scrollTop = 0;
  }
};

// Safe JSON parse
export const safeJsonParse = (json: string) => {
  // console.log(json);
  try {
    return JSON.parse(json);
  } catch (err) {
    console.error("Error parsing JSON:", err);
    return null;
  }
};



 // 格式化 JSON 字符串，使其更易读
export const formatJson = (json: any) => {
  // console.log("formatJson", json);
  try {
    return typeof json === 'string' ? JSON.stringify(JSON.parse(json), null, 2) : JSON.stringify(json, null, 2);
  } catch (e) {
    return "{}";
  }
};

// 解析 JSON 字符串，处理可能的错误
export const parseJson = (jsonString: string) => {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.error('Invalid JSON:', e);
    return null;
  }
};