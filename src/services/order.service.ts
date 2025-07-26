import { Order} from "../model/order.model";
import { OrderItem } from "../model/orderItem.model";
import { Product } from "../model/product.model";
import { getProductById, updateProduct } from "./product.service";

// In-memory storage for orders
let orders: Order[] = [];
let orderIdCounter = 1;

export const orderService = {
    // Create a new order and update product stock
    async createOrder(userId: number, items: Omit<OrderItem, 'price'>[]): Promise<{ order: Order | null; error: string | null }> {
        // Validate items and check stock
        const itemsWithPrices: OrderItem[] = [];
        let totalAmount = 0;

        try {
            // First, validate all items and calculate total
            for (const item of items) {
                const product = getProductById(item.productId);
                if (!product) {
                    return { order: null, error: `Product with ID ${item.productId} not found` };
                }
                if (product.stock < item.quantity) {
                    return { 
                        order: null, 
                        error: `Insufficient stock for product ${product.name}. Available: ${product.stock}` 
                    };
                }
                
                const itemWithPrice = {
                    ...item,
                    price: product.price
                };
                
                itemsWithPrices.push(itemWithPrice);
                totalAmount += product.price * item.quantity;
            }

            // If we got here, all items are valid - update stock
            for (const item of items) {
                const product = getProductById(item.productId);
                if (product) {
                    updateProduct(product.id, {
                        stock: product.stock - item.quantity
                    });
                }
            }

            // Create the order
            const newOrder: Order = {
                id: orderIdCounter++,
                userId,
                items: itemsWithPrices,
                totalAmount,
                status: 'completed',
                createdAt: new Date(),
                updatedAt: new Date()
            };

            orders.push(newOrder);
            return { order: newOrder, error: null };
        } catch (error) {
            console.error('Error creating order:', error);
            return { order: null, error: 'Failed to create order' };
        }
    },

    // Get all orders
    getAllOrders(): Order[] {
        return [...orders];
    },

    // Get order by ID
    getOrderById(id: number): Order | undefined {
        return orders.find(order => order.id === id);
    },

    // Get orders by user ID
    getOrdersByUserId(userId: number): Order[] {
        return orders.filter(order => order.userId === userId);
    },

    // Update order status
    updateOrderStatus(id: number, status: Order['status']): Order | null {
        const orderIndex = orders.findIndex(order => order.id === id);
        if (orderIndex === -1) return null;
        
        const updatedOrder = {
            ...orders[orderIndex],
            status,
            updatedAt: new Date()
        };
        
        orders[orderIndex] = updatedOrder;
        return updatedOrder;
    },

    // Delete order
    deleteOrder(id: number): boolean {
        const initialLength = orders.length;
        orders = orders.filter(order => order.id !== id);
        return orders.length < initialLength;
    }
};

export default orderService;