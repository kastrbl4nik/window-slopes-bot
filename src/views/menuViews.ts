import TelegramBot from "node-telegram-bot-api";
import View from "./view";

export class MainMenuView extends View {
    constructor(chatId: TelegramBot.ChatId, bot: TelegramBot) {
        const text = 
            '*Main Menu*:\n\n' +
            '▫️ *Account* — my credentials\n' +
            '▫️ *New order* — create a new order\n' +
            '▫️ *Status* — status of my last order\n' +
            '▫️ *Orders* — my order history\n';
        const options: TelegramBot.SendMessageOptions = {
            parse_mode: 'MarkdownV2',
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
        super(chatId, bot, text, options);
    }
}