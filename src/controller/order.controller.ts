import { Request, Response } from 'express';
import { Order, IOrder } from '../models/order.model';
import { orderService } from '../services/order.service';

// Create a new order
export const createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, itemName, itemPrice, username } = req.body;
        
        if (!userId) {
            res.status(400).json({ message: 'User ID is required' });
            return;
        }
        
        // Convert userId to number
        const userIdNum = Number(userId);
        if (isNaN(userIdNum)) {
            res.status(400).json({ message: 'User ID must be a valid number' });
            return;
        }
        
        if (!username) {
            res.status(400).json({ message: 'Username is required' });
            return;
        }
        
        if (!itemName) {
            res.status(400).json({ message: 'Item name is required' });
            return;
        }
        
        if (itemPrice === undefined || typeof itemPrice !== 'number' || itemPrice < 0) {
            res.status(400).json({ 
                success: false,
                message: 'Item price must be a valid non-negative number' 
            });
            return;
        }

        const orderStatus = req.body.status || 'pending'; // Default to 'pending' if not provided
        
        const { order, error, status: httpStatus = 500 } = await orderService.createOrder(
            userIdNum,
            String(itemName),
            Number(itemPrice),
            String(username),
            orderStatus
        );
        
        if (error || !order) {
            res.status(httpStatus).json({
                success: false,
                message: error || 'Failed to create order',
                details: error === 'Failed to create order' ? 'Unknown error occurred' : undefined
            });
            return;
        }

        res.status(201).json({
            success: true,
            data: order
        });
    } catch (error: any) {
        console.error('Error in createOrder controller:', error);
        const status = error.status || 500;
        res.status(status).json({
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
        
        // Convert userId to number
        const userIdNum = Number(userId);
        if (isNaN(userIdNum)) {
            res.status(400).json({ success: false, message: 'User ID must be a valid number' });
            return;
        }
        
        const orders = await orderService.getOrdersByUserId(userIdNum);
        
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
        const { status } = req.body;
        const { id } = req.params;

        if (!id) {
            res.status(400).json({ success: false, message: 'Order ID is required' });
            return;
        }

        if (!status || !['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
            res.status(400).json({ 
                success: false, 
                message: 'Valid status is required (pending, processing, shipped, delivered, cancelled)' 
            });
            return;
        }

        // Update both status and itemStatus to keep them in sync
        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { 
                status: status,
                itemStatus: status 
            },
            { new: true, runValidators: true }
        );

        if (!updatedOrder) {
            res.status(404).json({ success: false, message: 'Order not found' });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            data: updatedOrder
        });
    } catch (error) {
        console.error('Error updating order status:', error);
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