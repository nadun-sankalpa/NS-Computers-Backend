import { Router } from 'express';
import {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder,
    getOrdersByUserId
} from '../controller/order.controller';

const orderRouter: Router = Router();


orderRouter.post('/save-order', createOrder);
orderRouter.post('/place', createOrder);
orderRouter.get('/get-all-orders', getAllOrders);
orderRouter.get('/:id', getOrderById);
orderRouter.put('/update-order/:id', updateOrderStatus);
orderRouter.get('/orders/user/:userId', getOrdersByUserId);
orderRouter.delete('/delete-order/:id', deleteOrder);

export default orderRouter;