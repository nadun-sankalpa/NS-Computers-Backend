import { Document, Schema, model, Model, Types } from 'mongoose';
import { IUser } from './user.model';

// 1. Define interfaces
export interface IOrderItem {
    name: string;
    price: number;
}

export interface IOrder extends Document {
    _id: number;
    userId: number;
    username: string;
    items: IOrderItem[];
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    totalPrice: number;
    createdAt: Date;
    updatedAt: Date;
}

// 2. Define counter schema and model
interface ICounter extends Document {
    _id: string;
    seq: number;
}

const counterSchema = new Schema<ICounter>({
    _id: { type: String, required: true },
    seq: { type: Number, default: 1 }
});

const Counter = model<ICounter>('Counter', counterSchema);

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
        items: [
            {
                name: { 
                    type: String, 
                    required: true 
                },
                price: { 
                    type: Number, 
                    required: true 
                }
            }
        ],
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