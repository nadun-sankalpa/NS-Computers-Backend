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


// Set _id before saving if it's a new document and _id is not provided
userSchema.pre('save', async function (this: IUserDocument, next) {
    // Only proceed if this is a new document and _id is not already set
    if (this.isNew && !this._id) {
        try {
            // Find the user with the highest _id
            const UserModel = this.constructor as unknown as Model<IUserDocument>;
            const lastUser = await UserModel.findOne({}, { _id: 1 }, { sort: { _id: -1 } });
            
            // Set the new _id to be one more than the highest existing _id, or 1 if no users exist
            this._id = lastUser ? lastUser._id + 1 : 1;
            
            console.log(`Setting new user _id to: ${this._id}`);
            next();
        } catch (error) {
            console.error('Error generating user _id:', error);
            // If there's an error, set a default _id and continue
            // This ensures we don't block user creation if ID generation fails
            this._id = Date.now(); // Use timestamp as fallback ID
            console.log(`Using fallback _id: ${this._id}`);
            next();
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
    try {
        if (!candidatePassword) {
            console.error('[Auth] No password provided for comparison');
            return false;
        }
        
        if (!this.password) {
            console.error('[Auth] No stored password hash found for user:', this.email);
            return false;
        }
        
        console.log('[Auth] Comparing password for user:', this.email);
        console.log('[Auth] Stored hash exists:', !!this.password);
        console.log('[Auth] Candidate password provided:', !!candidatePassword);
        
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        console.log('[Auth] Password comparison result:', isMatch);
        
        return isMatch;
    } catch (error) {
        console.error('[Auth] Error in comparePassword:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            userId: this._id,
            hasStoredPassword: !!this.password,
            receivedPassword: !!candidatePassword
        });
        throw error; // Re-throw to be handled by the auth service
    }
};

// Create and export the User model
const User = model<IUserDocument, IUserModel>('User', userSchema);

export default User;