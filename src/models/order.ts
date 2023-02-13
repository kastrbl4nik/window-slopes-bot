import { Schema, model, Types } from 'mongoose';
import { IUser, User } from './user';

export interface IOrder {
    _id?: Types.ObjectId,
    width?: number,
    height?: number,
    user: Types.ObjectId,
}

const orderSchema = new Schema<IOrder>({
    width: {type: Number, required: false},
    height: {type: Number, required: false},
    user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
}, { versionKey: false })

orderSchema.pre('remove', async function (this: IOrder, next) {
    const order = this;
    await User.findByIdAndUpdate(order.user, { $pull: { orders: order._id } });
    next();
});

orderSchema.pre('save', async function (this: IOrder, next) {
    const order = this;
    await User.findByIdAndUpdate(order.user, { $push: { orders: order._id } });
    next();
});

export const Order = model<IOrder>('Order', orderSchema);