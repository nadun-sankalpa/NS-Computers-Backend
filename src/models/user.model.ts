import { Document, Schema, Model, model } from 'mongoose';
import bcrypt from 'bcrypt';

// Define the user document interface
export interface IUserDocument extends Document {
    _id: number;
    name: string;
    email: string;
    password?: string;
    address: string;
    phone: string;
    role: 'admin' | 'customer';
    refreshToken?: string;
    comparePassword(candidatePassword: string): Promise<boolean>;
    createdAt: Date;
    updatedAt: Date;
}

// Define the user interface (for input/creation)
export interface IUser extends Omit<IUserDocument, keyof Document> {
    _id?: number;
}

// Interface for User model
export interface IUserModel extends Model<IUserDocument> {
    // Static methods can be defined here
}

// Create schema
const userSchema = new Schema<IUserDocument, IUserModel>(
    {
        _id: { 
            type: Number,
            required: false
        },
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [3, 'Name must be at least 3 characters long'],
            maxlength: [50, 'Name cannot exceed 50 characters']
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters long'],
            select: false
        },
        address: {
            type: String,
            required: [true, 'Address is required'],
            trim: true
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            match: [/^\+?[0-9]{10,15}$/, 'Please enter a valid phone number']
        },
        role: {
            type: String,
            enum: ['admin', 'customer'],
            default: 'customer'
        },
        refreshToken: {
            type: String,
            select: false
        }
    },
    {
        timestamps: true,
        toJSON: {
            transform: function (doc, ret) {
                if ('password' in ret) {
                    delete ret.password;
                }
                if ('refreshToken' in ret) {
                    delete ret.refreshToken;
                }
                return ret;
            }
        }
    }
);


// Set _id before saving if it's a new document
userSchema.pre('save', async function (this: IUserDocument, next) {
    if (this.isNew && !this._id) {
        try {
            const UserModel = this.constructor as unknown as Model<IUserDocument>;
            const lastUser = await UserModel.findOne().sort({ _id: -1 });
            this._id = lastUser ? lastUser._id + 1 : 1;
            next();
        } catch (error) {
            next(error as Error);
        }
    } else {
        next();
    }
});

// Hash password before saving if it was modified
userSchema.pre('save', async function (this: IUserDocument, next) {
    if (!this.isModified('password') || !this.password) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(this.password, salt);
        this.password = hashedPassword;
        next();
    } catch (error) {
        next(error as Error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Create and export the User model
const User = model<IUserDocument, IUserModel>('User', userSchema);

export default User;