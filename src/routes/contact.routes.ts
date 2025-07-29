// src/routes/contact.routes.ts
import { Router } from 'express';
import {
    submitContactForm,
    getAllContactMessages,
    getContactMessage,
    markMessageAsRead,
    deleteContactMessage
} from '../controller/contact.controller';
import { authenticateToken } from '../middleware/auth.middleware'; // Assuming you have this middleware

const contactRouter: Router = Router();

// Public route for submitting contact form
contactRouter.post('/save-contact', submitContactForm);

// Admin routes (require authentication)
// You might want to add an authorization middleware here as well (e.g., isAdmin)
contactRouter.get('/get-all-messages', getAllContactMessages);
contactRouter.get('/get-all-messages/:id', getContactMessage);
contactRouter.put('/update-message/:id',  markMessageAsRead);
contactRouter.delete('/delete-message/:id', deleteContactMessage);

export default contactRouter;
