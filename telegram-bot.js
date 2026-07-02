const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const ADMIN_ID = process.env.ADMIN_ID;

const userData = {};

console.log('🤖 Telegram Bot Starting...');
console.log('Bot Token:', process.env.BOT_TOKEN ? '✅ Loaded' : '❌ Missing');
console.log('Admin ID:', ADMIN_ID ? '✅ Loaded' : '❌ Missing');

// /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const firstName = msg.from.first_name;
  const username = msg.from.username || 'No username';

  userData[userId] = {
    chatId,
    firstName,
    username,
    currentStep: 'welcome'
  };

  // Welcome message
  const welcomeMsg = `🎉 Welcome, ${firstName}! 🎉

🏆 GOLD SIGNALS

Get FREE access to:
✅ VIP Gold Signals — FREE
✅ 50% Lifetime Deposit Bonus
✅ Free Vantage Trading Course

⏱️ Takes less than 2 minutes to complete.

👇 Tap below to get started.`;

  bot.sendMessage(chatId, welcomeMsg, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🚀 Let's get you set up.", callback_data: 'start_setup' }]
      ]
    }
  });

  // Admin notification
  bot.sendMessage(ADMIN_ID, `
🆕 NEW LEAD STARTED!

👤 Name: ${firstName}
🔗 Username: @${username}
🆔 User ID: ${userId}
📍 Status: Just started

💬 Reply to THIS message to send them a message
  `, {
    reply_markup: {
      inline_keyboard: [
        [{ text: '✅ Mark Complete', callback_data: `complete_${userId}` }]
      ]
    }
  });
});

// Button clicks
bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  const data = query.data;

  if (!userData[userId]) {
    bot.answerCallbackQuery(query.id, 'Please use /start to begin', true);
    return;
  }

  const user = userData[userId];

  // START SETUP - Ask for broker
  if (data === 'start_setup') {
    user.currentStep = 'broker_choice';
    
    bot.editMessageText(
      '🏦 Please select the broker you\'re currently using:',
      {
        chat_id: chatId,
        message_id: query.message.message_id,
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔵 Vantage', callback_data: 'choose_vantage' }],
            [{ text: '🔴 PU Prime', callback_data: 'choose_puprime' }]
          ]
        }
      }
    );
  }

  // VANTAGE CHOSEN
  if (data === 'choose_vantage') {
    user.broker = 'vantage';
    user.currentStep = 'vantage_steps';

    // Send image (you can add your image URL here)
    const stepsMsg = `🚀 Complete the steps below to activate your FREE Premium Group access. (Takes 10s)

1️⃣ Log-in to your Vantage client portal:
👇 https://secure.vantagemarkets.com/logout?lang=en_US

2️⃣ Fill the Form 📋
👇 https://secure.vantagemarkets.com/profile/transfer-ib-affiliate

3️⃣ Enter the following details exactly as shown:
✅ Partnership Type: IB
✅ IB Code: 58576
✅ Reason: PM

🚨 IMPORTANT
🚫 Please close all open positions before initiating the transfer.
🚫 Wait for the confirmation email before placing any new trades.

👇 Once completed, click the button below.`;

    bot.editMessageText(stepsMsg, {
      chat_id: chatId,
      message_id: query.message.message_id,
      reply_markup: {
        inline_keyboard: [
          [{ text: '✅ DONE', callback_data: 'vantage_done' }]
        ]
      }
    });

    bot.sendMessage(ADMIN_ID, `
📌 Lead chose VANTAGE

👤 ${user.firstName}
🔗 @${user.username}
🏢 Broker: Vantage
    `);
  }

  // PU PRIME CHOSEN
  if (data === 'choose_puprime') {
    user.broker = 'puprime';
    user.currentStep = 'puprime_steps';

    const stepsMsg = `🚀 Complete the steps below to activate your FREE Premium Group access. (Takes 10s)

1️⃣ Log-in to your PU Prime Client Portal
👇 https://myaccount.puprime.com/home

2️⃣ Open the IB Transfer Form
👇 https://myaccount.puprime.com/profile/transfer-ib-affiliate

3️⃣ Enter the following details exactly as shown:
✅ Partnership Type: IB
✅ IB Code: 50151
✅ Reason: PM

🚨 IMPORTANT
🚫 Please close all open positions before initiating the transfer.
🚫 Wait for the confirmation email before placing any new trades.

👇 Once completed, click the button below.`;

    bot.editMessageText(stepsMsg, {
      chat_id: chatId,
      message_id: query.message.message_id,
      reply_markup: {
        inline_keyboard: [
          [{ text: '✅ DONE', callback_data: 'puprime_done' }]
        ]
      }
    });

    bot.sendMessage(ADMIN_ID, `
📌 Lead chose PU PRIME

👤 ${user.firstName}
🔗 @${user.username}
🏢 Broker: PU Prime
    `);
  }

  // VANTAGE DONE
  if (data === 'vantage_done') {
    user.currentStep = 'email_input';

    const msg = `🎉 Almost there!

Please enter your Vantage email or MT4/MT5 number below:`;

    bot.editMessageText(msg, {
      chat_id: chatId,
      message_id: query.message.message_id
    });

    bot.sendMessage(ADMIN_ID, `
📧 Vantage lead waiting for email/MT

👤 ${user.firstName}
🏢 Broker: Vantage
    `);
  }

  // PU PRIME DONE
  if (data === 'puprime_done') {
    user.currentStep = 'email_input';

    const msg = `🎉 Almost there!

Please enter your PU Prime email or MT4/MT5 number below:`;

    bot.editMessageText(msg, {
      chat_id: chatId,
      message_id: query.message.message_id
    });

    bot.sendMessage(ADMIN_ID, `
📧 PU Prime lead waiting for email/MT

👤 ${user.firstName}
🏢 Broker: PU Prime
    `);
  }

  // MARK COMPLETE
  if (data.startsWith('complete_')) {
    const targetUserId = parseInt(data.split('_')[1]);
    if (userData[targetUserId]) {
      userData[targetUserId].currentStep = 'completed';
      bot.answerCallbackQuery(query.id, '✅ Lead marked complete!');
    }
  }

  bot.answerCallbackQuery(query.id);
});

// Text input (email/MT number)
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text;

  if (text.startsWith('/')) return;

  if (!userData[userId]) return;

  const user = userData[userId];

  if (user.currentStep === 'email_input') {
    if (text.includes('@') || /^\d+$/.test(text)) {
      user.email = text.includes('@') ? text : '';
      user.mtNumber = /^\d+$/.test(text) ? text : '';
      user.currentStep = 'completed';

      // Final confirmation
      bot.sendMessage(chatId, `
✅ Thank you!

Your information has been received.

🎁 You now have FREE access to our Premium Group!

Welcome to GOLD SIGNALS! 🚀
      `);

      // Admin notification
      bot.sendMessage(ADMIN_ID, `
✅ LEAD COMPLETED ONBOARDING!

👤 ${user.firstName}
🔗 @${user.username}
🆔 User ID: ${userId}
🏢 Broker: ${user.broker.toUpperCase()}
📧 Email/MT: ${user.email || user.mtNumber}

✨ Ready to follow up!
      `);

    } else {
      bot.sendMessage(chatId, '❌ Please enter a valid email or MT4/MT5 number.');
    }
  }
});

console.log('✅ Bot is ready!');
