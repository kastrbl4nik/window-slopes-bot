import TelegramBot from "node-telegram-bot-api";
import { User, IUser } from "./models/user";
import { connect } from 'mongoose';
import { Answer } from "./models/answer";

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN as string, {polling: true});
connect(process.env.MONGODB_CONNECTION_STRING as string);

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

bot.onText(/\/answer/, async msg => {
	const answer = new Answer({
    	tag: 'answer_tag',
		text: new Map([
			['ru', 'Ответ'],
			['en', 'Answer']
		])
   	})
	await answer.save();

	bot.sendMessage(msg.chat.id, 'Answer added');
	
	await Answer.findOne({tag: 'answer_tag'}).then(a => {
		bot.sendMessage(
			msg.chat.id,
			a?.text.get(msg.from?.language_code ?? 'ru') as string
		)
	})
})

bot.onText(/\/status/, async msg => {
    User.find().then(users => {
        let usernames = '';
        for(const user of users) {
            usernames += user.username + '\n';
        }
        bot.sendMessage(
            msg.chat.id,
            `Currently there're ${users?.length} users in the database:\n${usernames}`,);
    })
});

bot.onText(/\/add/, async msg => {
    const user = new User(msg.from);
    await user.save()
    bot.sendMessage(
        msg.chat.id,
        `You've been added to a database!`);
})

bot.onText(/\/remove/, async msg => {
    const options : TelegramBot.SendMessageOptions = {
        reply_markup: {
            inline_keyboard: [[
                {text: 'Yes', callback_data: 'true'},
                {text: 'No', callback_data: 'false'}
            ]]
        }
    }
    bot.sendMessage(msg.chat.id, 'Are you sure?', options);
})

bot.on('callback_query', async query => {
    bot.deleteMessage(query.from.id, query.message!.message_id.toString());
    if(query.data == 'false')
        return bot.sendMessage(query.from.id, 'Deletion was canceled');

    await User.deleteOne(query.from);
    bot.sendMessage(
        query.from.id,
        `You've been deleted from a database!`);
})

export default bot;