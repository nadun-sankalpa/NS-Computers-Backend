import { Request, Response } from 'express';
import { Order } from '../model/order.model';
import { OrderItem } from '../model/orderItem.model';
import orderService from '../services/order.service';

// Create a new order
export const createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, items } = req.body;

        // Validate request body
        if (!userId || !Array.isArray(items) || items.length === 0) {
            res.status(400).json({
                success: false,
                message: 'User ID and at least one order item are required'
            });
            return;
        }

        // Convert userId to number
        const userIdNum = Number(userId);
        if (isNaN(userIdNum)) {
            res.status(400).json({
                success: false,
                message: 'Invalid user ID format'
            });
            return;
        }

        const { order, error } = await orderService.createOrder(userIdNum, items);

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
export const getAllOrders = (req: Request, res: Response): void => {
    try {
        const orders = orderService.getAllOrders();
        res.json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        console.error('Error in getAllOrders:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get order by ID
export const getOrderById = (req: Request, res: Response): void => {
    try {
        const orderId = parseInt(req.params.id);
        if (isNaN(orderId)) {
            res.status(400).json({
                success: false,
                message: 'Invalid order ID'
            });
            return;
        }

        const order = orderService.getOrderById(orderId);
        if (!order) {
            res.status(404).json({
                success: false,
                message: 'Order not found'
            });
            return;
        }

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Error in getOrderById:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get orders by user ID
export const getOrdersByUserId = (req: Request, res: Response): void => {
    try {
        const { userId } = req.params;
        if (!userId) {
            res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
            return;
        }

        const userIdNum = Number(userId);
        if (isNaN(userIdNum)) {
            res.status(400).json({
                success: false,
                message: 'Invalid user ID format'
            });
            return;
        }

        const orders = orderService.getOrdersByUserId(userIdNum);
        res.json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        console.error('Error in getOrdersByUserId:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Update order status
export const updateOrderStatus = (req: Request, res: Response): void => {
    try {
        const orderId = parseInt(req.params.id);
        if (isNaN(orderId)) {
            res.status(400).json({
                success: false,
                message: 'Invalid order ID'
            });
            return;
        }

        const { status } = req.body;
        if (!status || !['pending', 'processing', 'completed', 'cancelled'].includes(status)) {
            res.status(400).json({
                success: false,
                message: 'Valid status is required (pending, processing, completed, cancelled)'
            });
            return;
        }

        const updatedOrder = orderService.updateOrderStatus(orderId, status);
        if (!updatedOrder) {
            res.status(404).json({
                success: false,
                message: 'Order not found'
            });
            return;
        }

        res.json({
            success: true,
            data: updatedOrder
        });
    } catch (error) {
        console.error('Error in updateOrderStatus:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Delete order
export const deleteOrder = (req: Request, res: Response): void => {
    try {
        const orderId = parseInt(req.params.id);
        if (isNaN(orderId)) {
            res.status(400).json({
                success: false,
                message: 'Invalid order ID'
            });
            return;
        }

        // First check if order exists
        const order = orderService.getOrderById(orderId);
        if (!order) {
            res.status(404).json({
                success: false,
                message: 'Order not found'
            });
            return;
        }

        // For this implementation, we'll just filter out the order
        const success = orderService.deleteOrder(orderId);
        
        if (!success) {
            res.status(500).json({
                success: false,
                message: 'Failed to delete order'
            });
            return;
        }

        res.json({
            success: true,
            message: 'Order deleted successfully'
        });
    } catch (error) {
        console.error('Error in deleteOrder:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};