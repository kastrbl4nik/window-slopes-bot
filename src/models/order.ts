import { Schema, model, Types } from 'mongoose';
import { IUser, User } from './user';

export interface IOrder {
    //Order information
    _id?: Types.ObjectId,
    address?: string,
    status?: string,
    price?: number,

    //Input information about window
    outward_height?: number,
    inward_height?: number,
    outward_width?: number,
    inward_width?: number,
    depth?: number,
    left_width?: number,
    right_width?: number,
    sill_bias?: number,
    
    //upper slope
    upper_greater_width?: number, 
    upper_lesser_width?: number, 
    upper_side_width?: number, 
    upper_acute_angle?: number;
    upper_obtuse_angle?: number,

    //left slope
    left_lesser_length?: number, 
    left_side_length?: number, 
    left_upper_width?: number, 
    left_bottom_width?: number, 

    left_acute_angle?: number;
    left_obtuse_angle?: number,
    left_sill_angle?: number, 
    
    //right slope
    right_lesser_length?: number, 
    right_side_length?: number, 
    right_upper_width?: number, 
    right_bottom_width?: number, 

    right_acute_angle?: number;
    right_obtuse_angle?: number,
    right_sill_angle?: number, 

    user: Types.ObjectId,
}

const orderSchema = new Schema<IOrder>({
    outward_height: {type: Number, required: false},
    inward_height: {type: Number, required: false},
    outward_width: {type: Number, required: false},
    inward_width: {type: Number, required: false},
    depth: {type: Number, required: false},
    left_width: {type: Number, required: false},
    right_width: {type: Number, required: false},
    sill_bias: {type: Number, required: false},

    address: {type: String, required: false},
    status: {type: Number, required: false},
    price: {type: Number, required: false},

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