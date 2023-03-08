import { Model, Schema, Types, model } from "mongoose";
import TelegramBot, { EditMessageTextOptions } from "node-telegram-bot-api";
import bot from '../main';

export interface IView {
    _id?: Types.ObjectId,
    message_id?: number,
    text: string,
    options: TelegramBot.SendMessageOptions,
    chat_id: TelegramBot.ChatId,
}

interface IViewMethods {
    invoke(): Promise<void>,
    destroy(): Promise<void>,
    refresh(text: string): Promise<void>,
}

interface ViewModel extends Model<IView, {}, IViewMethods> {
    clearChat(chatId: number): Promise<void>,
};

const viewSchema = new Schema<IView, ViewModel, IViewMethods>({
    message_id: {type: Number, required: false},
    chat_id: {type: Number, required: true},
    text: {type: String, required: true},
    options: {type: Schema.Types.Mixed, required: false},
}, { versionKey: false })

viewSchema.method('invoke', async function invoke() {
    this.message_id = (await bot.sendMessage(this.chat_id, this.text, this.options)).message_id;
    this.save();
});

viewSchema.method('destroy', async function destroy() {
    if(!this.message_id) return;
    try {
        await bot.deleteMessage(this.chat_id, this.message_id.toString());
    } catch {
        console.error("Message to delete not found");
    }
    View.deleteOne({_id: this._id});
})

viewSchema.method('refresh', async function refresh(text: string) {
    const editOptions: EditMessageTextOptions = {
        parse_mode: this.options.parse_mode,
        chat_id: this.chat_id,
        message_id: this.message_id,
        reply_markup: this.options.reply_markup,
    }
    try {
        await bot.editMessageText(text, editOptions);
    } catch {
        console.error("Message to update not found");
    }
    this.update();
})

viewSchema.static('clearChat', async function clearChat(chatId: number) {
    const views = await View.find({chat_id: chatId});
    views.forEach(view => {
        view.destroy();
    });
});

export const View = model<IView, ViewModel>('View', viewSchema);