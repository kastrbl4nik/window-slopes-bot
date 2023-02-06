import mongoose from "mongoose";
import TelegramBot from "node-telegram-bot-api";
import { IOrder, Order } from "./models/order";
import { User } from "./models/user";

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN as string, {polling: true});
mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string).then(() => {
	console.log("Connected to mongoDB");
});

let orderMessages = new Map<Number, IOrder>();

const askQuestion = async (question: string, chatId: number): Promise<string> => {
	return new Promise((resolve, reject) => {
		bot.once('message', (msg) => {
			const response = msg.text ?? '';
			resolve(response);
		});
		bot.sendMessage(chatId, question);
	});
};

const getOrderStatus = (order: IOrder): {text: string, options: TelegramBot.SendMessageOptions} => {
	return {
		text: `Please enter the missing values in a form below:
		Width:\t ${order.width ?? '❌'}
		Height:\t ${order.height ?? '❌'}`,
		options: {
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
	};
}

const actions = new Map<string, (callbackQuery: TelegramBot.CallbackQuery) => void>([
    ['newOrder', async (query) => {
		let newOrder = new Order;
		let orderStatus = getOrderStatus(newOrder);
		bot.sendMessage(query.from.id,
			orderStatus.text,
			orderStatus.options
		).then(msg => {
			orderMessages.set(msg.message_id, newOrder);
		})
		bot.answerCallbackQuery(query.id);
    }],
	['cancelOrder', (query) => {
		if(query.message) {
			bot.deleteMessage(query.from.id, query.message.message_id.toString());
			orderMessages.delete(query.message.message_id);
		}
		bot.answerCallbackQuery(query.id, {text: 'Order was canceled'});
	}],
	['enterWidth', async (query) => {
		const order = orderMessages.get(query.message!.message_id);
		if(!order) {
			console.error('Order not found');
			return;
		}
		const answer = await askQuestion('Enter the width of your window (mm): ', query.from.id);
		if (answer.length > 0 && !isNaN(Number(answer))) {
			order.width = Number(answer);
			bot.sendMessage(query.from.id, 'Width updated!');
		} else {
			bot.sendMessage(query.from.id, 'Incorrect value.');
		}
		const orderStatus = getOrderStatus(order);
		bot.editMessageText(
			orderStatus.text, 
			{
				chat_id: query.from.id,
				message_id: query.message!.message_id,
				reply_markup: orderStatus.options.reply_markup as TelegramBot.InlineKeyboardMarkup,
			}
			);
		bot.answerCallbackQuery(query.id);
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