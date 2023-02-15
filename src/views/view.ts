import TelegramBot from "node-telegram-bot-api";

export default class View {
    public message?: TelegramBot.Message;
    constructor(
        private chatId: TelegramBot.ChatId,
        private bot: TelegramBot,
        private text: string,
        private options: TelegramBot.SendMessageOptions,
    ) {}

    public invoke = async () => {
        this.message = await this.bot.sendMessage(this.chatId, this.text, this.options);
    }
    public destroy = async () => {
        if(!this.message || !this.message.from) return;
        await this.bot.deleteMessage(this.message.chat.id, this.message.message_id.toString());
    }
}