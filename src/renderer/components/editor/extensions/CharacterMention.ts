/**
 * TipTap @角色提及扩展
 * 输入 @ 触发角色名称搜索和插入
 */
import Mention from '@tiptap/extension-mention';
import { PluginKey } from '@tiptap/pm/state';

export const CharacterMentionPluginKey = new PluginKey('character-mention');

/**
 * 创建角色提及扩展
 * @param getCharacters 获取当前项目角色列表的函数
 */
export function createCharacterMentionExtension(
  getCharacters: () => Array<{ id: string; name: string }>,
) {
  return Mention.configure({
    HTMLAttributes: {
      class: 'character-mention',
    },
    suggestion: {
      char: '@',
      pluginKey: CharacterMentionPluginKey,
      items: ({ query }: { query: string }) => {
        const characters = getCharacters();
        if (!query) return characters.slice(0, 10);
        const lowerQuery = query.toLowerCase();
        return characters
          .filter((c) => c.name.toLowerCase().includes(lowerQuery))
          .slice(0, 10);
      },
      render: () => {
        let popup: HTMLElement | null = null;
        let selectedIndex = 0;

        const destroy = () => {
          if (popup) {
            popup.remove();
            popup = null;
          }
        };

        return {
          onStart: (props: any) => {
            popup = document.createElement('div');
            popup.className = 'character-mention-dropdown';
            popup.style.cssText = `
              position: absolute;
              z-index: 9999;
              background: #16213e;
              border: 1px solid #3a3a5e;
              border-radius: 6px;
              max-height: 200px;
              overflow-y: auto;
              min-width: 180px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            `;
            document.body.appendChild(popup);

            // 定位
            const { clientRect } = props;
            if (clientRect) {
              popup.style.left = `${clientRect.left}px`;
              popup.style.top = `${clientRect.bottom + 4}px`;
            }
          },

          onUpdate: (props: any) => {
            selectedIndex = 0;
            if (!popup) return;

            const items = props.items as Array<{ id: string; name: string }>;
            popup.innerHTML = items
              .map(
                (item, idx) => `
                  <div class="mention-item ${idx === 0 ? 'mention-item-selected' : ''}"
                       style="padding:6px 12px;cursor:pointer;font-size:13px;color:#cdd6f4;${
                         idx === 0 ? 'background:#2a2a4e;' : ''
                       }">
                    @${item.name}
                  </div>`,
              )
              .join('');

            // 绑定点击事件
            popup.querySelectorAll('.mention-item').forEach((el, idx) => {
              el.addEventListener('click', () => {
                props.command({ id: items[idx].id, label: items[idx].name });
              });
              el.addEventListener('mouseenter', () => {
                selectedIndex = idx;
                popup!.querySelectorAll('.mention-item').forEach((e, i) => {
                  (e as HTMLElement).style.background = i === idx ? '#2a2a4e' : 'transparent';
                });
              });
            });
          },

          onKeyDown: (props: any) => {
            if (!popup) return false;
            const items = props.items as Array<any>;

            if (props.event.key === 'ArrowDown') {
              selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
              popup!.querySelectorAll('.mention-item').forEach((el, idx) => {
                (el as HTMLElement).style.background = idx === selectedIndex ? '#2a2a4e' : 'transparent';
              });
              return true;
            }
            if (props.event.key === 'ArrowUp') {
              selectedIndex = Math.max(selectedIndex - 1, 0);
              popup!.querySelectorAll('.mention-item').forEach((el, idx) => {
                (el as HTMLElement).style.background = idx === selectedIndex ? '#2a2a4e' : 'transparent';
              });
              return true;
            }
            if (props.event.key === 'Enter') {
              const item = items[selectedIndex];
              if (item) {
                props.command({ id: item.id, label: item.name });
              }
              return true;
            }
            if (props.event.key === 'Escape') {
              destroy();
              return true;
            }
            return false;
          },

          onExit: destroy,
        };
      },
    },
  });
}
