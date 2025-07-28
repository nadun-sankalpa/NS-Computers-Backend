import User, { IUser, IUserDocument } from '../models/user.model';
import { FilterQuery, UpdateQuery, Types } from 'mongoose';

export class UserService {
    // Email validation regex
    private readonly emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Password validation regex - at least 8 chars, 1 uppercase, 1 lowercase, 1 number
    private readonly passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

    /**
     * Validate user input
     */
    private validateUserInput(userData: Partial<IUser> & { password?: string }): { isValid: boolean; errors: string[] } {
        const { name, email, password } = userData;
        const errors: string[] = [];

        if (!name || name.trim().length < 2) {
            errors.push('Name must be at least 2 characters long');
        }

        if (!email || !this.emailRegex.test(email)) {
            errors.push('Please enter a valid email address');
        }

        if (password && !this.passwordRegex.test(password)) {
            errors.push('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Create a new user
     */
    async createUser(userData: {
        name: string;
        email: string;
        password: string;
        role?: 'admin' | 'customer';
        address?: string;
        phone?: string;
    }): Promise<IUserDocument> {
        // Validate input
        const { isValid, errors } = this.validateUserInput(userData);
        if (!isValid) {
            throw new Error(`Validation failed: ${errors.join(', ')}`);
        }

        try {
            // Check if user already exists
            const existingUser = await User.findOne({ email: userData.email });
            if (existingUser) {
                throw new Error('User with this email already exists');
            }

            // Create and save the user
            const user = new User({
                name: userData.name,
                email: userData.email,
                password: userData.password,
                role: userData.role || 'customer',
                address: userData.address || '',
                phone: userData.phone || ''
            });
            
            return await user.save();
        } catch (error: any) {
            throw new Error(`Error creating user: ${error.message}`);
        }
    }

    /**
     * Get all users (without sensitive data)
     */
    async getAllUsers(): Promise<Omit<IUser, 'password' | 'refreshToken'>[]> {
        try {
            const users = await User.find({}, { password: 0, refreshToken: 0 });
            return users;
        } catch (error: any) {
            throw new Error(`Error retrieving users: ${error.message}`);
        }
    }

    /**
     * Find user by ID (without sensitive data)
     */
    async findUserById(id: string): Promise<Omit<IUser, 'password' | 'refreshToken'> | null> {
        try {
            if (!Types.ObjectId.isValid(id)) {
                throw new Error('Invalid user ID');
            }
            const user = await User.findById(id, { password: 0, refreshToken: 0 });
            return user;
        } catch (error: any) {
            throw new Error(`Error finding user: ${error.message}`);
        }
    }

    /**
     * Find user by email (with password, for login verification)
     */
    async findUserByEmail(email: string): Promise<IUserDocument | null> {
        try {
            return await User.findOne({ email });
        } catch (error: any) {
            throw new Error(`Error finding user by email: ${error.message}`);
        }
    }

    /**
     * Update user
     */
    async updateUser(
        id: string, 
        updateData: UpdateQuery<IUser>
    ): Promise<Omit<IUser, 'password' | 'refreshToken'> | null> {
        try {
            if (!Types.ObjectId.isValid(id)) {
                throw new Error('Invalid user ID');
            }
            
            // Don't allow updating password or refreshToken through this method
            const { password, refreshToken, ...safeUpdateData } = updateData as any;
            
            const updatedUser = await User.findByIdAndUpdate(
                id, 
                { $set: { ...safeUpdateData, updatedAt: new Date() } },
                { new: true, runValidators: true, projection: { password: 0, refreshToken: 0 } }
            );
            
            return updatedUser;
        } catch (error: any) {
            throw new Error(`Error updating user: ${error.message}`);
        }
    }

    /**
     * Delete user
     */
    async deleteUser(id: string): Promise<boolean> {
        try {
            if (!Types.ObjectId.isValid(id)) {
                throw new Error('Invalid user ID');
            }
            
            const result = await User.findByIdAndDelete(id);
            return !!result;
        } catch (error: any) {
            throw new Error(`Error deleting user: ${error.message}`);
        }
    }

    /**
     * Compare password
     */
    async comparePassword(user: IUser, candidatePassword: string): Promise<boolean> {
        try {
            const userDoc = await User.findById(user._id).select('+password');
            if (!userDoc) return false;
            
            return await userDoc.comparePassword(candidatePassword);
        } catch (error: any) {
            throw new Error(`Error comparing passwords: ${error.message}`);
        }
    }

    /**
     * Update refresh token
     */
    async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
        try {
            if (!Types.ObjectId.isValid(userId)) {
                throw new Error('Invalid user ID');
            }
            
            await User.findByIdAndUpdate(
                userId,
                { refreshToken },
                { new: true }
            );
        } catch (error: any) {
            throw new Error(`Error updating refresh token: ${error.message}`);
        }
    }

    /**
     * Search users by name or email
     */
    async searchUsers(query: string): Promise<Omit<IUser, 'password' | 'refreshToken'>[]> {
        try {
            if (!query || query.trim().length < 2) {
                throw new Error('Search query must be at least 2 characters long');
            }

            const searchRegex = new RegExp(query, 'i');
            
            const users = await User.find({
                $or: [
                    { name: { $regex: searchRegex } },
                    { email: { $regex: searchRegex } }
                ]
            }, { password: 0, refreshToken: 0 });

            return users;
        } catch (error: any) {
            throw new Error(`Error searching users: ${error.message}`);
        }
    }
}

// Export a singleton instance
export const userService = new UserService();