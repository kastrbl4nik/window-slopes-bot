import TelegramBot from "node-telegram-bot-api";
import { IOrder } from "../models/order";
import { User } from "../models/user";

export class OrderFormView {
    private message?: TelegramBot.Message
    constructor(
        private bot: TelegramBot, 
        private order: IOrder,
    ) {}
    public async invoke() {
        const text = `Please enter the missing values in a form below:
        Width:\t ${this.order.width ?? '❌'}
        Height:\t ${this.order.height ?? '❌'}`;
        const options = {
            reply_markup: {
                inline_keyboard: [[
                    {text: 'Enter width', callback_data: 'enterWidth'},
                    {text: 'Enter height', callback_data: 'enterHeight'},
                ],
                [
                    {text: 'Confirm ✅', callback_data: 'confirmOrder'},
                    {text: 'Cancel ❌', callback_data: JSON.stringify({type: 'cancelOrder', orderId: this.order._id})},
                ]]
            }
        }
        const user = await User.findById(this.order.user);
        this.message = await this.bot.sendMessage(user!.id, text, options);
    }

    public destroy() {
        if(!this.message || !this.message.from) return;
        this.bot.deleteMessage(this.message.chat.id, this.message.message_id.toString());
    }
}