import {OrderItem} from "./orderItem.model";

export interface Order {
    id: number;
    userId: number;
    items: OrderItem[];
    totalAmount: number;
    status: 'pending' | 'processing' | 'completed' | 'cancelled';
    createdAt: Date;
    updatedAt: Date;
}