/**
 * 字数统计工具
 * 规则：统计中文字符 + 英文单词数量
 */

/** 中文字符正则 */
const CHINESE_CHAR_REGEX = /[\u4e00-\u9fff\u3400-\u4dbf]/g;

/** 英文单词正则 */
const ENGLISH_WORD_REGEX = /[a-zA-Z]+/g;

/** 纯文本字数统计 */
export function countWords(text: string): number {
  if (!text) return 0;

  let count = 0;

  // 统计中文字符
  const chineseMatches = text.match(CHINESE_CHAR_REGEX);
  if (chineseMatches) {
    count += chineseMatches.length;
  }

  // 统计英文单词
  const englishMatches = text.match(ENGLISH_WORD_REGEX);
  if (englishMatches) {
    count += englishMatches.length;
  }

  return count;
}

/** 从 TipTap JSON 中提取纯文本 */
export function extractPlainText(json: string): string {
  try {
    const doc = JSON.parse(json);
    const texts: string[] = [];

    function walk(node: any): void {
      if (node.text) {
        texts.push(node.text);
      }
      if (node.content && Array.isArray(node.content)) {
        for (const child of node.content) {
          walk(child);
        }
      }
    }

    walk(doc);
    return texts.join('');
  } catch {
    return '';
  }
}

/** 从 TipTap JSON 统计字数（先提取纯文本再统计） */
export function countWordsFromJSON(json: string): number {
  return countWords(extractPlainText(json));
}

/** 计算日更进度百分比 */
export function calcProgress(wordCount: number, dailyGoal: number): number {
  if (dailyGoal <= 0) return 100;
  return Math.min(100, Math.round((wordCount / dailyGoal) * 100));
}
