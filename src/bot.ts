import TeleBot from 'telebot';

const bot = new TeleBot(process.env.TELEGRAM_TOKEN as string);

bot.on('/start', msg => {
    return bot.sendMessage(msg.chat.id, "HELLO WORLD");
});

if(process.env.VERCEL_ENV != "production")
    bot.start(); // Use long polling instead of webhook
else
    bot.setWebhook(`https://window-slopes-bot.vercel.app/api/handler`);

export default bot;