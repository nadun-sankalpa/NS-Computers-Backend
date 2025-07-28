import { Document, Schema, model, Model } from 'mongoose';

// Interface for Product document
export interface IProduct extends Document {
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    imageUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Interface for Product model
interface IProductModel extends Model<IProduct> {
    // Static methods can be defined here
}

// Create the schema
const productSchema = new Schema<IProduct, IProductModel>(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        stock: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        },
        category: {
            type: String,
            required: true
        },
        imageUrl: {
            type: String,
            required: false
        }
    },
    {
        timestamps: true
    }
);

// Create and export the Product model
export const Product = model<IProduct, IProductModel>('Product', productSchema);

export type ProductDocument = IProduct;
export type ProductModel = IProductModel;