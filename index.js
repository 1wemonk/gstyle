const { Telegraf } = require('telegraf');
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('ok'));

app.listen(process.env.PORT || 3000);

const bot = new Telegraf(process.env.BOT_TOKEN);

function replaceToGStyleWord(word) {
  const hard = 'БВГДЖЗКЛМНПРСТФХЦЧШЩ';

  return word
    .split("")
    .map((char, i, arr) => {
      // Обработка последнего символа
      if (i === arr.length - 1) {
        if (hard.includes(char.toUpperCase())) {
          return char + 'ъ';
        }
        if (char.toLowerCase() === 'ь') {
          return 'ъ';
        }
      }

      const prev = arr[i - 1]

      // Замена 'е' на 'ѣ'
      if (char.toLowerCase() === 'е' && hard.includes(prev.toUpperCase())) {
        return char === 'е' ? 'ѣ' : 'Ѣ';
      }

      return char;
    })
    .join("");
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