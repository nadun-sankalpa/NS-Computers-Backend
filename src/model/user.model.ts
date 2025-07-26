export interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    address: string;
    phone: string;  // Made optional with ?
    role: 'admin' | 'customer';
    createdAt: Date;
    updatedAt: Date;


}