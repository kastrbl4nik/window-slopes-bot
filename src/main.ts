import { ChangeStream } from "mongodb";
import mongoose, { Types } from "mongoose";
import TelegramBot from "node-telegram-bot-api";
import { IOrder, Order } from "./models/order";
import { IUser, User } from "./models/user";
import { View } from "./models/view";
import { MainMenuView } from "./views/menuViews";
import { OrderFormView, OrderStatusView } from "./views/orderViews";
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
	new MainMenuView(msg.chat.id).invoke();
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
			//View.clearChat(query.from.id);
			new OrderFormView(query.from.id, order).invoke();
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
			View.clearChat(query.from.id);
			new OrderStatusView(query.from.id, bot, order).invoke();

			break; 
		}
		case 'showMainMenu' : {
			View.clearChat(query.from.id);
			new MainMenuView(query.from.id).invoke();

			break;
		}
		case 'showAccount' : {
			const user = await User.findOne({id: query.from.id}) ?? await new User(query.from).save();

			View.clearChat(query.from.id);
			new AccountFormView(query.from.id, user).invoke();

			break; 
		}
		case 'enterPhoneNumber' : { 
			const user = await User.findOne({id: query.from.id}) ?? await new User(query.from).save(); 
			let input = await ask(query.from.id, 'Enter your phone number') ?? '';
			input = input.replace(/\s+|-|\+375/g, "");
			const pattern = /^\d{9}$/;

			if(!pattern.test(input)) {
				bot.answerCallbackQuery(query.id, {text: 'Invalid phone number'});
				return;
			}

			user.phone_number = '+375' + input;
			user.save();

			if(!query.message) return;

			let view = await View.findOne({message_id: query.message.message_id});
			view?.refresh(new AccountFormView(query.from.id, user).text);

			bot.answerCallbackQuery(query.id, {text: 'Phone number updated'});

			break; 
		}

		case 'enterFirstName' : { 
			const user = await User.findOne({id: query.from.id}) ?? await new User(query.from).save(); 
			let input = await ask(query.from.id, 'Enter your first name') ?? '';

			user.first_name = input;
			user.save();

			if(!query.message) return;

			let view = await View.findOne({message_id: query.message.message_id});
			view?.refresh(new AccountFormView(query.from.id, user).text);

			bot.answerCallbackQuery(query.id, {text: 'First name updated'});

			break; 
		}

		case 'enterLastName' : { 
			const user = await User.findOne({id: query.from.id}) ?? await new User(query.from).save(); 
			let input = await ask(query.from.id, 'Enter your last name') ?? '';

			user.last_name = input;
			user.save();

			if(!query.message) return;

			let view = await View.findOne({message_id: query.message.message_id});
			view?.refresh(new AccountFormView(query.from.id, user).text);

			break; 
		}
	}

	bot.answerCallbackQuery(query.id);
})

export default bot;