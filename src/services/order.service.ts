import { Order, IOrder, IOrderItem } from '../models/order.model';
import { Product } from '../models/product.model';
import User from '../models/user.model';
import { Types } from 'mongoose';

class OrderService {
    /**
     * Create a new order and update product stock
     */
    // Define a return type for better type safety
    private createOrderResponse(order: IOrder | null, error: string | null, status: number = 200) {
        return { order, error, status };
    }

    async createOrder(
        userId: number,
        items: Array<{
            name: string;
            price: number;
        }>,
        username: string
    ): Promise<{ order: IOrder | null; error: string | null; status: number }> {
        const session = await Order.startSession();
        session.startTransaction();

        try {
            // 1. Validate user exists (using findOne for numeric ID)
            const user = await User.findOne({ _id: userId }).session(session);
            if (!user) {
                await session.abortTransaction();
                return this.createOrderResponse(
                    null, 
                    `User with ID ${userId} not found`,
                    404
                );
            }

            // 2. Calculate total price
            const totalPrice = items.reduce((sum, item) => sum + item.price, 0);

            // 3. Create the order
            const order = new Order({
                userId: userId,
                username: username,
                items: items,
                status: 'pending',
                totalPrice: totalPrice
            });

            const createdOrder = await order.save({ session });
            await session.commitTransaction();
            
            return this.createOrderResponse(createdOrder, null, 201);

        } catch (error: any) {
            await session.abortTransaction();
            console.error('Error creating order:', error);
            console.error('Error in order service:', error);
            return this.createOrderResponse(
                null, 
                error.message || 'Error creating order',
                500
            );
        } finally {
            await session.endSession();
        }
    }

    /**
     * Get order by ID
     */
    async getOrderById(id: string): Promise<IOrder | null> {
        try {
            return await Order.findById(id);
        } catch (error) {
            throw new Error('Error fetching order');
        }
    }

    /**
     * Get orders by user ID
     */
    async getOrdersByUserId(userId: string): Promise<IOrder[]> {
        try {
            return await Order.find({ userId: userId })
                .sort({ createdAt: -1 });
        } catch (error) {
            throw new Error('Error fetching user orders');
        }
    }

    /**
     * Get all orders (admin only)
     */
    async getAllOrders(): Promise<IOrder[]> {
        try {
            return await Order.find({}).sort({ createdAt: -1 });
        } catch (error) {
            throw new Error('Error fetching all orders');
        }
    }

    /**
     * Update order to paid
     */
    async updateOrderToPaid(
        orderId: string
    ): Promise<IOrder | null> {
        try {
            const order = await Order.findById(orderId);
            
            if (order) {
                order.status = 'processing';
                const updatedOrder = await order.save();
                return updatedOrder;
            }
            
            return null;
        } catch (error) {
            throw new Error('Error updating order to paid');
        }
    }

    /**
     * Update order to delivered (admin only)
     */
    async updateOrderToDelivered(orderId: string): Promise<IOrder | null> {
        try {
            const order = await Order.findById(orderId);
            
            if (order) {
                order.status = 'delivered';
                const updatedOrder = await order.save();
                return updatedOrder;
            }
            
            return null;
        } catch (error) {
            throw new Error('Error updating order to delivered');
        }
    }

    /**
     * Delete order (admin only)
     */
    async deleteOrder(orderId: string): Promise<boolean> {
        try {
            const result = await Order.findByIdAndDelete(orderId);
            return result !== null;
        } catch (error) {
            throw new Error('Error deleting order');
        }
    }
}

// Export a singleton instance
export const orderService = new OrderService();