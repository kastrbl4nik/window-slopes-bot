import { Schema, model, Types } from 'mongoose';
import { IUser, User } from './user';

export interface IOrder {
    
}

const orderSchema = new Schema<IOrder>({
    width: {type: Number, required: false},
    height: {type: Number, required: false},
    user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
}, { versionKey: false })

export const Order = model<IOrder>('Order', orderSchema);