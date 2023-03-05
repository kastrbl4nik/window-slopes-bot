import { Schema, Types, model } from "mongoose";
import TelegramBot from "node-telegram-bot-api";

export interface IView {
    _id?: Types.ObjectId,
    message_id?: number,
    chat_id: TelegramBot.ChatId,
    invoke(): Promise<void>,
    destroy(): Promise<void>,
}

const viewSchema = new Schema<IView>({
    message_id: {type: Number, required: false},
    chat_id: {type: Number, required: true},
}, { versionKey: false })

export const ViewModel = model<IView>('View', viewSchema);

export class View implements IView {
    public message_id?: number;
    constructor(
        public chat_id: TelegramBot.ChatId,
        public bot: TelegramBot,
        public text: string,
        public options: TelegramBot.SendMessageOptions,
    ) {}

    static getView(chatId: TelegramBot.ChatId, messageId: number) {
        return ViewModel.findOne({chat_id: chatId, message_id: messageId});
    }

    static async clearChat(chatId: TelegramBot.ChatId, bot: TelegramBot) {
        const viewsData = await ViewModel.find({chat_id: chatId});
        for(const viewData of viewsData) {
            const view = new View(viewData.chat_id, bot, '', {});
            view.message_id = viewData.message_id;
            view.destroy();
        }
    }

    public invoke = async () => {
        this.message_id = (await this.bot.sendMessage(this.chat_id, this.text, this.options)).message_id;
        const view = new ViewModel(this);
        view.save();
    }

    public destroy = async () => {
        if(!this.message_id) return;
        try {
            await this.bot.deleteMessage(this.chat_id, this.message_id.toString());
        } catch (e) {
            console.error(e);
        }
        const view = await View.getView(this.chat_id, this.message_id);
        view?.delete();
    }
}
