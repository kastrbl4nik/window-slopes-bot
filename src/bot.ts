import TeleBot from 'telebot';
import { MongoClient } from 'mongodb';

const bot = new TeleBot(process.env.TELEGRAM_TOKEN as string);
const client = new MongoClient(process.env.MONGODB as string);

client.connect().catch(err => console.error(err));
const Database = client.db('window-slopes-db');

bot.on('/start', async msg => {
    let replyMarkup = bot.keyboard([
        ['/help', '/start'],
        ['/orders', '/about'],
    ], {resize: true});
    return bot.sendMessage(msg.chat.id, `Hello, ${msg.from.first_name}!`, {replyMarkup});
});

if(process.env.VERCEL_ENV != 'production')
    bot.start(); // Use long polling instead of webhook
else 
    bot.setWebhook('https://window-slopes-bot.vercel.app/api/handler'); // Use webhook

export default bot;