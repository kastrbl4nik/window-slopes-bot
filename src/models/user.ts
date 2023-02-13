import TelegramBot from "node-telegram-bot-api";
import { Schema, Types, model } from 'mongoose';
import { IOrder, Order } from "./order";

export interface IUser extends TelegramBot.User{
    _id?: Types.ObjectId,
    phone_number?: number | undefined,
    orders: Types.ObjectId[],
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
}, { versionKey: false })

userSchema.pre('remove', async function (this: IUser, next) {
    const user = this;
    await Order.deleteMany({ user: user._id });
    next();
});

export const User = model<IUser>('User', userSchema);