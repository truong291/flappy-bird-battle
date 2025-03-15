const TelegramBot = require('node-telegram-bot-api');
const token = '7722618480:AAG4oj856tdV-IlekeMw5ko-8iDH07ywM7M';
const bot = new TelegramBot(token, { webHook: false });

bot.on('web_app_data', (msg) => {
  const chatId = msg.message.chat.id;
  const data = JSON.parse(msg.web_app_data.data);

  if (data.type === 'share') {
    const inlineKeyboard = {
      inline_keyboard: [
        [
          {
            text: data.button_text,
            url: data.referral_link
          }
        ]
      ]
    };

    bot.sendMessage(chatId, data.text, {
      reply_markup: inlineKeyboard
    });
  }
});

bot.startPolling();