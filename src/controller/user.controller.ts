import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { User } from '../model/user.model';

type UserResponse = Omit<User, 'password'>;

/**
 * Get all users
 */
export const getAllUsers = (req: Request, res: Response): void => {
    try {
        const users = userService.getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to retrieve users',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

/**
 * Get user by ID
 */
export const getUser = (req: Request, res: Response): void => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ 
                success: false, 
                message: 'Invalid user ID' 
            });
            return;
        }

        const user = userService.getUserById(id);
        if (!user) {
            res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
            return;
        }

        res.status(200).json({ 
            success: true, 
            data: user 
        });
    } catch (error) {
        console.error('Error getting user:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to retrieve user',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

/**
 * Create a new user
 */
export const saveUser = (req: Request, res: Response): void => {
    try {
        const { name, email, password, phone, address, role } = req.body;

        // Basic validation
        if (!name || !email || !password) {
            res.status(400).json({ 
                success: false, 
                message: 'Name, email, and password are required' 
            });
            return;
        }

        // Convert phone to number if provided
        const phoneNumber = phone ? Number(phone) : undefined;

        const result = userService.createUser({
            name,
            email,
            password,
            phone: phone,
            address: address || '',
            role: role || 'customer',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        if (result.errors.length > 0) {
            res.status(400).json({ 
                success: false, 
                message: 'Validation failed',
                errors: result.errors
            });
            return;
        }

        res.status(201).json({ 
            success: true, 
            message: 'User created successfully',
            data: result.user
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to create user',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

/**
 * Update an existing user
 */
export const updateUser = (req: Request, res: Response): void => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ 
                success: false, 
                message: 'Invalid user ID' 
            });
            return;
        }

        const { name, email, password, phone, address, role } = req.body;
        const updateData: Partial<User> = {};

        // Only include fields that are provided in the request
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (password) updateData.password = password; // In a real app, this would be hashed
        if (phone !== undefined) updateData.phone = (phone);
        if (address !== undefined) updateData.address = address;
        if (role) updateData.role = role;

        const result = userService.updateUser(id, updateData);

        if (result.errors.length > 0) {
            res.status(400).json({ 
                success: false, 
                message: 'Validation failed',
                errors: result.errors
            });
            return;
        }

        if (!result.user) {
            res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
            return;
        }

        res.status(200).json({ 
            success: true, 
            message: 'User updated successfully',
            data: result.user
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update user',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

/**
 * Delete a user
 */
export const deleteUser = (req: Request, res: Response): void => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ 
                success: false, 
                message: 'Invalid user ID' 
            });
            return;
        }

        const result = userService.deleteUser(id);
        
        if (!result.success) {
            res.status(404).json({ 
                success: false, 
                message: result.message 
            });
            return;
        }

        res.status(200).json({ 
            success: true, 
            message: result.message 
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to delete user',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

/**
 * Search users by name or email
 */
export const searchUser = (req: Request, res: Response): void => {
    try {
        const { q } = req.query;
        
        if (!q || typeof q !== 'string') {
            res.status(400).json({ 
                success: false, 
                message: 'Search query is required' 
            });
            return;
        }

        // In a real app, you would call userService.searchUsers(q)
        // For now, we'll filter the users in the controller
        const users = userService.getAllUsers().filter(user => 
            user.name.toLowerCase().includes(q.toLowerCase()) ||
            user.email.toLowerCase().includes(q.toLowerCase())
        );

        res.status(200).json({ 
            success: true, 
            data: users 
        });
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to search users',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

