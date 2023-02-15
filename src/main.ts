import { ChangeStream } from "mongodb";
import mongoose, { Types } from "mongoose";
import TelegramBot from "node-telegram-bot-api";
import { IOrder, Order } from "./models/order";
import { IUser, User } from "./models/user";
import { OrderFormView, OrderStatusView } from "./views/orderViews";
import { MainMenuView } from "./views/menuViews";
import { AccountFormView } from "./views/userViews";
import { IView, View, ViewModel } from "./models/view";

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
	const view = new MainMenuView(msg.from.id, bot);
	view.invoke();
});


bot.on('callback_query', async query => {
	if(!query.data)
		return bot.answerCallbackQuery(query.id);
	const request = JSON.parse(query.data);
	switch(request.type) {
		case 'newOrder': {
			const user = await User.findOne({id: query.from.id}) ?? await new User(query.from).save();
			const order = new Order({user: user._id!});
			order.save();
			
			View.clearChat(query.from.id, bot);
			const view = new OrderFormView(query.from.id, bot, order);
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
			View.clearChat(query.from.id, bot);
			const view = new OrderStatusView(query.from.id, bot, order);
			view.invoke();

			break; 
		}
		case 'showMainMenu' : {
			View.clearChat(query.from.id, bot);
			new MainMenuView(query.from.id, bot).invoke();

			break;
		}
		case 'showAccount' : {
			const user = await User.findOne({id: query.from.id}) ?? await new User(query.from).save();

			View.clearChat(query.from.id, bot);
			new AccountFormView(query.from.id, bot, user).invoke(); 

			break; 
		}
		case 'enterPhoneNumber' : { 
			const user = await User.findOne({id: query.from.id}) ?? await new User(query.from).save(); 
			let input = await ask(query.from.id, 'Enter your phone number') ?? '';
			input = input.replace(/\s+|-|\+375/g, "");
			const pattern = /^\d{9}$/;

			if(!pattern.test(input)) {
				bot.sendMessage(query.from.id, 'Invalid number')
				return;
			}

			user.phone_number = '+375' + input;
			user.save();
			bot.sendMessage(query.from.id, 'Phone number updated');
		}
	}

	bot.answerCallbackQuery(query.id);
})

export default bot;