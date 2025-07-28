import { Document, Schema, model, Model } from 'mongoose';
import bcrypt from 'bcrypt';

// Interface for User document
export interface IUserDocument extends Document {
    name: string;
    email: string;
    password: string;
    address: string;
    phone: string;
    role: 'admin' | 'customer';
    refreshToken?: string;
    comparePassword(candidatePassword: string): Promise<boolean>;
    createdAt: Date;
    updatedAt: Date;
}

// Interface for User model (static methods would go here)
export interface IUserModel extends Model<IUserDocument> {
    // Static methods can be defined here
}

// Combined interface for document instance methods
export interface IUser extends IUserDocument {
    name: string;
    email: string;
    password: string;
    address: string;
    phone: string;
    role: 'admin' | 'customer';
    refreshToken?: string;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters long']
        },
        address: {
            type: String,
            default: '',
            trim: true
        },
        phone: {
            type: String,
            default: '',
            trim: true
        },
        role: {
            type: String,
            enum: {
                values: ['admin', 'customer'],
                message: 'Role must be either admin or customer'
            },
            default: 'customer'
        },
        refreshToken: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
);

// Hash password before saving
userSchema.pre<IUser>('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error: any) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Create and export the User model
const User = model<IUserDocument, IUserModel>('User', userSchema);

export default User;