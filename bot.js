const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const bodyParser = require('body-parser');

const token = process.env.TOKEN;
const bot = new TelegramBot(token);

// Tạo Express app
const app = express();
app.use(bodyParser.json());

// Đặt webhook endpoint
app.post(`/bot${token}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Xử lý dữ liệu từ Mini App
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

// Khởi động server
const port = process.env.PORT || 3000;
app.listen(port, async () => {
  console.log(`Server running on port ${port}`);
  // Đặt webhook cho bot
  const webhookUrl = `https://${process.env.RENDER_EXTERNAL_HOSTNAME}/bot${token}`;
  await bot.setWebHook(webhookUrl);
  console.log(`Webhook set to ${webhookUrl}`);
});