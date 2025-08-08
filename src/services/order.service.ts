import { Order, IOrder } from '../models/order.model';
import { Product } from '../models/product.model';
import User from '../models/user.model';
import { Types } from 'mongoose';
import { Counter } from '../models/counter.model';

class OrderService {
    /**
     * Create a new order and update product stock
     */
    // Define a return type for better type safety
    private createOrderResponse(order: IOrder | null, error: string | null, status: number = 200) {
        return { order, error, status };
    }

    /**
     * Reset order counter if there are no orders
     */
    async resetOrderCounterIfNoOrders() {
        const orderCount = await Order.countDocuments({});
        if (orderCount === 0) {
            await Counter.findOneAndUpdate(
                { _id: 'orderId' },
                { $set: { seq: 0 } },
                { upsert: true, new: true }
            );
        }
    }

    async createOrder(
        userId: number,
        itemName: string,
        itemPrice: number,
        username: string,
        status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' = 'pending'
    ): Promise<{ order: IOrder | null; error: string | null; status: number }> {
        try {
            // Reset order counter if no orders exist
            await this.resetOrderCounterIfNoOrders();
            // 1. Validate user exists (using findOne for numeric ID)
            const user = await User.findOne({ _id: userId });
            if (!user) {
                return this.createOrderResponse(
                    null,
                    `User with ID ${userId} not found`,
                    404
                );
            }

            // 2. Calculate total price
            const totalPrice = itemPrice;

            // 3. Create the order with flat structure
            const order = new Order({
                userId: userId,
                username: username,
                itemName: itemName,
                itemPrice: itemPrice,
                itemStatus: status,
                status: status,
                totalPrice: totalPrice
            });

            const createdOrder = await order.save();
            return this.createOrderResponse(createdOrder, null, 201);
        } catch (error) {
            console.error('Error creating order:', error);
            return this.createOrderResponse(
                null,
                'Failed to create order: ' + (error as Error).message,
                500
            );
        }
    }

    /**
     * Create a new order and update product stock (with stock check)
     */
    async createOrderWithStockCheck(
        userId: number,
        itemName: string,
        itemPrice: number,
        username: string,
        quantity: number = 1,
        status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' = 'pending'
    ): Promise<{ order: IOrder | null; error: string | null; status: number }> {
        try {
            await this.resetOrderCounterIfNoOrders();
            // 1. Validate user exists
            const user = await User.findOne({ _id: userId });
            if (!user) {
                return this.createOrderResponse(null, `User with ID ${userId} not found`, 404);
            }
            // 2. Find product by name
            const product = await Product.findOne({ name: itemName });
            if (!product) {
                return this.createOrderResponse(null, `Product '${itemName}' not found`, 404);
            }
            // 3. Check stock
            if (product.stock < quantity) {
                return this.createOrderResponse(null, `Not enough stock for '${itemName}'. In stock: ${product.stock}, requested: ${quantity}`, 400);
            }
            // 4. Decrement stock and save
            product.stock -= quantity;
            await product.save();
            // 5. Calculate total price
            const totalPrice = itemPrice * quantity;
            // 6. Create the order
            const order = new Order({
                userId,
                username,
                itemName,
                itemPrice,
                itemStatus: status,
                status,
                totalPrice
            });
            const createdOrder = await order.save();
            return this.createOrderResponse(createdOrder, null, 201);
        } catch (error) {
            console.error('Error creating order with stock check:', error);
            return this.createOrderResponse(null, 'Failed to create order: ' + (error as Error).message, 500);
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
    async getOrdersByUserId(userId: number): Promise<IOrder[]> {
        try {
            // Sort by id ascending for user orders as well
            return await Order.find({ userId: userId }).sort({ id: 1 });
        } catch (error) {
            throw new Error('Error fetching user orders');
        }
    }

    /**
     * Get all orders (admin only)
     */
    async getAllOrders(): Promise<IOrder[]> {
        try {
            // Sort by id ascending so orders appear as 1, 4, 5, ...
            return await Order.find({}).sort({ id: 1 });
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