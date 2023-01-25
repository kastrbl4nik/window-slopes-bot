import TeleBot from 'telebot';

const bot = new TeleBot({
    token: process.env.TELEGRAM_TOKEN as string,
    webhook: {
        url: `https://${process.env.VERCEL_URL}/api/handler`,
    }
});

bot.on('/start', msg => {
    return bot.sendMessage(msg.chat.id, "HELLO WORLD");
});

bot.start();

export default bot;