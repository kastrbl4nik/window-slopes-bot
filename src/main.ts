import { ChangeStream } from "mongodb";
import mongoose, { Types } from "mongoose";
import TelegramBot from "node-telegram-bot-api";
import { IOrder, Order } from "./models/order";
import { IUser, User } from "./models/user";
import { OrderFormView } from "./views/orderView";

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN as string, {polling: true});

mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string)
.then(() => {
	console.log("Connected to MongoDB");
})
.catch(() => {
	throw new Error("Connection to MongoDB failed")
});

bot.setMyCommands([
    {command: '/start', description: 'Start the bot'},
]);

bot.onText(/\/start/, async msg => {
	User.updateOne(msg.from, {$set: msg.from}, {upsert: true}).catch(err => console.log(err));
    bot.sendMessage(
		msg.chat.id,
		`Hello ${msg.from?.first_name}!`,
		{
			reply_markup: {
				inline_keyboard: [[{ text: 'New order', callback_data: JSON.stringify({type: 'newOrder'}) }]],
			},
		}
    );
});

bot.onText(/\/remove/, async msg => {
	const user = await User.findOne();
	user?.remove();
})

const views = new Map<string, OrderFormView>();

bot.on('callback_query', async query => {
	if(!query.data)
		return bot.answerCallbackQuery(query.id);
	const request = JSON.parse(query.data);
	switch(request.type) {
		case 'newOrder': {
			const user = await User.findOne({id: query.from.id}) ?? await new User(query.from).save();
			const order = new Order({user: user._id!});
			order.save();

			const view = new OrderFormView(bot, order);
			views.set(order._id.toString(), view);
			view.invoke();

			bot.answerCallbackQuery(query.id);
		}
		break;
		case 'cancelOrder': {
			const order = await Order.findById({_id: request.orderId});
			order?.remove();
			bot.answerCallbackQuery(query.id);
		}
		break;
	}
})

Order.watch<IOrder>([], {fullDocument: 'updateLookup'})
.on("change", async (data: {documentKey: { _id: Types.ObjectId }, operationType: string}) => {
	console.log(data.operationType + ' ' + data.documentKey._id);
	switch(data.operationType) {
		case 'delete': {
			const view = views.get(data.documentKey._id.toString());
			view?.destroy();
			break;
		}
	}
})

export default bot;