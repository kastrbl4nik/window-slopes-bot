import { ChangeStream } from "mongodb";
import mongoose, { Types } from "mongoose";
import TelegramBot from "node-telegram-bot-api";
import { IOrder, Order } from "./models/order";
import { IUser, User } from "./models/user";
import { OrderFormView, OrderStatusView } from "./views/orderViews";
import View from "./views/view";
import { MainMenuView } from "./views/menuViews";
import { AccountFormView } from "./views/userViews";

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

async function ask(chatId: TelegramBot.ChatId, question: string): Promise<string | undefined> {
	return new Promise((resolve) => {
		bot.sendMessage(chatId, question);
		bot.once('message', (msg) => {
		  resolve(msg.text);
		});
	  });
}


bot.onText(/\/start/, async msg => {
	User.updateOne(msg.from, {$set: msg.from}, {upsert: true}).catch(err => console.log(err));
	if(!msg.from) return;
	const view: View = new MainMenuView(bot, msg.from.id);
	view.invoke();
});

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

			const view = new OrderFormView(bot, order, query.from.id);
			views.set(order._id.toString(), view);
			view.invoke();

			break;
		}
		case 'cancelOrder': {
			const order = await Order.findById({_id: request.orderId});
			order?.remove();

			break;
		}
		case 'orderStatus' : {
			const order = await Order.findOne(); //TODO: filter last order
			if (!order) return;
	 		const view = new OrderStatusView(bot, order, query.from.id); 
			view.invoke(); 

			break; 
		}
		case 'showMainMenu' : {
			new MainMenuView(bot, query.from.id).invoke();

			break;
		}
		case 'showAccount' : {
			const user = await User.findOne({id: query.from.id}) ?? await new User(query.from).save(); 
			new AccountFormView(bot, user, query.from.id).invoke(); 

			break; 
		}
		case 'enterPhoneNumber' : { 
			const user = await User.findOne({id: query.from.id}) ?? await new User(query.from).save(); 
			let input = await ask(query.from.id, 'Enter your phone number') ?? '';
			input = input.replace(/\s+|-|\+375/g, "");
			const pattern = /^\d{9}$/;
			console.log(input);

			if(!pattern.test(input)) {
				bot.sendMessage(query.from.id, 'Invalid number')
				return;
			}

			user.phone_number = '+375' + input;
			user.save();
			bot.sendMessage(query.from.id, 'Phone number updated');
		}
		case 'enterFirstName' : {

		}
		case 'enterLastName' : {

		}
		case 'enterLanguage' : {

		}
	}

	bot.answerCallbackQuery(query.id);
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