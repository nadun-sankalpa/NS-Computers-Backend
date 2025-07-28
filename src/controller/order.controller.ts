import { Request, Response } from 'express';
import { Order, IOrder } from '../models/order.model';
import { orderService } from '../services/order.service';

// Create a new order
export const createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, items, shippingAddress, paymentMethod } = req.body;
        
        if (!userId) {
            res.status(400).json({ message: 'User ID is required' });
            return;
        }
        
        if (!items || !Array.isArray(items) || items.length === 0) {
            res.status(400).json({ message: 'Order items are required' });
            return;
        }

        if (!shippingAddress || !shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country) {
            res.status(400).json({ message: 'Complete shipping address is required' });
            return;
        }

        if (!paymentMethod) {
            res.status(400).json({ message: 'Payment method is required' });
            return;
        }
        
        const { order, error } = await orderService.createOrder(
            userId,
            items,
            shippingAddress,
            paymentMethod
        );
        
        if (error || !order) {
            res.status(400).json({
                success: false,
                message: error || 'Failed to create order'
            });
            return;
        }

        res.status(201).json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Error in createOrder:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get all orders
export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        const orders = await orderService.getAllOrders();
        
        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

// Get order by ID
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
    try {
        const orderId = req.params.id;
        
        if (!orderId) {
            res.status(400).json({ success: false, message: 'Order ID is required' });
            return;
        }
        
        const order = await orderService.getOrderById(orderId);
        
        if (!order) {
            res.status(404).json({ success: false, message: 'Order not found' });
            return;
        }
        
        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching order',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

// Get orders by user ID
export const getOrdersByUserId = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            res.status(400).json({ success: false, message: 'User ID is required' });
            return;
        }
        
        const orders = await orderService.getOrdersByUserId(userId);
        
        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

// Update order status
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const orderId = req.params.id;
        
        if (!orderId) {
            res.status(400).json({ success: false, message: 'Order ID is required' });
            return;
        }
        
        const { status } = req.body;
        
        if (!status || !['pending', 'processing', 'completed', 'cancelled'].includes(status)) {
            res.status(400).json({ success: false, message: 'Valid status is required (pending, processing, completed, cancelled)' });
            return;
        }
        
        // First get the order
        const order = await Order.findById(orderId);
        
        if (!order) {
            res.status(404).json({ success: false, message: 'Order not found' });
            return;
        }
        
        // Update the status
        order.status = status;
        const updatedOrder = await order.save();
        
        res.status(200).json({
            success: true,
            data: updatedOrder
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating order status',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

// Delete order
export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const orderId = req.params.id;
        
        if (!orderId) {
            res.status(400).json({ success: false, message: 'Order ID is required' });
            return;
        }
        
        // Check if order exists and delete it
        const deletedOrder = await Order.findByIdAndDelete(orderId);
        
        if (!deletedOrder) {
            res.status(404).json({ success: false, message: 'Order not found' });
            return;
        }
        
        res.status(200).json({
            success: true,
            message: 'Order deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting order',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};