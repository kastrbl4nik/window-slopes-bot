import TelegramBot from "node-telegram-bot-api";
import { IUser, User } from "../models/user";
import View from "./view";

export class AccountFormView implements View {
    private message?: TelegramBot.Message
    constructor(
        private bot: TelegramBot, 
        private user: IUser,
        public chatId: TelegramBot.ChatId,
    ) {}
    public async invoke() {
        const text = `Your Account:
        First Name:\t ${this.user.first_name ?? '❌'}
        Last Name:\t ${this.user.last_name ?? '❌'}
        Phone Number: \`${this.user.phone_number ?? '❌'}\`
        Language: ${this.user.language_code ?? '❌'}`;
        const options: TelegramBot.SendMessageOptions = {
            parse_mode: 'MarkdownV2',
            reply_markup: {
                inline_keyboard: [[
                    {text: 'First Name', callback_data: JSON.stringify({type: 'enterFirstName'})},
                    {text: 'Last Name', callback_data: JSON.stringify({type: 'enterLastName'})},
                ],
                [
                    {text: 'Phone number', callback_data: JSON.stringify({type: 'enterPhoneNumber'})},
                    {text: 'Language', callback_data: JSON.stringify({type: 'enterLanguage'})},
                ], 
                [
                    {text: 'Return', callback_data: JSON.stringify({type: 'showMainMenu'})},
                ]]
            }
        }
        this.message = await this.bot.sendMessage(this.chatId, text, options);
    }

    public async destroy() {
        if(!this.message || !this.message.from) return;
        await this.bot.deleteMessage(this.message.chat.id, this.message.message_id.toString());
    }
}