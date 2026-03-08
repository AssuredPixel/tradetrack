import mongoose, { Schema, Document, Model } from 'mongoose';
import { Product } from '@/lib/types';

export interface ISale extends Document {
    date: Date;
    product: Product;
    unitType: string;
    quantity: number;
    sellingPricePerUnit: number;
    totalAmount: number;
    notes?: string;
    submittedBy: string;
    submittedAt: Date;
    deletedAt?: Date;
}

const SaleSchema: Schema = new Schema(
    {
        date: { type: Date, required: true },
        product: { type: String, enum: Object.values(Product), required: true },
        unitType: { type: String, required: true },
        quantity: { type: Number, required: true },
        sellingPricePerUnit: { type: Number, required: true },
        totalAmount: { type: Number, required: true },
        notes: { type: String },
        submittedBy: { type: String, required: true },
        deletedAt: { type: Date, default: null },
    },
    {
        timestamps: { createdAt: 'submittedAt', updatedAt: false },
    }
);

const Sale: Model<ISale> = mongoose.models.Sale || mongoose.model<ISale>('Sale', SaleSchema);

export default Sale;
