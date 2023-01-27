import TeleBot from 'telebot';
import { collections, connectToDatabase } from "./services/database.service";
import User from "./models/user";

const bot = new TeleBot(process.env.TELEGRAM_TOKEN as string);
connectToDatabase().catch((error: Error) => {
    console.error("Database connection failed", error);
    process.exit();
});

bot.on('/start', msg => {
    let replyMarkup = bot.keyboard([
        ['/start', '/add'],
        ['/remove', '/status'],
    ], {resize: true});
    bot.sendMessage(
        msg.chat.id, `Hi, ${msg.from.first_name}`,
        {replyMarkup})
})

bot.on('/status', async msg => {
    await collections.users?.find().toArray().then(users => {
        let usernames = '';
        for(const user of users) {
            usernames += user.username + '\n';
        }
        bot.sendMessage(
            msg.chat.id,
            `Currently there're ${users?.length} users in the database:\n${usernames}`,);
    });
});

bot.on('/add', async msg => {
    const user = new User(msg.from.id, msg.from.username);
    await collections.users?.updateOne(
        {_id: msg.from.id},
        {$set: user},
        {upsert: true}
    ).then(result => {
        bot.sendMessage(
            msg.chat.id,
            `You've been added to a database!`);
    });
})

bot.on('/remove', async msg => {
    await collections.users?.deleteOne(
        {_id: msg.from.id}
    ).then(result => {
        bot.sendMessage(
            msg.chat.id,
            `You've been deleted from a database!`);
    });
})

if(process.env.VERCEL_ENV != 'production')
    bot.start(); // Use long polling instead of webhook

export default bot;