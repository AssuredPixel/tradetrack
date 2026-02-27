import mongoose, { Schema, Document, Model } from 'mongoose';
import { Product } from './Sale.js';

export interface IPurchase extends Document {
    date: Date;
    product: Product;
    unitType: string;
    quantity: number;
    purchasePricePerUnit: number;
    totalCost: number;
    supplierName: string;
    notes?: string;
    submittedBy: string;
    submittedAt: Date;
    deletedAt?: Date;
}

const PurchaseSchema: Schema = new Schema(
    {
        date: { type: Date, required: true },
        product: { type: String, enum: Object.values(Product), required: true },
        unitType: { type: String, required: true },
        quantity: { type: Number, required: true },
        purchasePricePerUnit: { type: Number, required: true },
        totalCost: { type: Number, required: true },
        supplierName: { type: String, required: true },
        notes: { type: String },
        submittedBy: { type: String, required: true },
        deletedAt: { type: Date, default: null },
    },
    {
        timestamps: { createdAt: 'submittedAt', updatedAt: false },
    }
);

const Purchase: Model<IPurchase> = mongoose.models.Purchase || mongoose.model<IPurchase>('Purchase', PurchaseSchema);

export default Purchase;
