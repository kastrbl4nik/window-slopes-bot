import TelegramBot from "node-telegram-bot-api";
import { IOrder } from "./order";
import { Schema, model } from 'mongoose';

export interface IUser extends TelegramBot.User{
    phone_number?: number | undefined;
    orders: IOrder[];
}

const userSchema = new Schema<IUser>({
    id: {type: Number, required: true},
    is_bot: {type: Boolean, required: true},
    first_name: {type: String, required: true},
    last_name: {type: String, required: false},
    username: {type: String, required: false},
    language_code: {type: String, required: false},
    phone_number:  {type: String, required: false},
    orders: [{type: Schema.Types.ObjectId, ref: 'Order'}],
})

export const User = model<IUser>('User', userSchema);