const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const bodyParser = require('body-parser');

const token = process.env.TOKEN;
const bot = new TelegramBot(token);

const app = express();
app.use(bodyParser.json());

app.post(`/bot${token}`, (req, res) => {
  console.log('Received update:', req.body); // Log để debug
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

bot.on('web_app_data', (msg) => {
  console.log('Web app data received:', msg); // Log để debug
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
    }).then(() => {
      console.log('Message sent successfully');
    }).catch((error) => {
      console.error('Error sending message:', error);
    });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, async () => {
  console.log(`Server running on port ${port}`);
  const webhookUrl = `https://${process.env.RENDER_EXTERNAL_HOSTNAME}/bot${token}`;
  try {
    await bot.setWebHook(webhookUrl);
    console.log(`Webhook set to ${webhookUrl}`);
  } catch (error) {
    console.error('Error setting webhook:', error);
  }
});