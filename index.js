const { Telegraf } = require('telegraf');
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('ok'));

app.listen(process.env.PORT || 3000);

const bot = new Telegraf(process.env.BOT_TOKEN);

function isAllCaps(word) {
  return word === word.toUpperCase();
}
// GENE
function replaceToGStyleWord(word) {
  const isCaps = isAllCaps(word);
  const hard = 'БВГДЖЗКЛМНПРСТФХЦЧШЩ';

  return word
    .split("")
    .map((char, i, arr) => {
      const upper = char.toUpperCase();
      const lower = char.toLowerCase();

      // Обработка последнего символа
      if (i === arr.length - 1 && arr.length > 1) {
        if (hard.includes(upper)) {
          return char + (isCaps ? 'Ъ' : 'ъ');
        }
        if (lower === 'ь') {
          return isCaps ? 'Ъ' : 'ъ';
        }
        return isCaps ? upper : char;
      }

      const prev = arr[i - 1]

      // Замена 'е' на 'ѣ'
      if (lower === 'е' && prev && hard.includes(prev.toUpperCase())) {
        return isCaps ? 'Ѣ' : 'ѣ';
      }

      return isCaps ? upper : char;
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

// JDFLAG
const REPLACEMENTS = {
  'в': 'v',
  'г': 'g',
  'д': 'd',
  'з': 'z',
  'к': 'k',
  'л': 'l',
  'м': 'm',
  'н': 'n',
  'р': 'r',
  'с': 's',
  'т': 't',
  'ф': 'f'
};

function formatWord(word) {
  function process(index, acc) {
    if (index >= word.length) return acc;

    const char = word[index];
    const lower = char.toLowerCase();
    const replacement = REPLACEMENTS[lower];

    let nextChar;
    if (replacement) {
      nextChar = char === lower
        ? replacement
        : replacement.toUpperCase();
    } else {
      nextChar = char;
    }

    return process(index + 1, acc + nextChar);
  }

  return process(0, '');
}

function formatTextJDFLAG(text) {
  function processWords(words, index, acc) {
    if (index >= words.length) return acc.join('');

    const token = words[index];
    const formatted = /\s/.test(token) ? token : formatWord(token);
    acc.push(formatted);

    return processWords(words, index + 1, acc);
  }

  const tokens = text.split(/(\s+)/);
  return processWords(tokens, 0, []);
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
      description: 'ТГ обрѣзаѣтъ сообщѣния | такъ что получится' +
        ' максъ 30-40 словъ. запятая с пробѣлом = |',
      input_message_content: {
        message_text: replaceToGStyle(q),
      }
    },
    {
      type: 'article',
      id: `${Date.now()}_${Math.random()}`,
      title: 'SDELAЙ ЭТУ ХУЙNЮ',
      description: 'TЕKST V STИLЕ FLАGА',
      input_message_content: {
        message_text: formatTextJDFLAG(q),
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

bot.command('flag', async (ctx) => {
  return ctx.reply(formatTextJDFLAG(ctx.message.text)?.trim());
});

bot.command('gene', async (ctx) => {
  return ctx.reply(replaceToGStyle(ctx.message.text)?.trim());
});

bot.on('text', async () => {
  return 'тепѣръ в боте естъ и FLAG, tаk чtо vыбиrай че хочешь чеrеz /flag' +
    ' tеkst иlи /gene тѣкстъ'
});

bot.launch();

console.log('bot started');