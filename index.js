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
  let result = ctx;

  // заменяем запятую с пробелом
  result = result.replace(/,\s+/g, ' | ');

  // нормализуем пробелы
  result = result.replace(/\s+/g, ' ').trim();

  return result
    .split(' ')
    .map(word => replaceToGStyleWord(word))
    .join(' ');
}

bot.on('inline_query', async (ctx) => {
  const q = (ctx.inlineQuery.query || '').trim();

  if (!q || q.trim().length === 0) {
    return ctx.answerInlineQuery([]);
  }

  const result = [
    // {
    //   type: 'article',
    //   id: '1',
    //   title: 'Send original',
    //   description: q,
    //   input_message_content: {
    //     message_text: q
    //   }
    // },
    {
      type: 'article',
      id: `${Date.now()}_${Math.random()}`,
      title: 'Сделай G Style',
      description: 'запятая с пробѣлом = | \n' + replaceToGStyle(q),
      input_message_content: {
        message_text: replaceToGStyle(q),
      }
    },
    // {
    //   type: 'article',
    //   id: `${Date.now()}_${Math.random()}`,
    //   title: 'МЕняю',
    //   description: '',
    //   input_message_content: {
    //     message_text: replaceToHard(q)
    //   }
    // }
  ];

  return ctx.answerInlineQuery(result, {
    cache_time: 0,
    is_personal: true,
  });
});

bot.launch();

console.log('bot started');