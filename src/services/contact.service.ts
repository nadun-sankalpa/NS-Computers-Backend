// src/services/contact.service.ts
import Contact, { IContact } from '../models/contact.model';
import { Types } from 'mongoose';
// import { emailService } from './email.service'; // Uncomment if you have an email service

export class ContactService {
    /**
     * Create a new contact message
     */
    async createContactMessage(contactData: {
        name: string;
        email: string;
        phone?: string;
        subject: string;
        message: string;
        category: 'Sales' | 'Technical Support' | 'Warranty Claims' | 'Custom Builds' | 'General Inquiry';
    }): Promise<IContact> {
        try {
            const newContact = new Contact(contactData);
            const savedContact = await newContact.save();

            // Optional: Send an email notification to admin or confirmation to user
            // if (emailService) {
            //     await emailService.sendContactConfirmation(savedContact.email, savedContact.name);
            //     await emailService.sendAdminNotification('admin@example.com', savedContact);
            // }

            return savedContact;
        } catch (error: any) {
            // Check for Mongoose validation errors
            if (error.name === 'ValidationError') {
                const errors = Object.keys(error.errors).map(key => error.errors[key].message);
                throw new Error(`Validation failed: ${errors.join(', ')}`);
            }
            throw new Error(`Error creating contact message: ${error.message}`);
        }
    }

    /**
     * Get all contact messages (e.g., for admin dashboard)
     */
    async getAllContactMessages(): Promise<IContact[]> {
        try {
            const messages = await Contact.find().sort({ createdAt: -1 }); // Latest first
            return messages;
        } catch (error: any) {
            throw new Error(`Error retrieving contact messages: ${error.message}`);
        }
    }

    /**
     * Get a single contact message by ID
     */
    async getContactMessageById(id: string): Promise<IContact | null> {
        try {
            if (!Types.ObjectId.isValid(id)) {
                throw new Error('Invalid contact message ID');
            }
            const message = await Contact.findById(id);
            return message;
        } catch (error: any) {
            throw new Error(`Error retrieving contact message: ${error.message}`);
        }
    }

    /**
     * Mark a contact message as read
     */
    async markContactMessageAsRead(id: string): Promise<IContact | null> {
        try {
            if (!Types.ObjectId.isValid(id)) {
                throw new Error('Invalid contact message ID');
            }
            const updatedMessage = await Contact.findByIdAndUpdate(
                id,
                { $set: { isRead: true, updatedAt: new Date() } },
                { new: true }
            );
            return updatedMessage;
        } catch (error: any) {
            throw new Error(`Error marking contact message as read: ${error.message}`);
        }
    }

    /**
     * Delete a contact message
     */
    async deleteContactMessage(id: string): Promise<boolean> {
        try {
            if (!Types.ObjectId.isValid(id)) {
                throw new Error('Invalid contact message ID');
            }
            const result = await Contact.findByIdAndDelete(id);
            return !!result;
        } catch (error: any) {
            throw new Error(`Error deleting contact message: ${error.message}`);
        }
    }
}

export const contactService = new ContactService();
