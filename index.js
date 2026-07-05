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
        return char;
      }

      // Замена 'е' на 'ѣ'
      if (char.toLowerCase() === 'е') {
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

  console.log('LEN:', replaceToGStyle(q).length);
  console.log('TEXT:', replaceToGStyle(q));

  const result = [
    {
      type: 'article',
      id: `${Date.now()}_${Math.random()}`,
      title: 'Сделай G Style',
      description: 'ТГ на программном уровне обрезает сообщения, так что' +
        ' получится написать макс 30-40 слов =(\nзапятая с пробѣлом = | ',
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

bot.launch();

console.log('bot started');