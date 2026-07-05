const { Telegraf } = require('telegraf');
const express = require('express');
const {pre} = require('telegraf/format')
const app = express();

app.get('/', (req, res) => res.send('ok'));

app.listen(process.env.PORT || 3000);

const bot = new Telegraf(process.env.BOT_TOKEN);

function isAllCaps(word) {
  return word === word.toUpperCase();
}

function splitWordAndEmoji(word) {
  const match = word.match(/^([\p{L}\p{M}]+)(.*)$/u);
  return match ? [match[1], match[2]] : [word, ''];
}

function replaceToGStyleWord(word) {
  const [pureWord, suffix] = word.match(/^([\p{L}\p{M}]+)(.*)$/u) || [word, ''];

  const isCaps = pureWord === pureWord.toUpperCase();
  const hard = 'БВГДЖЗКЛМНПРСТФХЦЧШЩ';

  const transformed = pureWord
    .split("")
    .map((char, i, arr) => {
      const upper = char.toUpperCase();
      const lower = char.toLowerCase();

      if (i === arr.length - 1 && arr.length > 1) {
        if (hard.includes(upper)) {
          return char + (isCaps ? 'Ъ' : 'ъ');
        }
        if (lower === 'ь') {
          return isCaps ? 'Ъ' : 'ъ';
        }
        return isCaps ? upper : char;
      }

      const prev = arr[i - 1];

      if (lower === 'е' && prev && hard.includes(prev.toUpperCase())) {
        return isCaps ? 'Ѣ' : 'ѣ';
      }

      return isCaps ? upper : char;
    })
    .join("");

  return transformed + suffix;
}

function replaceToGStyle(ctx) {
  return ctx
    .replace(/,\s+/g, ' | ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(/\s+/)
    .map(replaceToGStyleWord)
    .join(' ');
}

bot.on('inline_query', async (ctx) => {
  const q = (ctx.inlineQuery.query || '').trim();

  if (!q || q.trim().length === 0) {
    return ctx.answerInlineQuery([]);
  }

  // console.log('LEN:', replaceToGStyle(q).length);
  // console.log('TEXT:', replaceToGStyle(q));

  const result = [
    {
      type: 'article',
      id: `${Date.now()}_${Math.random()}`,
      title: 'Сделай G Style',
      description: 'ТГ обрѣзаѣтъ сообщѣния | такъ что получится написатъ' +
        ' максъ 30-40 словъ =(. запятая с пробѣлом = |',
      input_message_content: {
        message_text: replaceToGStyle(q),
      }
    },
  ];

  return ctx.answerInlineQuery(result, {
    cache_time: 0,
    is_personal: true,
  });
});

bot.command('start', (ctx) => {
  return ctx.reply('Отправъ сюда свою хуйню | я её замѣню🖤');
})

bot.on('text', async (ctx) => {
  const q = (ctx.message.text || '').trim();

  const transformed = replaceToGStyle(q);

  return ctx.reply(transformed);
});

bot.launch();

console.log('bot started');