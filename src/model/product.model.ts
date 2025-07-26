export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    currency: string;
    stock: number;
    image: string;
    createdAt?: Date;
    updatedAt?: Date;
}