import TeleBot from 'telebot';
import { collections, connectToDatabase } from "./services/database.service";
import User from "./models/user";

const bot = new TeleBot(process.env.TELEGRAM_TOKEN as string);
connectToDatabase().catch((error: Error) => {
    console.error("Database connection failed", error);
    process.exit();
});

bot.on('/start', async msg => {
    let replyMarkup = bot.keyboard([
        ['/help', '/start'],
        ['/orders', '/about'],
    ], {resize: true});
    const users = (await collections.users?.find().toArray()) as User[];
    let usernames = '';
    users?.forEach(user => {
        usernames += user.username + '\n';
    });
    bot.sendMessage(
        msg.chat.id,
        `Hello, ${msg.from.first_name}! Currently there're ${users?.length} in the database:\n${usernames}`,
        {replyMarkup});
});

if(process.env.VERCEL_ENV != 'production')
    bot.start(); // Use long polling instead of webhook
else 
    bot.setWebhook('https://window-slopes-bot.vercel.app/api/handler'); // Use webhook

export default bot;