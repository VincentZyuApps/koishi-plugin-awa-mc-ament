import { h } from 'koishi';

export const DEFAULT_KEYBOARD_ROWS = {
  rows: [
    {
      buttons: [
        {
          render_data: { label: '🔄 再来一张', style: 1 },
          action: {
            type: 2,
            permission: { type: 2 },
            data: '${commandName} -t 这里是标题 -d 这里是介绍',
            enter: true,
          },
        },
        {
          render_data: { label: '❓ 获取帮助', style: 1 },
          action: {
            type: 2,
            permission: { type: 2 },
            data: '${commandName} --help',
            enter: true,
          },
        },
      ],
    },
  ],
};

export function buildQueryKeyboard(
  commandName: string,
  userId: string,
  title: string,
  description: string,
  defaultIcon: string,
  customJson?: string,
): object {
  let raw: string;
  if (customJson) {
    raw = customJson;
  } else {
    raw = JSON.stringify(DEFAULT_KEYBOARD_ROWS);
  }
  try {
    raw = raw.replace(/\$\{commandName\}/g, commandName);
    raw = raw.replace(/\$\{userId\}/g, userId);
    raw = raw.replace(/\$\{title\}/g, title);
    raw = raw.replace(/\$\{description\}/g, description);
    raw = raw.replace(/\$\{defaultIcon\}/g, defaultIcon);
    const parsed = JSON.parse(raw);
    if (parsed?.rows?.length) return parsed;
  } catch {}
  return DEFAULT_KEYBOARD_ROWS;
}

export function buildAmentMarkdown(title: string, description: string): string {
  return [
    '# ⛏️ MC 成就/进度图！',
    '',
    `> *标题:*  <u>**${title}**</u>`,
    `> *简介:*  <u>${description}</u>`,
  ].join('\n');
}

export async function sendQQMarkdown(
  session: any,
  markdown: string,
  keyboard: object,
): Promise<void> {
  if (!['qq', 'qqguild'].includes(session.platform)) return;
  try {
    const isCrack = !!(session.bot as any)?.config?.autoStreamText;

    if (isCrack) {
      const payload: Record<string, unknown> = {
        markdown: { content: markdown },
      };
      if ((keyboard as any)?.rows?.length) {
        payload.keyboard = { content: keyboard };
      }
      await session.send(h('qq:rawmarkdown', payload));
    } else {
      const payload: Record<string, unknown> = {
        msg_type: 2,
        markdown: { content: markdown },
      };
      if ((keyboard as any)?.rows?.length) {
        payload.keyboard = { content: keyboard };
      }

      const s = session;
      if (
        s.messageId &&
        s.timestamp &&
        Date.now() - s.timestamp < 5 * 60 * 1000 - 2000
      ) {
        s.seq ||= 0;
        payload.msg_id = s.messageId;
        payload.msg_seq = ++s.seq;
      }

      await session.bot.internal.sendMessage(session.channelId, payload);
    }
  } catch (e) {
    console.warn('⚠️💬 [QQ Markdown] 发送失败, 不影响图片:', e?.message || e);
  }
}

export function stringifyCompact(obj: any): string {
  const rows = obj.rows;
  let result = '{\n';
  result += '  "rows": [\n';
  for (let ri = 0; ri < rows.length; ri++) {
    const buttons = rows[ri].buttons.map(
      (b: any) => '        ' + JSON.stringify(b),
    );
    result += '    {\n';
    result += '      "buttons": [\n';
    result += buttons.join(',\n');
    result += '\n      ]\n';
    result += '    }' + (ri < rows.length - 1 ? ',' : '') + '\n';
  }
  result += '  ]\n';
  result += '}';
  return result;
}
