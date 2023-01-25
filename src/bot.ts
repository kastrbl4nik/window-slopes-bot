import TeleBot from 'telebot';

const bot = new TeleBot(process.env.TELEGRAM_TOKEN as string);

bot.on('/start', msg => {
    return bot.sendMessage(msg.chat.id, "HELLO WORLD");
});

if(process.env.NODE_ENV === "debug")
    bot.start();
else
    bot.setWebhook(`https://${process.env.VERCEL_ENV}/api/handler`).catch((err) => console.log(err));

export default bot;