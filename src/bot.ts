import TelegramBot from "node-telegram-bot-api";
import { collections, connectToDatabase } from "./services/database.service";
import { ObjectId } from "mongodb";
import User from "./models/user";

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN as string, {polling: true});
connectToDatabase().catch(err => {
    console.error("Database connection failed", err);
    process.exit();
});

bot.setMyCommands([
    {command: '/start', description: 'Start the bot'},
    {command: '/status', description: 'Print information about the database'},
    {command: '/add', description: 'Add you to a database'},
    {command: '/remove', description: 'Remove you from a database'},
]);

bot.onText(/\/start/, msg => {
    const options : TelegramBot.SendMessageOptions = {
        reply_markup: {
            keyboard: [
                [{text: '/start'}, {text: '/status'}],
                [{text: '/add'}, {text: '/remove'}],
            ],
            resize_keyboard: true
        }
    }
    bot.sendMessage(
        msg.chat.id, `Hi, ${msg.from?.first_name}`,
        options)
})

bot.onText(/\/status/, async msg => {
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

bot.onText(/\/add/, async msg => {
    const user = msg.from as User;
    await collections.users?.updateOne(
        {_id: new ObjectId(msg.from!.id)},
        {$set: user},
        {upsert: true}
    ).then(result => {
        bot.sendMessage(
            msg.chat.id,
            `You've been added to a database!`);
    });
})

bot.onText(/\/remove/, async msg => {
    await collections.users?.deleteOne(
        {id: msg.from?.id}
    ).then(result => {
        console.debug(result);
        console.debug(msg.from?.id);
        bot.sendMessage(
            msg.chat.id,
            `You've been deleted from a database!`);
    });
})

export default bot;