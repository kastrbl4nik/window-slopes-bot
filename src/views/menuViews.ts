import TelegramBot, { ParseMode } from "node-telegram-bot-api";
import { View } from "../models/view";

export class MainMenuView extends View {
    constructor(chatId: number) {
        const text = 
        '*Main Menu*:\n\n' +
        '▫️ *Account* — my credentials\n' +
        '▫️ *New order* — create a new order\n' +
        '▫️ *Status* — status of my last order\n' +
        '▫️ *Orders* — my order history\n';
        const options = {
            parse_mode: 'MarkdownV2' as ParseMode,
            reply_markup: {
                inline_keyboard: [[
                    {text: 'Account 🔒', callback_data: JSON.stringify({type: 'showAccount'})},
                    {text: 'New order 📝', callback_data: JSON.stringify({type: 'newOrder'})},
                ],
                [
                    {text: 'Status 💬', callback_data: JSON.stringify({type: 'orderStatus'})},
                    {text: 'Orders 📖', callback_data: JSON.stringify({type: 'orderHistory'})},
                ]]
            }
        }
        super({chat_id: chatId, text: text, options: options});
    }
}