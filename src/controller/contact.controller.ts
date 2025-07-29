// src/controller/contact.controller.ts
import { Request, Response } from 'express';
import { contactService } from '../services'; // Make sure this path is correct and contactService is exported

interface ContactResponse {
    success: boolean;
    message: string;
    data?: any;
    error?: string;
}

/**
 * Submit a new contact message
 */
export const submitContactForm = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, phone, subject, message, category } = req.body;

        // Basic validation (more detailed validation is in the service/model)
        if (!name || !email || !subject || !message || !category) {
            res.status(400).json({
                success: false,
                message: 'Name, email, subject, message, and category are required.'
            });
            return;
        }

        const contactData = {
            name,
            email,
            phone: phone || '', // Phone is optional
            subject,
            message,
            category
        };

        const savedMessage = await contactService.createContactMessage(contactData);

        res.status(201).json({
            success: true,
            message: 'Your message has been sent successfully!',
            data: savedMessage
        });
    } catch (error: any) {
        console.error('Error submitting contact form:', error);
        res.status(400).json({ // Use 400 for client-side errors like validation
            success: false,
            message: 'Failed to send your message.',
            error: error.message
        });
    }
};

/**
 * Get all contact messages (Admin only, requires authentication/authorization)
 */
export const getAllContactMessages = async (req: Request, res: Response): Promise<void> => {
    try {
        const messages = await contactService.getAllContactMessages();
        res.status(200).json({
            success: true,
            message: 'Contact messages retrieved successfully.',
            data: messages
        });
    } catch (error: any) {
        console.error('Error retrieving contact messages:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve contact messages.',
            error: error.message
        });
    }
};

/**
 * Get a single contact message by ID (Admin only)
 */
export const getContactMessage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const message = await contactService.getContactMessageById(id);

        if (!message) {
            res.status(404).json({
                success: false,
                message: 'Contact message not found.'
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Contact message retrieved successfully.',
            data: message
        });
    } catch (error: any) {
        console.error('Error retrieving single contact message:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve contact message.',
            error: error.message
        });
    }
};

/**
 * Mark a contact message as read (Admin only)
 */
export const markMessageAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const updatedMessage = await contactService.markContactMessageAsRead(id);

        if (!updatedMessage) {
            res.status(404).json({
                success: false,
                message: 'Contact message not found.'
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Contact message marked as read.',
            data: updatedMessage
        });
    } catch (error: any) {
        console.error('Error marking message as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark message as read.',
            error: error.message
        });
    }
};

/**
 * Delete a contact message (Admin only)
 */
export const deleteContactMessage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const result = await contactService.deleteContactMessage(id);

        if (!result) {
            res.status(404).json({
                success: false,
                message: 'Contact message not found.'
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Contact message deleted successfully.'
        });
    } catch (error: any) {
        console.error('Error deleting contact message:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete contact message.',
            error: error.message
        });
    }
};
