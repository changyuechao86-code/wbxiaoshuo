import { describe, it, expect } from 'vitest';
import { countWords, extractPlainText, countWordsFromJSON, calcProgress } from '../../renderer/utils/word-counter';

describe('countWords', () => {
  it('返回 0 对空字符串', () => {
    expect(countWords('')).toBe(0);
  });

  it('返回 0 对 null/undefined 等 falsy 值', () => {
    expect(countWords(null as any)).toBe(0);
    expect(countWords(undefined as any)).toBe(0);
  });

  it('统计纯中文', () => {
    expect(countWords('你好世界')).toBe(4);
    expect(countWords('剑指苍穹')).toBe(4);
  });

  it('统计纯英文单词', () => {
    expect(countWords('hello world')).toBe(2);
    expect(countWords('the quick brown fox')).toBe(4);
  });

  it('统计中英文混合', () => {
    expect(countWords('Hello你好World世界')).toBe(6);
  });

  it('忽略标点符号', () => {
    expect(countWords('你好！世界。')).toBe(4);
    expect(countWords('hello, world!')).toBe(2);
  });

  it('处理纯空格', () => {
    expect(countWords('   ')).toBe(0);
  });

  it('处理换行符', () => {
    // 第一行(3) + 第二行(3) + 第三行(3) = 9 个中文字符
    expect(countWords('第一行\n第二行\n第三行')).toBe(9);
  });

  it('处理数字（不统计）', () => {
    expect(countWords('第128章 2024年')).toBe(3);
  });

  it('中文不应统计为英文单词', () => {
    // ABC(1英文单词) + 你好(2中文) + DEF(1英文单词) = 4
    expect(countWords('ABC你好DEF')).toBe(4);
  });
});

describe('extractPlainText', () => {
  it('从简单 TipTap JSON 提取纯文本', () => {
    const json = JSON.stringify({
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Hello你好' }] },
      ],
    });
    expect(extractPlainText(json)).toBe('Hello你好');
  });

  it('从嵌套文档提取', () => {
    const json = JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: '第一段' },
          ],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: '第二段' },
          ],
        },
      ],
    });
    expect(extractPlainText(json)).toBe('第一段第二段');
  });

  it('处理无效 JSON 返回空字符串', () => {
    expect(extractPlainText('not json')).toBe('');
  });

  it('处理空 JSON 对象', () => {
    expect(extractPlainText('{}')).toBe('');
  });
});

describe('countWordsFromJSON', () => {
  it('从 JSON 统计字数', () => {
    const json = JSON.stringify({
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: '你好世界' }] },
      ],
    });
    expect(countWordsFromJSON(json)).toBe(4);
  });

  it('空格和空文档', () => {
    expect(countWordsFromJSON('{}')).toBe(0);
  });
});

describe('calcProgress', () => {
  it('计算进度百分比', () => {
    expect(calcProgress(2000, 4100)).toBe(49);
    expect(calcProgress(4100, 4100)).toBe(100);
  });

  it('超过目标封顶 100%', () => {
    expect(calcProgress(5000, 4100)).toBe(100);
  });

  it('目标为 0 返回 100', () => {
    expect(calcProgress(100, 0)).toBe(100);
  });

  it('精确取整', () => {
    expect(calcProgress(1234, 4100)).toBe(30);
    expect(calcProgress(1, 4100)).toBe(0);
  });
});
