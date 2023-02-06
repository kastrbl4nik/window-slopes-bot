import { Schema, model, Types } from 'mongoose';
import TelegramBot from 'node-telegram-bot-api';

export interface IOrder {
    price: number;
    width: number;
    height: number;
}

const orderSchema = new Schema<IOrder>({
    price: {type: Number, required: true},
    width: {type: Number, required: true},
    height: {type: Number, required: true},
})

export const Order = model<IOrder>('Order', orderSchema);