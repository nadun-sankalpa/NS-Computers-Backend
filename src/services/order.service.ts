import { Order, IOrder, IOrderItem } from '../models/order.model';
import { Product } from '../models/product.model';
import { IUser } from '../models/user.model';
import { productService } from './product.service';
import { Types } from 'mongoose';
import { IProduct } from '../models/product.model';

class OrderService {
    /**
     * Create a new order and update product stock
     */
    async createOrder(
        userId: string | Types.ObjectId,
        items: Array<{
            product: string | Types.ObjectId;
            quantity: number;
            price: number;
        }>,
        shippingAddress: {
            address: string;
            city: string;
            postalCode: string;
            country: string;
        },
        paymentMethod: string
    ): Promise<{ order: IOrder | null; error: string | null }> {
        const session = await Order.startSession();
        session.startTransaction();

        try {
            // 1. Validate all items and check stock
            const orderItems: IOrderItem[] = [];
            let itemsPrice = 0;

            for (const item of items) {
                const product = await Product.findById(item.product).session(session);
                
                if (!product) {
                    await session.abortTransaction();
                    return { 
                        order: null, 
                        error: `Product with ID ${item.product} not found` 
                    };
                }

                if (product.stock < item.quantity) {
                    await session.abortTransaction();
                    return { 
                        order: null, 
                        error: `Insufficient stock for product ${product.name}. Available: ${product.stock}` 
                    };
                }

                // Add to order items with proper type casting
                const orderItem: IOrderItem = {
                    product: product._id as unknown as Types.ObjectId, // Cast to ObjectId
                    name: product.name,
                    quantity: item.quantity,
                    price: product.price,
                    image: product.imageUrl || ''
                };
                orderItems.push(orderItem);

                itemsPrice += product.price * item.quantity;

                // Update product stock
                product.stock -= item.quantity;
                await product.save({ session });
            }

            // 2. Calculate prices
            const taxPrice = Number((itemsPrice * 0.1).toFixed(2));
            const shippingPrice = itemsPrice > 100 ? 0 : 10;
            const totalPrice = itemsPrice + taxPrice + shippingPrice;

            // 3. Create the order
            const order = new Order({
                user: userId,
                orderItems,
                shippingAddress,
                paymentMethod,
                itemsPrice,
                taxPrice,
                shippingPrice,
                totalPrice,
            });

            const createdOrder = await order.save({ session });
            await session.commitTransaction();
            
            return { 
                order: await createdOrder.populate('user', 'name email'),
                error: null 
            };

        } catch (error: any) {
            await session.abortTransaction();
            console.error('Error creating order:', error);
            return { 
                order: null, 
                error: error.message || 'Error creating order' 
            };
        } finally {
            await session.endSession();
        }
    }

    /**
     * Get order by ID
     */
    async getOrderById(id: string): Promise<IOrder | null> {
        try {
            return await Order.findById(id)
                .populate('user', 'name email')
                .populate({
                    path: 'orderItems.product',
                    select: 'name imageUrl'
                });
        } catch (error) {
            throw new Error('Error fetching order');
        }
    }

    /**
     * Get orders by user ID
     */
    async getOrdersByUserId(userId: string): Promise<IOrder[]> {
        try {
            return await Order.find({ user: userId })
                .sort({ createdAt: -1 })
                .populate({
                    path: 'orderItems.product',
                    select: 'name imageUrl'
                });
        } catch (error) {
            throw new Error('Error fetching user orders');
        }
    }

    /**
     * Get all orders (admin only)
     */
    async getAllOrders(): Promise<IOrder[]> {
        try {
            return await Order.find({})
                .populate('user', 'id name')
                .sort({ createdAt: -1 });
        } catch (error) {
            throw new Error('Error fetching all orders');
        }
    }

    /**
     * Update order to paid
     */
    async updateOrderToPaid(
        orderId: string,
        paymentResult: {
            id: string;
            status: string;
            update_time: string;
            email_address: string;
        }
    ): Promise<IOrder | null> {
        try {
            const order = await Order.findById(orderId);
            
            if (order) {
                order.isPaid = true;
                order.paidAt = new Date();
                order.paymentResult = paymentResult;
                
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
                order.isDelivered = true;
                order.deliveredAt = new Date();
                
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