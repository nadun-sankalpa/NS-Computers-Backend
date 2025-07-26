import { User } from "../model/user.model";

class UserService {
    // In-memory storage
    private users: User[] = [];

    // Email validation regex
    private readonly emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Password requirements:
    // - At least 8 characters
    // - At least one uppercase letter
    // - At least one lowercase letter
    // - At least one number
    private readonly passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

    /**
     * Generate a new user ID
     */
    private generateId(): number {
        if (this.users.length === 0) return 1;
        const maxId = Math.max(...this.users.map(u => u.id));
        return maxId + 1;
    }

    /**
     * Validate user input
     */
    private validateUserInput(userData: Partial<User> & { password?: string }): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (userData.email && !this.emailRegex.test(userData.email)) {
            errors.push('Invalid email format');
        }

        if (userData.password && !this.passwordRegex.test(userData.password)) {
            errors.push('Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number');
        }

        if (userData.phone !== undefined) {
            // Convert to string to check length if it's a number
            const phoneStr = userData.phone.toString();
            if (phoneStr.length !== 10 || !/^\d+$/.test(phoneStr)) {
                errors.push('Phone number must be a 10-digit number');
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Get all users (without passwords)
     */
    public getAllUsers(): Omit<User, 'password'>[] {
        return this.users.map(({ password, ...user }) => user);
    }

    /**
     * Get user by ID (without password)
     */
    public getUserById(id: number): Omit<User, 'password'> | undefined {
        const user = this.users.find(u => u.id === id);
        if (!user) return undefined;

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    /**
     * Get user by email (with password, for login verification)
     */
    public getUserByEmail(email: string): User | undefined {
        return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    }

    /**
     * Create a new user
     */
    public createUser(userData: Omit<User, 'id'>): { user?: Omit<User, 'password'>; errors: string[] } {
        // Check if email already exists
        if (this.users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
            return { errors: ['Email already in use'] };
        }

        // Validate input
        const validation = this.validateUserInput(userData);
        if (!validation.isValid) {
            return { errors: validation.errors };
        }

        // Create new user
        const newUser: User = {
            id: this.generateId(),
            ...userData,
            role: userData.role || 'customer',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.users.push(newUser);

        // Return user without password
        const { password, ...userWithoutPassword } = newUser;
        return { user: userWithoutPassword, errors: [] };
    }

    /**
     * Update an existing user
     */
    public updateUser(id: number, userData: Partial<Omit<User, 'id'>>): { user?: Omit<User, 'password'>; errors: string[] } {
        const userIndex = this.users.findIndex(u => u.id === id);

        if (userIndex === -1) {
            return { errors: ['User not found'] };
        }

        // Check if email is being changed and already exists
        if (userData.email && this.users.some(u =>
            u.id !== id && u.email.toLowerCase() === userData.email!.toLowerCase()
        )) {
            return { errors: ['Email already in use'] };
        }

        // Validate input
        const validation = this.validateUserInput(userData);
        if (!validation.isValid) {
            return { errors: validation.errors };
        }

        // Update user
        const updatedUser = {
            ...this.users[userIndex],
            ...userData,
            id, // Ensure ID remains unchanged
            updatedAt: new Date()
        };

        this.users[userIndex] = updatedUser;

        // Return user without password
        const { password, ...userWithoutPassword } = updatedUser;
        return { user: userWithoutPassword, errors: [] };
    }

    /**
     * Delete a user
     */
    public deleteUser(id: number): { success: boolean; message: string } {
        const initialLength = this.users.length;
        this.users = this.users.filter(user => user.id !== id);

        return {
            success: this.users.length < initialLength,
            message: this.users.length < initialLength
                ? 'User deleted successfully'
                : 'User not found'
        };
    }

    /**
     * Verify user credentials
     */
    public verifyCredentials(email: string, password: string): { isValid: boolean; user?: Omit<User, 'password'> } {
        const user = this.users.find(u =>
            u.email.toLowerCase() === email.toLowerCase() &&
            u.password === password // In a real app, you would hash and compare passwords
        );

        if (!user) {
            return { isValid: false };
        }

        const { password: _, ...userWithoutPassword } = user;
        return {
            isValid: true,
            user: userWithoutPassword
        };
    }
}

// Export a singleton instance
export const userService = new UserService();