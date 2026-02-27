import mongoose, { Schema, Document, Model } from 'mongoose';
import { Product } from './Sale.js';

export interface ICreditSupply extends Document {
    date: Date;
    customerName: string;
    product: Product;
    unitType: string;
    quantity: number;
    agreedPricePerUnit: number;
    totalAmountOwed: number;
    notes?: string;
    submittedBy: string;
    submittedAt: Date;
    deletedAt?: Date;
}

const CreditSupplySchema: Schema = new Schema(
    {
        date: { type: Date, required: true },
        customerName: { type: String, required: true },
        product: { type: String, enum: Object.values(Product), required: true },
        unitType: { type: String, required: true },
        quantity: { type: Number, required: true },
        agreedPricePerUnit: { type: Number, required: true },
        totalAmountOwed: { type: Number, required: true },
        notes: { type: String },
        submittedBy: { type: String, required: true },
        deletedAt: { type: Date, default: null },
    },
    {
        timestamps: { createdAt: 'submittedAt', updatedAt: false },
    }
);

const CreditSupply: Model<ICreditSupply> = mongoose.models.CreditSupply || mongoose.model<ICreditSupply>('CreditSupply', CreditSupplySchema);

export default CreditSupply;
