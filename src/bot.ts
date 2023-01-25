import TeleBot from 'telebot';

const bot = new TeleBot(process.env.TELEGRAM_TOKEN as string);

bot.on('/start', msg => {
    return bot.sendMessage(msg.chat.id, "HELLO WORLD");
});

//bot.start();
bot.setWebhook(`https://${process.env.VERCEL_URL}/api/handler`);

export default bot;