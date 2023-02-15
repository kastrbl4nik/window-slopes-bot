import TelegramBot from "node-telegram-bot-api";
import { IUser, User } from "../models/user";
import { View } from "../models/view";

export class AccountFormView extends View {

    constructor(chatId: TelegramBot.ChatId, bot: TelegramBot, user: IUser) {
        const text = 
        '*Your Account*:\n\n' +
        '▫️ *First Name*: ' + (user.first_name ?? '🚫') + '\n' +
        '▫️ *Last Name*: ' + (user.last_name ?? '🚫') + '\n' +
        '▫️ *Phone Number*: \`' + (user.phone_number ?? '🚫') + '\`\n' +
        '▫️ *Language*: ' + (user.language_code ?? '🚫') + '\n';
        const options: TelegramBot.SendMessageOptions = {
            parse_mode: 'MarkdownV2',
            reply_markup: {
                inline_keyboard: [[
                    {text: 'First name ✏️', callback_data: JSON.stringify({type: 'enterFirstName'})},
                    {text: 'Last name ✏️', callback_data: JSON.stringify({type: 'enterLastName'})},
                ],
                [
                    {text: 'Phone number ✏️', callback_data: JSON.stringify({type: 'enterPhoneNumber'})},
                    {text: 'Language ✏️', callback_data: JSON.stringify({type: 'enterLanguage'})},
                ], 
                [
                    {text: 'Return ↩️', callback_data: JSON.stringify({type: 'showMainMenu'})},
                ]]
            }
        }
        super(chatId, bot, text, options);
    }
}