import mongoose from "mongoose";
import TelegramBot from "node-telegram-bot-api";
import { Order } from "./models/order";
import { User } from "./models/user";

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN as string, {polling: true});
mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string).then(() => {
	console.log("Connected to mongoDB");
});

const actions = new Map<string, (callbackQuery: TelegramBot.CallbackQuery) => void>([
    ['newOrder', async (query) => {
		let user = await User.findOne({id: query.from.id});
		if(!user) {
			user = new User(query.from);
			user.save();
		}
		const newOrder = new Order();
		/*user.orders.push(newOrder);
		await newOrder.save();*/
		await user.updateOne();
		
		bot.sendMessage(query.from.id, 
			`Your order was created!\
			Please enter the missing values in a form below:
			Width:\t ${newOrder.width ?? '❌'}
			Height:\t ${newOrder.height ?? '❌'}`,
			{
				reply_markup: {
					inline_keyboard: [[
						{text: 'Enter width', callback_data: 'enterWidth'},
						{text: 'Enter height', callback_data: 'enterHeight'},
					],
					[
						{text: 'Confirm ✅', callback_data: 'confirmOrder'},
						{text: 'Cancel ❌', callback_data: 'cancelOrder'},
					]]
				}
			}
		);
		bot.answerCallbackQuery(query.id);
    }],
	['cancelOrder', (query) => {
		if(query.message)
			bot.deleteMessage(query.from.id, query.message.message_id.toString());
		bot.answerCallbackQuery(query.id, {text: 'Order was canceled'});
	}]
]);

bot.on('message', (msg) => {
	if (msg.text?.startsWith('/'))
		return;
});

bot.setMyCommands([
    {command: '/start', description: 'Start the bot'},
]);

bot.onText(/\/start/, async msg => {
	User.updateOne(msg.from, {$set: msg.from}, {upsert: true});
    bot.sendMessage(
		msg.chat.id,
		`Hello ${msg.from?.first_name}!`,
		{
			reply_markup: {
				inline_keyboard: [[{ text: 'New order', callback_data: 'newOrder' }]],
			},
		}
    );
});

bot.on('callback_query', query => {
    const action = actions.get(query.data!);
    if(!action)
        return bot.answerCallbackQuery(query.id, {text: 'Invalid callback data'})

    action(query);
})

export default bot;