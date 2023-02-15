import TelegramBot from "node-telegram-bot-api";
import { IOrder, Order } from "../models/order";
import { User } from "../models/user";
import { View } from "../models/view";

export class OrderFormView extends View {
    private order: IOrder;
    constructor(chatId: TelegramBot.ChatId, bot: TelegramBot, order: IOrder) {
        const text = 
        '*Your order was created*\\!\n\n' +
        '▫️ *Id*: \`'+ (order._id ?? '🚫') + '\`\n' +
        '▫️ *Width*: ' + (order.width ?? '🚫') + '\n' +
        '▫️ *Height*: ' + (order.height ?? '🚫') + '\n';
        const options: TelegramBot.SendMessageOptions = {
            parse_mode: 'MarkdownV2',
            reply_markup: {
                inline_keyboard: [[
                    {text: 'Width ✏️', callback_data: 'enterWidth'},
                    {text: 'Height ✏️', callback_data: 'enterHeight'},
                ],
                [
                    {text: 'Confirm ✅', callback_data: 'confirmOrder'},
                    {text: 'Cancel 🗑', callback_data: JSON.stringify({type: 'cancelOrder', orderId: order._id})},
                ]]
            }
        }
        super(chatId, bot, text, options);
        this.order = order;
    }
}

export class OrderStatusView extends View {
    private order: IOrder;
    constructor(chatId: TelegramBot.ChatId, bot: TelegramBot, order: IOrder) {
        const text = 
        'Your last order status: '; // TODO: order status
        const options: TelegramBot.SendMessageOptions = {
            reply_markup: {
                inline_keyboard: [[
                    {text: 'Return', callback_data: JSON.stringify({type: 'showMainMenu'})},
                ]]
            }
        }
        super(chatId, bot, text, options);
        this.order = order;
    }
}