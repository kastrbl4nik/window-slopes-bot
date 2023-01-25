import TeleBot from 'telebot';

const bot = new TeleBot(process.env.TELEGRAM_TOKEN as string);

bot.on('/start', msg => {
    return bot.sendMessage(msg.chat.id, "HELLO WORLD");
});

if(process.env.NODE_ENV === "debug")
    bot.start();

export default function handler(request : any, response: any) {
    response.status(200).json({
        body: request.body,
        query: request.query,
        cookies: request.cookies,
    });
}