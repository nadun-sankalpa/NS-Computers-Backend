import { Document, Schema, model, Model, Types } from 'mongoose';
import { IUser } from './user.model';
import { Counter, ICounter } from './counter.model';

// 1. Define interfaces
export interface IOrder extends Document {
    _id: number;
    userId: number;
    username: string;
    itemName: string;
    itemPrice: number;
    itemStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    totalPrice: number;
    createdAt: Date;
    updatedAt: Date;
}

// 3. Define order schema
const orderSchema = new Schema<IOrder>(
    {
        _id: { type: Number },
        userId: {
            type: Number,
            required: true,
            ref: 'User'
        },
        username: {
            type: String,
            required: true
        },
        itemName: {
            type: String,
            required: true
        },
        itemPrice: {
            type: Number,
            required: true
        },
        itemStatus: {
            type: String,
            enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
            default: 'pending'
        },
        status: {
            type: String,
            enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
            default: 'pending'
        },
        totalPrice: {
            type: Number,
            required: true,
            default: 0.0
        }
    },
    {
        timestamps: true
    }
);

// 4. Add pre-save hook for auto-incrementing ID
orderSchema.pre<IOrder>('save', async function(next) {
    if (this.isNew) {
        try {
            const counter = await Counter.findByIdAndUpdate(
                { _id: 'orderId' },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
            this._id = counter.seq;
            next();
        } catch (error) {
            next(error as Error);
        }
    } else {
        next();
    }
});

// 5. Create and export the model
const Order = model<IOrder>('Order', orderSchema);

export { Order };

export type { IOrder as OrderDocument };
export type OrderModel = typeof Order;